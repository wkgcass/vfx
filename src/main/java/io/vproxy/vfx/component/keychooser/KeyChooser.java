package io.vproxy.vfx.component.keychooser;

import com.github.kwhat.jnativehook.GlobalScreen;
import com.github.kwhat.jnativehook.keyboard.NativeKeyEvent;
import com.github.kwhat.jnativehook.keyboard.NativeKeyListener;
import io.vproxy.vfx.control.globalscreen.GlobalScreenUtils;
import io.vproxy.vfx.entity.input.Key;
import io.vproxy.vfx.entity.input.KeyCode;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import javafx.application.Platform;
import javafx.scene.control.ButtonBar;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Dialog;
import javafx.scene.control.Label;
import javafx.scene.input.MouseButton;
import javafx.stage.StageStyle;

import java.util.Optional;

import static com.github.kwhat.jnativehook.keyboard.NativeKeyEvent.*;

public class KeyChooser extends Dialog<Key> {
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
                KeyChooser.this.setResult(key);
                KeyChooser.this.close();
            });
        }
    };

    public KeyChooser() {
        this(true);
    }

    public KeyChooser(boolean withMouse) {
        initStyle(StageStyle.UTILITY);
        var useLeftMouseButtonType = new ButtonType(InternalI18n.get().keyChooserLeftMouseButton(), ButtonBar.ButtonData.OK_DONE);
        var useRightMouseButtonType = new ButtonType(InternalI18n.get().keyChooserRightMouseButton(), ButtonBar.ButtonData.OK_DONE);
        if (withMouse) {
            getDialogPane().getButtonTypes().addAll(useLeftMouseButtonType, useRightMouseButtonType, ButtonType.CANCEL);
        } else {
            getDialogPane().getButtonTypes().add(ButtonType.CANCEL);
        }

        var desc = new Label(withMouse ? InternalI18n.get().keyChooserDesc() : InternalI18n.get().keyChooserDescWithoutMouse()) {{
            FontManager.get().setFont(FontUsages.keyChooserDesc, this);
        }};

        getDialogPane().setContent(desc);

        setResultConverter(t -> {
            if (t == useLeftMouseButtonType) {
                return new Key(MouseButton.PRIMARY);
            } else if (t == useRightMouseButtonType) {
                return new Key(MouseButton.SECONDARY);
            }
            return null;
        });
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
