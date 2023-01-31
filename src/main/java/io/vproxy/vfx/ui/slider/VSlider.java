package io.vproxy.vfx.ui.slider;

import io.vproxy.vfx.control.drag.DragHandler;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.loading.VProgressBar;
import io.vproxy.vfx.ui.shapes.ClickableCircle;
import javafx.beans.property.DoubleProperty;
import javafx.scene.layout.Pane;

public class VSlider extends Pane {
    private static final int radius = 15;

    private final VProgressBar bar = new VProgressBar();
    private final ClickableCircle button = new ClickableCircle(
        Theme.current().sliderButtonNormalColor(),
        Theme.current().sliderButtonHoverColor(),
        Theme.current().sliderButtonDownColor()
    );

    public VSlider() {
        setMinHeight(radius * 2);
        setPrefHeight(radius * 2);
        setMaxHeight(radius * 2);

        button.setRadius(radius);
        button.setLayoutX(radius);

        bar.progressProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var p = now.doubleValue();
            button.setLayoutX(bar.getLength() * p + radius);
        });
        bar.setLayoutX(radius);

        var dragHandler = new DragHandler() {
            @Override
            protected void set(double x, double y) {
                setPercentage((x - radius) / bar.getLength());
            }

            @Override
            protected double[] get() {
                return new double[]{button.getLayoutX(), 0};
            }
        };
        var mousePressedHandler = button.getOnMousePressed();
        button.setOnMousePressed(e -> {
            mousePressedHandler.handle(e);
            dragHandler.handle(e);
        });
        button.setOnMouseDragged(dragHandler);

        getChildren().addAll(bar, button);
    }

    public double getLength() {
        return bar.getLength() + radius * 2;
    }

    public void setLength(double length) {
        bar.setLength(length - radius * 2);
        setMinWidth(length);
        setPrefWidth(length);
        setMaxWidth(length);
    }

    public DoubleProperty percentageProperty() {
        return bar.progressProperty();
    }

    public double getPercentage() {
        return bar.getProgress();
    }

    public void setPercentage(double p) {
        bar.setProgress(p);
    }
}
