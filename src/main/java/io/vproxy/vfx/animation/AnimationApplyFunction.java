package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.algebradata.AlgebraData;

@FunctionalInterface
public interface AnimationApplyFunction<T extends AlgebraData<T>> {
    void apply(AnimationNode<T> from, AnimationNode<T> to, T data);
}
