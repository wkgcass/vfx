package io.vproxy.vfx.intro;

import io.vproxy.vfx.ui.pane.FusionPane;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.layout.Pane;

public class _05bFusionPaneDemoScene extends DemoVScene {
    public _05bFusionPaneDemoScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "Demonstration about the FusionPane."
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(100);

        var manuallySetPane = new FusionPane();
        manuallySetPane.getNode().setPrefWidth(400);
        manuallySetPane.getNode().setPrefHeight(100);
        manuallySetPane.getContentPane().getChildren().add(new ThemeLabel("Manually set width and height"));

        var autoPane = new FusionPane(false);
        autoPane.getContentPane().getChildren().add(new ThemeLabel("Auto width height"));
        autoPane.getNode().setLayoutX(500);

        var group = new Pane();
        group.setPrefWidth(700);
        group.setLayoutY(400);
        FXUtils.observeWidthCenter(getContentPane(), group);
        group.getChildren().addAll(manuallySetPane.getNode(), autoPane.getNode());

        getContentPane().getChildren().addAll(
            msgLabel,
            group
        );
    }

    @Override
    public String title() {
        return "FusionPane Demo";
    }
}
