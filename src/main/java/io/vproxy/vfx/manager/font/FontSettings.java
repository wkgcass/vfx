package io.vproxy.vfx.manager.font;

import javafx.scene.text.Font;
import javafx.scene.text.FontPosture;
import javafx.scene.text.FontWeight;

public class FontSettings {
    public String family;
    public double size = -1;
    public FontWeight weight;
    public FontPosture posture;

    public FontSettings() {
    }

    public FontSettings setFamily(String family) {
        this.family = family;
        return this;
    }

    public FontSettings setSize(double size) {
        this.size = size;
        return this;
    }

    public FontSettings setWeight(FontWeight weight) {
        this.weight = weight;
        return this;
    }

    public FontSettings setPosture(FontPosture posture) {
        this.posture = posture;
        return this;
    }

    public Font build() {
        var family = this.family;
        if (family == null) family = FontManager.FONT_NAME_Default;
        return Font.font(family, weight, posture, size);
    }
}
