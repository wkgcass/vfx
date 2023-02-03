package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.image.ImageManager;
import io.vproxy.vfx.ui.button.TransparentFusionButton;
import io.vproxy.vfx.ui.pane.TransparentFusionPane;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;

public class _xxcComponentsDemo2Scene extends DemoVScene {
    public _xxcComponentsDemo2Scene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new Label(
            "" +
            "Some components are suitable for image backgrounds."
        ) {{
            FontManager.get().setFont(this, settings -> settings.setSize(30));
        }};
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(100);

        getContentPane().setBackground(new Background(new BackgroundImage(
            ImageManager.get().load("images/bg1.png"),
            BackgroundRepeat.NO_REPEAT,
            BackgroundRepeat.NO_REPEAT,
            BackgroundPosition.CENTER,
            BackgroundSize.DEFAULT
        )));

        var transparentButton = new TransparentFusionButton("TransparentFusionButton") {{
            setPrefWidth(300);
            setPrefHeight(100);
            getTextNode().setTextFill(Color.BLACK);
        }};
        var transparentFusionPane = new TransparentFusionPane(false);
        transparentFusionPane.getContentPane().getChildren().add(new ThemeLabel("TransparentFusionPane") {{
            setTextFill(Color.BLACK);
        }});

        var gridPane = new GridPane();
        FXUtils.observeWidthCenter(getContentPane(), gridPane);
        gridPane.setLayoutY(250);
        gridPane.setHgap(10);
        gridPane.setVgap(10);

        gridPane.add(transparentButton, 0, 0, 2, 1);
        gridPane.add(transparentFusionPane.getNode(), 0, 1);

        getContentPane().getChildren().addAll(msgLabel, gridPane);
    }

    @Override
    public String title() {
        return "Components Demo with Image Bg";
    }
}
