package io.vproxy.vfx.ui.button;

import io.vproxy.vfx.manager.image.ImageManager;
import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.scene.Cursor;
import javafx.scene.image.ImageView;

public class ImageButton extends ImageView {
    private final double w;
    private final double h;
    private EventHandler<Event> handler;

    public ImageButton(String prefix, String suffix) {
        setCursor(Cursor.HAND);

        var normalImage = ImageManager.get().load(prefix + "-normal" + "." + suffix);
        w = normalImage.getWidth();
        h = normalImage.getHeight();
        var hoverImage = ImageManager.get().load(prefix + "-hover" + "." + suffix);
        var downImage = ImageManager.get().load(prefix + "-down" + "." + suffix);
        setImage(normalImage);
        setOnMouseEntered(e -> setImage(hoverImage));
        setOnMouseExited(e -> setImage(normalImage));
        setOnMousePressed(e -> setImage(downImage));
        setOnMouseReleased(e -> setImage(normalImage));
        setOnMouseClicked(e -> {
            var handler = this.handler;
            if (handler == null) {
                return;
            }
            handler.handle(null);
        });
    }

    public void setOnAction(EventHandler<? extends Event> handler) {
        //noinspection unchecked
        this.handler = (EventHandler<Event>) handler;
    }

    public void setScale(double v) {
        setFitWidth(w * v);
        setFitHeight(h * v);
    }
}
