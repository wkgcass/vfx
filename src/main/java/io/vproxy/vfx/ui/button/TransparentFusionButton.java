package io.vproxy.vfx.ui.button;

import io.vproxy.vfx.theme.Theme;
import javafx.scene.paint.Color;

public class TransparentFusionButton extends FusionButton {
    public TransparentFusionButton() {
        setOnlyAnimateWhenNotClicked(true);
    }

    public TransparentFusionButton(String text) {
        super(text);
        setOnlyAnimateWhenNotClicked(true);
    }

    @Override
    protected Color normalColor() {
        return Theme.current().transparentFusionButtonNormalBackgroundColor();
    }

    @Override
    protected Color hoverColor() {
        return Theme.current().transparentFusionButtonHoverBackgroundColor();
    }

    @Override
    protected Color downColor() {
        return Theme.current().transparentFusionButtonDownBackgroundColor();
    }
}
