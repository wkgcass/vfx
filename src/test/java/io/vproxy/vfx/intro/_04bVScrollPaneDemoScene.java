package io.vproxy.vfx.intro;

import io.vproxy.vfx.control.scroll.VScrollPane;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.layout.GridPane;

public class _04bVScrollPaneDemoScene extends DemoVScene {
    public _04bVScrollPaneDemoScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "Demonstration about the VScrollPane."
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(100);

        var scrollPaneWithLittleContent = new VScrollPane();
        scrollPaneWithLittleContent.getNode().setPrefWidth(400);
        scrollPaneWithLittleContent.getNode().setPrefHeight(400);
        var littleContentLabel = new ThemeLabel("Hello World");
        scrollPaneWithLittleContent.setContent(littleContentLabel);

        var scrollPaneWithMuchContent = new VScrollPane();
        scrollPaneWithMuchContent.getNode().setPrefWidth(400);
        scrollPaneWithMuchContent.getNode().setPrefHeight(400);
        var muchContentLabel = new ThemeLabel(
            "" +
            "Once upon a time a little girl tried to make a living by selling matches in the " +
            "street. It was New Year's Eve and the snowed streets were deserted. From brightly " +
            "lit windows came the tinkle of laughter and the sound of singing. People were " +
            "getting ready to bring in the new year. But the poor little match seller sat " +
            "sadly beside the fountain. Her ragged dress and worn shawl did not keep out the " +
            "cold and she tried to keep her bare feet from touching the frozen ground. She " +
            "hadn't sold one box of matches all day and she was frightened to go home, for " +
            "her father would certainly be angry. It wouldn't be much warmer anyway, in the " +
            "draughty attic that was her home. The little girl's fingers were stiff with cold. " +
            "If only she could light a match! But what would her father say at such a waste. " +
            "Falteringly she took out a match and lit it.\n\n");
        muchContentLabel.setWrapText(true);
        FXUtils.observeWidth(scrollPaneWithLittleContent.getNode(), muchContentLabel, -1);
        scrollPaneWithMuchContent.setContent(muchContentLabel);

        var gridPane = new GridPane();
        gridPane.setLayoutY(250);
        gridPane.setHgap(50);
        gridPane.setVgap(50);
        FXUtils.observeWidthCenter(getContentPane(), gridPane);
        gridPane.add(scrollPaneWithLittleContent.getNode(), 0, 0);
        gridPane.add(scrollPaneWithMuchContent.getNode(), 1, 0);

        getContentPane().getChildren().addAll(
            msgLabel,
            gridPane
        );
    }

    @Override
    public String title() {
        return "VScrollPane Demo";
    }
}
