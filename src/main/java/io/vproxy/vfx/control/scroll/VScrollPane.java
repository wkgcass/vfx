package io.vproxy.vfx.control.scroll;

import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.control.drag.DragHandler;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.algebradata.DoubleData;
import javafx.scene.Node;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Region;

public class VScrollPane {
    static final int SCROLL_V_WIDTH = 4;
    private static final int SCROLL_V_MIN_HEIGHT = 25;

    private double scrollSpeed = 5;

    private final Pane root = new Pane();
    private final Viewport viewport = new Viewport();
    private final VerticalScrollBarImpl scrollBarV = new VerticalScrollBarImpl() {{
        setMouseTransparent(true);
    }};
    private final AnimationNode<DoubleData> animationHide = new AnimationNode<>("hide", new DoubleData(0));
    private final AnimationNode<DoubleData> animationShow = new AnimationNode<>("show", new DoubleData(1));
    private final AnimationGraph<DoubleData> animationHideShow = AnimationGraphBuilder
        .simpleTwoNodeGraph(animationHide, animationShow, 300)
        .setApply(d -> scrollBarV.setOpacity(d.value))
        .build(animationHide);

    public VScrollPane() {
        viewport.getNode().setOnScroll(e -> {
            var h = viewport.getContentHeight();
            if (h == 0) return;
            double dy = e.getDeltaY() * scrollSpeed / h;
            setVvalue(getVvalue() - dy);
            e.consume();
        });
        var dragScrollHandler = new DragHandler() {
            @Override
            protected void set(double x, double y) {
                if (y < 0) {
                    y = 0;
                } else if (y > viewport.getContentHeight()) {
                    y = viewport.getContentHeight();
                }
                setVvalue(y / viewport.getContentHeight());
            }

            @Override
            protected double[] get() {
                return new double[]{0, getVvalue() * viewport.getContentHeight()};
            }

            @Override
            protected double calculateDeltaY(double deltaX, double deltaY) {
                return deltaY * 4;
            }

            @Override
            protected double[] getOffset(MouseEvent e) {
                var ret = super.getOffset(e);
                ret[0] = -ret[0];
                ret[1] = -ret[1];
                return ret;
            }
        };
        viewport.getNode().setOnMousePressed(dragScrollHandler);
        viewport.getNode().setOnMouseDragged(dragScrollHandler);
        root.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            viewport.getNode().setPrefWidth(w);
            scrollBarV.setLayoutX(w - SCROLL_V_WIDTH - 2);
        });
        root.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            viewport.getNode().setPrefHeight(h);
            updateScrollVHeightAndPosition();
        });

        root.getChildren().addAll(viewport.getNode(), scrollBarV);

        root.setOnMouseEntered(e -> animationHideShow.play(animationShow, Callback.handler((v, ex) -> {
        })));
        root.setOnMouseExited(e -> animationHideShow.play(animationHide, Callback.handler((v, ex) -> {
        })));
    }

    private void updateScrollVHeightAndPosition() {
        var h = root.getHeight();
        if (h == 0) { // ignore invalid value
            return;
        }
        var content = viewport.getContent();
        if (content == null) {
            scrollBarV.setVisible(false);
            return;
        }
        var bounds = content.getLayoutBounds();
        if (bounds.getHeight() <= h) {
            scrollBarV.setVisible(false);
            return;
        }
        var p = h / bounds.getHeight();
        var length = p * h;
        if (length < SCROLL_V_MIN_HEIGHT) {
            length = SCROLL_V_MIN_HEIGHT;
        }
        scrollBarV.setLength(length);
        updateScrollVPosition(h, length);
        scrollBarV.setVisible(true);
    }

    private void updateScrollVPosition() {
        var h = root.getHeight();
        if (h == 0) { // ignore invalid value
            return;
        }
        updateScrollVPosition(h, scrollBarV.getLength());
    }

    private void updateScrollVPosition(double scrollPaneHeight, double scrollBarLength) {
        double p = getVvalue();
        var y = (scrollPaneHeight - scrollBarLength) * p;
        scrollBarV.setLayoutY(y);
    }

    public double getScrollSpeed() {
        return scrollSpeed;
    }

    public void setScrollSpeed(double scrollSpeed) {
        this.scrollSpeed = scrollSpeed;
    }

    public Region getNode() {
        return root;
    }

    public double getVvalue() {
        return viewport.getVvalue();
    }

    public void setVvalue(double vvalue) {
        viewport.setVvalue(vvalue);
        updateScrollVPosition();
    }

    public void setContent(Node node) {
        viewport.setContent(node);
        node.layoutBoundsProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            updateScrollVHeightAndPosition();
        });
    }
}
