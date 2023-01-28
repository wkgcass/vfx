package io.vproxy.vfx.ui.button;

import io.vproxy.vfx.theme.Theme;
import javafx.scene.image.Image;
import javafx.scene.paint.Color;

public class TransparentFusionImageButton extends FusionImageButton {
    public TransparentFusionImageButton() {
    }

    public TransparentFusionImageButton(Image image) {
        super(image);
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
