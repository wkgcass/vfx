package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _06dVTableViewStructureScene extends DemoVScene {
    public _06dVTableViewStructureScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("VTableView Internal Structure") {{
                FontManager.get().setFont(this, settings -> settings.setSize(40));
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "VTableView is a full rework of the TableView, based on simple JavaFX layout objects.\n" +
                "The table columns are constructed using VBoxes.\n" +
                "The rows are built using small StackPanes with the same height, their height properties\n" +
                "are linked together using ChangeListener on heightProperty, and modified using prefHeight\n" +
                "property."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "VTableView Internal Structure";
    }
}
