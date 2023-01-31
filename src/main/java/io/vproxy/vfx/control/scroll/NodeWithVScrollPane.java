package io.vproxy.vfx.control.scroll;

import io.vproxy.vfx.util.JavaFXRegion;

public interface NodeWithVScrollPane extends JavaFXRegion {
    VScrollPane getScrollPane();
}
