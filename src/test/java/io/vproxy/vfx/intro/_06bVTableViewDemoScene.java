package io.vproxy.vfx.intro;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.test.TUtils;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.pane.FusionPane;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.table.VTableColumn;
import io.vproxy.vfx.ui.table.VTableView;
import io.vproxy.vfx.ui.wrapper.FusionW;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.MiscUtils;
import javafx.geometry.Pos;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

public class _06bVTableViewDemoScene extends DemoVScene {
    public _06bVTableViewDemoScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "Click the column name to sort the rows (some of them are sortable).\n" +
            "Tips: try to sort by multiple columns, and try to hover on \"name\" cells :)"
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(40);

        var table = new VTableView<Data>();
        table.getNode().setPrefWidth(1000);
        table.getNode().setPrefHeight(580);

        var idCol = new VTableColumn<Data, String>("id", data -> data.id);
        var nameCol = new VTableColumn<Data, Data>("name", data -> data);
        var addressCol = new VTableColumn<Data, String>("address", data -> data.address);
        var typeCol = new VTableColumn<Data, String>("type", data -> data.type);
        var bandwidthCol = new VTableColumn<Data, Integer>("bandwidth", data -> data.bandwidth);
        var createTimeCol = new VTableColumn<Data, ZonedDateTime>("createtime", data ->
            ZonedDateTime.ofInstant(
                Instant.ofEpochMilli(data.createtime), ZoneId.systemDefault()
            ));

        idCol.setMinWidth(300);
        nameCol.setComparator(Comparator.comparing(data -> data.name));
        nameCol.setNodeBuilder(data -> {
            var textField = new TextField();
            var text = new FusionW(textField) {{
                FontManager.get().setFont(FontUsages.tableCellText, getLabel());
            }};
            textField.setText(data.name);
            textField.focusedProperty().addListener((ob, old, now) -> {
                if (old == null || now == null) return;
                if (old && !now) {
                    data.name = textField.getText();
                }
            });
            return text;
        });
        addressCol.setAlignment(Pos.CENTER);
        addressCol.setComparator(String::compareTo);
        typeCol.setAlignment(Pos.CENTER);
        typeCol.setComparator(String::compareTo);
        bandwidthCol.setAlignment(Pos.CENTER);
        bandwidthCol.setComparator(Integer::compareTo);
        createTimeCol.setMinWidth(200);
        createTimeCol.setAlignment(Pos.CENTER_RIGHT);
        createTimeCol.setTextBuilder(MiscUtils.YYYYMMddHHiissDateTimeFormatter::format);

        //noinspection unchecked
        table.getColumns().addAll(idCol, nameCol, addressCol, typeCol, bandwidthCol, createTimeCol);

        for (int i = 0; i < 10; ++i) {
            table.getItems().add(new Data());
        }

        var controlPane = new FusionPane(false);
        controlPane.getContentPane().getChildren().add(new VBox(
            new FusionButton("Add") {{
                setOnAction(e -> table.getItems().add(new Data()));
                setPrefWidth(120);
                setPrefHeight(40);
            }},
            new VPadding(10),
            new FusionButton("Del") {{
                setOnAction(e -> {
                    var selected = table.getSelectedItem();
                    if (selected == null) {
                        return;
                    }
                    table.getItems().remove(selected);
                });
                setPrefWidth(120);
                setPrefHeight(40);
            }}
        ));

        var hbox = new HBox(table.getNode(), new HPadding(10), controlPane.getNode());
        FXUtils.observeWidthCenter(getContentPane(), hbox);
        hbox.setLayoutY(100);

        getContentPane().getChildren().addAll(msgLabel, hbox);
    }

    @Override
    public String title() {
        return "VTableView Demo";
    }

    public static class Data {
        public String id;
        public String name;
        public String address;
        public String type;
        public int bandwidth;
        public long createtime;

        public Data() {
            id = UUID.randomUUID().toString();
            name = TUtils.randomString(10, 15);
            address = TUtils.randomIPAddress();
            type = ThreadLocalRandom.current().nextBoolean() ? "classic" : "new";
            bandwidth = ThreadLocalRandom.current().nextInt(10) * 100 + 100;
            createtime = System.currentTimeMillis();
        }
    }
}
