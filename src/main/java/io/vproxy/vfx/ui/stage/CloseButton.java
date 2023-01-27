package io.vproxy.vfx.ui.stage;

import io.vproxy.vfx.theme.Theme;
import javafx.scene.image.Image;
import javafx.scene.layout.CornerRadii;

public class CloseButton extends WindowControlButton {
    private CornerRadii cornerRadii;

    public CloseButton(VStage stage, VStageInitParams initParams) {
        super(stage, initParams);
    }

    @Override
    protected void init(VStageInitParams initParams) {
        if (initParams.iconifyButton || initParams.maximizeAndResetButton) {
            cornerRadii = CornerRadii.EMPTY;
        } else {
            cornerRadii = new CornerRadii(0, 0, 0, 4, false);
        }
    }

    @Override
    protected void onMouseClicked() {
        stage.close();
    }

    @Override
    protected CornerRadii getCornerRadii() {
        return cornerRadii;
    }

    @Override
    protected Image getNormalImage() {
        return Theme.current().windowCloseButtonNormalImage();
    }

    @Override
    protected Image getHoverImage() {
        return Theme.current().windowCloseButtonHoverImage();
    }
}
