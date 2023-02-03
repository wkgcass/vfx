package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _07cAnimationSystemDescScene extends DemoVScene {
    public _07cAnimationSystemDescScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("Animation System Description") {{
                FontManager.get().setFont(this, settings -> settings.setSize(40));
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "VFX Animation System thinks animation as a graph,\n" +
                "as a result, the entry class is called AnimationGraph(Builder).\n" +
                "The graph nodes are animation states, and edges are the time cost for the state transfer.\n" +
                "Each node contains data which can be added, subtracted with each other, and can be multiplied\n" +
                "or divided by double values.\n" +
                "With all these information, the system can calculate the shortest path from one state to another,\n" +
                "as well as the data to be applied to animated objects in every frame.\n" +
                "\n" +
                "The system allows you to play an animation even when it is animating. It automatically finds the\n" +
                "best solution for the new animation to play, and runs the new animation when the current one is\n" +
                "finished or reverted.\n" +
                "You can see the fluent revertible animation on the background color of a button when you quickly\n" +
                "move mouse in and out.\n" +
                "\n" +
                "All the animation effects you see in VFX are based on this animation system.\n" +
                "There is a complex usage of this system in VScene.java and VSceneGroup.java."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "Animation System Description";
    }
}
