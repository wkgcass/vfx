package io.vproxy.vfx.ui.stage;

public class VStageInitParams {
    public boolean closeButton = true;
    public boolean maximizeAndResetButton = true;
    public boolean iconifyButton = true;
    public boolean resizable = true;

    public VStageInitParams() {
    }

    public VStageInitParams setCloseButton(boolean closeButton) {
        this.closeButton = closeButton;
        return this;
    }

    public VStageInitParams setMaximizeAndResetButton(boolean maximizeAndResetButton) {
        this.maximizeAndResetButton = maximizeAndResetButton;
        return this;
    }

    public VStageInitParams setIconifyButton(boolean iconifyButton) {
        this.iconifyButton = iconifyButton;
        return this;
    }

    public VStageInitParams setResizable(boolean resizable) {
        this.resizable = resizable;
        return this;
    }
}
