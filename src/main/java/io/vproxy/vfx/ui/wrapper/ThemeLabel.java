package io.vproxy.vfx.ui.wrapper;

import io.vproxy.vfx.theme.Theme;
import javafx.scene.control.Label;

public class ThemeLabel extends Label {
    public ThemeLabel() {
    }

    public ThemeLabel(String text) {
        super(text);
        setTextFill(Theme.current().normalTextColor());
    }
}
