package io.vproxy.vfx.ui.loading;

public class LoadingFailure extends RuntimeException {
    public final LoadingItem failedItem;

    public LoadingFailure(LoadingItem failedItem, Throwable cause) {
        super(cause);
        this.failedItem = failedItem;
    }

    public LoadingFailure(String msg) {
        super(msg);
        this.failedItem = null;
    }
}
