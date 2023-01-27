package io.vproxy.vfx.test;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.image.ImageManager;
import io.vproxy.vfx.ui.pane.TransparentFusionPane;
import io.vproxy.vfx.ui.stage.VStage;
import javafx.application.Application;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.stage.Stage;

public class TransparentComponentTest extends Application {
    @Override
    public void start(Stage primaryStage) {
        var stage = new VStage(primaryStage);
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
            transparentPane.getNode().setLayoutY((primaryStage.getHeight() - transparentPane.getNode().getHeight()) / 2);
            transparentPane.getNode().setPrefWidth(primaryStage.getWidth() - 20);
        };
        stage.getStage().widthProperty().addListener((ob, old, now) -> fixPosition.run());
        stage.getStage().heightProperty().addListener((ob, old, now) -> fixPosition.run());
        transparentPane.getNode().widthProperty().addListener((ob, old, now) -> fixPosition.run());
        transparentPane.getNode().heightProperty().addListener((ob, old, now) -> fixPosition.run());

        primaryStage.setWidth(1024);
        primaryStage.setHeight(768);
        primaryStage.centerOnScreen();
        primaryStage.show();
    }
}
