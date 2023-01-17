package io.vproxy.vfx.ui.table;

import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableList;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;

import java.util.*;
import java.util.stream.Collectors;

public class VTableView<S> {
    private static final Border BORDER_SCROLL = new Border(new BorderStroke(VTableColumn.COLOR_BORDER, BorderStrokeStyle.SOLID, CornerRadii.EMPTY,
        new BorderWidths(0, 1, 1, 1)));

    private final VBox root = new VBox();
    private final HBox columnPane = new HBox();
    private final Pane fixColumnWidthColum = new Pane() {{
        setBackground(VTableColumn.BG);
        setBorder(VTableColumn.BORDER_COL_FIX);
        setPrefWidth(0);
    }};
    private final ScrollPane scrollPane = new ScrollPane() {{
        setBorder(BORDER_SCROLL);
    }};
    private final HBox dataPane = new HBox();

    private final VTableSharedData<S> shared = new VTableSharedData<>(this);

    private final ObservableList<VTableColumn<S, ?>> columns = FXCollections.observableArrayList();
    private final ArrayList<VTableColumn<S, ?>> lastColumns = new ArrayList<>();
    final ObservableList<VTableRow<S>> items = FXCollections.observableArrayList();
    private final VTableRowListDelegate<S> itemsDelegate = new VTableRowListDelegate<>(items, shared);
    private VTableRow<S> selectedRow = null;

    public VTableView() {
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);
        scrollPane.setContent(dataPane);
        columns.addListener(colsListener);
        items.addListener(itemsListener);

        var columnPane = new HBox();
        root.getChildren().addAll(columnPane, scrollPane);

