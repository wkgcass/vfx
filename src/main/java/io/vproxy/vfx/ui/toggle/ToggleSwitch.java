package io.vproxy.vfx.ui.toggle;

import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.control.click.ClickEventHandler;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.shapes.VLine;
import io.vproxy.vfx.util.algebradata.ColorData;
import io.vproxy.vfx.util.algebradata.DoubleData;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.BooleanPropertyBase;
import javafx.scene.Cursor;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Region;
import javafx.scene.shape.Circle;

public class ToggleSwitch {
    public final double buttonRadius;
    public final double trayLength;
    private final Pane root = new Pane();
    private final Circle button;
    private boolean selected = false;

    private final AnimationNode<ColorData> unselectedColorNode;
    private final AnimationNode<ColorData> unselectedHoverColorNode;
    private final AnimationNode<ColorData> selectedColorNode;
    private final AnimationGraph<ColorData> colorAnimation;

    private final AnimationNode<DoubleData> unselectedPosNode;
    private final AnimationNode<DoubleData> selectedPosNode;
    private final AnimationGraph<DoubleData> posAnimation;

    private final AnimationNode<ColorData> trayUnselectedNode;
    private final AnimationNode<ColorData> traySelectedNode;
    private final AnimationGraph<ColorData> trayAnimation;

    public ToggleSwitch() {
        this(15, 60);
    }

    public ToggleSwitch(double radius, double length) {
        if (length < radius * 2) {
            throw new IllegalArgumentException("length = " + length + " < radius = " + radius);
        }
        this.buttonRadius = radius;
        this.trayLength = length;
        root.setPrefWidth(radius + length + radius);
        root.setPrefHeight(radius * 2);
        root.setMinWidth(radius + length + radius);
        root.setMinHeight(radius * 2);
        root.setMaxWidth(radius + length + radius);
        root.setMaxHeight(radius * 2);

        button = new Circle(radius);
        button.setStrokeWidth(0.5);
        button.setStroke(Theme.current().toggleSwitchBorderColor());
        button.setCursor(Cursor.HAND);
        button.setLayoutY(radius);
        var tray = new VLine(2);
        tray.setEndX(length);
        tray.setLayoutX(radius);
        tray.setLayoutY(radius);
        tray.setCursor(Cursor.HAND);
        root.getChildren().addAll(tray, button);

        unselectedColorNode = new AnimationNode<>("unselected", new ColorData(Theme.current().toggleSwitchUnselectedButtonColor()));
        unselectedHoverColorNode = new AnimationNode<>("hover", new ColorData(Theme.current().toggleSwitchUnselectedButtonHoverColor()));
        selectedColorNode = new AnimationNode<>("selected", new ColorData(Theme.current().toggleSwitchSelectedButtonColor()));
        colorAnimation = new AnimationGraphBuilder<ColorData>()
            .addNode(unselectedColorNode)
            .addNode(unselectedHoverColorNode)
            .addNode(selectedColorNode)
            .addTwoWayEdge(unselectedColorNode, unselectedHoverColorNode, 150)
            .addTwoWayEdge(unselectedColorNode, selectedColorNode, 150)
            .addEdge(unselectedHoverColorNode, selectedColorNode, 150)
            .setApply((from, to, d) -> button.setFill(d.getColor()))
            .build(unselectedColorNode);

        unselectedPosNode = new AnimationNode<>("unselected", new DoubleData(radius));
        selectedPosNode = new AnimationNode<>("selected", new DoubleData(radius + length));
        posAnimation = AnimationGraphBuilder
            .simpleTwoNodeGraph(unselectedPosNode, selectedPosNode, 150)
            .setApply((from, to, d) -> button.setLayoutX(d.value))
            .build(unselectedPosNode);

        trayUnselectedNode = new AnimationNode<>("unselected", new ColorData(
            Theme.current().toggleSwitchUnselectedTrayColor()
        ));
        traySelectedNode = new AnimationNode<>("selected", new ColorData(
            Theme.current().toggleSwitchSelectedTrayColor()
        ));
        trayAnimation = AnimationGraphBuilder
            .simpleTwoNodeGraph(trayUnselectedNode, traySelectedNode, 150)
            .setApply((from, to, d) -> tray.setStroke(d.getColor()))
            .build(trayUnselectedNode);

        var clickHandler = new ClickEventHandler() {
            @Override
            protected void onMouseEntered() {
                if (isSelected()) {
                    return;
                }
                colorAnimation.play(unselectedHoverColorNode);
            }

            @Override
            protected void onMouseExited() {
                colorAnimation.play(isSelected() ? selectedColorNode : unselectedColorNode);
            }

            @Override
            protected void onMousePressed() {
                colorAnimation.play(selectedColorNode);
            }

            @Override
            protected void onMouseClicked() {
                setSelected(!isSelected());
            }
        };
        button.setOnMouseEntered(clickHandler);
        button.setOnMouseExited(clickHandler);
        button.setOnMousePressed(clickHandler);
        button.setOnMouseReleased(clickHandler);
    }

    private final BooleanPropertyBase selectedProperty = new BooleanPropertyBase() {
        @Override
        protected void invalidated() {
            setSelected(selectedProperty.get());
        }

        @Override
        public Object getBean() {
            return ToggleSwitch.this;
        }

        @Override
        public String getName() {
            return "selectedProperty";
        }
    };

    public BooleanProperty selectedProperty() {
        return selectedProperty;
    }

    public boolean isSelected() {
        return selected;
    }

    private void setSelected(boolean selected) {
        this.selected = selected;
        selectedProperty.set(selected);
        animate();
    }

    private void animate() {
        if (selected) {
            colorAnimation.play(selectedColorNode);
            posAnimation.play(selectedPosNode);
            trayAnimation.play(traySelectedNode);
        } else {
            colorAnimation.play(unselectedColorNode);
            posAnimation.play(unselectedPosNode);
            trayAnimation.play(trayUnselectedNode);
        }
    }

    public Region getNode() {
        return root;
    }
}
