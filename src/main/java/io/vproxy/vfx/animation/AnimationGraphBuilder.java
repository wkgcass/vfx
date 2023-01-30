package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.algebradata.AlgebraData;
import io.vproxy.vfx.util.algebradata.DoubleDoubleFunction;
import io.vproxy.vfx.util.graph.GraphBuilder;

public class AnimationGraphBuilder<T extends AlgebraData<T>> {

    private final GraphBuilder<AnimationNode<T>> builder = new GraphBuilder<>();
    private AnimationStateTransferBeginCallback<T> stateTransferBeginCallback = null;
    private AnimationApplyFunction<T> apply;

    public AnimationGraphBuilder() {
    }

    public static <T extends AlgebraData<T>> AnimationGraphBuilder<T> simpleTwoNodeGraph(AnimationNode<T> a, AnimationNode<T> b, long millis) {
        return new AnimationGraphBuilder<T>()
            .addNode(a)
            .addNode(b)
            .addTwoWayEdge(a, b, millis);
    }

    public AnimationGraphBuilder<T> addNode(AnimationNode<T> n) {
        builder.addNode(n);
        return this;
    }

    public AnimationGraphBuilder<T> addEdge(AnimationNode<T> from, AnimationNode<T> to,
                                            long preferredMillis) {
        return addEdge(from, to, preferredMillis, t -> t);
    }

    public AnimationGraphBuilder<T> addEdge(AnimationNode<T> from, AnimationNode<T> to,
                                            long durationMillis, DoubleDoubleFunction function) {
        if (durationMillis < 0) {
            throw new IllegalArgumentException("`durationMillis` < 0");
        }
        builder.addEdge(new AnimationEdge<>(from, to, durationMillis, function));
        return this;
    }

    public AnimationGraphBuilder<T> addTwoWayEdge(AnimationNode<T> from, AnimationNode<T> to,
                                                  long durationMillis) {
        return addTwoWayEdge(from, to, durationMillis, t -> t);
    }

    public AnimationGraphBuilder<T> addTwoWayEdge(AnimationNode<T> from, AnimationNode<T> to,
                                                  long durationMillis, DoubleDoubleFunction function) {
        if (durationMillis < 0) {
            throw new IllegalArgumentException("`durationMillis` < 0");
        }
        builder.addEdge(new AnimationEdge<>(from, to, durationMillis, function));
        builder.addEdge(new AnimationEdge<>(to, from, durationMillis, function));
        return this;
    }

    public AnimationGraphBuilder<T> setApply(AnimationApplyFunction<T> apply) {
        this.apply = apply;
        return this;
    }

    public AnimationGraphBuilder<T> setStateTransferBeginCallback(AnimationStateTransferBeginCallback<T> stateTransferBeginCallback) {
        this.stateTransferBeginCallback = stateTransferBeginCallback;
        return this;
    }

    public AnimationGraph<T> build(AnimationNode<T> initialNode) {
        if (apply == null) {
            throw new IllegalArgumentException("`apply` not set");
        }
        var beginCB = stateTransferBeginCallback;
        if (beginCB == null) {
            beginCB = (from, to) -> {
            };
        }
        return new AnimationGraph<>(builder.build(), apply, beginCB, initialNode);
    }
}
