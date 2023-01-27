package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.algebradata.AlgebraData;
import io.vproxy.vfx.util.algebradata.DoubleDoubleFunction;
import io.vproxy.vfx.util.graph.GraphEdge;

class AnimationEdge<T extends AlgebraData<T>> extends GraphEdge<AnimationNode<T>> {
    final AnimationNode<T> from;
    final AnimationNode<T> to;
    final long durationMillis;
    final DoubleDoubleFunction function;

    AnimationEdge(AnimationNode<T> from, AnimationNode<T> to, long durationMillis, DoubleDoubleFunction function) {
        super(from, to, durationMillis);
        this.from = from;
        this.to = to;
        this.durationMillis = durationMillis;
        this.function = function;
    }
}
