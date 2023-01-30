package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _zzzzzEndingScene extends DemoVScene {
    public _zzzzzEndingScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("This is the end of this demo") {{
                FontManager.get().setFont(this, 40);
            }},
            new VPadding(30),
            new ThemeLabel("This demo only shows how the UI elements work,\n" +
                           "but VFX also provides many useful tools for managing your JavaFX application.\n" +
                           "Check the module-info to have a general view of what VFX provides,\n" +
                           "and try them for yourself.\n" +
                           "\n" +
                           "Hope you can enjoy it.")
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "Ending";
    }
}
