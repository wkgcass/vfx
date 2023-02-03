package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _08cLoadingStageStructureScene extends DemoVScene {
    public _08cLoadingStageStructureScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("LoadingStage Internal Structure") {{
                FontManager.get().setFont(this, settings -> settings.setSize(40));
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "LoadingStage contains a LoadingPane, and the LoadingPane contains a VProgressBar.\n" +
                "The VProgressBar is an encapsulation of VLine, which provides rounded endpoints.\n" +
                "The LoadingPane is simply a VProgressBar with a Label showing name of the current loading item.\n" +
                "The LoadingStage is simply a LoadingPane inside a VStage.\n" +
                "\n" +
                "The progress bar has loading logic, but you can also ignore the loading function and only\n" +
                "use it as a simple ProgressBar."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "LoadingStage Internal Structure";
    }
}
