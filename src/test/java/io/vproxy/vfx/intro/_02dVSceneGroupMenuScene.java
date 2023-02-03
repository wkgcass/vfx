package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.image.ImageManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.image.ImageView;
import javafx.scene.layout.VBox;
import javafx.scene.transform.Rotate;
import javafx.scene.transform.Scale;

public class _02dVSceneGroupMenuScene extends DemoVScene {
    public _02dVSceneGroupMenuScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var img = ImageManager.get().load("images/up-arrow.png:white");
        var imgView = new ImageView(img) {{
            setPreserveRatio(true);
            setFitWidth(250);
        }};
        var flip = new Scale();
        var rotate = new Rotate();
        imgView.getTransforms().addAll(rotate, flip);
        flip.setX(-1);
        imgView.setLayoutX(240);
        imgView.setLayoutY(0);
        rotate.setAngle(-5);

        var pane = new VBox(
            new ThemeLabel("The menu is a DRAWER_VERTICAL scene\n" +
                           "shows using FROM_LEFT, and hides using TO_LEFT") {{
                FontManager.get().setFont(this, settings -> settings.setSize(35));
            }},
            new VPadding(30),
            new ThemeLabel("Click the button to show the menu.")
        ) {{
            setAlignment(Pos.CENTER);
        }};
        FXUtils.observeWidthCenter(getContentPane(), pane);
        pane.setLayoutY(280);
        getContentPane().getChildren().addAll(imgView, pane);
    }

    @Override
    public String title() {
        return "The Menu Button";
    }
}
