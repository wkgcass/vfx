package io.vproxy.vfx.ui.wrapper;

import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.util.algebradata.DoubleData;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.scene.Node;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.Labeled;
import javafx.scene.control.TextInputControl;
import javafx.scene.layout.Pane;

import java.util.function.Function;

public class FusionW extends Pane {
    public final Node node;
    public final StringProperty property;
    private final Label label = new Label() {{
        setTextFill(Theme.current().normalTextColor());
    }};
    private final AnimationNode<DoubleData> showLabel = new AnimationNode<>("label", new DoubleData(0));
    private final AnimationNode<DoubleData> showNode = new AnimationNode<>("node", new DoubleData(1));
    private final AnimationGraph<DoubleData> animation;

    public FusionW(Labeled node) {
        this(node, Labeled::textProperty);
    }

    public FusionW(TextInputControl node) {
        this(node, TextInputControl::textProperty);
    }

    public FusionW(ComboBox<?> node) {
        this(node, n -> {
            var p = new SimpleStringProperty();
            n.valueProperty().addListener((ob, old, now) ->
                p.set(toStringOrEmpty(now)));
            p.set(toStringOrEmpty(n.getValue()));
            return p;
        });
    }

    private static String toStringOrEmpty(Object o) {
        if (o == null) return "";
        return o.toString();
    }

    public <T extends Node> FusionW(T node, Function<T, StringProperty> fluentPropertyGetter) {
        this.node = node;
        this.property = fluentPropertyGetter.apply(node);
        this.node.setStyle("-fx-focus-color: transparent; -fx-faint-focus-color: transparent;");

        node.layoutBoundsProperty().addListener((ob, old, now) -> update());
        property.addListener((ob, old, now) -> {
            if (now == null) now = "";
            label.setText(now);
        });
        label.textProperty().addListener((ob, old, now) -> update());

        animation = AnimationGraphBuilder
            .simpleTwoNodeGraph(showLabel, showNode, 300)
            .setApply((from, to, d) -> {
                node.setOpacity(d.value);
                label.setOpacity(1 - d.value);
            })
            .build(showLabel);

        getChildren().add(label);
        getChildren().add(node);

        setOnMouseEntered(e -> animation.play(showNode));
        setOnMouseExited(e -> animation.play(showLabel));

        label.setText(property.get());
    }

    public Label getLabel() {
        return label;
    }

    private void update() {
        var bounds = node.getLayoutBounds();
        setPrefWidth(bounds.getWidth());
        setPrefHeight(bounds.getHeight());
        setMinHeight(bounds.getHeight());
        label.setPrefWidth(bounds.getWidth());
        label.setPrefHeight(bounds.getHeight());
    }
}
