package io.vproxy.vfx.ui.pane;

import io.vproxy.vfx.theme.Theme;
import javafx.event.EventHandler;
import javafx.scene.Cursor;
import javafx.scene.paint.Color;

public class ClickableFusionPane extends FusionPane {
    private EventHandler<?> handler;

    public ClickableFusionPane() {
        super();
        getNode().setCursor(Cursor.HAND);
    }

    public ClickableFusionPane(boolean manuallyHandleOuterRegion) {
        super(manuallyHandleOuterRegion);
        getNode().setCursor(Cursor.HAND);
    }

    @Override
    protected AbstractFusionPane buildRootNode() {
        return new FusionPaneImpl() {
            @Override
            protected Color downColor() {
                return Theme.current().fusionButtonDownBackgroundColor();
            }

            @Override
            protected void onMouseClicked() {
                var h = handler;
                if (h != null) {
                    h.handle(null);
                }
            }
        };
    }

    public void setOnAction(EventHandler<?> handler) {
        this.handler = handler;
    }
}
