package io.vproxy.vfx.intro;

import io.vproxy.vfx.component.keychooser.KeyChooser;
import io.vproxy.vfx.control.dialog.VDialog;
import io.vproxy.vfx.control.dialog.VDialogValueProvider;
import io.vproxy.vfx.ui.alert.SimpleAlert;
import io.vproxy.vfx.ui.alert.StackTraceAlert;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.control.Alert;
import javafx.scene.layout.GridPane;
import javafx.scene.text.TextAlignment;

import java.util.LinkedHashMap;

public class _xxbComponentsDemoScene extends DemoVScene {
    public _xxbComponentsDemoScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidth();

        var buttonButton = new Btn("This is a\nFusionButton") {{
            getTextNode().setTextAlignment(TextAlignment.CENTER);
        }};

        var alertButton = new Btn("SimpleAlert");
        alertButton.setOnAction(e -> SimpleAlert.showAndWait(Alert.AlertType.INFORMATION,
            "call SimpleAlert.showAndWait(...)"));

        var stacktraceAlertButton = new Btn("StackTraceAlert");
        stacktraceAlertButton.setOnAction(e -> StackTraceAlert.showAndWait(
            "Click the stacktrace to copy", new Throwable()));

        var dialogButton = new Btn("VDialog");
        dialogButton.setOnAction(e -> {
            var dialog = new VDialog<Integer>();
            dialog.setText("Choose a number");
            dialog.setButtons(new LinkedHashMap<>() {{
                put("1", new VDialogValueProvider<>(1));
                put("2", new VDialogValueProvider<>(2));
                put("3", new VDialogValueProvider<>(3));
                put("Cancel", new VDialogValueProvider<>());
            }});
            var result = dialog.showAndWait();
            SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "dialog result is " + result);
        });
        var keyChooserBtn = new Btn("KeyChooser");
        keyChooserBtn.setOnAction(e -> {
            var chooser = new KeyChooser();
            var keyOpt = chooser.choose();
            SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "the chosen key is " + keyOpt);
        });

        var noAnimationButton = new Btn("FusionButton\n" +
                                        "setDisableAnimation(true)") {{
            getTextNode().setTextAlignment(TextAlignment.CENTER);
        }};
        noAnimationButton.setDisableAnimation(true);

        var onlyAnimateWhenNotClickedButton = new Btn("FusionButton\n" +
                                                      "setOnlyAnimateWhenNotClicked(true)") {{
            getTextNode().setTextAlignment(TextAlignment.CENTER);
        }};
        onlyAnimateWhenNotClickedButton.setOnlyAnimateWhenNotClicked(true);

        var gridPane = new GridPane();
        gridPane.setVgap(50);
        gridPane.setHgap(50);
        FXUtils.observeWidthCenter(getContentPane(), gridPane);
        gridPane.setLayoutY(100);

        gridPane.add(buttonButton, 0, 0);
        gridPane.add(alertButton, 1, 0);
        gridPane.add(stacktraceAlertButton, 2, 0);
        gridPane.add(dialogButton, 0, 1);
        gridPane.add(keyChooserBtn, 1, 1);
        gridPane.add(noAnimationButton, 0, 2, 2, 1);
        gridPane.add(onlyAnimateWhenNotClickedButton, 0, 3, 2, 1);

        getContentPane().getChildren().add(gridPane);
    }

    @Override
    public String title() {
        return "Components Demo";
    }

    private static class Btn extends FusionButton {
        Btn(String name) {
            super(name);
            setPrefWidth(200);
            setPrefHeight(100);
        }
    }
}
