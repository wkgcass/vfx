package io.vproxy.vfx.manager.font;

public interface FontProvider {
    String name(FontUsage usage);

    int defaultFontSize(FontUsage usage);
}
