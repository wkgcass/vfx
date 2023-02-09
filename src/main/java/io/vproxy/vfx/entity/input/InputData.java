package io.vproxy.vfx.entity.input;

import javafx.scene.input.MouseButton;
import vjson.JSON;
import vjson.deserializer.rule.BoolRule;
import vjson.deserializer.rule.ObjectRule;
import vjson.deserializer.rule.Rule;
import vjson.deserializer.rule.StringRule;
import vjson.util.ObjectBuilder;

import java.util.Set;

public class InputData {
    public boolean ctrl;
    public boolean alt;
    public boolean shift;
    public Key key;

    public static final Rule<InputData> rule = new ObjectRule<>(InputData::new)
        .put("ctrl", (o, it) -> o.ctrl = it, BoolRule.get())
        .put("alt", (o, it) -> o.alt = it, BoolRule.get())
        .put("shift", (o, it) -> o.shift = it, BoolRule.get())
        .put("key", (o, it) -> o.key = new Key(it), StringRule.get());

    public InputData() {
    }

    public InputData(InputData data) {
        this.ctrl = data.ctrl;
        this.alt = data.alt;
        this.shift = data.shift;
        this.key = data.key;
    }

    public InputData(boolean ctrl, boolean alt, boolean shift, Key key) {
        this.ctrl = ctrl;
        this.alt = alt;
        this.shift = shift;
        this.key = key;
    }

    public InputData(Key key) {
        this(false, false, false, key);
    }

    public boolean matches(Set<KeyCode> keys, Set<MouseButton> buttons, KeyCode currentKey, MouseButton currentMouse) {
        if (ctrl) {
            if (!keys.contains(KeyCode.CONTROL)) return false;
        }
        if (alt) {
            if (!keys.contains(KeyCode.ALT)) return false;
        }
        if (shift) {
            if (!keys.contains(KeyCode.SHIFT)) return false;
        }
        if (key.key != null) return key.key == currentKey;
        if (key.button != null) return key.button == currentMouse;
        if (currentKey == KeyCode.CONTROL) return ctrl;
        if (currentKey == KeyCode.ALT) return alt;
        if (currentKey == KeyCode.SHIFT) return shift;
        return false;
    }

    public JSON.Object toJson() {
        var ob = new ObjectBuilder()
            .put("ctrl", ctrl)
            .put("alt", alt)
            .put("shift", shift);
        if (key != null) {
            ob.put("key", key.toString());
        }
        return ob.build();
    }
}
