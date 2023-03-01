package io.vproxy.vfx.manager.font;

import io.vproxy.base.util.LogType;
import io.vproxy.base.util.Logger;
import io.vproxy.vfx.theme.Theme;
import javafx.scene.control.Labeled;
import javafx.scene.control.TextInputControl;
import javafx.scene.text.Font;
import javafx.scene.text.Text;

import java.util.function.Function;

public class FontManager {
    private static final FontManager instance = new FontManager();

    private FontProvider provider;

    private FontManager() {
        var font = Font.loadFont(getClass().getResourceAsStream("/io/vproxy/vfx/res/font/SmileySans-Oblique.otf"), 1);
        if (font == null) {
            Logger.error(LogType.FILE_ERROR, "failed loading font: SmileySans-Oblique");
        }
        font = Font.loadFont(getClass().getResourceAsStream("/io/vproxy/vfx/res/font/NotoSansSC-Regular.otf"), 1);
        if (font == null) {
            Logger.error(LogType.FILE_ERROR, "failed loading font: NotoSansSC-Regular");
        }
        font = Font.loadFont(getClass().getResourceAsStream("/io/vproxy/vfx/res/font/JetBrainsMono-Regular.ttf"), 1);
        if (font == null) {
            Logger.error(LogType.FILE_ERROR, "failed loading font: JetBrainsMono-Regular");
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
        setFont(FontUsages.defaultUsage, labeled);
    }

    public void setFont(Labeled labeled, Function<FontSettings, FontSettings> apply) {
        setFont(FontUsages.defaultUsage, labeled, apply);
    }

    // -------------

    public void setFont(FontUsage usage, Labeled labeled) {
        var settings = new FontSettings();
        getProvider().apply(usage, settings);
        labeled.setFont(settings.build());
    }

    public void setFont(FontUsage usage, Labeled labeled, Function<FontSettings, FontSettings> apply) {
        var settings = new FontSettings();
        getProvider().apply(usage, settings);
        apply.apply(settings);
        labeled.setFont(settings.build());
    }

    // =============

    public void setFont(TextInputControl input) {
        setFont(FontUsages.defaultUsage, input);
    }

    public void setFont(TextInputControl input, Function<FontSettings, FontSettings> apply) {
        setFont(FontUsages.defaultUsage, input, apply);
    }

    // -------------

    public void setFont(FontUsage usage, TextInputControl input) {
        var settings = new FontSettings();
        getProvider().apply(usage, settings);
        input.setFont(settings.build());
    }

    public void setFont(FontUsage usage, TextInputControl input, Function<FontSettings, FontSettings> apply) {
        var settings = new FontSettings();
        getProvider().apply(usage, settings);
        apply.apply(settings);
        input.setFont(settings.build());
    }

    // =============

    public void setFont(Text text) {
        setFont(FontUsages.defaultUsage, text);
    }

    public void setFont(Text text, Function<FontSettings, FontSettings> apply) {
        setFont(FontUsages.defaultUsage, text, apply);
    }

    // -------------

    public void setFont(FontUsage usage, Text text) {
        var settings = new FontSettings();
        getProvider().apply(usage, settings);
        text.setFont(settings.build());
    }

    public void setFont(FontUsage usage, Text text, Function<FontSettings, FontSettings> apply) {
        var settings = new FontSettings();
        getProvider().apply(usage, settings);
        apply.apply(settings);
        text.setFont(settings.build());
    }
}
