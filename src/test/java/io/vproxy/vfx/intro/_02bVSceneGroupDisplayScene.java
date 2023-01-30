package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Insets;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

public class _02bVSceneGroupDisplayScene extends DemoVScene {
    public _02bVSceneGroupDisplayScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new Pane();
        pane.setBackground(new Background(new BackgroundFill(
            new Color(0xc5 / 255d, 0x95 / 255d, 0x71 / 255d, 1),
            CornerRadii.EMPTY,
            Insets.EMPTY
        )));
        var label = new ThemeLabel(
            "" +
            "This pane is inside a VSceneGroup.\n" +
            "The bottom 'previous' and 'next' buttons uses its functions to switch the 'MAIN' scenes."
        ) {{
            FontManager.get().setFont(this, 20);
        }};
        getContentPane().getChildren().add(pane);
        pane.getChildren().add(label);
        FXUtils.observeWidthHeight(getContentPane(), pane);
        FXUtils.observeWidthHeightCenter(pane, label);
    }

    @Override
    public String title() {
        return "VSceneGroup Display";
    }
}
