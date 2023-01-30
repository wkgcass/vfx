package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.Callback;

public class AnimationInterruptedException extends Exception implements Callback.SuppressError {
    public AnimationInterruptedException() {
        super(null, null, false, false);
    }
}
