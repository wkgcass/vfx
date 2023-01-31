package io.vproxy.vfx.intro;

import io.vproxy.vfx.control.globalscreen.GlobalScreenUtils;
import io.vproxy.vfx.manager.image.ImageManager;
import io.vproxy.vfx.manager.task.TaskManager;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.button.FusionImageButton;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.pane.FusionPane;
import io.vproxy.vfx.ui.scene.*;
import io.vproxy.vfx.ui.stage.VStage;
import io.vproxy.vfx.util.FXUtils;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.layout.*;
import javafx.stage.Stage;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class IntroFXMain extends Application {
    private final List<DemoVScene> mainScenes = new ArrayList<>();
    private VSceneGroup sceneGroup;

    @Override
    public void start(Stage primaryStage) {
        ImageManager.get().loadBlackAndChangeColor("images/menu.png", Map.of("white", 0xffffffff));
        ImageManager.get().loadBlackAndChangeColor("images/up-arrow.png", Map.of("white", 0xffffffff));

        var stage = new VStage(primaryStage) {
            @Override
            public void close() {
                super.close();
                TaskManager.get().terminate();
                GlobalScreenUtils.unregister();
            }
        };
        stage.getInitialScene().enableAutoContentWidthHeight();

        stage.setTitle("VFX Intro");

        mainScenes.add(new _00IntroScene());
        mainScenes.add(new _01aVStageIntroScene());
        mainScenes.add(new _01bVStageInitParamsScene());
        mainScenes.add(new _01cVStageStructureScene());
        mainScenes.add(new _02aVSceneGroupIntroScene());
        mainScenes.add(new _02bVSceneGroupDisplayScene());
        mainScenes.add(new _02cVSceneGroupDemoScene(() -> sceneGroup));
        mainScenes.add(new _02dVSceneGroupMenuScene());
        mainScenes.add(new _02eVSceneGroupStructureScene());
        mainScenes.add(new _03aVSceneIntroScene());
        mainScenes.add(new _03bVSceneStructureScene());
        mainScenes.add(new _04aVScrollPaneIntroScene());
        mainScenes.add(new _04bVScrollPaneDemoScene());
        mainScenes.add(new _04cVScrollPaneStructureScene());
        mainScenes.add(new _05aFusionPaneIntroScene());
        mainScenes.add(new _05bFusionPaneDemoScene());
        mainScenes.add(new _05cFusionPaneStructureScene());
        mainScenes.add(new _06aVTableViewIntroScene());
        mainScenes.add(new _06bVTableViewDemoScene());
        mainScenes.add(new _06cVTableViewDemo2Scene());
        mainScenes.add(new _06dVTableViewStructureScene());
        mainScenes.add(new _06eVTableViewSpecialUsageScene());
        mainScenes.add(new _07aAnimationSystemIntroScene());
        mainScenes.add(new _07bAnimationSystemDemoScene());
        mainScenes.add(new _07cAnimationSystemDescScene());
        mainScenes.add(new _08aLoadingStageIntroScene());
        mainScenes.add(new _08bLoadingStageDemoScene());
        mainScenes.add(new _08cLoadingStageStructureScene());
        mainScenes.add(new _xxaComponentsIntroScene());
        mainScenes.add(new _xxbComponentsDemoScene());
        mainScenes.add(new _xxcComponentsDemo2Scene());
        mainScenes.add(new _xxdComponentsDemo3Scene());
        mainScenes.add(new _zzzzzEndingScene());

        // var initialScene = mainScenes.stream().filter(e -> e instanceof ).findAny().get();
        var initialScene = mainScenes.get(0);
        sceneGroup = new VSceneGroup(initialScene);
        for (var s : mainScenes) {
            if (s == initialScene) continue;
            sceneGroup.addScene(s);
        }

        var navigatePane = new FusionPane();

        navigatePane.getNode().setPrefHeight(60);
        FXUtils.observeHeight(stage.getInitialScene().getContentPane(), sceneGroup.getNode(), -10 - 60 - 5 - 10);

        FXUtils.observeWidth(stage.getInitialScene().getContentPane(), sceneGroup.getNode(), -20);
        FXUtils.observeWidth(stage.getInitialScene().getContentPane(), navigatePane.getNode(), -20);

        var prevButton = new FusionButton("<< Previous") {{
            setPrefWidth(150);
            setPrefHeight(navigatePane.getNode().getPrefHeight() - FusionPane.PADDING_V * 2);
            setOnlyAnimateWhenNotClicked(true);

            var current = sceneGroup.getCurrentMainScene();
            //noinspection SuspiciousMethodCalls
            var index = mainScenes.indexOf(current);
            if (index == 0) {
                setDisable(true);
            }
        }};
        var nextButton = new FusionButton("Next >>") {{
            setPrefWidth(150);
            setPrefHeight(navigatePane.getNode().getPrefHeight() - FusionPane.PADDING_V * 2);
            setOnlyAnimateWhenNotClicked(true);

            var current = sceneGroup.getCurrentMainScene();
            //noinspection SuspiciousMethodCalls
            var index = mainScenes.indexOf(current);
            if (index == mainScenes.size() - 1) {
                setDisable(true);
            }
        }};
        prevButton.setOnAction(e -> {
            var current = sceneGroup.getCurrentMainScene();
            //noinspection SuspiciousMethodCalls
            var index = mainScenes.indexOf(current);
            if (index == 0) return;
            sceneGroup.show(mainScenes.get(index - 1), VSceneShowMethod.FROM_LEFT);
            if (index - 1 == 0) {
                prevButton.setDisable(true);
            }
            nextButton.setDisable(false);
        });
        nextButton.setOnAction(e -> {
            var current = sceneGroup.getCurrentMainScene();
            //noinspection SuspiciousMethodCalls
            var index = mainScenes.indexOf(current);
            if (index == mainScenes.size() - 1) return;
            sceneGroup.show(mainScenes.get(index + 1), VSceneShowMethod.FROM_RIGHT);
            if (index + 1 == mainScenes.size() - 1) {
                nextButton.setDisable(true);
            }
            prevButton.setDisable(false);
        });

        navigatePane.getContentPane().getChildren().add(prevButton);
        navigatePane.getContentPane().getChildren().add(nextButton);
        navigatePane.getContentPane().widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var v = now.doubleValue();
            nextButton.setLayoutX(v - nextButton.getPrefWidth());
        });

        var box = new HBox(
            new HPadding(10),
            new VBox(
                new VPadding(10),
                sceneGroup.getNode(),
                new VPadding(5),
                navigatePane.getNode()
            )
        );
        stage.getInitialScene().getContentPane().getChildren().add(box);

        var menuScene = new VScene(VSceneRole.DRAWER_VERTICAL);
        menuScene.getNode().setPrefWidth(450);
        menuScene.enableAutoContentWidth();
        menuScene.getNode().setBackground(new Background(new BackgroundFill(
            Theme.current().subSceneBackgroundColor(),
            CornerRadii.EMPTY,
            Insets.EMPTY
        )));
        stage.getRootSceneGroup().addScene(menuScene, VSceneHideMethod.TO_LEFT);
        var menuVBox = new VBox() {{
            setPadding(new Insets(0, 0, 0, 24));
            getChildren().add(new VPadding(20));
        }};
        menuScene.getContentPane().getChildren().add(menuVBox);
        for (int i = 0; i < mainScenes.size(); ++i) {
            final var fi = i;
            var s = mainScenes.get(i);
            var title = s.title();
            var button = new FusionButton(title);
            button.setDisableAnimation(true);
            button.setOnAction(e -> {
                //noinspection SuspiciousMethodCalls
                var currentIndex = mainScenes.indexOf(sceneGroup.getCurrentMainScene());
                if (currentIndex != fi) {
                    sceneGroup.show(s, currentIndex < fi ? VSceneShowMethod.FROM_RIGHT : VSceneShowMethod.FROM_LEFT);
                }
                stage.getRootSceneGroup().hide(menuScene, VSceneHideMethod.TO_LEFT);
                prevButton.setDisable(fi == 0);
                nextButton.setDisable(fi == mainScenes.size() - 1);
            });
            button.setPrefWidth(400);
            button.setPrefHeight(40);
            if (i != 0) {
                menuVBox.getChildren().add(new VPadding(20));
            }
            menuVBox.getChildren().add(button);
        }
        menuVBox.getChildren().add(new VPadding(20));

        var menuBtn = new FusionImageButton(ImageManager.get().load("images/menu.png:white")) {{
            setPrefWidth(40);
            setPrefHeight(VStage.TITLE_BAR_HEIGHT + 1);
            getImageView().setFitHeight(15);
            setLayoutX(-2);
            setLayoutY(-1);
        }};
        menuBtn.setOnAction(e -> stage.getRootSceneGroup().show(menuScene, VSceneShowMethod.FROM_LEFT));
        stage.getRoot().getContentPane().getChildren().add(menuBtn);

        stage.getStage().setWidth(1280);
        stage.getStage().setHeight(800);
        stage.getStage().centerOnScreen();
        stage.getStage().show();
    }
}
