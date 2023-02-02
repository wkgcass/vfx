package io.vproxy.vfx.control.dialog;

import java.util.function.Supplier;

public class VDialogButton<T> {
    public final String name;
    public final Supplier<T> provider;

    public VDialogButton(String name, T value) {
        this(name, () -> value);
    }

    public VDialogButton(String name, Supplier<T> provider) {
        this.name = name;
        this.provider = provider;
    }

    public VDialogButton(String name) {
        this.name = name;
        this.provider = null;
    }
}
