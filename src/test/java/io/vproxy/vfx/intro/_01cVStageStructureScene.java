package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _01cVStageStructureScene extends DemoVScene {
    public _01cVStageStructureScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("VStage Internal Structure") {{
                FontManager.get().setFont(this, 40);
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "VStage contains a rootContainer pane, which defines the border and the invisible bottom-right corner resize button.\n" +
                "A VSceneGroup called 'rootSceneGroup' is contained in the rootContainer pane. It ensures the content won't exceed\n" +
                "the stage bounds.\n" +
                "When the VStage is created, it automatically creates a VScene called 'rootContent' inside the rootSceneGroup.\n" +
                "\n" +
                "The window control buttons (close/max/iconify) and the title pane are contained in the rootContent.\n" +
                "In the rootContent, it also contains a VSceneGroup simply called 'sceneGroup'.\n" +
                "When the VStage is created, it automatically creates a VScene called 'content' inside the sceneGroup,\n" +
                "which is used as the content of the stage.\n" +
                "\n" +
                "Use stage.getRoot() to retrieve rootContent.\n" +
                "Use stage.getInitialScene() to retrieve content.\n" +
                "Use stage.getRootSceneGroup() to retrieve rootSceneGroup.\n" +
                "Use stage.getSceneGroup() to retrieve sceneGroup.\n" +
                "\n" +
                "Details about the VSceneGroups and VScenes are described in the following sections.\n" +
                "\n" +
                "When modifying the stage width or height, all above described elements will be automatically resized\n" +
                "by setting their prefWidth and prefHeight."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "VStage Internal Structure";
    }
}
