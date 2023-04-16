package io.vproxy.vfx.component.keychooser;

import com.github.kwhat.jnativehook.GlobalScreen;
import com.github.kwhat.jnativehook.keyboard.NativeKeyEvent;
import com.github.kwhat.jnativehook.keyboard.NativeKeyListener;
import io.vproxy.vfx.control.dialog.VDialog;
import io.vproxy.vfx.control.dialog.VDialogButton;
import io.vproxy.vfx.control.globalscreen.GlobalScreenUtils;
import io.vproxy.vfx.entity.input.Key;
import io.vproxy.vfx.entity.input.KeyCode;
import io.vproxy.vfx.entity.input.MouseWheelScroll;
import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import javafx.application.Platform;
import javafx.scene.input.MouseButton;

import java.util.*;

import static com.github.kwhat.jnativehook.keyboard.NativeKeyEvent.*;

public class KeyChooser extends VDialog<Key> {
    public static final int FLAG_WITH_MOUSE = 0x0001;
    public static final int FLAG_WITH_WHEEL_SCROLL = 0x0002;

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
        this(FLAG_WITH_MOUSE);
    }

    public KeyChooser(int flags) {
        List<VDialogButton<Key>> buttons = new ArrayList<>();
        if ((flags & FLAG_WITH_WHEEL_SCROLL) == FLAG_WITH_WHEEL_SCROLL) {
            buttons.add(new VDialogButton<>(InternalI18n.get().keyChooserWheelScrollUpButton(), new Key(new MouseWheelScroll(MouseWheelScroll.Direction.UP))));
            buttons.add(new VDialogButton<>(InternalI18n.get().keyChooserWheelScrollDownButton(), new Key(new MouseWheelScroll(MouseWheelScroll.Direction.DOWN))));
        }
        if ((flags & FLAG_WITH_MOUSE) == FLAG_WITH_MOUSE) {
            buttons.add(new VDialogButton<>(InternalI18n.get().keyChooserLeftMouseButton(), new Key(MouseButton.PRIMARY)));
            buttons.add(new VDialogButton<>(InternalI18n.get().keyChooserMiddleMouseButton(), new Key(MouseButton.MIDDLE)));
            buttons.add(new VDialogButton<>(InternalI18n.get().keyChooserRightMouseButton(), new Key(MouseButton.SECONDARY)));
        }
        buttons.add(new VDialogButton<>(InternalI18n.get().cancelButton(), () -> null));
        setButtons(buttons);
        boolean withMouse = (flags & (FLAG_WITH_WHEEL_SCROLL | FLAG_WITH_MOUSE)) != 0;
        getMessageNode().setText(withMouse ? InternalI18n.get().keyChooserDesc() : InternalI18n.get().keyChooserDescWithoutMouse());

        if (buttons.size() > 4) {
            getStage().getStage().setWidth(1200);
        }
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
