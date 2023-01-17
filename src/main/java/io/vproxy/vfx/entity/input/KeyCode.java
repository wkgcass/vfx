package io.vproxy.vfx.entity.input;

import java.util.HashMap;
import java.util.Map;

public enum KeyCode {
    ESCAPE(0x0001, "Escape", javafx.scene.input.KeyCode.ESCAPE),
    F1(0x003B, "F1", javafx.scene.input.KeyCode.F1),
    F2(0x003C, "F2", javafx.scene.input.KeyCode.F2),
    F3(0x003D, "F3", javafx.scene.input.KeyCode.F3),
    F4(0x003E, "F4", javafx.scene.input.KeyCode.F4),
    F5(0x003F, "F5", javafx.scene.input.KeyCode.F5),
    F6(0x0040, "F6", javafx.scene.input.KeyCode.F6),
    F7(0x0041, "F7", javafx.scene.input.KeyCode.F7),
    F8(0x0042, "F8", javafx.scene.input.KeyCode.F8),
    F9(0x0043, "F9", javafx.scene.input.KeyCode.F9),
    F10(0x0044, "F10", javafx.scene.input.KeyCode.F10),
    F11(0x0057, "F11", javafx.scene.input.KeyCode.F11),
    F12(0x0058, "F12", javafx.scene.input.KeyCode.F12),
    BACKQUOTE(0x0029, "Tilde", javafx.scene.input.KeyCode.BACK_QUOTE),
    KEY_1(0x0002, "One", javafx.scene.input.KeyCode.DIGIT1),
    KEY_2(0x0003, "Two", javafx.scene.input.KeyCode.DIGIT2),
    KEY_3(0x0004, "Three", javafx.scene.input.KeyCode.DIGIT3),
    KEY_4(0x0005, "Four", javafx.scene.input.KeyCode.DIGIT4),
    KEY_5(0x0006, "Five", javafx.scene.input.KeyCode.DIGIT5),
    KEY_6(0x0007, "Six", javafx.scene.input.KeyCode.DIGIT6),
    KEY_7(0x0008, "Seven", javafx.scene.input.KeyCode.DIGIT7),
    KEY_8(0x0009, "Eight", javafx.scene.input.KeyCode.DIGIT8),
    KEY_9(0x000A, "Nine", javafx.scene.input.KeyCode.DIGIT9),
    KEY_0(0x000B, "Zero", javafx.scene.input.KeyCode.DIGIT0),
    MINUS(0x000C, "Hyphen", javafx.scene.input.KeyCode.MINUS),
    EQUALS(0x000D, "Equals", javafx.scene.input.KeyCode.EQUALS),
    BACKSPACE(0x000E, "BackSpace", javafx.scene.input.KeyCode.BACK_SPACE),
    TAB(0x000F, "Tab", javafx.scene.input.KeyCode.TAB),
    A(0x001E, "A", javafx.scene.input.KeyCode.A),
    B(0x0030, "B", javafx.scene.input.KeyCode.B),
    C(0x002E, "C", javafx.scene.input.KeyCode.C),
    D(0x0020, "D", javafx.scene.input.KeyCode.D),
    E(0x0012, "E", javafx.scene.input.KeyCode.E),
    F(0x0021, "F", javafx.scene.input.KeyCode.F),
    G(0x0022, "G", javafx.scene.input.KeyCode.G),
    H(0x0023, "H", javafx.scene.input.KeyCode.H),
    I(0x0017, "I", javafx.scene.input.KeyCode.I),
    J(0x0024, "J", javafx.scene.input.KeyCode.J),
    K(0x0025, "K", javafx.scene.input.KeyCode.K),
    L(0x0026, "L", javafx.scene.input.KeyCode.L),
    M(0x0032, "M", javafx.scene.input.KeyCode.M),
    N(0x0031, "N", javafx.scene.input.KeyCode.N),
    O(0x0018, "O", javafx.scene.input.KeyCode.O),
    P(0x0019, "P", javafx.scene.input.KeyCode.P),
    Q(0x0010, "Q", javafx.scene.input.KeyCode.Q),
    R(0x0013, "R", javafx.scene.input.KeyCode.R),
    S(0x001F, "S", javafx.scene.input.KeyCode.S),
    T(0x0014, "T", javafx.scene.input.KeyCode.T),
    U(0x0016, "U", javafx.scene.input.KeyCode.U),
    V(0x002F, "V", javafx.scene.input.KeyCode.V),
    W(0x0011, "W", javafx.scene.input.KeyCode.W),
    X(0x002D, "X", javafx.scene.input.KeyCode.X),
    Y(0x0015, "Y", javafx.scene.input.KeyCode.Y),
    Z(0x002C, "Z", javafx.scene.input.KeyCode.Z),
    OPEN_BRACKET(0x001A, "LeftBracket", javafx.scene.input.KeyCode.BRACELEFT),
    CLOSE_BRACKET(0x001B, "RightBracket", javafx.scene.input.KeyCode.BRACERIGHT),
    BACK_SLASH(0x002B, "Backslash", javafx.scene.input.KeyCode.BACK_SLASH),
    SEMICOLON(0x0027, "Semicolon", javafx.scene.input.KeyCode.SEMICOLON),
    QUOTE(0x0028, "Quote", javafx.scene.input.KeyCode.QUOTE),
    ENTER(0x001C, "Enter", javafx.scene.input.KeyCode.ENTER),
    COMMA(0x0033, "Comma", javafx.scene.input.KeyCode.COMMA),
    PERIOD(0x0034, "Period", javafx.scene.input.KeyCode.PERIOD),
    SLASH(0x0035, "Slash", javafx.scene.input.KeyCode.SLASH),
    SPACE(0x0039, "SpaceBar", javafx.scene.input.KeyCode.SPACE),
    INSERT(0x0E52, "Insert", javafx.scene.input.KeyCode.INSERT),
    DELETE(0x0E53, "Delete", javafx.scene.input.KeyCode.DELETE),
    HOME(0x0E47, "Home", javafx.scene.input.KeyCode.HOME),
    END(0x0E4F, "End", javafx.scene.input.KeyCode.END),
    PAGE_UP(0x0E49, "PageUp", javafx.scene.input.KeyCode.PAGE_UP),
    PAGE_DOWN(0x0E51, "PageDown", javafx.scene.input.KeyCode.PAGE_DOWN),
    UP(0xE048, "Up", javafx.scene.input.KeyCode.UP),
    LEFT(0xE04B, "Left", javafx.scene.input.KeyCode.LEFT),
    RIGHT(0xE04D, "Right", javafx.scene.input.KeyCode.RIGHT),
    DOWN(0xE050, "Down", javafx.scene.input.KeyCode.DOWN),
    SHIFT(0x002A, "Shift", javafx.scene.input.KeyCode.SHIFT, true),
    CONTROL(0x001D, "Control", javafx.scene.input.KeyCode.CONTROL, true),
    ALT(0x0038, "Alt", javafx.scene.input.KeyCode.ALT, true),
    ;
    public final int code;
    public final String ueText;
    public final boolean requireLeftRight;
    public final javafx.scene.input.KeyCode java;

    KeyCode(int code, String ueText, javafx.scene.input.KeyCode java) {
        this(code, ueText, java, false);
    }

    KeyCode(int code, String ueText, javafx.scene.input.KeyCode java, boolean requireLeftRight) {
        this.code = code;
        this.ueText = ueText;
        this.java = java;
        this.requireLeftRight = requireLeftRight;
    }

    private static final KeyCode[] codeMap;
    private static final Map<String, KeyCode> ueTextMap = new HashMap<>();

    static {
        int max = 0;
        for (var c : values()) {
            if (c.code > max) {
                max = c.code;
            }
        }
        codeMap = new KeyCode[max + 1];
        for (var c : values()) {
            codeMap[c.code] = c;
            ueTextMap.put(c.ueText, c);
        }
    }

    public static KeyCode valueOf(int code) {
        if (code == 0x0e36) return SHIFT;
        if (code >= codeMap.length) return null;
        if (code < 0) return null;
        return codeMap[code];
    }

    public static KeyCode valueOfUeText(String ueText) {
        return ueTextMap.get(ueText);
    }
}
