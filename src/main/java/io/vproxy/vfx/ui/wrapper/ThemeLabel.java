package io.vproxy.vfx.ui.wrapper;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.theme.Theme;
import javafx.scene.control.Label;

public class ThemeLabel extends Label {
    public ThemeLabel() {
        setTextFill(Theme.current().normalTextColor());
    }

    public ThemeLabel(String text) {
        super(text);
        setTextFill(Theme.current().normalTextColor());
        FontManager.get().setFont(this);
    }
}
