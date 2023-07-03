package io.vproxy.vfx.ui.pane;

public class TransparentContentFusionPane extends TransparentFusionPane {
    public TransparentContentFusionPane() {
        super();
    }

    public TransparentContentFusionPane(boolean manuallyHandleOuterRegion) {
        super(manuallyHandleOuterRegion);
    }

    @Override
    protected AbstractFusionPane buildRootNode() {
        return new TransparentContentFusionPaneImpl();
    }

    protected class TransparentContentFusionPaneImpl extends TransparentFusionPaneImpl {
        @Override
        protected double normalContentOpacity() {
            return 0.5;
        }
    }
}
