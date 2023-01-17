package io.vproxy.vfx.entity.input;

import javafx.scene.input.MouseButton;

import java.util.Set;

public class InputData {
    public boolean ctrl;
    public boolean alt;
    public boolean shift;
    public Key key;

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
}
