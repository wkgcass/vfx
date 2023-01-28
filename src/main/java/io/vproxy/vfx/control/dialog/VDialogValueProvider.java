package io.vproxy.vfx.control.dialog;

import java.util.function.Supplier;

public class VDialogValueProvider<T> {
    public final Supplier<T> provider;
    public final boolean directlySetValue;

    public VDialogValueProvider(T value) {
        this(() -> value);
    }

    public VDialogValueProvider(Supplier<T> provider) {
        this.provider = provider;
        this.directlySetValue = false;
    }

    public VDialogValueProvider() {
        this.provider = null;
        this.directlySetValue = true;
    }
}
