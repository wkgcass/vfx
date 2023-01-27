package io.vproxy.vfx.ui.scene;

import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.control.scroll.VScrollPane;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.algebradata.DoubleData;
import javafx.beans.value.ChangeListener;
import javafx.scene.Node;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Region;

import java.util.HashSet;
import java.util.Set;
import java.util.function.DoubleConsumer;

public class VScene {
    private final Pane root = new Pane();
    private final VScrollPane scrollPane = new VScrollPane();
    private final Pane content = new Pane();
    public final VSceneRole role;
    final AnimationNode<DoubleData> state0 = new AnimationNode<>("0", new DoubleData(0));
    final AnimationNode<DoubleData> state1 = new AnimationNode<>("1", new DoubleData(1));
    final AnimationGraph<DoubleData> progress = AnimationGraphBuilder
        .simpleTwoNodeGraph(state0, state1, 300)
        .setApply(d -> apply(d.value))
        .build(state0);
    DoubleConsumer animationFunction;
    final Set<ChangeListener<? super Number>> changeListeners = new HashSet<>();
    Node bundle;
    Pane cover;
    VSceneHideMethod defaultHideMethod;

    public VScene(VSceneRole role) {
        this.role = role;
        scrollPane.setContent(content);
        FXUtils.observeWidthHeight(root, scrollPane.getNode());
        root.getChildren().add(scrollPane.getNode());
    }

    private void apply(double value) {
        var f = animationFunction;
        if (f != null) {
            f.accept(value);
        }
    }

    public Region getNode() {
        return root;
    }

    public VScrollPane getScrollPane() {
        return scrollPane;
    }

    public Pane getContentPane() {
        return content;
    }
}
