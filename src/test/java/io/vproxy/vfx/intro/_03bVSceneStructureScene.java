package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _03bVSceneStructureScene extends DemoVScene {
    public _03bVSceneStructureScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("VScene Internal Structure") {{
                FontManager.get().setFont(this, settings -> settings.setSize(40));
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "VScene contains a root pane.\n" +
                "A VScrollPane is contained in the root pane,\n" +
                "UI elements should be added to the 'contentPane' of the VScrollPane.\n" +
                "\n" +
                "Width and height of the VScrollPane stay the same as the the root pane,\n" +
                "but the contentPane inside VScrollPane will not be modified by default.\n" +
                "\n" +
                "When the contentPane exceeds the height of the VScrollPane, a scroll bar\n" +
                "will show to indicate the current vertical position.\n" +
                "\n" +
                "You may call the following methods to make the contentPane's width/height\n" +
                "correspond to the VScrollPane:\n" +
                "    scene.enableAutoContentWidthHeight()\n" +
                "    scene.enableAutoContentWidth()\n" +
                "    scene.enableAutoContentHeight()\n" +
                "\n" +
                "Details about the VScrollPane will be described in the following sections."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "VScene Internal Structure";
    }
}
