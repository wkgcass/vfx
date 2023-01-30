package io.vproxy.vfx.ui.scene;

public class VSceneGroupInitParams {
    public boolean gradientCover = false;
    public boolean useClip = true;

    public VSceneGroupInitParams setGradientCover(boolean gradientCover) {
        this.gradientCover = gradientCover;
        return this;
    }

    public VSceneGroupInitParams setUseClip(boolean useClip) {
        this.useClip = useClip;
        return this;
    }
}
