package io.vproxy.vfx.intro;

import io.vproxy.vfx.test.TUtils;
import io.vproxy.vfx.ui.alert.SimpleAlert;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.loading.LoadingItem;
import io.vproxy.vfx.ui.loading.LoadingStage;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.control.Alert;

public class _08bLoadingStageDemoScene extends DemoVScene {
    public _08bLoadingStageDemoScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "Click the button to create a LoadingStage."
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(100);

        var loadingStageButton = new FusionButton("Open LoadingStage");
        loadingStageButton.setPrefWidth(300);
        loadingStageButton.setPrefHeight(200);
        FXUtils.observeWidthCenter(getContentPane(), loadingStageButton);
        loadingStageButton.setLayoutY(300);
        loadingStageButton.setOnAction(e -> {
            var stage = new LoadingStage("LoadingStage Demo");
            stage.setInterval(20);
            stage.setItems(TUtils.buildLoadingItems());
            stage.load(new Callback<>() {
                @Override
                protected void succeeded0(Void value) {
                    FXUtils.runDelay(200, () ->
                        SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "loading complete"));
                }

                @Override
                public void failed(LoadingItem loadingItem) {
                    if (loadingItem == null)
                        SimpleAlert.showAndWait(Alert.AlertType.ERROR, "loading process canceled");
                    else
                        SimpleAlert.showAndWait(Alert.AlertType.ERROR, "failed to load item: " + loadingItem.name);
                }
            });
        });

        getContentPane().getChildren().addAll(msgLabel, loadingStageButton);
    }

    @Override
    public String title() {
        return "LoadingStage Demo";
    }
}
