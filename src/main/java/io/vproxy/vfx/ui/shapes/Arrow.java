package io.vproxy.vfx.ui.shapes;

import io.vproxy.vfx.manager.image.ImageManager;
import javafx.scene.Group;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.paint.Paint;
import javafx.scene.shape.Rectangle;

public class Arrow extends Group {
    private final Image img;
    private final ImageView imageView;
    private final Rectangle rect;

    public Arrow() {
        img = ImageManager.get().load("io/vproxy/vfx/res/image/arrow.png");
        imageView = new ImageView(img);
        rect = new Rectangle();
        rect.setStrokeWidth(0);
        getChildren().add(rect);
        rect.setClip(imageView);
        setScale(1);
    }

    public void setFill(Paint paint) {
        rect.setFill(paint);
    }

    public void setScale(double ratio) {
        rect.setWidth(img.getWidth() * ratio);
        rect.setHeight(img.getHeight() * ratio);

        imageView.setFitWidth(img.getWidth() * ratio);
        imageView.setFitHeight(img.getHeight() * ratio);

        rect.setLayoutX(-img.getWidth() * ratio * 0.7);
        rect.setLayoutY(-img.getHeight() * ratio / 2);
    }
}
