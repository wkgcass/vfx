package io.vproxy.vfx.ui.table;

import javafx.beans.value.ChangeListener;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.layout.Background;
import javafx.scene.layout.StackPane;

public class VTableCellPane<S> extends StackPane {
    private final VTableRow<S> row;
    final ChangeListener<? super Number> heightWatcher = (ob, old, now) -> {
        if (now == null) return;
        double dNow = now.doubleValue();
        var thisHeight = getHeight();
        if (thisHeight < dNow) {
            setPrefHeight(dNow);
        }
    };
    private Background backgroundSetByUser = null;

    public VTableCellPane(Node node, VTableRow<S> row, VTableSharedData<S> shared) {
        this.row = row;
        if (node != null) {
            getChildren().add(node);
        }
        setMinHeight(30);
        setAlignment(Pos.CENTER_LEFT);
        setPadding(new Insets(2, 5, 2, 5));

        setOnMouseClicked(e -> shared.tableView.selectRow(row));
    }

    public void resetBg() {
        backgroundSetByUser = null;
        row.setBgColor();
    }

    void setBackground0(Background bg) {
        if (backgroundSetByUser != null) {
            setBackground(backgroundSetByUser);
        } else {
            setBackground(bg);
        }
    }

    public void setBg(Background bg) {
        backgroundSetByUser = bg;
        row.setBgColor();
    }
}
