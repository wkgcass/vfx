package io.vproxy.vfx.util;

abstract public class Callback<T, EX> {
    public Callback() {
    }

    public void succeeded(T value) {
        succeeded0(value);
    }

    protected abstract void succeeded0(T value);

    public void failed(EX ex) {
        failed0(ex);
    }

    protected void failed0(EX ex) {
    }
}
