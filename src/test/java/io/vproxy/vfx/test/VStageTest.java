package io.vproxy.vfx.test;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.image.ImageManager;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.button.FusionImageButton;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.scene.VScene;
import io.vproxy.vfx.ui.scene.VSceneHideMethod;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.scene.VSceneShowMethod;
import io.vproxy.vfx.ui.stage.VStage;
import javafx.application.Application;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class VStageTest extends Application {
    private int n = 12;
    private final Label label = new Label();

    @Override
    public void start(Stage primaryStage) {
        var stage = new VStage(primaryStage);
        stage.getStage().centerOnScreen();
        stage.getStage().setWidth(1024);
        stage.getStage().setHeight(768);
        stage.setTitle("你好 Hello World 世界");
        stage.getStage().show();

        var menuBtn = new FusionImageButton(ImageManager.get().load("io/vproxy/vfx/res/image/menu.png:white")) {{
            setPrefWidth(40);
            setPrefHeight(VStage.TITLE_BAR_HEIGHT - 4);
            getImageView().setFitHeight(15);
        }};
        var addBtn = new FusionButton("Add") {{
            FontManager.get().setFont(getTextNode(), 18);
            setPrefWidth(120);
            setPrefHeight(VStage.TITLE_BAR_HEIGHT - 4);
        }};
        var delBtn = new FusionButton("Del") {{
            FontManager.get().setFont(getTextNode(), 18);
            setPrefWidth(120);
            setPrefHeight(VStage.TITLE_BAR_HEIGHT - 4);
        }};
        stage.getRoot().getChildren().add(new HBox(
            new HPadding(10), menuBtn, new HPadding(5), addBtn, new HPadding(5), delBtn
        ) {{
            setLayoutY(4);
        }});
        label.setTextFill(Theme.current().normalTextColor());
        FontManager.get().setFont(label, 90);
        stage.getInitialScene().getContentPane().getChildren().add(label);

        setValue(n);
        addBtn.setOnAction(e -> setValue(++n));
        delBtn.setOnAction(e -> setValue(--n));

        var menuScene = new VScene(VSceneRole.DRAWER_VERTICAL) {{
            var vbox = new VBox();
            vbox.getChildren().add(new Label("test 1") {{
                setTextFill(Theme.current().normalTextColor());
            }});
            vbox.getChildren().add(new Label("test 2") {{
                setTextFill(Theme.current().normalTextColor());
            }});
            vbox.getChildren().add(new Label("test 3") {{
                setTextFill(Theme.current().normalTextColor());
            }});
            getContentPane().getChildren().add(vbox);
        }};
        stage.getSceneGroup().addScene(menuScene, VSceneHideMethod.TO_LEFT);
        menuBtn.setOnAction(e ->
            stage.getSceneGroup().show(menuScene, VSceneShowMethod.FROM_LEFT));
    }

    private void setValue(int n) {
        var sb = new StringBuilder();
        for (int i = 1; i <= n; ++i) {
            sb.append(i).append("\n");
        }
        label.setText(sb.toString());
    }
}
