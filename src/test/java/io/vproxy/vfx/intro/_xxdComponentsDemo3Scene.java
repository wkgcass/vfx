package io.vproxy.vfx.intro;

import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.shapes.BrokenLine;
import io.vproxy.vfx.ui.shapes.EndpointStyle;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;

public class _xxdComponentsDemo3Scene extends DemoVScene {
    public _xxdComponentsDemo3Scene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "BrokenLine & VLine Demonstration"
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(100);

        var brokenLine = new BrokenLine(16,
            200, 275,
            340, 480,
            520, 360,
            730, 520,
            900, 420,
            1000, 240);
        brokenLine.setStroke(Theme.current().normalTextColor());
        brokenLine.setEndStyle(EndpointStyle.ARROW);

        getContentPane().getChildren().addAll(msgLabel, brokenLine.getNode());
    }

    @Override
    public String title() {
        return "BrokenLine Demo";
    }
}
