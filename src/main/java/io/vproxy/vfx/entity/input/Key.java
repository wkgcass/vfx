package io.vproxy.vfx.entity.input;

import javafx.scene.input.MouseButton;
import vjson.JSON;
import vjson.JSONObject;
import vjson.deserializer.rule.BoolRule;
import vjson.deserializer.rule.ObjectRule;
import vjson.deserializer.rule.Rule;
import vjson.deserializer.rule.StringRule;
import vjson.util.ObjectBuilder;

import java.util.*;

public class Key implements JSONObject {
    public final MouseButton button;
    public final MouseWheelScroll scroll;
    public final KeyCode key;
    public final boolean isLeftKey;
    public final String raw;

    public static final Rule<Key> rule = ObjectRule.builder(KeyBuilder::new, KeyBuilder::build, builder -> builder
        .put("button", (o, it) -> o.button = MouseButton.valueOf(it), StringRule.get())
        .put("scroll", (o, it) -> o.scroll = it, MouseWheelScroll.rule)
        .put("key", (o, it) -> o.key = KeyCode.valueOf(it), StringRule.get())
        .put("isLeftKey", (o, it) -> o.isLeftKey = it, BoolRule.get())
        .put("raw", (o, it) -> o.raw = it, StringRule.get())
    );

    private static class KeyBuilder {
        MouseButton button;
        MouseWheelScroll scroll;
        KeyCode key;
        boolean isLeftKey;
        String raw;

        Key build() {
            if (button != null)
                return new Key(button);
            if (scroll != null)
                return new Key(scroll);
            if (key != null)
                return new Key(key, isLeftKey);
            return new Key(raw);
        }
    }

    public Key(String raw) {
        this.raw = raw;
        this.button = formatButton(raw);
        this.scroll = null;
        this.key = formatKey(raw);
        this.isLeftKey = checkIsLeftKey(raw);
    }

    public Key(MouseButton button) {
        this.button = button;
        this.scroll = null;
        this.key = null;
        this.isLeftKey = false;
        this.raw = toString(button, null, null, false);
    }

    public Key(MouseWheelScroll scroll) {
        this.button = null;
        this.scroll = scroll;
        this.key = null;
        this.isLeftKey = false;
        this.raw = toString(null, scroll, null, false);
    }

    public Key(KeyCode key) {
        this.button = null;
        this.scroll = null;
        this.key = key;
        this.isLeftKey = false;
        this.raw = toString(null, null, key, false);
    }

    public Key(KeyCode key, boolean isLeftKey) {
        this.button = null;
        this.scroll = null;
        this.key = key;
        this.isLeftKey = isLeftKey;
        this.raw = toString(null, null, key, isLeftKey);
    }

    public boolean isValid() {
        return toString(button, scroll, key, isLeftKey) != null;
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

    private String toString(MouseButton button, MouseWheelScroll scroll, KeyCode key, boolean isLeftKey) {
        String ret = null;
        if (button != null) {
            ret = mouseButtonToStringMap.get(button);
        } else if (scroll != null) {
            ret = scroll.toString();
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
        String ret = toString(button, scroll, key, isLeftKey);
        if (ret == null) {
            ret = raw;
        }
        if (ret == null) {
            ret = "Unknown";
        }
        return ret;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Key key1 = (Key) o;

        if (isLeftKey != key1.isLeftKey) return false;
        if (button != key1.button) return false;
        if (key != key1.key) return false;
        return Objects.equals(raw, key1.raw);
    }

    @Override
    public int hashCode() {
        int result = button != null ? button.hashCode() : 0;
        result = 31 * result + (key != null ? key.hashCode() : 0);
        result = 31 * result + (isLeftKey ? 1 : 0);
        result = 31 * result + (raw != null ? raw.hashCode() : 0);
        return result;
    }

    @Override
    public JSON.Object toJson() {
        var ob = new ObjectBuilder();
        if (button != null) {
            ob.put("button", button.name());
        }
        if (scroll != null) {
            ob.putInst("scroll", scroll.toJson());
        }
        if (key != null) {
            ob.put("key", key.name());
            ob.put("isLeftKey", isLeftKey);
        }
        if (button == null && key == null && raw != null) {
            ob.put("raw", raw);
        }
        return ob.build();
    }
}
