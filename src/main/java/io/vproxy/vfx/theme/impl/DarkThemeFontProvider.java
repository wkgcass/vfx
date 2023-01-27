package io.vproxy.vfx.theme.impl;

import io.vproxy.vfx.manager.font.FontUsage;
import io.vproxy.vfx.theme.ThemeFontProvider;
import io.vproxy.vfx.manager.font.FontManager;

public class DarkThemeFontProvider extends ThemeFontProvider {
    @Override
    protected String windowTitle() {
        return FontManager.FONT_NAME_NotoSansSCRegular;
    }

    @Override
    protected String _name(FontUsage usage) {
        return FontManager.FONT_NAME_NotoSansSCRegular;
    }
}
