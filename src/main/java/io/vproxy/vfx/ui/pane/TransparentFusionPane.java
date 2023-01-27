package io.vproxy.vfx.ui.pane;

import io.vproxy.vfx.theme.Theme;
import javafx.scene.paint.Color;

public class TransparentFusionPane extends FusionPane {
    @Override
    protected AbstractFusionPane buildRootNode() {
        return new TransparentFusionPaneImpl();
    }

    protected static class TransparentFusionPaneImpl extends FusionPaneImpl {
        @Override
        protected Color normalColor() {
            return Theme.current().transparentFusionPaneNormalBackgroundColor();
        }

        @Override
        protected Color hoverColor() {
            return Theme.current().transparentFusionPaneHoverBackgroundColor();
        }
    }
}
