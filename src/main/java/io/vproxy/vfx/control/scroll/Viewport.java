package io.vproxy.vfx.control.scroll;

import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Region;
import javafx.scene.shape.Rectangle;

public class Viewport {
    private final Pane root = new Pane();
    private final Group container = new Group();
    private double lastContentHeight = 0;

    public Viewport() {
        var cut = new Rectangle();
        root.setClip(cut);

        root.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            cut.setWidth(w);
        });
        root.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            cut.setHeight(h);
            updateVPos();
        });
        root.getChildren().add(container);
    }

    private void updateVPos() {
        if (container.getChildren().isEmpty()) {
            return;
        }
        var height = lastContentHeight;
        var viewportH = root.getHeight();
        if (viewportH >= height) {
            container.setLayoutY(0);
            return;
        }
        var y = container.getLayoutY(); // <= 0
        if (height - viewportH + y < 0) {
            container.setLayoutY(viewportH - height);
        }
    }

    public double getVvalue() {
        if (container.getChildren().isEmpty()) {
            return 0;
        }
        var height = lastContentHeight;
        var viewportH = root.getHeight();
        var y = container.getLayoutY(); // <= 0
        if (y == 0) return 0;
        if (viewportH >= height) return 0;
        return -y / (height - viewportH);
    }

    public void setVvalue(double vvalue) {
        if (container.getChildren().isEmpty()) {
            return;
        }
        if (vvalue < 0) {
            container.setLayoutY(0);
            return;
        }
        if (vvalue > 1) {
            vvalue = 1;
        }
        var content = container.getChildren().get(0);
        var bounds = content.getLayoutBounds();
        var height = bounds.getHeight();
        var viewportH = root.getHeight();
        if (viewportH >= height) return;
        var y = (height - viewportH) * vvalue;
        container.setLayoutY(-y);
    }

    public void setContent(Node node) {
        if (node == null) {
            if (!container.getChildren().isEmpty()) {
                container.getChildren().remove(0);
            }
            return;
        }
        if (container.getChildren().isEmpty()) {
            container.getChildren().add(node);
        } else {
            container.getChildren().set(0, node);
        }
        node.layoutBoundsProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            lastContentHeight = now.getHeight();
            updateVPos();
        });
        lastContentHeight = node.getLayoutBounds().getHeight();
        updateVPos();
    }

    public Region getNode() {
        return root;
    }

    public Node getContent() {
        if (container.getChildren().isEmpty()) return null;
        return container.getChildren().get(0);
    }

    public double getContentHeight() {
        return lastContentHeight;
    }
}
