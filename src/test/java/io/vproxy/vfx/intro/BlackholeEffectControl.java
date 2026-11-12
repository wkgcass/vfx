package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.theme.Theme;
import javafx.beans.InvalidationListener;
import javafx.event.EventHandler;
import javafx.geometry.Bounds;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.CheckBox;
import javafx.scene.control.Tooltip;
import javafx.scene.effect.Effect;
import javafx.scene.input.MouseEvent;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

final class BlackholeEffectControl implements AutoCloseable {
    private static final String SHADER_SOURCE =
        "shader_type canvas_item;\n" +
        "render_mode unshaded, blend_premul_alpha;\n" +
        "\n" +
        "// Adapted from the user-supplied lens template to a JavaFX node texture.\n" +
        "uniform vec2 lens_center = vec2(0.5, 0.5);\n" +
        "uniform vec2 extent = vec2(1280.0, 800.0);\n" +
        "uniform float lens_radius = 0.18;\n" +
        "uniform float influence_radius = 0.33;\n" +
        "uniform float distortion_strength = 0.13341541;\n" +
        "uniform float edge_softness = 2.0;\n" +
        "uniform float outer_warp = 0.015;\n" +
        "\n" +
        "void fragment() {\n" +
        "    float aspect = extent.x / extent.y;\n" +
        "    vec2 delta = UV - lens_center;\n" +
        "    delta.x *= aspect;\n" +
        "    float dist = length(delta);\n" +
        "    vec4 original = texture(TEXTURE, UV);\n" +
        "    if (dist >= influence_radius) {\n" +
        "        COLOR = original;\n" +
        "    } else {\n" +
        "        float t = clamp(dist / influence_radius, 0.0, 1.0);\n" +
        "        float falloff = pow(1.0 - t, edge_softness);\n" +
        "        float inner = 1.0 - smoothstep(lens_radius, influence_radius, dist);\n" +
        "        vec2 dir = dist > 0.0001 ? normalize(delta) : vec2(0.0);\n" +
        "        float inner_strength = distortion_strength * inner;\n" +
        "        float outer_strength = outer_warp * falloff;\n" +
        "        vec2 offset = -dir * (inner_strength + outer_strength);\n" +
        "        offset.x /= aspect;\n" +
        "        vec2 sample_uv = clamp(UV + offset, vec2(0.001), vec2(0.999));\n" +
        "        vec4 col = texture(TEXTURE, sample_uv);\n" +
        "        COLOR = col;\n" +
        "    }\n" +
        "}\n";

    private final CheckBox control = new CheckBox("Blackhole Effect");
    private final Scene scene;
    private final Node target;
    private Effect effect;
    private Effect previousEffect;
    private Method setFloat;
    private boolean pointerInScene;
    private double sceneX, sceneY;
    private final EventHandler<MouseEvent> motion = this::move;
    private final EventHandler<MouseEvent> exit = event -> { pointerInScene = false; update(); };
    private final InvalidationListener boundsChanged = ignored -> update();

    BlackholeEffectControl(Scene scene, Node target) {
        this.scene = scene;
        this.target = target;
        control.setId("blackhole-effect-toggle");
        control.setTextFill(Theme.current().normalTextColor());
        FontManager.get().setFont(control);
        control.setPrefHeight(40);
        control.setTooltip(new Tooltip("Warp the Demo content around the pointer using a Godot shader."));
        control.selectedProperty().addListener((observable, oldValue, selected) -> {
            if (selected) {
                try {
                    if (effect == null) createEffect();
                    previousEffect = target.getEffect();
                    update();
                } catch (ReflectiveOperationException failure) {
                    control.setSelected(false);
                    throw new IllegalStateException("Cannot initialize Blackhole Effect", failure);
                }
            } else {
                restore();
            }
        });
        scene.addEventFilter(MouseEvent.MOUSE_MOVED, motion);
        scene.addEventFilter(MouseEvent.MOUSE_DRAGGED, motion);
        scene.addEventFilter(MouseEvent.MOUSE_PRESSED, motion);
        scene.addEventFilter(MouseEvent.MOUSE_EXITED, exit);
        target.layoutBoundsProperty().addListener(boundsChanged);
    }

    CheckBox getControl() { return control; }

    private void createEffect() throws ReflectiveOperationException {
        // Resolve the public extension lazily so standard JavaFX builds and
        // native reference runs do not require a nonstandard JavaFX class.
        var type = Class.forName("javafx.scene.effect.GodotShaderEffect");
        effect = (Effect) type.getConstructor(String.class).newInstance(SHADER_SOURCE);
        setFloat = type.getMethod("setFloat", String.class, float[].class);
    }

    private void move(MouseEvent event) {
        sceneX = event.getSceneX();
        sceneY = event.getSceneY();
        pointerInScene = true;
        update();
    }

    private void update() {
        if (!control.isSelected() || effect == null) return;
        if (!pointerInScene) { restore(); return; }
        Bounds bounds = target.getBoundsInLocal();
        if (bounds.getWidth() <= 0 || bounds.getHeight() <= 0) return;
        var point = target.sceneToLocal(sceneX, sceneY);
        if (point == null) { restore(); return; }
        uniform("extent", (float) bounds.getWidth(), (float) bounds.getHeight());
        uniform("lens_center", (float) ((point.getX() - bounds.getMinX()) / bounds.getWidth()),
            (float) ((point.getY() - bounds.getMinY()) / bounds.getHeight()));
        if (target.getEffect() != effect) target.setEffect(effect);
    }

    private void uniform(String name, float... values) {
        try {
            setFloat.invoke(effect, name, values);
        } catch (IllegalAccessException | InvocationTargetException failure) {
            throw new IllegalStateException("Cannot update Blackhole Effect parameter " + name, failure);
        }
    }

    private void restore() {
        if (effect != null && target.getEffect() == effect) {
            target.setEffect(previousEffect);
        }
    }

    @Override public void close() {
        control.setSelected(false);
        restore();
        scene.removeEventFilter(MouseEvent.MOUSE_MOVED, motion);
        scene.removeEventFilter(MouseEvent.MOUSE_DRAGGED, motion);
        scene.removeEventFilter(MouseEvent.MOUSE_PRESSED, motion);
        scene.removeEventFilter(MouseEvent.MOUSE_EXITED, exit);
        target.layoutBoundsProperty().removeListener(boundsChanged);
        effect = null;
        previousEffect = null;
    }
}
