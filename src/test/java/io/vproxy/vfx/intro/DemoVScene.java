package io.vproxy.vfx.intro;

import io.vproxy.vfx.ui.scene.VScene;
import io.vproxy.vfx.ui.scene.VSceneRole;

public abstract class DemoVScene extends VScene {
    public DemoVScene(VSceneRole role) {
        super(role);
    }

    public abstract String title();
}
