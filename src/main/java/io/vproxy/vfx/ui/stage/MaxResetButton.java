package io.vproxy.vfx.ui.stage;

import io.vproxy.vfx.theme.Theme;
import javafx.scene.image.Image;
import javafx.scene.layout.CornerRadii;

public class MaxResetButton extends WindowControlButton {
    private final Image[] maxImg;
    private final Image[] rstImg;
    private CornerRadii cornerRadii;

    public MaxResetButton(VStage stage, VStageInitParams initParams) {
        super(stage, initParams);
        maxImg = new Image[]{
            Theme.current().windowMaximizeButtonNormalImage(),
            Theme.current().windowMaximizeButtonHoverImage(),
        };
        rstImg = new Image[]{
            Theme.current().windowResetWindowSizeButtonNormalImage(),
            Theme.current().windowResetWindowSizeButtonHoverImage(),
        };
        updateImage();
    }

    @Override
    protected void init(VStageInitParams initParams) {
        if (initParams.iconifyButton) {
            cornerRadii = CornerRadii.EMPTY;
        } else {
            cornerRadii = new CornerRadii(0, 0, 0, 4, false);
        }
    }

    @Override
    protected void onMouseEntered() {
        super.onMouseEntered();
        imageView.setImage(currentImageGroup()[1]);
    }

    @Override
    protected void onMouseExited() {
        super.onMouseExited();
        imageView.setImage(currentImageGroup()[0]);
    }

    @Override
    protected void onMouseClicked() {
        stage.setMaximized(!stage.isMaximized());
    }

    @Override
    protected CornerRadii getCornerRadii() {
        return cornerRadii;
    }

    @Override
    protected Image getNormalImage() {
        return Theme.current().windowMaximizeButtonNormalImage();
    }

    @Override
    protected Image getHoverImage() {
        return Theme.current().windowMaximizeButtonHoverImage();
    }

    private Image[] currentImageGroup() {
        if (stage.isMaximized()) {
            return rstImg;
        } else {
            return maxImg;
        }
    }

    void updateImage() {
        if (stage.isMaximized()) {
            imageView.setFitWidth(22);
            imageView.setFitHeight(22);
            imageView.setLayoutX((WIDTH - 22) / 2d);
            imageView.setLayoutY((HEIGHT - 22) / 2d);
            imageView.setScaleX(-1);
        } else {
            imageView.setFitWidth(20);
            imageView.setFitHeight(20);
            imageView.setLayoutX((WIDTH - 20) / 2d);
            imageView.setLayoutY((HEIGHT - 20) / 2d);
            imageView.setScaleX(-1);
        }
        if (clickHandler.isMouseEntered()) {
            imageView.setImage(currentImageGroup()[1]);
        } else {
            imageView.setImage(currentImageGroup()[0]);
        }
    }
}
