package io.vproxy.vfx.intro;

import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.shapes.BrokenLine;
import io.vproxy.vfx.ui.shapes.EndpointStyle;
import io.vproxy.vfx.ui.stage.VStage;
import io.vproxy.vfx.ui.stage.VStageInitParams;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.Group;
import javafx.scene.layout.GridPane;

public class _01bVStageInitParamsScene extends DemoVScene {
    public _01bVStageInitParamsScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "VStageInitParams can be passed to VStage, it has the following properties:"
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(100);

        var defaultButton = new FusionButton("new VStageInitParams()") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        defaultButton.setOnAction(e -> {
            var stage = new VStage();
            var group = new Group();
            var label = new ThemeLabel("Drag here to resize");
            var line = new BrokenLine(2,
                120, 30,
                120, 75,
                200, 100);
            line.setStroke(Theme.current().normalTextColor());
            line.setEndStyle(EndpointStyle.ARROW);
            group.getChildren().addAll(label, line.getNode());
            stage.getInitialScene().enableAutoContentWidthHeight();
            stage.getInitialScene().getContentPane().getChildren().add(group);
            stage.getInitialScene().getContentPane().widthProperty().addListener((ob, old, now) -> {
                if (now == null) return;
                var w = now.doubleValue();
                group.setLayoutX(w - 210);
            });
            stage.getInitialScene().getContentPane().heightProperty().addListener((ob, old, now) -> {
                if (now == null) return;
                var h = now.doubleValue();
                group.setLayoutY(h - 110);
            });
            stage.getStage().setWidth(400);
            stage.getStage().setHeight(400);
            stage.show();
        });

        var noIconifyButton = new FusionButton("setIconifyButton(false)") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        noIconifyButton.setOnAction(e -> {
            var stage = new VStage(new VStageInitParams()
                .setIconifyButton(false));
            stage.getStage().setWidth(400);
            stage.getStage().setHeight(400);
            stage.show();
        });

        var noMaximizeAndResetButton = new FusionButton("setMaximizeAndResetButton(false)") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        noMaximizeAndResetButton.setOnAction(e -> {
            var stage = new VStage(new VStageInitParams()
                .setMaximizeAndResetButton(false));
            stage.getStage().setWidth(400);
            stage.getStage().setHeight(400);
            stage.show();
        });

        var noCloseButton = new FusionButton("setCloseButton(false)") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        noCloseButton.setOnAction(e -> {
            var stage = new VStage(new VStageInitParams()
                .setCloseButton(false));
            stage.getStage().setWidth(400);
            stage.getStage().setHeight(400);
            stage.getInitialScene().enableAutoContentWidthHeight();
            var closeBtn = new FusionButton("close") {{
                setPrefWidth(100);
                setPrefHeight(50);
            }};
            closeBtn.setOnAction(ee -> stage.close());
            stage.getInitialScene().getContentPane().getChildren().add(closeBtn);
            FXUtils.observeWidthHeightCenter(stage.getInitialScene().getContentPane(), closeBtn);
            stage.show();
        });

        var notResizableButton = new FusionButton("setResizable(false)") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        notResizableButton.setOnAction(e -> {
            var stage = new VStage(new VStageInitParams()
                .setResizable(false));
            stage.getStage().setWidth(400);
            stage.getStage().setHeight(400);
            stage.show();
        });

        var gridPane = new GridPane();
        gridPane.setLayoutY(300);
        gridPane.setHgap(50);
        gridPane.setVgap(50);
        FXUtils.observeWidthCenter(getContentPane(), gridPane);
        gridPane.add(defaultButton, 0, 0);
        gridPane.add(noIconifyButton, 1, 0);
        gridPane.add(noMaximizeAndResetButton, 2, 0);
        gridPane.add(noCloseButton, 0, 1);
        gridPane.add(notResizableButton, 1, 1);

        getContentPane().getChildren().addAll(
            msgLabel,
            gridPane
        );
    }

    @Override
    public String title() {
        return "VStageInitParams";
    }
}
