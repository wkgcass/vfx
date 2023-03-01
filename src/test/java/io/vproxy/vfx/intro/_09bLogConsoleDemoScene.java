package io.vproxy.vfx.intro;

import io.vproxy.base.util.Logger;
import io.vproxy.vfx.component.logconsole.LogConsole;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.pane.FusionPane;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.control.CheckBox;
import javafx.scene.layout.HBox;

import java.util.concurrent.ThreadLocalRandom;

public class _09bLogConsoleDemoScene extends DemoVScene {
    public _09bLogConsoleDemoScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "The LogConsole component. Click the log line to copy.\n" +
            "Launch VFX with -Dio.vproxy.vfx.logLevel and -Dio.vproxy.vfx.consoleLogLevel to modify the log levels."
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(50);

        var console = new LogConsole();
        FXUtils.observeWidth(getContentPane(), console.getNode());
        FXUtils.observeHeight(getContentPane(), console.getNode(), -250);
        console.getNode().setLayoutY(150);

        var bottomButtons = new HBox();

        var scrollCheckBox = new CheckBox("Always scroll to end") {{
            setTextFill(Theme.current().normalTextColor());
            FontManager.get().setFont(this);
            FXUtils.disableFocusColor(this);
        }};
        scrollCheckBox.setSelected(console.isAlwaysScrollToEnd());
        scrollCheckBox.setOnAction(e -> console.setAlwaysScrollToEnd(scrollCheckBox.isSelected()));

        var makeSomeLogButton = new FusionButton("Make Some Log") {{
            setPrefWidth(165);
            setPrefHeight(40);
        }};
        makeSomeLogButton.setOnAction(e ->
            Logger.alert(logTemplates[ThreadLocalRandom.current().nextInt(logTemplates.length)]));

        bottomButtons.getChildren().addAll(new FusionPane() {{
            getContentPane().getChildren().add(scrollCheckBox);
            getNode().setPrefWidth(260);
            getNode().setPrefHeight(40);
        }}.getNode(), new HPadding(20), makeSomeLogButton);
        bottomButtons.setLayoutX(10);
        getContentPane().heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            bottomButtons.setLayoutY(h - 50);
        });

        getContentPane().getChildren().addAll(msgLabel, console.getNode(), bottomButtons);
    }

    private static final String[] logTemplates = new String[]{
        "Hello World",
        "Hello VFX",
        "Long Log: a b c d e f g h i j k l m n o p q r s t u v w x y z, Long Long long log 0 1 2 3 4 5 6 7 8 9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z",
        "Multi Line Log\nThis is a multi-line log",
    };

    @Override
    public String title() {
        return "LogConsole";
    }
}
