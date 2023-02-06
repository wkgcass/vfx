package io.vproxy.vfx.control.scroll;

import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.control.drag.DragHandler;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.algebradata.DoubleData;
import javafx.beans.property.DoubleProperty;
import javafx.scene.Node;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Region;

public class VScrollPane implements NodeWithVScrollPane {
    public static final int SCROLL_WIDTH = 4;
    public static final int SCROLL_PADDING = 2;
    private static final int SCROLL_MIN_LENGTH = 25;

    private double scrollSpeed = 5;

    private final Pane root = new Pane();
    private final Viewport viewport = new Viewport();
    private final VerticalScrollBarImpl scrollBarV = new VerticalScrollBarImpl() {{
        setMouseTransparent(true);
    }};
    private final HorizontalScrollBarImpl scrollBarH = new HorizontalScrollBarImpl() {{
        setMouseTransparent(true);
    }};
    private Double verticalScrollBarLayoutX;
    private Double horizontalScrollBarLayoutY;
    private final AnimationNode<DoubleData> animationHide = new AnimationNode<>("hide", new DoubleData(0));
    private final AnimationNode<DoubleData> animationShow = new AnimationNode<>("show", new DoubleData(1));
    private final AnimationGraph<DoubleData> animationHideShow = AnimationGraphBuilder
        .simpleTwoNodeGraph(animationHide, animationShow, 300)
        .setApply((from, to, d) -> {
            scrollBarV.setOpacity(d.value);
            scrollBarH.setOpacity(d.value);
        })
        .build(animationHide);
    private ScrollDirection scrollDirection;

    public VScrollPane() {
        this(ScrollDirection.VERTICAL);
    }

