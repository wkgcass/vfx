package io.vproxy.vfx.ui.slider;

public enum SliderDirection {
    LEFT_TO_RIGHT(0, true),
    RIGHT_TO_LEFT(180, true),
    TOP_TO_BOTTOM(90, false),
    BOTTOM_TO_TOP(-90, false),
    ;
    public final int rotation;
    public final boolean isHorizontal;
    public final boolean isVertical;

    SliderDirection(int rotation, boolean isHorizontal) {
        this.rotation = rotation;
        this.isHorizontal = isHorizontal;
        this.isVertical = !isHorizontal;
    }
}
