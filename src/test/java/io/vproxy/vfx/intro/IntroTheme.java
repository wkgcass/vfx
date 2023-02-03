package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontProvider;
import io.vproxy.vfx.manager.font.FontSettings;
import io.vproxy.vfx.theme.impl.DarkTheme;
import io.vproxy.vfx.theme.impl.DarkThemeFontProvider;

public class IntroTheme extends DarkTheme {
    @Override
    public FontProvider fontProvider() {
        return new IntroFontProvider();
    }

    public static class IntroFontProvider extends DarkThemeFontProvider {
        @Override
        protected void defaultFont(FontSettings settings) {
            super.defaultFont(settings);
            settings.setFamily(FontManager.FONT_NAME_JetBrainsMono);
        }
    }
}
