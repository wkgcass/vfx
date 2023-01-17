package io.vproxy.vfx.ui.layout;

import javafx.geometry.Insets;
import javafx.scene.layout.Pane;

public class VPadding extends Pane {
    public VPadding(int padding) {
        setVisible(false);
        setWidth(0);
        setPrefWidth(0);
        setMaxWidth(0);
        setPadding(new Insets(0, 0, padding, 0));
    }
}
