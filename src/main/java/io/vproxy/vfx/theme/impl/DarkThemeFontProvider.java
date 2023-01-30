package io.vproxy.vfx.theme.impl;

import io.vproxy.vfx.manager.font.FontUsage;
import io.vproxy.vfx.theme.ThemeFontProvider;
import io.vproxy.vfx.manager.font.FontManager;

public class DarkThemeFontProvider extends ThemeFontProvider {
    protected String defaultFont() {
        return FontManager.FONT_NAME_NotoSansSCRegular;
    }

    @Override
    protected String windowTitle() {
        return defaultFont();
    }

    @Override
    protected String tableCellText() {
        return defaultFont();
    }

    @Override
    protected int windowTitleSize() {
        return 15;
    }

    @Override
    protected int tableCellTextSize() {
        return 12;
    }

    @Override
    protected String _name(FontUsage usage) {
        return defaultFont();
    }

    @Override
    protected int _size(FontUsage usage) {
        return 16;
    }
}
