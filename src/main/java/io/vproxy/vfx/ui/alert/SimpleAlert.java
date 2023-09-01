package io.vproxy.vfx.ui.alert;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsage;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.control.Alert;

public class SimpleAlert extends ThemeAlertBase {
    private SimpleAlert(String title, String contentText, FontUsage fontUsage) {
        setTitle(title);
        var alertMessage = new ThemeLabel(contentText) {{
            setWrapText(true);
            FontManager.get().setFont(fontUsage, this);
        }};
        FXUtils.observeWidth(getSceneGroup().getNode(), alertMessage, -PADDING_H * 2);

        alertMessagePane.getChildren().add(alertMessage);
    }

    private static String typeToTitle(Alert.AlertType type) {
        if (type == Alert.AlertType.INFORMATION) {
            return InternalI18n.get().alertInfoTitle();
        } else if (type == Alert.AlertType.WARNING) {
            return InternalI18n.get().alertWarningTitle();
        } else if (type == Alert.AlertType.ERROR) {
            return InternalI18n.get().alertErrorTitle();
        } else {
            return type.name();
        }
    }

    public static void show(Alert.AlertType type, String contentText) {
        show(typeToTitle(type), contentText);
    }

    public static void show(Alert.AlertType type, String contentText, FontUsage fontUsage) {
        show(typeToTitle(type), contentText, fontUsage);
    }

    public static void showAndWait(Alert.AlertType type, String contentText) {
        showAndWait(typeToTitle(type), contentText);
    }

    public static void showAndWait(Alert.AlertType type, String contentText, FontUsage fontUsage) {
        showAndWait(typeToTitle(type), contentText, fontUsage);
    }

    public static void show(String title, String contentText) {
        show(title, contentText, FontUsages.alert);
    }

    public static void show(String title, String contentText, FontUsage fontUsage) {
        FXUtils.runOnFX(() -> new SimpleAlert(title, contentText, fontUsage).show());
    }

    public static void showAndWait(String title, String contentText) {
        showAndWait(title, contentText, FontUsages.alert);
    }

    public static void showAndWait(String title, String contentText, FontUsage fontUsage) {
        new SimpleAlert(title, contentText, fontUsage).showAndWait();
    }
}