    @SuppressWarnings("ReplaceNullCheck")
    public VScrollPane(ScrollDirection scrollDirection0) {
        this.scrollDirection = scrollDirection0;
        viewport.getNode().setOnScroll(e -> {
            if (scrollDirection == ScrollDirection.NONE) return;
            var ll = scrollDirection == ScrollDirection.HORIZONTAL ? viewport.getContentWidth() : viewport.getContentHeight();
            if (ll == 0) return;
            if (scrollDirection == ScrollDirection.HORIZONTAL) {
                if (ll <= root.getWidth()) return;
            } else {
                if (ll <= root.getHeight()) return;
            }
            double dd = e.getDeltaY() * scrollSpeed / ll;
            if (scrollDirection == ScrollDirection.HORIZONTAL) {
                setHvalue(getHvalue() - dd);
            } else {
                setVvalue(getVvalue() - dd);
            }
            e.consume();
        });
        var dragScrollHandler = new DragHandler() {
            @Override
            protected void set(double x, double y) {
                setHpos(x);
                setVpos(y);
            }

            @Override
            protected double[] get() {
                return new double[]{viewport.getHpos(), viewport.getVpos()};
            }
        };
        viewport.getNode().setOnMousePressed(dragScrollHandler);
        viewport.getNode().setOnMouseDragged(dragScrollHandler);
        root.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            viewport.getNode().setPrefWidth(w);
            updateScrollHWidthAndPosition();
            if (verticalScrollBarLayoutX == null) {
                scrollBarV.setLayoutX(w - SCROLL_WIDTH - SCROLL_PADDING);
            } else {
                scrollBarH.setLayoutX(verticalScrollBarLayoutX);
            }
        });
        root.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            viewport.getNode().setPrefHeight(h);
            updateScrollVHeightAndPosition();
            if (horizontalScrollBarLayoutY == null) {
                scrollBarH.setLayoutY(h - SCROLL_WIDTH - SCROLL_PADDING);
            } else {
                scrollBarH.setLayoutY(horizontalScrollBarLayoutY);
            }
        });

        root.getChildren().addAll(viewport.getNode(), scrollBarV, scrollBarH);

        root.setOnMouseEntered(e -> animationHideShow.play(animationShow));
        root.setOnMouseExited(e -> animationHideShow.play(animationHide));
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
        if (length < SCROLL_MIN_LENGTH) {
            length = SCROLL_MIN_LENGTH;
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

    private void updateScrollHWidthAndPosition() {
        var w = root.getWidth();
        if (w == 0) { // ignore invalid value
            return;
        }
        var content = viewport.getContent();
        if (content == null) {
            scrollBarH.setVisible(false);
            return;
        }
        var bounds = content.getLayoutBounds();
        if (bounds.getWidth() <= w) {
            scrollBarH.setVisible(false);
            return;
        }
        var p = w / bounds.getWidth();
        var length = p * w;
        if (length < SCROLL_MIN_LENGTH) {
            length = SCROLL_MIN_LENGTH;
        }
        scrollBarH.setLength(length);
        updateScrollHPosition(w, length);
        scrollBarH.setVisible(true);
    }

    private void updateScrollHPosition() {
        var w = root.getWidth();
        if (w == 0) { // ignore invalid value
            return;
        }
        updateScrollHPosition(w, scrollBarH.getLength());
    }

    private void updateScrollHPosition(double scrollPaneWidth, double scrollBarLength) {
        double p = getHvalue();
        var x = (scrollPaneWidth - scrollBarLength) * p;
        scrollBarH.setLayoutX(x);
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

    public double getHvalue() {
        return viewport.getHvalue();
    }

    public void setVvalue(double vvalue) {
        viewport.setVvalue(vvalue);
        updateScrollVPosition();
    }

    public void setHvalue(double hvalue) {
        viewport.setHvalue(hvalue);
        updateScrollHPosition();
    }

    public DoubleProperty vposProperty() {
        return viewport.vposProperty();
    }

    public double getVpos() {
        return viewport.getVpos();
    }

    public void setVpos(double vpos) {
        viewport.setVpos(vpos);
        updateScrollVPosition();
    }

    public DoubleProperty hposProperty() {
        return viewport.hposProperty();
    }

    public double getHpos() {
        return viewport.getHpos();
    }

    public void setHpos(double hpos) {
        viewport.setHpos(hpos);
        updateScrollHPosition();
    }

    public void setContent(Node node) {
        viewport.setContent(node);
        node.layoutBoundsProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            updateScrollVHeightAndPosition();
            updateScrollHWidthAndPosition();
        });
    }

    public void setVerticalScrollBarLayoutX(Double verticalScrollBarLayoutX) {
        this.verticalScrollBarLayoutX = verticalScrollBarLayoutX;
        scrollBarV.setLayoutX(verticalScrollBarLayoutX);
    }

    public void setHorizontalScrollBarLayoutY(Double horizontalScrollBarLayoutY) {
        this.horizontalScrollBarLayoutY = horizontalScrollBarLayoutY;
        scrollBarH.setLayoutY(horizontalScrollBarLayoutY);
    }

    public ScrollDirection getScrollDirection() {
        return scrollDirection;
    }

    public void setScrollDirection(ScrollDirection scrollDirection) {
        this.scrollDirection = scrollDirection;
    }

    @Override
    public VScrollPane getScrollPane() {
        return this;
    }

    @Override
    public Region getSelfNode() {
        return getNode();
    }

    public static VScrollPane makeHorizontalScrollPaneToManage(NodeWithVScrollPane node) {
        var pane = new VScrollPane(ScrollDirection.HORIZONTAL);
        pane.setContent(node.getSelfNode());
        Runnable update = () ->
            node.getScrollPane().setVerticalScrollBarLayoutX(
                -pane.getHpos() + pane.getNode().getWidth() - VScrollPane.SCROLL_WIDTH - VScrollPane.SCROLL_PADDING);
        pane.getNode().widthProperty().addListener((ob, old, now) -> update.run());
        pane.hposProperty().addListener((ob, old, now) -> update.run());
        FXUtils.observeHeight(node.getSelfNode(), pane.getNode());
        return pane;
    }
}
