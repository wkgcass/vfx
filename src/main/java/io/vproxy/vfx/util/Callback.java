package io.vproxy.vfx.util;

import java.util.function.BiConsumer;
import java.util.function.Consumer;

abstract public class Callback<T, EX> {
    public Callback() {
    }

    public static <T, EX> Callback<T, EX> handler(BiConsumer<T, EX> cb) {
        return new Callback<>() {
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

    public static <T, EX> Callback<T, EX> ignoreExceptionHandler(Consumer<T> cb) {
        return new Callback<>() {
            @Override
            protected void succeeded0(T value) {
                cb.accept(value);
            }

            @Override
            protected void failed0(EX ex) {
                // do nothing
            }
        };
    }

    public void succeeded() {
        succeeded(null);
    }

    public void succeeded(T value) {
        succeeded0(value);
        finally0();
    }

    protected abstract void succeeded0(T value);

    public void failed(EX ex) {
        failed0(ex);
        finally0();
    }

    protected void failed0(EX ex) {
        if (ex instanceof SuppressError) {
            Logger.debug("the callback is not finishing with succeeded(...): " + ex);
            return;
        }
        if (!(ex instanceof Throwable)) {
            Logger.error("callback failed with " + ex);
            return;
        }
        Logger.error("unhandled exception in callback", (Throwable) ex);
    }

    protected void finally0() {
    }

    public interface SuppressError {
    }
}
