package io.vproxy.vfx.ui.slider;

import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.control.drag.DragHandler;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.loading.VProgressBar;
import io.vproxy.vfx.ui.shapes.ClickableCircle;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.MiscUtils;
import io.vproxy.vfx.util.algebradata.DoubleData;
import javafx.beans.property.DoubleProperty;
import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.scene.Group;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Pane;
import javafx.scene.transform.Rotate;

import java.util.function.DoubleFunction;

public class VSlider extends Pane {
    public static final int BUTTON_RADIUS = 15;

    private final SliderDirection sliderDirection;
    private final Group positionGroup = new Group();
    private final Pane rotatePane = new Pane();
    private final Rotate rotate = new Rotate();
    private final VProgressBar bar = new VProgressBar();
    private final ClickableCircle button = new ClickableCircle(
        Theme.current().sliderButtonNormalColor(),
        Theme.current().sliderButtonHoverColor(),
        Theme.current().sliderButtonDownColor()
    ) {{
        setStroke(Theme.current().sliderButtonBorderColor());
    }};
    private EventHandler<Event> onAction = null;
    private final ThemeLabel buttonLabel = new ThemeLabel();
    private DoubleFunction<String> valueTransform = MiscUtils.roughFloatValueFormat::format;
    private final AnimationNode<DoubleData> labelInvisible = new AnimationNode<>("invisible", new DoubleData(0));
    private final AnimationNode<DoubleData> labelVisible = new AnimationNode<>("visible", new DoubleData(1));
    private final AnimationGraph<DoubleData> labelAnimation = AnimationGraphBuilder
        .simpleTwoNodeGraph(labelInvisible, labelVisible, 300)
        .setApply((from, to, d) -> buttonLabel.setOpacity(d.value))
        .build(labelInvisible);

    public VSlider() {
        this(SliderDirection.LEFT_TO_RIGHT);
    }

    public VSlider(SliderDirection sliderDirection) {
        this.sliderDirection = sliderDirection;

        rotate.setAngle(sliderDirection.rotation);
        rotatePane.getTransforms().add(rotate);
        positionGroup.getChildren().add(rotatePane);
        getChildren().add(positionGroup);
        getChildren().add(buttonLabel);

        if (sliderDirection.isHorizontal) {
            setMinHeight(BUTTON_RADIUS * 2);
            setPrefHeight(BUTTON_RADIUS * 2);
            setMaxHeight(BUTTON_RADIUS * 2);
        } else {
            setMinWidth(BUTTON_RADIUS * 2);
            setPrefWidth(BUTTON_RADIUS * 2);
            setMaxWidth(BUTTON_RADIUS * 2);
        }
        rotatePane.setMinHeight(BUTTON_RADIUS * 2);
        rotatePane.setPrefHeight(BUTTON_RADIUS * 2);
        rotatePane.setMaxHeight(BUTTON_RADIUS * 2);

        button.setRadius(BUTTON_RADIUS);
        button.setLayoutX(BUTTON_RADIUS);

        FXUtils.setOnMouseEntered(button,
            e -> labelAnimation.play(labelVisible));
        FXUtils.setOnMouseExited(button, e -> labelAnimation.play(labelInvisible));
        button.layoutXProperty().addListener(ob -> updateLabel());

        bar.progressProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var p = now.doubleValue();
            button.setLayoutX(bar.getLength() * p + BUTTON_RADIUS);
        });
        bar.setLayoutX(BUTTON_RADIUS);

        var dragHandler = new DragHandler() {
            @Override
            protected void set(double x, double y) {
                setPercentage((x - BUTTON_RADIUS) / bar.getLength());
            }

            @Override
            protected double[] get() {
                return new double[]{button.getLayoutX(), 0};
            }

            @SuppressWarnings("SuspiciousNameCombination")
            @Override
            protected double calculateDeltaX(double deltaX, double deltaY) {
                switch (sliderDirection) {
                    case LEFT_TO_RIGHT:
                        return deltaX;
                    case RIGHT_TO_LEFT:
                        return -deltaX;
                    case TOP_TO_BOTTOM:
                        return deltaY;
                    case BOTTOM_TO_TOP:
                        return -deltaY;
                }
                throw new IllegalStateException("should not reach here");
            }

            @Override
            protected void consume(MouseEvent e) {
                e.consume();
            }
        };
        double[] tmp = new double[]{0};
        FXUtils.setOnMousePressed(button, e -> {
            tmp[0] = button.getLayoutX();
            dragHandler.handle(e);
        });
        button.setOnAction(e -> {
            if (tmp[0] != button.getLayoutX()) {
                return;
            }
            if (onAction != null) {
                onAction.handle(e);
            }
        });
        button.setOnMouseDragged(dragHandler);

        rotatePane.getChildren().addAll(bar, button);
    }

    public double getLength() {
        return bar.getLength() + BUTTON_RADIUS * 2;
    }

    public void setLength(double length) {
        bar.setLength(length - BUTTON_RADIUS * 2);
        if (sliderDirection.isHorizontal) {
            setMinWidth(length);
            setPrefWidth(length);
            setMaxWidth(length);
        } else {
            setMinHeight(length);
            setPrefHeight(length);
            setMaxHeight(length);
        }
        rotatePane.setMinWidth(length);
        rotatePane.setPrefWidth(length);
        rotatePane.setMaxWidth(length);
        rotate.setPivotX(length / 2);
        if (sliderDirection.isVertical) {
            positionGroup.setLayoutX(-length / 2 + BUTTON_RADIUS);
            positionGroup.setLayoutY(length / 2);
        } else {
            positionGroup.setLayoutY(BUTTON_RADIUS);
        }
        updateLabel();
    }

    public void setValueTransform(DoubleFunction<String> valueTransform) {
        if (valueTransform == null) {
            valueTransform = MiscUtils.roughFloatValueFormat::format;
        }
        this.valueTransform = valueTransform;
        updateLabel();
    }

    private void updateLabel() {
        var str = this.valueTransform.apply(getPercentage());
        buttonLabel.setText(str);
        if (sliderDirection.isHorizontal) {
            if (sliderDirection == SliderDirection.LEFT_TO_RIGHT) {
                buttonLabel.setLayoutX(button.getLayoutX() + BUTTON_RADIUS + 5);
            } else {
                buttonLabel.setLayoutX(getLength() - button.getLayoutX() + BUTTON_RADIUS + 5);
            }
            buttonLabel.setLayoutY(BUTTON_RADIUS + 5);
        } else {
            buttonLabel.setLayoutX(BUTTON_RADIUS + 5);
            if (sliderDirection == SliderDirection.TOP_TO_BOTTOM) {
                buttonLabel.setLayoutY(button.getLayoutX() + BUTTON_RADIUS + 5);
            } else {
                buttonLabel.setLayoutY(getLength() - button.getLayoutX() + BUTTON_RADIUS + 5);
            }
        }
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

    public void setOnAction(EventHandler<Event> onAction) {
        this.onAction = onAction;
    }
}
