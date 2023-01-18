package io.vproxy.vfx.test;

import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.table.*;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextField;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.stage.Stage;

import java.text.DecimalFormat;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

public class VTableTest extends Application {
    private static final DecimalFormat roughFloatValueFormat = new DecimalFormat("0.0");

    @Override
    public void start(Stage primaryStage) {
        var borderPane = new BorderPane();
        var scene = new Scene(borderPane);

        var tablePane = new Pane();
        var table = new VTableView<Data>();

        var colStrF = new VTableColumn<>("str", Data::getStrF);
        var colIntF = new VTableColumn<>("int", Data::getIntF);
        var colDoubleF = new VTableColumn<>("double", Data::getDoubleF);
        var colNodeF = new VTableColumn<>("node", Data::getNodeF);

        {
            colStrF.setPrefWidth(100);
            colStrF.setMinWidth(40);
            colStrF.setComparator(String::compareTo);
        }
        {
            colIntF.setMinWidth(30);
            colIntF.setMaxWidth(50);
            colIntF.setComparator(Integer::compareTo);
            colIntF.setAlignment(Pos.CENTER);
        }
        {
            colDoubleF.setPrefWidth(80);
            colDoubleF.setTextBuilder(roughFloatValueFormat::format);
            colDoubleF.setComparator(Double::compareTo);
        }
        {
            colNodeF.setMinWidth(500);
            colNodeF.setPrefWidth(1000);
            colNodeF.setNodeBuilder(n -> n);
        }

        table.getColumns().addAll(Arrays.asList(colStrF, colIntF, colDoubleF, colNodeF));

        for (var i = 0; i < 6; ++i) {
            table.getItems().add(new Data());
        }

        var hbox = new HBox();
        hbox.setLayoutX(15);
        hbox.setLayoutY(10);
        tablePane.getChildren().add(hbox);

        hbox.getChildren().add(table.getNode());
        hbox.getChildren().add(new HPadding(15));
        var buttons = new VBox();
        hbox.getChildren().add(buttons);

        var addBtn = new Button("add") {{
            setPrefWidth(120);
        }};
        var delBtn = new Button("del") {{
            setPrefWidth(120);
        }};
        buttons.getChildren().addAll(
            addBtn,
            new VPadding(5),
            delBtn
        );

        addBtn.setOnAction(e -> table.getItems().add(new Data()));
        delBtn.setOnAction(e -> {
            var selected = table.getSelectedItem();
            if (selected == null) {
                return;
            }
            table.getItems().remove(selected);
        });

        tablePane.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            table.getNode().setPrefWidth(now.doubleValue() - 165);
        });
        tablePane.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            table.getNode().setPrefHeight(now.doubleValue() - 20);
        });

        var tablePane2 = new Pane();
        var table2 = new VTableView<Data2>();
        var aCol = new VTableColumn<Data2, Integer>("a", d -> d.a);
        var bCol = new VTableColumn<Data2, String>("b", d -> d.b);
        //noinspection unchecked
        table2.getColumns().addAll(aCol, bCol);
        table2.setItems(Arrays.asList(
            new Data2(1, "a"),
            new Data2(2, "b"),
            new Data2(3, "c")
        ));
        tablePane2.getChildren().add(new VBox(
            new VPadding(10),
            new HBox(new HPadding(15), table2.getNode())
        ));

        tablePane2.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            table2.getNode().setPrefWidth(now.doubleValue() - 30);
        });
        tablePane2.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            table2.getNode().setPrefHeight(now.doubleValue() - 20);
        });

        borderPane.setCenter(tablePane);
        borderPane.setBottom(new VBox(
            new HBox(
                new HPadding(15),
                new Button("table1") {{
                    setOnAction(e -> borderPane.setCenter(tablePane));
                }},
                new HPadding(5),
                new Button("table2") {{
                    setOnAction(e -> borderPane.setCenter(tablePane2));
                }}
            ),
            new VPadding(10)
        ));

        primaryStage.setScene(scene);
        primaryStage.setWidth(1024);
        primaryStage.setHeight(768);
        primaryStage.centerOnScreen();
        primaryStage.show();
    }
}

class Data implements RowInformerAware, CellAware<Data> {
    private String strF;
    private int intF;
    private double doubleF;
    private Node nodeF;

    public Data() {
        strF = randomString(ThreadLocalRandom.current().nextInt(10) + 5);
        intF = ThreadLocalRandom.current().nextInt(15);
        doubleF = ThreadLocalRandom.current().nextDouble(1000);
        nodeF = randomNode();
    }

    private RowInformer informer;

    @Override
    public void setRowInformer(RowInformer rowInformer) {
        this.informer = rowInformer;
    }

    public String getStrF() {
        return strF;
    }

    public void setStrF(String strF) {
        this.strF = strF;
        informer.informRowUpdate();
    }

    public int getIntF() {
        return intF;
    }

    public void setIntF(int intF) {
        this.intF = intF;
        informer.informRowUpdate();
    }

    public double getDoubleF() {
        return doubleF;
    }

    public void setDoubleF(double doubleF) {
        this.doubleF = doubleF;
        informer.informRowUpdate();
    }

    public Node getNodeF() {
        return nodeF;
    }

    public void setNodeF(Node nodeF) {
        this.nodeF = nodeF;
        informer.informRowUpdate();
    }

    private static String randomString(int len) {
        int leftLimit = 97; // letter 'a'
        int rightLimit = 122; // letter 'z'
        var random = ThreadLocalRandom.current();
        StringBuilder buffer = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            int randomLimitedInt = leftLimit + (int)
                (random.nextFloat() * (rightLimit - leftLimit + 1));
            buffer.append((char) randomLimitedInt);
        }
        return buffer.toString();
    }

    @SuppressWarnings("ConstantConditions")
    private Node randomNode() {
        int n = ThreadLocalRandom.current().nextInt(2);
        if (n == 0) {
            var ret = new TextField(randomString(5));
            ret.setOnAction(e -> {
                if ("red".equals(ret.getText())) {
                    cells.forEach(c -> c.setBg(new Background(
                        new BackgroundFill(Color.RED,
                            CornerRadii.EMPTY, Insets.EMPTY)
                    )));
                } else {
                    cells.forEach(VTableCellPane::resetBg);
                }
            });
            return ret;
        } else if (n == 1) {
            var ret = new ComboBox<String>();
            ret.setEditable(true);
            ret.getItems().addAll(randomString(5), randomString(5), randomString(5));
            ret.setOnAction(e -> {
                if ("red".equals(ret.getValue())) {
                    cells.forEach(c -> c.setBg(new Background(
                        new BackgroundFill(Color.RED,
                            CornerRadii.EMPTY, Insets.EMPTY
                        ))));
                } else {
                    cells.forEach(VTableCellPane::resetBg);
                }
            });
            return ret;
        } else {
            return new Pane();
        }
    }

    private final Set<VTableCellPane<Data>> cells = new HashSet<>();

    @Override
    public void setCell(VTableColumn<Data, ?> col, VTableCellPane<Data> pane) {
        cells.add(pane);
    }
}

class Data2 {
    final int a;
    final String b;

    Data2(int a, String b) {
        this.a = a;
        this.b = b;
    }
}
