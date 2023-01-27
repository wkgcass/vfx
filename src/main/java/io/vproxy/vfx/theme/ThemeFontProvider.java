package io.vproxy.vfx.theme;

import io.vproxy.vfx.manager.font.FontProvider;
import io.vproxy.vfx.manager.font.FontUsage;
import io.vproxy.vfx.manager.font.FontUsages;

public abstract class ThemeFontProvider implements FontProvider {
    @Override
    public final String name(FontUsage usage) {
        if (usage == FontUsages.windowTitle) {
            return windowTitle();
        } else {
            return _name(usage);
        }
    }

    protected abstract String windowTitle();

    protected abstract String _name(FontUsage usage);
}
