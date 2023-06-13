package io.vproxy.vfx.control.dialog;

import io.vproxy.vfx.ui.button.FusionButton;

import java.util.function.Supplier;

public class VDialogButton<T> {
    public final String name;
    public final Supplier<T> provider;
    FusionButton button;

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

    // will be null before setting into a VDialog
    public FusionButton getButton() {
        return button;
    }
}
