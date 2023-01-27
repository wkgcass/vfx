package io.vproxy.vfx.ui.stage;

import io.vproxy.vfx.ui.button.AbstractFusionButton;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

abstract class WindowControlButton extends AbstractFusionButton {
    static final int WIDTH = 64;
    static final int HEIGHT = VStage.TITLE_BAR_HEIGHT;

    protected final VStage stage;

    protected final ImageView imageView = new ImageView();
    private final Image normalImage;
    private final Image hoverImage;

    WindowControlButton(VStage stage, VStageInitParams initParams) {
        super();
        this.stage = stage;

        init(initParams);

        setPrefWidth(WIDTH);
        setPrefHeight(HEIGHT);

        cornerRadii = getCornerRadii();
        normalImage = getNormalImage();
        hoverImage = getHoverImage();

        imageView.setFitWidth(12);
        imageView.setFitHeight(12);
        imageView.setLayoutX((WIDTH - 12) / 2d);
        imageView.setLayoutY((HEIGHT - 12) / 2d);
        imageView.setImage(normalImage);

        getChildren().add(imageView);
    }

    protected void init(VStageInitParams initParams) {
    }

    @Override
    protected void onMouseEntered() {
        super.onMouseEntered();
        imageView.setImage(hoverImage);
    }

    @Override
    protected void onMouseExited() {
        super.onMouseExited();
        imageView.setImage(normalImage);
    }

    protected abstract Image getNormalImage();

    protected abstract Image getHoverImage();
}
