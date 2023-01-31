package io.vproxy.vfx.util;

import javafx.scene.layout.Region;

public interface JavaFXRegion extends JavaFXNode {
    @Override
    Region getSelfNode();
}
