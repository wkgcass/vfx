package io.vproxy.vfx.theme;

import io.vproxy.vfx.manager.font.FontProvider;
import io.vproxy.vfx.manager.font.FontUsage;
import io.vproxy.vfx.manager.font.FontUsages;

public abstract class ThemeFontProvider implements FontProvider {
    @Override
    public final String name(FontUsage usage) {
        if (usage == FontUsages.windowTitle) {
            return windowTitle();
        } else if (usage == FontUsages.tableCellText) {
            return tableCellText();
        } else {
            return _name(usage);
        }
    }

    @Override
    public int defaultFontSize(FontUsage usage) {
        if (usage == FontUsages.windowTitle) {
            return windowTitleSize();
        } else if (usage == FontUsages.tableCellText) {
            return tableCellTextSize();
        } else {
            return _size(usage);
        }
    }

    protected abstract String windowTitle();

    protected abstract String tableCellText();

    protected abstract int windowTitleSize();

    protected abstract int tableCellTextSize();

    protected abstract String _name(FontUsage usage);

    protected abstract int _size(FontUsage usage);
}
