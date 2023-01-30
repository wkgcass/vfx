package io.vproxy.vfx.ui.button;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.util.FXUtils;
import javafx.animation.AnimationTimer;
import javafx.beans.value.ChangeListener;
import javafx.event.EventHandler;
import javafx.scene.Cursor;
import javafx.scene.Group;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.shape.Circle;
import javafx.stage.Window;

public class FusionButton extends AbstractFusionButton {
    private final Label text = new Label() {{
        setTextFill(Theme.current().fusionButtonTextColor());
        FontManager.get().setFont(FontUsages.fusionButtonText, this);
    }};
    private EventHandler<?> actionHandler = null;

    private Window watchingWindow = null;
    private final ChangeListener<? super Boolean> windowFocusPlayAnimationListener = (ob, old, now) -> {
        if (now == null) {
            return;
        }
        setInternalDisableAnimation(!now);
    };

    public FusionButton() {
        this(null);
    }

    public FusionButton(String text) {
        this.text.textProperty().addListener((ob, old, now) -> updateTextPosition());
        widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            updateTextPosition();
            var w = now.doubleValue();
            borderLightPane.setPrefWidth(w);
        });
        heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            updateTextPosition();
            var h = now.doubleValue();
            borderLightPane.setPrefHeight(h);
        });
        if (text != null) {
            this.text.setText(text);
        }
        setCursor(Cursor.HAND);
        getChildren().add(this.text);
        sceneProperty().addListener((ob, old, now) -> {
            var oldWindow = watchingWindow;
            watchingWindow = null;
            if (oldWindow != null) {
                oldWindow.focusedProperty().removeListener(windowFocusPlayAnimationListener);
            }
            if (now != null) {
                var newWindow = now.getWindow();
                watchingWindow = newWindow;
                newWindow.focusedProperty().addListener(windowFocusPlayAnimationListener);
                setInternalDisableAnimation(!newWindow.isFocused());
            } else {
                setInternalDisableAnimation(true);
            }
        });
        setInternalDisableAnimation(true);
        disabledProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            handleDisable(now);
        });

        borderLightPane.setBorder(new Border(new BorderStroke(
            Theme.current().fusionButtonAnimatingBorderLightColor(),
            BorderStrokeStyle.SOLID,
            getCornerRadii(),
            new BorderWidths(1.5)
        )));
        borderLightPane.setBackground(Background.EMPTY);
        borderLightPane.setClip(new Group(borderLightCut1, borderLightCut2));
        getChildren().add(borderLightPane);

        setPrefWidth(64);
        setPrefHeight(24);
    }

    private void handleDisable(boolean v) {
        if (v) {
            setCursor(Cursor.DEFAULT);
            setMouseTransparent(true);
            text.setTextFill(Theme.current().fusionButtonDisabledTextColor());
        } else {
            setCursor(Cursor.HAND);
            setMouseTransparent(false);
            text.setTextFill(Theme.current().fusionButtonTextColor());
            startAnimating();
        }
    }

    private void updateTextPosition() {
        var bounds = FXUtils.calculateTextBounds(text);
        text.setLayoutX((getWidth() - bounds.getWidth()) / 2);
        text.setLayoutY((getHeight() - bounds.getHeight()) / 2);
    }

    public void setText(String text) {
        this.text.setText(text);
    }

    public void setOnAction(EventHandler<?> handler) {
        this.actionHandler = handler;
    }

    @Override
    protected void onMouseClicked() {
        var actionHandler = this.actionHandler;
        if (actionHandler == null) {
            return;
        }
        actionHandler.handle(null);
    }

    @Override
    protected CornerRadii getCornerRadii() {
        return new CornerRadii(4);
    }

    public Label getTextNode() {
        return text;
    }

    private Animation timer = null;
    private final Circle borderLightCut1 = new Circle(12) {{
        setOpacity(0);
    }};
    private final Circle borderLightCut2 = new Circle(12) {{
        setOpacity(0);
    }};
    private final Pane borderLightPane = new Pane();
    private boolean disableAnimation = !Theme.current().enableFusionButtonAnimation();
    private boolean internalDisableAnimation = false;

    // return true if it's animating after calling this method
    public boolean startAnimating() {
        var timer = this.timer;
        if (timer != null) {
            return true; // is already animating
        }
        if (isDisableAnimation0()) {
            return false;
        }
        timer = new Animation();
        timer.start();
        this.timer = timer;
        return true;
    }

    private class Animation extends AnimationTimer {
        private long beginTs = 0;

        @Override
        public void handle(long now) {
            if (beginTs == 0) {
                beginTs = now;
                return;
            }
            var w = getWidth();
            var h = getHeight();
            var total = (w + h) * 2;
            var delta = (now - beginTs) / 1_000_000;
            final long period = 1_500;
            final long fullPeriod = 20_000;
            if (delta > fullPeriod) {
                while (delta > fullPeriod) {
                    delta -= fullPeriod;
                }
                beginTs = now - delta * 1_000_000;
            }
            if (delta > 3 * period) {
                borderLightCut1.setOpacity(0);
                borderLightCut2.setOpacity(0);
                if (isDisableAnimation0()) {
                    timer = null;
                    stop();
                }
                return;
            }
            if (delta < period) {
                var p = delta / (double) period;
                borderLightCut1.setOpacity(p);
                borderLightCut2.setOpacity(p);
            } else if (delta > period * 2) {
                var p = (delta % period) / (double) period;
                borderLightCut1.setOpacity(1 - p);
                borderLightCut2.setOpacity(1 - p);
            } else {
                borderLightCut1.setOpacity(1);
                borderLightCut2.setOpacity(1);
            }
            delta %= period;
            var p = delta / (double) period;
            var l = total * p;
            if (l < getWidth()) {
                borderLightCut1.setLayoutX(l);
                borderLightCut1.setLayoutY(0);
                borderLightCut2.setLayoutX(w - l);
                borderLightCut2.setLayoutY(h);
            } else if (l < w + h) {
                borderLightCut1.setLayoutX(w);
                borderLightCut1.setLayoutY(l - w);
                borderLightCut2.setLayoutX(0);
                borderLightCut2.setLayoutY(h - (l - w));
            } else if (l < w + h + w) {
                borderLightCut1.setLayoutX(w - (l - w - h));
                borderLightCut1.setLayoutY(h);
                borderLightCut2.setLayoutX(l - w - h);
                borderLightCut2.setLayoutY(0);
            } else {
                borderLightCut1.setLayoutX(0);
                borderLightCut1.setLayoutY(h - (l - w - h - w));
                borderLightCut2.setLayoutX(w);
                borderLightCut2.setLayoutY(l - w - h - w);
            }
        }
    }

    public void stopAnimating() {
        var timer = this.timer;
        this.timer = null;
        if (timer != null) {
            timer.stop();
        }
        borderLightCut1.setOpacity(0);
        borderLightCut2.setOpacity(0);
    }

    public boolean isDisableAnimation() {
        return disableAnimation;
    }

    public boolean isDisableAnimation0() {
        return disableAnimation || internalDisableAnimation || isDisabled();
    }

    public void setDisableAnimation(boolean disableAnimation) {
        this.disableAnimation = disableAnimation;
        if (disableAnimation) {
            stopAnimating();
        } else {
            startAnimating();
        }
    }

    private void setInternalDisableAnimation(boolean internalDisableAnimation) {
        this.internalDisableAnimation = internalDisableAnimation;
        if (internalDisableAnimation) {
            stopAnimating();
        } else {
            startAnimating();
        }
    }
}
