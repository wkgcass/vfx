package io.vproxy.vfx.ui.button;

import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.pane.AbstractFusionPane;
import javafx.scene.paint.Color;

public abstract class AbstractFusionButton extends AbstractFusionPane {
    protected abstract void onMouseClicked();

    @Override
    protected Color normalColor() {
        return Theme.current().fusionButtonNormalBackgroundColor();
    }

    @Override
    protected Color hoverColor() {
        return Theme.current().fusionButtonHoverBackgroundColor();
    }

    @Override
    protected Color downColor() {
        return Theme.current().fusionButtonDownBackgroundColor();
    }
}
