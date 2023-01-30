package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.algebradata.AlgebraData;

public interface AnimationStateTransferBeginCallback<T extends AlgebraData<T>> {
    void animationStateTransferBegin(AnimationNode<T> from, AnimationNode<T> to);
}
