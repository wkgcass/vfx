package io.vproxy.vfx.component.keychooser;

import com.github.kwhat.jnativehook.GlobalScreen;
import com.github.kwhat.jnativehook.keyboard.NativeKeyEvent;
import com.github.kwhat.jnativehook.keyboard.NativeKeyListener;
import io.vproxy.vfx.control.dialog.VDialog;
import io.vproxy.vfx.control.dialog.VDialogValueProvider;
import io.vproxy.vfx.control.globalscreen.GlobalScreenUtils;
import io.vproxy.vfx.entity.input.Key;
import io.vproxy.vfx.entity.input.KeyCode;
import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import javafx.application.Platform;

import java.util.LinkedHashMap;
import java.util.Optional;

import static com.github.kwhat.jnativehook.keyboard.NativeKeyEvent.*;

public class KeyChooser extends VDialog<Key> {
    private final NativeKeyListener keyListener = new NativeKeyListener() {
        @Override
        public void nativeKeyPressed(NativeKeyEvent e) {
            Key key;
            if (e.getKeyCode() == VC_CONTROL || e.getKeyCode() == VC_ALT || e.getKeyCode() == VC_SHIFT || e.getKeyCode() == 0x0e36 /*right shift*/) {
                boolean isLeft;
                if (e.getKeyLocation() == KEY_LOCATION_LEFT) {
                    isLeft = true;
                } else if (e.getKeyLocation() == KEY_LOCATION_RIGHT) {
                    isLeft = false;
                } else {
                    return; // should not happen, but if happens, we ignore this event
                }
                key = new Key(KeyCode.valueOf(e.getKeyCode()), isLeft);
            } else {
                if (e.getKeyLocation() == KEY_LOCATION_NUMPAD) {
                    return; // ignore numpad
                }
                key = new Key(KeyCode.valueOf(e.getKeyCode()));
            }
            Platform.runLater(() -> {
                KeyChooser.this.returnValue = key;
                KeyChooser.this.getStage().close();
            });
        }
    };

    public KeyChooser() {
        this(true);
    }

    public KeyChooser(boolean withMouse) {
        if (withMouse) {
            setButtons(new LinkedHashMap<>() {{
                put(InternalI18n.get().keyChooserLeftMouseButton(), new VDialogValueProvider<>());
                put(InternalI18n.get().keyChooserRightMouseButton(), new VDialogValueProvider<>());
                put(InternalI18n.get().cancelButton(), new VDialogValueProvider<>(() -> null));
            }});
        } else {
            setButtons(new LinkedHashMap<>() {{
                put(InternalI18n.get().cancelButton(), new VDialogValueProvider<>(() -> null));
            }});
        }

        getMessageNode().setText(withMouse ? InternalI18n.get().keyChooserDesc() : InternalI18n.get().keyChooserDescWithoutMouse());
    }

    public Optional<Key> choose() {
        GlobalScreenUtils.enable(this);
        GlobalScreen.addNativeKeyListener(keyListener);
        var ret = showAndWait();
        GlobalScreen.removeNativeKeyListener(keyListener);
        GlobalScreenUtils.disable(this);
        return ret;
    }
}
