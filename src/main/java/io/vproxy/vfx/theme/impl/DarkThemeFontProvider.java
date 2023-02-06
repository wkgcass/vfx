package io.vproxy.vfx.theme.impl;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontSettings;
import io.vproxy.vfx.manager.font.FontUsage;
import io.vproxy.vfx.theme.ThemeFontProvider;

public class DarkThemeFontProvider extends ThemeFontProvider {
    protected void defaultFont(FontSettings settings) {
        settings.setFamily(FontManager.FONT_NAME_NotoSansSCRegular);
    }

    @Override
    protected void windowTitle(FontSettings settings) {
        defaultFont(settings);
        settings.setSize(15);
    }

    @Override
    protected void tableCellText(FontSettings settings) {
        defaultFont(settings);
        settings.setSize(12);
    }

    @Override
    protected void _default(FontUsage usage, FontSettings settings) {
        defaultFont(settings);
        settings.setSize(16);
    }
}
