package io.vproxy.vfx.ui.stage;

import io.vproxy.vfx.theme.Theme;
import javafx.scene.image.Image;
import javafx.scene.layout.CornerRadii;

public class IconifyButton extends WindowControlButton {
    public IconifyButton(VStage stage, VStageInitParams initParams) {
        super(stage, initParams);
    }

    @Override
    protected void onMouseClicked() {
        stage.setIconified(true);
    }

    @Override
    protected CornerRadii getCornerRadii() {
        return new CornerRadii(0, 0, 0, 4, false);
    }

    @Override
    protected Image getNormalImage() {
        return Theme.current().windowIconifyButtonNormalImage();
    }

    @Override
    protected Image getHoverImage() {
        return Theme.current().windowIconifyButtonHoverImage();
    }
}
