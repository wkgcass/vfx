package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _05cFusionPaneStructureScene extends DemoVScene {
    public _05cFusionPaneStructureScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("FusionPane Internal Structure") {{
                FontManager.get().setFont(this, settings -> settings.setSize(40));
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "FusionPane has an outer pane and an inner pane.\n" +
                "The outer pane defines border and background. The inner pane contains your ui elements.\n" +
                "\n" +
                "Sometimes you may want to specify the pane's width and height, and sometimes you may want the\n" +
                "width and height to be automatically calculated based on the content.\n" +
                "As a result, for different scenarios, you can instantiate the FusionPane in two ways:\n" +
                "    1. Using 'new FusionPane()' or `new FusionPane(true)`, you can set the prefWidth/prefHeight\n" +
                "       of the outer pane, the inner one will be automatically calculated based on your settings.\n" +
                "    2. Using 'new FusionPane(false)', the width and height are automatically calculated by JavaFX."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "FusionPane Internal Structure";
    }
}
