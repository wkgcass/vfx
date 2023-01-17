package io.vproxy.vfx.entity.input;

import javafx.scene.input.MouseButton;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class Key {
    public final MouseButton button;
    public final KeyCode key;
    public final boolean isLeftKey;
    public final String raw;

    public Key(String raw) {
        this.raw = raw;
        this.button = formatButton(raw);
        this.key = formatKey(raw);
        this.isLeftKey = checkIsLeftKey(raw);
    }

    public Key(MouseButton button) {
        this.button = button;
        this.key = null;
        this.isLeftKey = false;
        this.raw = toString(button, null, false);
    }

    public Key(KeyCode key) {
        this.button = null;
        this.key = key;
        this.isLeftKey = false;
        this.raw = toString(null, key, false);
    }

    public Key(KeyCode key, boolean isLeftKey) {
        this.button = null;
        this.key = key;
        this.isLeftKey = isLeftKey;
        this.raw = toString(null, key, isLeftKey);
    }

    public boolean isValid() {
        return toString(button, key, isLeftKey) != null;
    }

    private static MouseButton formatButton(String raw) {
        return stringToMouseButtonMap.get(raw.toLowerCase());
    }

    private static KeyCode formatKey(String raw) {
        return stringToKeyCodeMap.get(raw.toLowerCase());
    }

    private static boolean checkIsLeftKey(String raw) {
        raw = raw.toLowerCase();
        return hasLeftRightStrings.contains(raw) && raw.startsWith("left");
    }

    @SuppressWarnings("MismatchedQueryAndUpdateOfCollection")
    private static final Map<String, MouseButton> stringToMouseButtonMap;
    private static final Map<MouseButton, String> mouseButtonToStringMap = new HashMap<>() {{
        put(MouseButton.PRIMARY, "LeftMouseButton");
        put(MouseButton.SECONDARY, "RightMouseButton");
        put(MouseButton.MIDDLE, "MiddleMouseButton");
    }};
    private static final Map<KeyCode, String> keyCodeToStringMap = new HashMap<>() {{
        for (var c : KeyCode.values()) {
            put(c, c.ueText);
        }
    }};
    @SuppressWarnings("MismatchedQueryAndUpdateOfCollection")
    private static final Map<String, KeyCode> stringToKeyCodeMap;
    private static final Set<KeyCode> requireLeftRightKeys = new HashSet<>() {{
        add(KeyCode.CONTROL);
        add(KeyCode.SHIFT);
        add(KeyCode.ALT);
    }};
    private static final Set<String> hasLeftRightStrings = new HashSet<>() {{
        add("LeftControl".toLowerCase());
        add("RightControl".toLowerCase());
        add("LeftAlt".toLowerCase());
        add("RightAlt".toLowerCase());
        add("LeftShift".toLowerCase());
        add("RightShift".toLowerCase());
    }};

    static {
        stringToMouseButtonMap = new HashMap<>() {{
            for (var entry : mouseButtonToStringMap.entrySet()) {
                put(entry.getValue().toLowerCase(), entry.getKey());
            }
        }};
        stringToKeyCodeMap = new HashMap<>() {{
            for (var entry : keyCodeToStringMap.entrySet()) {
                var k = entry.getKey();
                var s = entry.getValue().toLowerCase();
                if (requireLeftRightKeys.contains(k)) {
                    put("left" + s, k);
                    put("right" + s, k);
                } else {
                    put(s, k);
                }
            }
        }};
    }

    private String toString(MouseButton button, KeyCode key, boolean isLeftKey) {
        String ret = null;
        if (button != null) {
            ret = mouseButtonToStringMap.get(button);
        } else if (key != null) {
            ret = keyCodeToStringMap.get(key);
            if (ret != null) {
                if (requireLeftRightKeys.contains(key)) {
                    ret = (isLeftKey ? "Left" : "Right") + ret;
                }
            }
        }
        return ret;
    }

    @Override
    public String toString() {
        String ret = toString(button, key, isLeftKey);
        if (ret == null) {
            ret = raw;
        }
        if (ret == null) {
            ret = "Unknown";
        }
        return ret;
    }
}
