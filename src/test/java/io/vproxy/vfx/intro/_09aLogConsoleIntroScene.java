package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _09aLogConsoleIntroScene extends DemoVScene {
    public _09aLogConsoleIntroScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("09. LogConsole") {{
                FontManager.get().setFont(this, settings -> settings.setSize(40));
            }},
            new VPadding(30),
            new ThemeLabel("Display logs in the UI.")
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "LogConsole Intro";
    }
}
