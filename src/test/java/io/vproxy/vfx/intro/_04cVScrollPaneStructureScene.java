package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _04cVScrollPaneStructureScene extends DemoVScene {
    public _04cVScrollPaneStructureScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("VScrollPane Internal Structure") {{
                FontManager.get().setFont(this, 40);
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "VScrollPane uses a root pane to contain the Viewport and the scrollbar.\n" +
                "The Viewport is simply a pane which uses 'setClip' to show only ui within the pane.\n" +
                "Inside the viewport, there is a jfx Group which manages the content position.\n" +
                "\n" +
                "The VScrollPane width/height is synchronizing to the Viewport, but the content is not managed.\n" +
                "You may use FXUtils.observe...(...) methods to bind your content pane to the VScrollPane."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "VScrollPane Internal Structure";
    }
}
