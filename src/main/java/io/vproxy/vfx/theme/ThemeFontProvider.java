package io.vproxy.vfx.theme;

import io.vproxy.vfx.manager.font.FontProvider;
import io.vproxy.vfx.manager.font.FontSettings;
import io.vproxy.vfx.manager.font.FontUsage;
import io.vproxy.vfx.manager.font.FontUsages;

public abstract class ThemeFontProvider implements FontProvider {
    @Override
    public void apply(FontUsage usage, FontSettings settings) {
        if (usage == FontUsages.windowTitle) {
            windowTitle(settings);
        } else if (usage == FontUsages.tableCellText) {
            tableCellText(settings);
        } else {
            _default(settings);
        }
    }

    protected abstract void windowTitle(FontSettings settings);

    protected abstract void tableCellText(FontSettings settings);

    protected abstract void _default(FontSettings settings);
}
