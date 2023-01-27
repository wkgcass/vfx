package io.vproxy.vfx.util;

import java.util.function.BiConsumer;

abstract public class Callback<T, EX> {
    public Callback() {
    }

    public static <T, EX> Callback<T, EX> handler(BiConsumer<T, EX> cb) {
        return new Callback<T, EX>() {
            @Override
            protected void succeeded0(T value) {
                cb.accept(value, null);
            }

            @Override
            protected void failed0(EX ex) {
                cb.accept(null, ex);
            }
        };
    }

    public void succeeded() {
        succeeded(null);
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