        root.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            scrollPane.setPrefWidth(now.doubleValue());
            if (root.getPrefWidth() != 0) {
                updateWidth(root.getPrefWidth());
            } else {
                updateWidth();
            }
            columnWidthFix();
        });
        this.columnPane.widthProperty().addListener((ob, old, now) -> columnWidthFix());
        scrollPane.heightProperty().addListener((ob, old, now) -> updateWidth());
        dataPane.heightProperty().addListener((ob, old, now) -> updateWidth());
        root.heightProperty().addListener((ob, old, now) ->
            scrollPane.setPrefHeight(root.getHeight() - columnPane.getHeight()));
        columnPane.heightProperty().addListener((ob, old, now) ->
            scrollPane.setPrefHeight(root.getHeight() - columnPane.getHeight()));

        columnPane.getChildren().addAll(this.columnPane, fixColumnWidthColum);
    }

    public Region getNode() {
        return root;
    }

    public ObservableList<VTableColumn<S, ?>> getColumns() {
        return columns;
    }

    public List<S> getItems() {
        return itemsDelegate;
    }

    public void setItems(List<S> items) {
        this.items.removeListener(itemsListener);
        this.items.clear();
        for (var item : items) {
            this.items.add(new VTableRow<>(item, shared));
        }
        this.items.addListener(itemsListener);
        sort();
    }

    @SuppressWarnings("FieldCanBeLocal")
    private final ListChangeListener<VTableColumn<S, ?>> colsListener = c -> {
        while (c.next()) {
            var added = c.getAddedSubList();
            var removed = c.getRemoved();

            for (int i = removed.size() - 1; i >= 0; --i) {
                var col = removed.get(i);
                int index = lastColumns.indexOf(col);
                lastColumns.remove(index);
                assert index != -1;
                for (var row : items) {
                    row.removeCol(index);
                }
                dataPane.getChildren().remove(index);
                columnPane.getChildren().remove(index);
                clearSort(col);
                col.shared = null;
            }
            for (var col : added) {
                var index = columns.indexOf(col);
                lastColumns.add(index, col);
                for (var row : items) {
                    row.addCol(index, col);
                }
                dataPane.getChildren().add(index, col.vbox);
                columnPane.getChildren().add(index, col.columnNode);
                col.shared = shared;
            }
        }
    };

    private final ListChangeListener<VTableRow<S>> itemsListener = c -> {
        while (c.next()) {
            var added = c.getAddedSubList();
            var removed = c.getRemoved();

            for (var row : removed) {
                row.remove();
            }
            for (var row : added) {
                row.setCols(columns);
                var index = items.indexOf(row);
                row.add(index);
            }
        }
        for (int i = 0; i < items.size(); i++) {
            var row = items.get(i);
            row.setBgColor(i);
        }
    };

    private void columnWidthFix() {
        double columnW = columnPane.getWidth();
        double scrollW = scrollPane.getWidth();
        if (scrollW > columnW) {
            fixColumnWidthColum.setPrefWidth(scrollW - columnW);
        } else {
            fixColumnWidthColum.setPrefWidth(0);
        }
    }

    void updateWidth() {
        updateWidth(scrollPane.getWidth());
    }

    private void updateWidth(double width) {
        width -= 10;
        if (dataPane.getHeight() > scrollPane.getHeight()) {
            width -= 15;
        }
        if (width <= 0) return;
        if (columns.isEmpty()) return;
        var plan = buildUpdateWithPrefWidthPlan(width);
        if (plan != null) {
            updateWidth(plan);
            return;
        }
        plan = buildUpdateAvgConsiderMinMaxPlan(width);
        if (plan != null) {
            updateWidth(plan);
            return;
        }
        plan = buildAvgPlan(width);
        updateWidth(plan);
    }

    private Map<VTableColumn<S, ?>, Double> buildUpdateWithPrefWidthPlan(double width) {
        var ret = new HashMap<VTableColumn<S, ?>, Double>();

        var prefWCols = new ArrayList<VTableColumn<S, ?>>();

        double remain = width;
        int remainCnt = columns.size();
        for (var c : columns) {
            if (c.prefWidth > 0) {
                remain -= c.prefWidth;
                ret.put(c, c.prefWidth);
                prefWCols.add(c);
                --remainCnt;
            }
        }
        if (remain < 0) { // exceeds
            return null;
        }
        if (prefWCols.size() == columns.size()) {
            return ret;
        }

        return buildUpdateAvgConsiderMinMaxPlan(ret, prefWCols, remain, remainCnt);
    }

    private Map<VTableColumn<S, ?>, Double> buildUpdateAvgConsiderMinMaxPlan(double width) {
        var ret = new HashMap<VTableColumn<S, ?>, Double>();
        return buildUpdateAvgConsiderMinMaxPlan(ret, Collections.emptyList(), width, columns.size());
    }

    @SuppressWarnings("UnnecessaryContinue")
    private Map<VTableColumn<S, ?>, Double> buildUpdateAvgConsiderMinMaxPlan(
        HashMap<VTableColumn<S, ?>, Double> ret,
        List<VTableColumn<S, ?>> prefWCols,
        double remain, int remainCnt) {

        var exceedsMin = new ArrayList<VTableColumn<S, ?>>();
        var exceedsMax = new ArrayList<VTableColumn<S, ?>>();

        double avg = remain / remainCnt;
        while (true) {
            var exceedsMin0 = new ArrayList<VTableColumn<S, ?>>();
            var exceedsMax0 = new ArrayList<VTableColumn<S, ?>>();
            for (var c : columns) {
                if (prefWCols.contains(c)) continue;
                if (exceedsMin.contains(c)) continue;
                if (exceedsMax.contains(c)) continue;
                if (c.minWidth > 0) {
                    if (c.minWidth > avg) {
                        if (remain < c.minWidth) {
                            return null;
                        }
                        remain -= c.minWidth;
                        --remainCnt;
                        exceedsMin0.add(c);
                        ret.put(c, c.minWidth);
                        continue;
                    }
                }
                if (c.maxWidth > 0) {
                    if (c.maxWidth < avg) {
                        if (remain < c.maxWidth) {
                            return null;
                        }
                        remain -= c.maxWidth;
                        --remainCnt;
                        exceedsMax0.add(c);
                        ret.put(c, c.maxWidth);
                        continue;
                    }
                }
            }
            exceedsMin.addAll(exceedsMin0);
            exceedsMax.addAll(exceedsMax0);
            if (remainCnt == 0) {
                return ret;
            }
            avg = remain / remainCnt;
            if (exceedsMin0.size() == 0 && exceedsMax0.size() == 0) {
                for (var c : columns) {
                    if (prefWCols.contains(c)) continue;
                    if (exceedsMin.contains(c)) continue;
                    if (exceedsMax.contains(c)) continue;
                    ret.put(c, avg);
                }
                return ret;
            }
        }
    }

    private Map<VTableColumn<S, ?>, Double> buildAvgPlan(double width) {
        var avg = width / columns.size();
        var ret = new HashMap<VTableColumn<S, ?>, Double>();
        for (var c : columns) {
            ret.put(c, avg);
        }
        return ret;
    }

    private void updateWidth(Map<VTableColumn<S, ?>, Double> plan) {
        for (int i = 0; i < columns.size(); i++) {
            var c = columns.get(i);
            var w = plan.get(c);
            assert w != null;
            for (var row : items) {
                row.updateColWidth(i, w);
            }
        }
    }

    void refresh() {
        for (var c : columns) {
            c.vbox.getChildren().clear();
        }
        for (int i = 0; i < items.size(); i++) {
            var row = items.get(i);
            row.add();
            row.setBgColor(i);
        }
    }

    void updateRowNodeForColumn(VTableColumn<S, ?> col) {
        for (var row : items) {
            row.updateRowNodeForColumn(col);
        }
    }

    void selectRow(VTableRow<S> r) {
        if (selectedRow != null) {
            var index = items.indexOf(selectedRow);
            if (index != -1) {
                selectedRow.setSelected(false);
                selectedRow.setBgColor(index);
            }
        }
        r.setSelected(true);
        selectedRow = r;
    }

    public S getSelectedItem() {
        if (selectedRow == null) return null;
        if (!items.contains(selectedRow)) {
            return null;
        }
        return selectedRow.item;
    }

    public void sortBy(VTableColumn<S, ?> c, VTableSortOrder order) {
        if (c.comparator == null) {
            return;
        }
        if (c.getSortPriority() == 0) {
            int p = 0;
            for (var col : columns) {
                if (col.getSortPriority() > p) {
                    p = col.getSortPriority();
                }
            }
            ++p;
            c.setSort(p, order);
        } else {
            c.setSort(c.getSortPriority(), order);
        }
        sort();
    }

    public void clearSort(VTableColumn<S, ?> c) {
        c.resetSortOrder();
        if (c.getSortPriority() == 0) {
            return;
        }
        for (var col : columns) {
            if (col == c) continue;
            if (col.getSortPriority() < c.getSortPriority()) continue;
            col.decSortPriority();
        }
        c.resetSortPriority();
        sort();
    }

    void sort() {
        var cols = new ArrayList<>(columns).stream()
            .filter(c -> c.getSortPriority() > 0 && c.comparator != null)
            .sorted(Comparator.comparingInt(VTableColumn::getSortPriority))
            .collect(Collectors.toList());
        var tmp = new ArrayList<>(items);
        tmp.sort((a, b) -> {
            for (var c : cols) {
                var va = c.valueRetriever.apply(a.item);
                var vb = c.valueRetriever.apply(b.item);
                //noinspection unchecked,rawtypes
                var res = ((Comparator) c.comparator).compare(va, vb);
                if (res == 0) {
                    continue;
                }
                if (c.getSortOrder() == VTableSortOrder.ASC) {
                    return res;
                } else {
                    return -res;
                }
            }
            return 0;
        });

        this.items.removeListener(itemsListener);
        this.items.clear();
        this.items.addAll(tmp);
        this.items.addListener(itemsListener);
        refresh();
    }
}
