package io.vproxy.vfx.ui.button;

import io.vproxy.vfx.control.click.ClickEventHandler;
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
        var clickHandler = new ClickEventHandler() {
            @Override
            protected void onMouseEntered() {
                setImage(hoverImage);
            }

            @Override
            protected void onMouseExited() {
                setImage(normalImage);
            }

            @Override
            protected void onMousePressed() {
                setImage(downImage);
            }

            @Override
            protected void onMouseReleased() {
                setImage(hoverImage);
            }

            @Override
            protected void onMouseClicked() {
                var handler = ImageButton.this.handler;
                if (handler == null) {
                    return;
                }
                handler.handle(null);
            }
        };
        setOnMouseEntered(clickHandler);
        setOnMouseExited(clickHandler);
        setOnMousePressed(clickHandler);
        setOnMouseReleased(clickHandler);
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
