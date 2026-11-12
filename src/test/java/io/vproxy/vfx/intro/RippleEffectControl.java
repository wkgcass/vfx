package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.theme.Theme;
import javafx.animation.AnimationTimer;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.event.EventHandler;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.control.CheckBox;
import javafx.scene.control.Tooltip;
import javafx.scene.effect.Effect;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;

final class RippleEffectControl implements AutoCloseable {
    private static final int CAPACITY = 16;
    private static final double LIFETIME = 3.0;
    private static final String SHADER_SOURCE = shaderSource();

    private static String shaderSource() {
        StringBuilder source = new StringBuilder(
            "shader_type canvas_item;\n" +
            "render_mode unshaded, blend_premul_alpha;\n" +
            "uniform vec2 extent = vec2(1280.0, 800.0);\n" +
            "uniform float ripple_speed = 0.32;\n" +
            "uniform float ripple_duration = 3.0;\n" +
            "uniform float wavelength = 0.035;\n" +
            "uniform float wave_width = 0.025;\n" +
            "uniform float distortion_strength = 0.012;\n" +
            "uniform float decay_power = 1.3;\n" +
            "uniform float secondary_wave_strength = 0.35;\n");
        for (int i = 0; i < CAPACITY; ++i) {
            source.append("uniform vec4 ripple").append(i).append(" = vec4(0.0);\n");
        }
        source.append(
            "vec2 calculate_ripple(vec2 uv, vec4 ripple) {\n" +
            "    if (ripple.w <= 0.0) { return vec2(0.0); }\n" +
            "    vec2 delta = uv - ripple.xy;\n" +
            "    float aspect = extent.x / extent.y;\n" +
            "    delta.x *= aspect;\n" +
            "    float distance_from_center = length(delta);\n" +
            "    vec2 direction = delta / max(distance_from_center, 0.00001);\n" +
            "    float age = ripple.z;\n" +
            "    float wave_radius = age * ripple_speed;\n" +
            "    float wave_distance = distance_from_center - wave_radius;\n" +
            "    float wave_envelope = exp(-pow(wave_distance / wave_width, 2.0));\n" +
            "    float time_fade = pow(max(1.0 - age / ripple_duration, 0.0), decay_power);\n" +
            "    float valid_range = step(0.0, wave_radius - distance_from_center + wave_width * 2.0);\n" +
            "    float primary_wave = sin(wave_distance * (6.2831853 / wavelength));\n" +
            "    float secondary_wave = sin(wave_distance * (6.2831853 / wavelength) * 0.55 + 1.2);\n" +
            "    float wave = mix(primary_wave, primary_wave + secondary_wave * secondary_wave_strength, 0.65);\n" +
            "    float displacement = wave * wave_envelope * time_fade * ripple.w * distortion_strength * valid_range;\n" +
            "    vec2 offset = direction * displacement;\n" +
            "    offset.x /= aspect;\n" +
            "    return offset;\n" +
            "}\n" +
            "void fragment() {\n" +
            "    vec2 total_offset = vec2(0.0);\n");
        for (int i = 0; i < CAPACITY; ++i) {
            source.append("    total_offset += calculate_ripple(UV, ripple").append(i).append(");\n");
        }
        source.append(
            "    total_offset = clamp(total_offset, vec2(-0.035), vec2(0.035));\n" +
            "    vec4 original = texture(TEXTURE, UV);\n" +
            "    if (dot(total_offset, total_offset) == 0.0) {\n" +
            "        COLOR = original;\n" +
            "    } else {\n" +
            "        vec2 sample_uv = clamp(UV + total_offset, vec2(0.001), vec2(0.999));\n" +
            "        vec4 sampled = texture(TEXTURE, sample_uv);\n" +
            "        COLOR = sampled.a > 0.0001 ? vec4(sampled.rgb * (original.a / sampled.a), original.a) : original;\n" +
            "    }\n" +
            "}\n");
        return source.toString();
    }

