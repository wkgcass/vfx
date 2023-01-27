package io.vproxy.vfx.ui.scene;

import static io.vproxy.vfx.ui.scene.VSceneRoleConsts.*;

class VSceneRoleConsts {
    static final int BIT_MANAGE_WIDTH = 0x0001;
    static final int BIT_MANAGE_HEIGHT = 0x0002;
    static final int BIT_SHOW_COVER = 0x0004;
    static final int BIT_TEMPORARY = 0x008;

    private VSceneRoleConsts() {
    }
}

public enum VSceneRole {
    MAIN(BIT_MANAGE_WIDTH | BIT_MANAGE_HEIGHT),
    TEMPORARY(BIT_MANAGE_WIDTH | BIT_MANAGE_HEIGHT | BIT_TEMPORARY),
    DRAWER_VERTICAL(BIT_MANAGE_HEIGHT | BIT_SHOW_COVER | BIT_TEMPORARY),
    DRAWER_HORIZONTAL(BIT_MANAGE_WIDTH | BIT_SHOW_COVER | BIT_TEMPORARY);
    public final boolean manageWidth;
    public final boolean manageHeight;
    public final boolean showCover;
    public final boolean temporary;

    VSceneRole(int bits) {
        this.manageWidth = (bits & BIT_MANAGE_WIDTH) == BIT_MANAGE_WIDTH;
        this.manageHeight = (bits & BIT_MANAGE_HEIGHT) == BIT_MANAGE_HEIGHT;
        this.showCover = (bits & BIT_SHOW_COVER) == BIT_SHOW_COVER;
        this.temporary = (bits & BIT_TEMPORARY) == BIT_TEMPORARY;
    }
}
