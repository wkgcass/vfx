package io.vproxy.vfx.intro;

import io.vproxy.vfx.component.keychooser.KeyChooser;
import io.vproxy.vfx.control.dialog.VDialog;
import io.vproxy.vfx.control.dialog.VDialogButton;
import io.vproxy.vfx.ui.alert.SimpleAlert;
import io.vproxy.vfx.ui.alert.StackTraceAlert;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.slider.VSlider;
import io.vproxy.vfx.ui.toggle.ToggleSwitch;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.layout.GridPane;
import javafx.scene.text.TextAlignment;

import java.util.Arrays;

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
            dialog.setButtons(Arrays.asList(
                new VDialogButton<>("1", 1),
                new VDialogButton<>("2", 2),
                new VDialogButton<>("3", 3)
            ));
            var result = dialog.showAndWait();
            SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "dialog result is " + result);
        });
        var keyChooserBtn = new Btn("KeyChooser");
        keyChooserBtn.setOnAction(e -> {
            var chooser = new KeyChooser();
            var keyOpt = chooser.choose();
            SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "the chosen key is " + keyOpt);
        });

        var toggleSwitch = new ToggleSwitch();

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

        var slider = new VSlider();
        slider.setLength(500);

        var gridPane = new GridPane();
        gridPane.setVgap(50);
        gridPane.setHgap(50);
        FXUtils.observeWidthCenter(getContentPane(), gridPane);
        gridPane.setLayoutY(60);
        gridPane.setAlignment(Pos.CENTER);

        gridPane.add(buttonButton, 0, 0);
        gridPane.add(alertButton, 1, 0);
        gridPane.add(stacktraceAlertButton, 2, 0);
        gridPane.add(dialogButton, 0, 1);
        gridPane.add(keyChooserBtn, 1, 1);
        gridPane.add(toggleSwitch.getNode(), 2, 1);
        gridPane.add(noAnimationButton, 0, 2, 2, 1);
        gridPane.add(onlyAnimateWhenNotClickedButton, 0, 3, 2, 1);
        gridPane.add(slider, 0, 4, 3, 1);
        gridPane.add(new Label(), 0, 5);

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
