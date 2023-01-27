package io.vproxy.vfx.ui.pane;

import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.control.click.ClickEventHandler;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.algebradata.ColorData;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

public abstract class AbstractFusionPane extends Pane {
    private final AnimationGraph<ColorData> animation;
    private final AnimationNode<ColorData> normalNode = new AnimationNode<>("normal", new ColorData(
        normalColor()
    ));
    private final AnimationNode<ColorData> hoverNode = new AnimationNode<>("hover", new ColorData(
        hoverColor()
    ));
    private final AnimationNode<ColorData> downNode = new AnimationNode<>("down", new ColorData(
        downColor()
    ));

    protected CornerRadii cornerRadii = CornerRadii.EMPTY;
    protected final ClickEventHandler clickHandler;

    public AbstractFusionPane() {
        Platform.runLater(() -> {
            cornerRadii = getCornerRadii();
            setBackground(new Background(new BackgroundFill(
                normalNode.value.getColor(), cornerRadii, Insets.EMPTY
            )));
        });

        animation = AnimationGraphBuilder
            .simpleTwoNodeGraph(normalNode, hoverNode, 300)
            .addNode(downNode)
            .setApply(data -> setBackground(new Background(
                new BackgroundFill(data.getColor(), cornerRadii, Insets.EMPTY)
            )))
            .build(normalNode);

        clickHandler = new ClickEventHandler() {
            @Override
            protected void onMouseEntered() {
                AbstractFusionPane.this.onMouseEntered();
            }

            @Override
            protected void onMouseExited() {
                AbstractFusionPane.this.onMouseExited();
            }

            @Override
            protected void onMousePressed() {
                AbstractFusionPane.this.onMousePressed();
            }

            @Override
            protected void onMouseReleased() {
                AbstractFusionPane.this.onMouseReleased();
            }

            @Override
            protected void onMouseClicked() {
                AbstractFusionPane.this.onMouseClicked();
            }
        };
        setOnMouseEntered(clickHandler);
        setOnMouseExited(clickHandler);
        setOnMousePressed(clickHandler);
        setOnMouseReleased(clickHandler);
    }

    protected void onMouseEntered() {
        animation.play(hoverNode, Callback.handler((v, ex) -> {
        }));
    }

    protected void onMouseExited() {
        animation.play(normalNode, Callback.handler((v, ex) -> {
        }));
    }

    protected void onMousePressed() {
        animation.stopAndSetNode(downNode);
    }

    protected void onMouseReleased() {
        animation.stopAndSetNode(hoverNode);
    }

    protected void onMouseClicked() {
    }

    protected abstract CornerRadii getCornerRadii();

    protected Color normalColor() {
        return Theme.current().fusionPaneNormalBackgroundColor();
    }

    protected Color hoverColor() {
        return Theme.current().fusionPaneHoverBackgroundColor();
    }

    protected Color downColor() {
        return Theme.current().fusionPaneHoverBackgroundColor();
    }
}
