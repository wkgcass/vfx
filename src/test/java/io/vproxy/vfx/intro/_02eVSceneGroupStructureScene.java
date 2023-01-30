package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _02eVSceneGroupStructureScene extends DemoVScene {
    public _02eVSceneGroupStructureScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("VSceneGroup Internal Structure") {{
                FontManager.get().setFont(this, 40);
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "VSceneGroup uses a root pane to manage all contents.\n" +
                "The VScenes are not added to the pane until show(...) is called.\n" +
                "\n" +
                "When a scene is added to the group, the group might manage scenes' width or height based on their roles.\n" +
                "Each role's behavior is described in VSceneRole.java,\n" +
                "for example both width and height will be managed by the group for scenes with 'MAIN' role."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "VSceneGroup Internal Structure";
    }
}
