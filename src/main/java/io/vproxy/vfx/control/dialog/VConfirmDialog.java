package io.vproxy.vfx.control.dialog;

import io.vproxy.vfx.manager.internal_i18n.InternalI18n;

import java.util.Arrays;

public class VConfirmDialog extends VDialog<VConfirmDialog.Result> {
    public enum Result {
        YES,
        NO,
    }

    public VConfirmDialog() {
        setButtons(Arrays.asList(
            new VDialogButton<>(InternalI18n.get().confirmationYesButton(), Result.YES),
            new VDialogButton<>(InternalI18n.get().confirmationNoButton(), Result.NO)
        ));
    }
}
