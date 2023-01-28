package io.vproxy.vfx.test;

import io.vproxy.vfx.control.dialog.VDialog;
import io.vproxy.vfx.control.dialog.VDialogValueProvider;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.image.ImageManager;
import io.vproxy.vfx.manager.task.TaskManager;
import io.vproxy.vfx.ui.alert.SimpleAlert;
import io.vproxy.vfx.ui.alert.StackTraceAlert;
import io.vproxy.vfx.ui.button.TransparentFusionButton;
import io.vproxy.vfx.ui.button.TransparentFusionImageButton;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.loading.LoadingItem;
import io.vproxy.vfx.ui.loading.LoadingPane;
import io.vproxy.vfx.ui.loading.LoadingStage;
import io.vproxy.vfx.ui.pane.FusionPane;
import io.vproxy.vfx.ui.pane.TransparentFusionPane;
import io.vproxy.vfx.ui.scene.*;
import io.vproxy.vfx.ui.stage.VStage;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.FXUtils;
import javafx.application.Application;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.stage.Stage;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

public class MiscTest extends Application {
    @Override
    public void start(Stage primaryStage) {
        ImageManager.get().loadBlackAndChangeColor("images/menu.png", Map.of("white", 0xffffffff));

        var stage = new VStage(primaryStage) {
            {
                useInverseBorder();
            }

            @Override
            public void close() {
                super.close();
                TaskManager.get().terminate();
            }
        };
        var root = stage.getInitialScene().getContentPane();
        var transparentPane = new TransparentFusionPane();
        root.getChildren().add(transparentPane.getNode());

        stage.getRoot().setBackground(new Background(new BackgroundImage(
            ImageManager.get().load("images/bg1.png"),
            BackgroundRepeat.NO_REPEAT,
            BackgroundRepeat.NO_REPEAT,
            BackgroundPosition.CENTER,
            BackgroundSize.DEFAULT
        )));
        transparentPane.getContentPane().getChildren().add(
            new Label("文字文字文字文字文字文字\n说明说明说明说明说明说明\n文字文字文字文字") {{
                setFont(new Font(FontManager.FONT_NAME_SmileySansOblique, 48));
            }}
        );
        transparentPane.getNode().setLayoutX(10);
        Runnable fixPosition = () -> {
            transparentPane.getNode().setLayoutY((primaryStage.getHeight() - VStage.TITLE_BAR_HEIGHT - transparentPane.getNode().getHeight()) / 2);
            transparentPane.getNode().setPrefWidth(primaryStage.getWidth() - 20);
        };
        stage.getStage().widthProperty().addListener((ob, old, now) -> fixPosition.run());
        stage.getStage().heightProperty().addListener((ob, old, now) -> fixPosition.run());
        transparentPane.getNode().widthProperty().addListener((ob, old, now) -> fixPosition.run());
        transparentPane.getNode().heightProperty().addListener((ob, old, now) -> fixPosition.run());
        transparentPane.getNode().setOnMouseClicked(e -> {
            SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "提示！提示！提示！提示！提示！提示！警告！警告！警告！警告！警告！警告！信息！信息！信息！信息！信息！信息！");
            StackTraceAlert.showAndWait("说明文字", new Throwable());
        });

        var transparentImageButton = new TransparentFusionImageButton(ImageManager.get().load("images/menu.png:white"));
        transparentImageButton.getImageView().setFitHeight(18);
        transparentImageButton.setPrefWidth(VStage.TITLE_BAR_HEIGHT - 4);
        transparentImageButton.setPrefHeight(VStage.TITLE_BAR_HEIGHT - 4);

        var transparentButton = new TransparentFusionButton("进度条");
        transparentButton.setPrefWidth(100);
        transparentButton.setPrefHeight(VStage.TITLE_BAR_HEIGHT - 4);
        transparentButton.setOnAction(e -> {
            var load = new LoadingStage("加载中...");
            load.setInterval(20);
            var items = new ArrayList<LoadingItem>();
            for (int i = 0; i < 240; ++i) {
                items.add(new LoadingItem(1, "" + i, () -> {
                }));
            }
            load.setItems(items);
            load.load(new Callback<>() {
                @Override
                protected void succeeded0(Void value) {
                    SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "加载完成");
                }

                @Override
                public void failed(LoadingItem loadingItem) {
                    SimpleAlert.showAndWait(Alert.AlertType.INFORMATION,
                        "加载失败：" +
                        (loadingItem == null ? "用户取消" : loadingItem.name));
                }
            });
        });

        var transparentButton2 = new TransparentFusionButton("窗口内进度条");
        transparentButton2.setPrefWidth(150);
        transparentButton2.setPrefHeight(VStage.TITLE_BAR_HEIGHT - 4);
        transparentButton2.setOnAction(e -> {
            var vScene = new VScene(VSceneRole.POPUP);
            stage.getSceneGroup().addScene(vScene, VSceneHideMethod.FADE_OUT,
                new VSceneAddParams()
                    .setCoverClickable(false)
            );

            var vPane = new FusionPane();
            var load = new LoadingPane("加载中...");
            vPane.getContentPane().getChildren().add(load);
            vScene.getContentPane().getChildren().add(vPane.getNode());

            vPane.getNode().setPrefWidth(700);
            vPane.getNode().setPrefHeight(250);
            vScene.getNode().setPrefWidth(700);
            vScene.getNode().setPrefHeight(250);
            load.setLength(600);
            FXUtils.observeWidthHeightCenter(vPane.getContentPane(), load);

            load.getProgressBar().setInterval(20);
            var items = new ArrayList<LoadingItem>();
            for (int i = 0; i < 240; ++i) {
                items.add(new LoadingItem(1, "" + i, () -> {
                }));
            }
            load.getProgressBar().setItems(items);
            stage.getSceneGroup().show(vScene, VSceneShowMethod.FADE_IN);
            load.getProgressBar().load(Callback.handler((v, ex) -> {
                stage.getSceneGroup().hide(vScene, VSceneHideMethod.FADE_OUT);
                FXUtils.runDelay(VScene.ANIMATION_DURATION_MILLIS,
                    () -> stage.getSceneGroup().removeScene(vScene));
            }));
        });

        var transparentButton3 = new TransparentFusionButton("Dialog");
        transparentButton3.setPrefWidth(100);
        transparentButton3.setPrefHeight(VStage.TITLE_BAR_HEIGHT - 4);
        transparentButton3.setOnAction(e -> {
            var dialog = new VDialog<Integer>();
            dialog.getMessageNode().setText("a b c d e f g h i j k l m n o p q r s t u v w x y z ".repeat(10));
            dialog.setButtons(new LinkedHashMap<>() {{
                put("1", new VDialogValueProvider<>(1));
                put("2", new VDialogValueProvider<>(2));
                put("3", new VDialogValueProvider<>(3));
            }});
            var result = dialog.showAndWait();
            if (result.isPresent()) {
                SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "点击的按钮是：" + result);
            } else {
                SimpleAlert.showAndWait(Alert.AlertType.INFORMATION, "取消操作");
            }
        });

        var topHBox = new HBox(
            transparentImageButton,
            new HPadding(5),
            transparentButton,
            new HPadding(5),
            transparentButton2,
            new HPadding(5),
            transparentButton3
        );
        topHBox.setLayoutX(5);
        topHBox.setLayoutY(4);

        stage.getRoot().getChildren().add(topHBox);

        primaryStage.setWidth(1024);
        primaryStage.setHeight(768);
        primaryStage.centerOnScreen();
        primaryStage.show();
    }
}
