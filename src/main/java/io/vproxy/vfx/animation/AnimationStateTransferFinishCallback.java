package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.algebradata.AlgebraData;

public interface AnimationStateTransferFinishCallback<T extends AlgebraData<T>> {
    void animationStateTransferFinish(AnimationNode<T> from, AnimationNode<T> to);
}
