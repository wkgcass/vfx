package io.vproxy.vfx.control.scroll;

import javafx.beans.property.DoubleProperty;
import javafx.beans.property.DoublePropertyBase;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Region;
import javafx.scene.shape.Rectangle;

public class Viewport {
    private final Pane root = new Pane();
    private final Group container = new Group();
    private double lastContentHeight = 0;
    private double lastContentWidth = 0;

    public Viewport() {
        var cut = new Rectangle();
        root.setClip(cut);

        root.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            cut.setWidth(w);
            updateHPos();
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

    private void updateHPos() {
        if (container.getChildren().isEmpty()) {
            return;
        }
        var width = lastContentWidth;
        var viewportW = root.getHeight();
        if (viewportW >= width) {
            container.setLayoutX(0);
            return;
        }
        var x = container.getLayoutX(); // <= 0
        if (width - viewportW + x < 0) {
            container.setLayoutY(viewportW - width);
        }
    }

    public double getHvalue() {
        if (container.getChildren().isEmpty()) {
            return 0;
        }
        var width = lastContentWidth;
        var viewportW = root.getWidth();
        var x = container.getLayoutX(); // <= 0
        if (x == 0) return 0;
        if (viewportW >= width) return 0;
        return -x / (width - viewportW);
    }

    public void setHvalue(double hvalue) {
        if (container.getChildren().isEmpty()) {
            return;
        }
        if (hvalue < 0) {
            container.setLayoutX(0);
            return;
        }
        if (hvalue > 1) {
            hvalue = 1;
        }
        var content = container.getChildren().get(0);
        var bounds = content.getLayoutBounds();
        var width = bounds.getWidth();
        var viewportW = root.getWidth();
        if (viewportW >= width) return;
        var x = (width - viewportW) * hvalue;
        container.setLayoutX(-x);
    }

    private final DoublePropertyBase vposProperty = new DoublePropertyBase(getVpos()) {
        {
            container.layoutYProperty().addListener((ob, old, now) -> {
                if (now == null) return;
                set(now.doubleValue());
            });
        }

        @Override
        protected void invalidated() {
            setVpos(vposProperty.get());
        }

        @Override
        public Object getBean() {
            return Viewport.this;
        }

        @Override
        public String getName() {
            return "vposProperty";
        }
    };

    public DoubleProperty vposProperty() {
        return vposProperty;
    }

    public double getVpos() {
        return container.getLayoutY();
    }

    public void setVpos(double vpos) {
        var content = container.getChildren().get(0);
        var bounds = content.getLayoutBounds();
        var height = bounds.getHeight();
        var viewportH = root.getHeight();
        if (vpos < viewportH - height) {
            vpos = viewportH - height;
        }
        if (vpos > 0) {
            vpos = 0;
        }
        vposProperty.set(vpos);
        container.setLayoutY(vpos);
    }

    private final DoublePropertyBase hposProperty = new DoublePropertyBase(getHpos()) {
        {
            container.layoutXProperty().addListener((ob, old, now) -> {
                if (now == null) return;
                set(now.doubleValue());
            });
        }

        @Override
        protected void invalidated() {
            setHpos(hposProperty.get());
        }

        @Override
        public Object getBean() {
            return Viewport.this;
        }

        @Override
        public String getName() {
            return "hposProperty";
        }
    };

    public DoubleProperty hposProperty() {
        return hposProperty;
    }

    public double getHpos() {
        return container.getLayoutX();
    }

    public void setHpos(double hpos) {
        var content = container.getChildren().get(0);
        var bounds = content.getLayoutBounds();
        var width = bounds.getWidth();
        var viewportW = root.getWidth();
        if (hpos < viewportW - width) {
            hpos = viewportW - width;
        }
        if (hpos > 0) {
            hpos = 0;
        }
        hposProperty.set(hpos);
        container.setLayoutX(hpos);
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
            lastContentWidth = now.getWidth();
            updateVPos();
            updateHPos();
        });
        lastContentHeight = node.getLayoutBounds().getHeight();
        lastContentWidth = node.getLayoutBounds().getWidth();
        updateVPos();
        updateHPos();
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

    public double getContentWidth() {
        return lastContentWidth;
    }
}
