package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.algebradata.AlgebraData;
import io.vproxy.vfx.util.algebradata.DoubleDoubleFunction;
import io.vproxy.commons.graph.GraphEdge;

public class AnimationEdge<T extends AlgebraData<T>> extends GraphEdge<AnimationNode<T>> {
    public final AnimationNode<T> from;
    public final AnimationNode<T> to;
    public final long durationMillis;
    public final DoubleDoubleFunction function;

    AnimationEdge(AnimationNode<T> from, AnimationNode<T> to, long durationMillis, DoubleDoubleFunction function) {
        super(from, to, durationMillis);
        this.from = from;
        this.to = to;
        this.durationMillis = durationMillis;
        this.function = function;
    }
}
