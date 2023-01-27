package io.vproxy.vfx.ui.button;

import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

public class FusionImageButton extends FusionButton {
    private final ImageView imageView = new ImageView();

    public FusionImageButton() {
        this(null);
    }

    public FusionImageButton(Image image) {
        if (image != null) {
            imageView.setImage(image);
        }
        imageView.setPreserveRatio(true);
        getChildren().add(imageView);

        widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            updateImagePosition();
        });
        heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            updateImagePosition();
        });
        setDisableAnimation(true);
    }

    public ImageView getImageView() {
        return imageView;
    }

    private void updateImagePosition() {
        var bounds = imageView.getLayoutBounds();
        imageView.setLayoutX((getWidth() - bounds.getWidth()) / 2);
        imageView.setLayoutY((getHeight() - bounds.getHeight()) / 2);
    }
}
