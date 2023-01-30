package io.vproxy.vfx.intro;

import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.scene.*;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Insets;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.GridPane;
import javafx.scene.paint.Color;

import java.util.function.Supplier;

public class _02cVSceneGroupDemoScene extends DemoVScene {
    public _02cVSceneGroupDemoScene(Supplier<VSceneGroup> sceneGroupSup) {
        super(VSceneRole.MAIN);
        enableAutoContentWidth();

        var msgLabel = new ThemeLabel(
            "VSceneGroup also provides the following switching methods:"
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(100);

        var fromTopButton = new FusionButton("DRAWER_HORIZONTAL + FROM_TOP") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        fromTopButton.setOnAction(e -> {
            var scene = new VScene(VSceneRole.DRAWER_HORIZONTAL);
            scene.enableAutoContentWidthHeight();
            scene.getNode().setPrefHeight(300);
            scene.getNode().setBackground(new Background(new BackgroundFill(
                new Color(0xaf / 255d, 0xcb / 255d, 0x9e / 255d, 1),
                CornerRadii.EMPTY,
                Insets.EMPTY
            )));
            var closeBtn = new FusionButton("hide") {{
                setPrefWidth(100);
                setPrefHeight(50);
            }};
            closeBtn.setOnAction(ee -> {
                sceneGroupSup.get().hide(scene, VSceneHideMethod.TO_TOP);
                FXUtils.runDelay(VScene.ANIMATION_DURATION_MILLIS, () -> sceneGroupSup.get().removeScene(scene));
            });
            scene.getContentPane().getChildren().add(closeBtn);
            FXUtils.observeWidthHeightCenter(scene.getContentPane(), closeBtn);
            sceneGroupSup.get().addScene(scene, VSceneHideMethod.TO_TOP);
            FXUtils.runDelay(50, () -> sceneGroupSup.get().show(scene, VSceneShowMethod.FROM_TOP));
        });

        var fromRightButton = new FusionButton("DRAWER_VERTICAL + FROM_RIGHT") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        fromRightButton.setOnAction(e -> {
            var scene = new VScene(VSceneRole.DRAWER_VERTICAL);
            scene.enableAutoContentWidthHeight();
            scene.getNode().setPrefWidth(300);
            scene.getNode().setBackground(new Background(new BackgroundFill(
                new Color(0xaf / 255d, 0xcb / 255d, 0x9e / 255d, 1),
                CornerRadii.EMPTY,
                Insets.EMPTY
            )));
            var closeBtn = new FusionButton("hide") {{
                setPrefWidth(100);
                setPrefHeight(50);
            }};
            closeBtn.setOnAction(ee -> {
                sceneGroupSup.get().hide(scene, VSceneHideMethod.TO_RIGHT);
                FXUtils.runDelay(VScene.ANIMATION_DURATION_MILLIS, () -> sceneGroupSup.get().removeScene(scene));
            });
            scene.getContentPane().getChildren().add(closeBtn);
            FXUtils.observeWidthHeightCenter(scene.getContentPane(), closeBtn);
            sceneGroupSup.get().addScene(scene, VSceneHideMethod.TO_RIGHT);
            FXUtils.runDelay(50, () -> sceneGroupSup.get().show(scene, VSceneShowMethod.FROM_RIGHT));
        });

        var fromBottomButton = new FusionButton("DRAWER_HORIZONTAL + FROM_BOTTOM") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        fromBottomButton.setOnAction(e -> {
            var scene = new VScene(VSceneRole.DRAWER_HORIZONTAL);
            scene.enableAutoContentWidthHeight();
            scene.getNode().setPrefHeight(300);
            scene.getNode().setBackground(new Background(new BackgroundFill(
                new Color(0xaf / 255d, 0xcb / 255d, 0x9e / 255d, 1),
                CornerRadii.EMPTY,
                Insets.EMPTY
            )));
            var closeBtn = new FusionButton("hide") {{
                setPrefWidth(100);
                setPrefHeight(50);
            }};
            closeBtn.setOnAction(ee -> {
                sceneGroupSup.get().hide(scene, VSceneHideMethod.TO_BOTTOM);
                FXUtils.runDelay(VScene.ANIMATION_DURATION_MILLIS, () -> sceneGroupSup.get().removeScene(scene));
            });
            scene.getContentPane().getChildren().add(closeBtn);
            FXUtils.observeWidthHeightCenter(scene.getContentPane(), closeBtn);
            sceneGroupSup.get().addScene(scene, VSceneHideMethod.TO_BOTTOM);
            FXUtils.runDelay(50, () -> sceneGroupSup.get().show(scene, VSceneShowMethod.FROM_BOTTOM));
        });

        var fromLeftButton = new FusionButton("DRAWER_VERTICAL + FROM_LEFT") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        fromLeftButton.setOnAction(e -> {
            var scene = new VScene(VSceneRole.DRAWER_VERTICAL);
            scene.enableAutoContentWidthHeight();
            scene.getNode().setPrefWidth(300);
            scene.getNode().setBackground(new Background(new BackgroundFill(
                new Color(0xaf / 255d, 0xcb / 255d, 0x9e / 255d, 1),
                CornerRadii.EMPTY,
                Insets.EMPTY
            )));
            var closeBtn = new FusionButton("hide") {{
                setPrefWidth(100);
                setPrefHeight(50);
            }};
            closeBtn.setOnAction(ee -> {
                sceneGroupSup.get().hide(scene, VSceneHideMethod.TO_LEFT);
                FXUtils.runDelay(VScene.ANIMATION_DURATION_MILLIS, () -> sceneGroupSup.get().removeScene(scene));
            });
            scene.getContentPane().getChildren().add(closeBtn);
            FXUtils.observeWidthHeightCenter(scene.getContentPane(), closeBtn);
            sceneGroupSup.get().addScene(scene, VSceneHideMethod.TO_LEFT);
            FXUtils.runDelay(50, () -> sceneGroupSup.get().show(scene, VSceneShowMethod.FROM_LEFT));
        });

        var popButton = new FusionButton("POPUP + FADE_IN") {{
            setPrefWidth(320);
            setPrefHeight(150);
        }};
        popButton.setOnAction(e -> {
            var scene = new VScene(VSceneRole.POPUP);
            scene.enableAutoContentWidthHeight();
            scene.getNode().setPrefWidth(300);
            scene.getNode().setPrefHeight(300);
            scene.getNode().setBackground(new Background(new BackgroundFill(
                new Color(0xaf / 255d, 0xcb / 255d, 0x9e / 255d, 1),
                CornerRadii.EMPTY,
                Insets.EMPTY
            )));
            var closeBtn = new FusionButton("hide") {{
                setPrefWidth(100);
                setPrefHeight(50);
            }};
            closeBtn.setOnAction(ee -> {
                sceneGroupSup.get().hide(scene, VSceneHideMethod.FADE_OUT);
                FXUtils.runDelay(VScene.ANIMATION_DURATION_MILLIS, () -> sceneGroupSup.get().removeScene(scene));
            });
            scene.getContentPane().getChildren().add(closeBtn);
            FXUtils.observeWidthHeightCenter(scene.getContentPane(), closeBtn);
            sceneGroupSup.get().addScene(scene, VSceneHideMethod.FADE_OUT);
            FXUtils.runDelay(50, () -> sceneGroupSup.get().show(scene, VSceneShowMethod.FADE_IN));
        });

        var gridPane = new GridPane();
        gridPane.setLayoutY(200);
        gridPane.setHgap(50);
        gridPane.setVgap(50);
        FXUtils.observeWidthCenter(getContentPane(), gridPane);
        gridPane.add(fromTopButton, 1, 0);
        gridPane.add(fromRightButton, 2, 1);
        gridPane.add(fromBottomButton, 1, 2);
        gridPane.add(fromLeftButton, 0, 1);
        gridPane.add(popButton, 1, 1);

        getContentPane().getChildren().addAll(
            msgLabel,
            gridPane
        );
    }

    @Override
    public String title() {
        return "VSceneGroup Demo";
    }
}
