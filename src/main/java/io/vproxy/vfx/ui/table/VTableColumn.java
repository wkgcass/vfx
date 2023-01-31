package io.vproxy.vfx.ui.table;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.paint.CycleMethod;
import javafx.scene.paint.LinearGradient;
import javafx.scene.paint.Stop;

import java.util.Comparator;
import java.util.function.Function;

import static io.vproxy.vfx.ui.table.VTableSortOrder.ASC;
import static io.vproxy.vfx.ui.table.VTableSortOrder.DESC;

public class VTableColumn<S, T> {
    private static final Color COLOR_TOP = Theme.current().tableHeaderTopBackgroundColor();// = new Color(0xef / 255d, 0xef / 255d, 0xef / 255d, 1);
    private static final Color COLOR_BOT = Theme.current().tableHeaderBottomBackgroundColor();// = new Color(0xe1 / 255d, 0xe1 / 255d, 0xe1 / 255d, 1);
    static final Background BG = new Background(new BackgroundFill(
        new LinearGradient(
            0, 0, 0, 1, true, CycleMethod.NO_CYCLE,
            new Stop(0, COLOR_TOP),
            new Stop(1, COLOR_BOT)
        ),
        CornerRadii.EMPTY,
        Insets.EMPTY
    ));
    private static final int sortWidth = 15;

    public final String name;
    final Function<S, T> valueRetriever;
    Comparator<T> comparator;
    final HBox columnNode = new HBox();
    private final Label sortLabel;
    Function<T, ? extends Node> nodeBuilder = null;

    VTableSharedData<S> shared;

    final VBox vbox = new VBox();
    double minWidth = 0;
    double maxWidth = 0;
    double prefWidth = 0;
    Pos alignment;

    private int sortPriority = 0; // 0 means no sort
    private VTableSortOrder sortOrder = DESC; // the first time it will be set to ASC

    public VTableColumn(String name, Function<S, T> valueRetriever) {
        this(name, new Label(name) {{
            setAlignment(Pos.CENTER);
            setTextFill(Theme.current().tableHeaderTextColor());
            setPrefHeight(25);
        }}, valueRetriever);
    }

    public VTableColumn(String name, Region columnContentNode, Function<S, T> valueRetriever) {
        this.name = name;
        this.valueRetriever = valueRetriever;
        sortLabel = new Label() {{
            setPadding(new Insets(0, 4, 0, 4));
            setPrefWidth(sortWidth);
            setTextFill(Theme.current().tableSortLabelColor());
        }};
        columnNode.getChildren().addAll(
            new HPadding(sortWidth),
            columnContentNode,
            sortLabel
        );
        columnNode.setBackground(BG);
        FXUtils.observeHeight(columnContentNode, columnNode);
        columnNode.setAlignment(Pos.CENTER);

        columnNode.setOnMouseClicked(e -> {
            if (comparator == null) {
                if (sortPriority != 0) {
                    shared.tableView.clearSort(this);
                }
                return;
            }
            if (shared != null) {
                if (sortPriority != 0 && sortOrder == DESC) {
                    shared.tableView.clearSort(this);
                } else {
                    shared.tableView.sortBy(this, sortOrder == ASC ? DESC : ASC);
                }
            }
        });

        columnNode.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            columnContentNode.setPrefWidth(now.doubleValue() - 2 * sortWidth);
        });
        vbox.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            columnNode.setPrefWidth(now.doubleValue());
            columnNode.setMinWidth(now.doubleValue());
            columnNode.setMaxWidth(now.doubleValue());
        });
    }

    public void setComparator(Comparator<T> comparator) {
        this.comparator = comparator;
        if (sortPriority > 0 && shared != null) {
            if (comparator == null) {
                shared.tableView.clearSort(this);
            } else {
                shared.tableView.sort();
            }
        }
    }

    public void setMinWidth(double minWidth) {
        this.minWidth = minWidth;
        if (shared != null) {
            shared.tableView.updateWidth();
        }
    }

    public void setMaxWidth(double maxWidth) {
        this.maxWidth = maxWidth;
        if (shared != null) {
            shared.tableView.updateWidth();
        }
    }

    public void setPrefWidth(double prefWidth) {
        this.prefWidth = prefWidth;
        if (shared != null) {
            shared.tableView.updateWidth();
        }
    }

    public void setAlignment(Pos alignment) {
        this.alignment = alignment;
        if (shared != null) {
            shared.tableView.updateRowNodeForColumn(this);
        }
    }

    public void setTextBuilder(Function<T, String> textBuilder) {
        setNodeBuilder(t -> {
            var str = textBuilder.apply(t);
            return new Label(str) {{
                setTextFill(Theme.current().tableTextColor());
                FontManager.get().setFont(FontUsages.tableCellText, this);
            }};
        });
    }

    public void setNodeBuilder(Function<T, ? extends Node> nodeBuilder) {
        this.nodeBuilder = nodeBuilder;
        if (shared != null) {
            shared.tableView.refresh();
        }
    }

    void initCell(VTableCellPane<S> cell) {
        if (alignment != null) {
            cell.setAlignment(alignment);
        }
    }

    public int getSortPriority() {
        return sortPriority;
    }

    public VTableSortOrder getSortOrder() {
        return sortOrder;
    }

    void setSort(int priority, VTableSortOrder order) {
        this.sortPriority = priority;
        this.sortOrder = order;
        updateSortLabel();
    }

    private void updateSortLabel() {
        if (sortPriority == 0) {
            sortLabel.setText("");
            return;
        }
        if (sortOrder == ASC) {
            sortLabel.setRotate(0);
            sortLabel.setAlignment(Pos.CENTER_RIGHT);
        } else {
            sortLabel.setRotate(180);
            sortLabel.setAlignment(Pos.CENTER_LEFT);
        }
        sortLabel.setText("" + sortPriority);
    }

    void resetSortOrder() {
        this.sortOrder = DESC;
    }

    void resetSortPriority() {
        sortPriority = 0;
        sortLabel.setText("");
    }

    void decSortPriority() {
        --this.sortPriority;
        updateSortLabel();
    }
}