    private final CheckBox control = new CheckBox("Ripple Effect");
    private final Node target;
    private final Scene scene;
    private final EventHandler<MouseEvent> press = this::pressed;
    private final long[] births = new long[CAPACITY];
    private final float[] centersX = new float[CAPACITY];
    private final float[] centersY = new float[CAPACITY];
    private Effect effect;
    private Effect previousEffect;
    private Method setFloat;
    private final AnimationTimer timer = new AnimationTimer() {
        @Override public void handle(long now) {
            try {
                update(System.nanoTime());
            } catch (RuntimeException failure) {
                control.setSelected(false);
                throw failure;
            }
        }
    };

    RippleEffectControl(Node target) {
        this.target = target;
        this.scene = target.getScene();
        control.setId("ripple-effect-toggle");
        control.setTextFill(Theme.current().normalTextColor());
        FontManager.get().setFont(control);
        control.setPrefHeight(40);
        control.setTooltip(new Tooltip("Left-click anywhere in the Demo window to create expanding water ripples."));
        control.selectedProperty().addListener((observable, oldValue, selected) -> {
            if (selected) {
                try {
                    if (effect == null) {
                        var type = Class.forName("javafx.scene.effect.GodotShaderEffect");
                        effect = (Effect) type.getConstructor(String.class).newInstance(SHADER_SOURCE);
                        setFloat = type.getMethod("setFloat", String.class, float[].class);
                        uniform("ripple_duration", (float) LIFETIME);
                    }
                    previousEffect = target.getEffect();
                    Arrays.fill(births, 0);
                    for (int i = 0; i < CAPACITY; ++i) uniform("ripple" + i, 0, 0, 0, 0);
                    target.setEffect(effect);
                } catch (ReflectiveOperationException | RuntimeException failure) {
                    control.setSelected(false);
                    throw new IllegalStateException("Cannot initialize Ripple Effect", failure);
                }
            } else {
                timer.stop();
                Arrays.fill(births, 0);
                if (target.getEffect() == effect) target.setEffect(previousEffect);
                previousEffect = null;
            }
        });
        scene.addEventFilter(MouseEvent.MOUSE_PRESSED, press);
    }

    CheckBox getControl() { return control; }

    private void pressed(MouseEvent event) {
        if (!control.isSelected() || event.getButton() != MouseButton.PRIMARY) return;
        var bounds = target.getLayoutBounds();
        var point = target.sceneToLocal(event.getSceneX(), event.getSceneY());
        if (bounds.getWidth() <= 0 || bounds.getHeight() <= 0 || point == null || !bounds.contains(point)) return;
        long now = System.nanoTime();
        try {
            for (int i = 0; i < CAPACITY; ++i) {
                if (births[i] != 0 && (now - births[i]) / 1e9 < LIFETIME) continue;
                centersX[i] = (float) ((point.getX() - bounds.getMinX()) / bounds.getWidth());
                centersY[i] = (float) ((point.getY() - bounds.getMinY()) / bounds.getHeight());
                births[i] = now;
                update(now);
                timer.start();
                break;
            }
        } catch (RuntimeException failure) {
            control.setSelected(false);
            throw failure;
        }
    }

    private void update(long now) {
        var bounds = target.getLayoutBounds();
        boolean active = false;
        for (int i = 0; i < CAPACITY; ++i) {
            if (births[i] != 0 && (now - births[i]) / 1e9 >= LIFETIME) births[i] = 0;
            active |= births[i] != 0;
        }
        if (bounds.getWidth() > 0 && bounds.getHeight() > 0) {
            uniform("extent", (float) bounds.getWidth(), (float) bounds.getHeight());
            for (int i = 0; i < CAPACITY; ++i) {
                uniform("ripple" + i, centersX[i], centersY[i], births[i] == 0 ? 0 : (float) ((now - births[i]) / 1e9), births[i] == 0 ? 0 : 1);
            }
        }
        if (!active) timer.stop();
    }

    private void uniform(String name, float... values) {
        try {
            setFloat.invoke(effect, name, values);
        } catch (IllegalAccessException | InvocationTargetException failure) {
            throw new IllegalStateException("Cannot update Ripple Effect parameter " + name, failure);
        }
    }

    @Override public void close() {
        control.setSelected(false);
        timer.stop();
        scene.removeEventFilter(MouseEvent.MOUSE_PRESSED, press);
        effect = null;
        previousEffect = null;
    }
}
