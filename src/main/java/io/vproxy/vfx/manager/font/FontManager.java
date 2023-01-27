package io.vproxy.vfx.manager.font;

import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.util.Logger;
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
        var font = Font.loadFont(getClass().getResourceAsStream("/io/vproxy/vfx/res/font/SmileySans-Oblique.otf"), 1);
        if (font == null) {
            Logger.error("failed loading font: SmileySans-Oblique");
        }
        font = Font.loadFont(getClass().getResourceAsStream("/io/vproxy/vfx/res/font/NotoSansSC-Regular.otf"), 1);
        if (font == null) {
            Logger.error("failed loading font: NotoSansSC-Regular");
        }
        font = Font.loadFont(getClass().getResourceAsStream("/io/vproxy/vfx/res/font/JetBrainsMono-Regular.ttf"), 1);
        if (font == null) {
            Logger.error("failed loading font: JetBrainsMono-Regular");
        }
    }

    public static final String FONT_NAME_Default = Font.getDefault().getFamily();
    public static final String FONT_NAME_SmileySansOblique = "Smiley Sans Oblique";
    public static final String FONT_NAME_NotoSansSCRegular = "Noto Sans SC Regular";
    public static final String FONT_NAME_JetBrainsMono = "JetBrains Mono";

    public static FontManager get() {
        return instance;
    }

    public void setFontProvider(FontProvider provider) {
        this.provider = provider;
    }

    private FontProvider getProvider() {
        if (provider == null) {
            setFontProvider(Theme.current().fontProvider());
        }
        return provider;
    }

    public void setFont(Labeled labeled) {
        labeled.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), 16));
    }

    public void setFont(Labeled labeled, int size) {
        labeled.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), size));
    }

    public void setFont(Labeled labeled, FontPosture posture, double size) {
        labeled.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), posture, size));
    }

    public void setFont(Labeled labeled, FontWeight weight, double size) {
        labeled.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), weight, size));
    }

    public void setFont(Labeled labeled, FontWeight weight,
                        FontPosture posture, double size) {
        labeled.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), weight, posture, size));
    }

    // -------------

    public void setFont(FontUsage usage, Labeled labeled) {
        labeled.setFont(Font.font(getProvider().name(usage), 16));
    }

    public void setFont(FontUsage usage, Labeled labeled, int size) {
        labeled.setFont(Font.font(getProvider().name(usage), size));
    }

    public void setFont(FontUsage usage, Labeled labeled, FontPosture posture, double size) {
        labeled.setFont(Font.font(getProvider().name(usage), posture, size));
    }

    public void setFont(FontUsage usage, Labeled labeled, FontWeight weight, double size) {
        labeled.setFont(Font.font(getProvider().name(usage), weight, size));
    }

    public void setFont(FontUsage usage, Labeled labeled, FontWeight weight,
                        FontPosture posture, double size) {
        labeled.setFont(Font.font(getProvider().name(usage), weight, posture, size));
    }

    // =============

    public void setFont(TextInputControl input) {
        input.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), 16));
    }

    public void setFont(TextInputControl input, int size) {
        input.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), size));
    }

    public void setFont(TextInputControl input, FontPosture posture, double size) {
        input.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), posture, size));
    }

    public void setFont(TextInputControl input, FontWeight weight, double size) {
        input.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), weight, size));
    }

    public void setFont(TextInputControl input, FontWeight weight,
                        FontPosture posture, double size) {
        input.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), weight, posture, size));
    }

    // -------------

    public void setFont(FontUsage usage, TextInputControl input) {
        input.setFont(Font.font(getProvider().name(usage), 16));
    }

    public void setFont(FontUsage usage, TextInputControl input, int size) {
        input.setFont(Font.font(getProvider().name(usage), size));
    }

    public void setFont(FontUsage usage, TextInputControl input, FontPosture posture, double size) {
        input.setFont(Font.font(getProvider().name(usage), posture, size));
    }

    public void setFont(FontUsage usage, TextInputControl input, FontWeight weight, double size) {
        input.setFont(Font.font(getProvider().name(usage), weight, size));
    }

    public void setFont(FontUsage usage, TextInputControl input, FontWeight weight,
                        FontPosture posture, double size) {
        input.setFont(Font.font(getProvider().name(usage), weight, posture, size));
    }

    // =============
    public void setFont(Text text) {
        text.setFont(Font.font(getProvider().name(FontUsages.defaultUsage)));
    }

    public void setFont(Text text, int size) {
        text.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), size));
    }

    public void setFont(Text text, FontPosture posture, double size) {
        text.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), posture, size));
    }

    public void setFont(Text text, FontWeight weight, double size) {
        text.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), weight, size));
    }

    public void setFont(Text text, FontWeight weight,
                        FontPosture posture, double size) {
        text.setFont(Font.font(getProvider().name(FontUsages.defaultUsage), weight, posture, size));
    }

    // -------------

    public void setFont(FontUsage usage, Text text) {
        text.setFont(Font.font(getProvider().name(usage)));
    }

    public void setFont(FontUsage usage, Text text, int size) {
        text.setFont(Font.font(getProvider().name(usage), size));
    }

    public void setFont(FontUsage usage, Text text, FontPosture posture, double size) {
        text.setFont(Font.font(getProvider().name(usage), posture, size));
    }

    public void setFont(FontUsage usage, Text text, FontWeight weight, double size) {
        text.setFont(Font.font(getProvider().name(usage), weight, size));
    }

    public void setFont(FontUsage usage, Text text, FontWeight weight,
                        FontPosture posture, double size) {
        text.setFont(Font.font(getProvider().name(usage), weight, posture, size));
    }
}
