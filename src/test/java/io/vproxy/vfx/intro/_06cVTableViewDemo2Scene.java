package io.vproxy.vfx.intro;

import io.vproxy.vfx.control.scroll.VScrollPane;
import io.vproxy.vfx.test.TUtils;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.table.VTableColumn;
import io.vproxy.vfx.ui.table.VTableView;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;

import java.util.concurrent.ThreadLocalRandom;

public class _06cVTableViewDemo2Scene extends DemoVScene {
    public _06cVTableViewDemo2Scene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "1. Very long VTableView (held inside a horizontal VScrollPane).\n" +
            "2. Custom column height and graphic.\n" +
            "Tips: try to drag the table."
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(40);

        var table = new VTableView<Data>();
        table.getNode().setPrefWidth(1500);
        table.getNode().setPrefHeight(500);

        var veryCol = new VTableColumn<Data, String>("very", data -> data.very);
        var longCol = new VTableColumn<Data, Long>("long", data -> data._long);
        var tableviewCol = new VTableColumn<Data, Integer>("tableview", new ThemeLabel("table\nview") {{
            setPrefHeight(100);
        }}, data -> data.tableview);
        var withCol = new VTableColumn<Data, String>("with", data -> data.with);
        var customCol = new VTableColumn<Data, String>("custom", data -> data.custom);
        var uiCol = new VTableColumn<Data, Integer>("ui", data -> data.ui);
        var elementsCol = new VTableColumn<Data, String>("elements", data -> data.elements);

        tableviewCol.setComparator(Integer::compareTo);

        //noinspection unchecked
        table.getColumns().addAll(veryCol, longCol, tableviewCol, withCol, customCol, uiCol, elementsCol);

        for (int i = 0; i < 50; ++i) {
            table.getItems().add(new Data());
        }

        var hScrollPane = VScrollPane.makeHorizontalScrollPaneToManage(table);
        hScrollPane.getNode().setPrefWidth(1000);
        hScrollPane.getNode().setLayoutY(150);
        FXUtils.observeWidthCenter(getContentPane(), hScrollPane.getNode());

        getContentPane().getChildren().addAll(msgLabel, hScrollPane.getNode());
    }

    @Override
    public String title() {
        return "Non-Standard VTableView";
    }

    public static class Data {
        public String very;
        public long _long;
        public int tableview;
        public String with;
        public String custom;
        public int ui;
        public String elements;

        public Data() {
            very = TUtils.randomString(10);
            _long = ThreadLocalRandom.current().nextLong(10) * 100;
            tableview = ThreadLocalRandom.current().nextInt(10);
            with = TUtils.randomString(10, 15);
            custom = TUtils.randomString(8);
            ui = ThreadLocalRandom.current().nextInt(20);
            elements = TUtils.randomString(15);
        }
    }
}
