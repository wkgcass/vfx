package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.Callback;

public class AnimationInterrupted extends Exception implements Callback.SuppressError {
    public AnimationInterrupted() {
        super(null, null, false, false);
    }
}
