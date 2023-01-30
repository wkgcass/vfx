package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

public class _06dVTableViewSpecialUsageScene extends DemoVScene {
    public _06dVTableViewSpecialUsageScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var pane = new VBox(
            new ThemeLabel("VTableView Special Usage") {{
                FontManager.get().setFont(this, 40);
            }},
            new VPadding(30),
            new ThemeLabel(
                "" +
                "The VTableView provides some special interfaces to give you more choices to interact with the table:\n" +
                "    CellAware\n" +
                "        Implement this interface on your entity class, then every time a related cell is constructed,\n" +
                "        the cell will be feed into your entity object, you can do anything you want on the cell.\n" +
                "        One entity object will receive column count cells, each cell for one column.\n" +
                "    RowInformerAware\n" +
                "        Implement this interface on your entity class, then when the row is constructed,\n" +
                "        an informer of the certain row will be feed into your entity object.\n" +
                "        When you update your entity, you can call the informer to update the row.\n" +
                "        This is different from how the JavaFX table view works."
            )
        ) {{
            setAlignment(Pos.CENTER);
        }};
        getContentPane().getChildren().add(pane);
        FXUtils.observeWidthHeightCenter(getContentPane(), pane);
    }

    @Override
    public String title() {
        return "VTableView Special Usage";
    }
}
