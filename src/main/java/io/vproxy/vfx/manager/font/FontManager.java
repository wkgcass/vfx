package io.vproxy.vfx.manager.font;

import javafx.scene.control.Labeled;
import javafx.scene.control.TextInputControl;
import javafx.scene.text.Font;
import javafx.scene.text.FontPosture;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;

public class FontManager {
    private static final FontManager instance = new FontManager();

    private FontProvider provider;

    private FontManager() {
    }

    public static FontManager get() {
        return instance;
    }

    public void setFontProvider(FontProvider provider) {
        this.provider = provider;
    }

    public void setFont(Labeled labeled) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(FontUsages.defaultUsage), 16));
    }

    public void setFont(Labeled labeled, int size) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(FontUsages.defaultUsage), size));
    }

    public void setFont(Labeled labeled, FontPosture posture, double size) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(FontUsages.defaultUsage), posture, size));
    }

    public void setFont(Labeled labeled, FontWeight weight, double size) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(FontUsages.defaultUsage), weight, size));
    }

    public void setFont(Labeled labeled, FontWeight weight,
                        FontPosture posture, double size) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(FontUsages.defaultUsage), weight, posture, size));
    }

    // -------------

    public void setFont(FontUsage usage, Labeled labeled) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(usage), 16));
    }

    public void setFont(FontUsage usage, Labeled labeled, int size) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(usage), size));
    }

    public void setFont(FontUsage usage, Labeled labeled, FontPosture posture, double size) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(usage), posture, size));
    }

    public void setFont(FontUsage usage, Labeled labeled, FontWeight weight, double size) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(usage), weight, size));
    }

    public void setFont(FontUsage usage, Labeled labeled, FontWeight weight,
                        FontPosture posture, double size) {
        if (provider == null) return;
        labeled.setFont(Font.font(provider.name(usage), weight, posture, size));
    }

    // =============

    public void setFont(TextInputControl input) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(FontUsages.defaultUsage), 16));
    }

    public void setFont(TextInputControl input, int size) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(FontUsages.defaultUsage), size));
    }

    public void setFont(TextInputControl input, FontPosture posture, double size) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(FontUsages.defaultUsage), posture, size));
    }

    public void setFont(TextInputControl input, FontWeight weight, double size) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(FontUsages.defaultUsage), weight, size));
    }

    public void setFont(TextInputControl input, FontWeight weight,
                        FontPosture posture, double size) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(FontUsages.defaultUsage), weight, posture, size));
    }

    // -------------

    public void setFont(FontUsage usage, TextInputControl input) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(usage), 16));
    }

    public void setFont(FontUsage usage, TextInputControl input, int size) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(usage), size));
    }

    public void setFont(FontUsage usage, TextInputControl input, FontPosture posture, double size) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(usage), posture, size));
    }

    public void setFont(FontUsage usage, TextInputControl input, FontWeight weight, double size) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(usage), weight, size));
    }

    public void setFont(FontUsage usage, TextInputControl input, FontWeight weight,
                        FontPosture posture, double size) {
        if (provider == null) return;
        input.setFont(Font.font(provider.name(usage), weight, posture, size));
    }

    // =============
    public void setFont(Text text) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(FontUsages.defaultUsage)));
    }

    public void setFont(Text text, int size) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(FontUsages.defaultUsage), size));
    }

    public void setFont(Text text, FontPosture posture, double size) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(FontUsages.defaultUsage), posture, size));
    }

    public void setFont(Text text, FontWeight weight, double size) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(FontUsages.defaultUsage), weight, size));
    }

    public void setFont(Text text, FontWeight weight,
                        FontPosture posture, double size) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(FontUsages.defaultUsage), weight, posture, size));
    }

    // -------------

    public void setFont(FontUsage usage, Text text) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(usage)));
    }

    public void setFont(FontUsage usage, Text text, int size) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(usage), size));
    }

    public void setFont(FontUsage usage, Text text, FontPosture posture, double size) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(usage), posture, size));
    }

    public void setFont(FontUsage usage, Text text, FontWeight weight, double size) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(usage), weight, size));
    }

    public void setFont(FontUsage usage, Text text, FontWeight weight,
                        FontPosture posture, double size) {
        if (provider == null) return;
        text.setFont(Font.font(provider.name(usage), weight, posture, size));
    }
}
