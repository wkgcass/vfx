import { Node } from '../../javafx/Node.js';
import { Label } from '../../javafx/Label.js';
import { HBox } from '../../javafx/HBox.js';
import { VBox } from '../../javafx/VBox.js';
import { Pane } from '../../javafx/Pane.js';
import { ObservableList, ListChangeListener } from '../../javafx/Parent.js';
import { ChangeListener } from '../../javafx/Property.js';
import { Pos } from '../../javafx/layout.js';
import { Color } from '../../javafx/color.js';
import { VScrollPane } from '../../control/scroll/VScrollPane.js';
import type { NodeWithVScrollPane } from '../../control/scroll/NodeWithVScrollPane.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';
import { Theme } from '../../theme/Theme.js';
import { FXUtils } from '../../util/FXUtils.js';
import { VTableColumn } from './VTableColumn.js';
import { VTableSortOrder } from './VTableSortOrder.js';
import { VTableSharedData } from './VTableSharedData.js';
import { VTableRow } from './VTableRow.js';
import { VTableRowListDelegate } from './VTableRowListDelegate.js';

export class VTableView<S> implements NodeWithVScrollPane {
  private readonly root: Pane = new Pane();
  private readonly rootVBox: VBox = new VBox();
  readonly columnPane: HBox = new HBox();
  private readonly fixColumnWidthColum: Pane = new Pane();
  private readonly scrollPane: VScrollPane = new VScrollPane();
  private readonly dataPane: HBox = new HBox();
  private readonly emptyTableLabel: Label = (() => {
    const label = new Label(InternalI18n.get().emptyTableLabel());
    FontManager.get().setFont(FontUsages.tableEmptyTableLabel, label);
    label.setTextFill(Theme.current().tableTextColor());
    label.setAlignment(Pos.CENTER);
    label.setTextFill(Color.GRAY);
    return label;
  })();

  private readonly shared: VTableSharedData<S> = new VTableSharedData<S>(this);

  private readonly columns: ObservableList<VTableColumn<S, unknown>> = new ObservableList<VTableColumn<S, unknown>>();
  private readonly lastColumns: VTableColumn<S, unknown>[] = [];
  readonly items: ObservableList<VTableRow<S>> = new ObservableList<VTableRow<S>>();
  private readonly itemsDelegate: VTableRowListDelegate<S> = new VTableRowListDelegate<S>(this.items, this.shared);
  private selectedRow: VTableRow<S> | null = null;

  constructor() {
    this.scrollPane.setContent(this.emptyTableLabel);
    this.columns.addListener(this.colsListener);
    this.items.addListener(this.itemsListener);

    this.root.getChildren().add(this.rootVBox);
    FXUtils.observeWidthHeightWithPreferred(this.root, this.rootVBox);

    const columnPane = new HBox();
    this.rootVBox.getChildren().addAll(columnPane, this.scrollPane.getNode());

    const rootVBoxWidthChange: ChangeListener<number> = (_old, now) => {
      if (now === null) return;
      this.scrollPane.getNode().setPrefWidth(now);
      if (this.rootVBox.getPrefWidth() !== 0) {
        this.updateWidthWith(this.rootVBox.getPrefWidth());
      } else {
        this.updateWidth();
      }
      this.columnWidthFix();
    };
    this.rootVBox.widthProperty.addListener(rootVBoxWidthChange);
    // Java registers the same listener on both widthProperty AND
    // prefWidthProperty — the latter fires synchronously when something
    // calls setPrefWidth, so column redistribution happens before the
    // actual rendered width propagates. Node now exposes prefWidthProperty
    // (kept in sync inside setPrefWidth), so we wire it up here for 1:1
    // parity with the Java original.
    this.rootVBox.prefWidthProperty.addListener(rootVBoxWidthChange);
    this.columnPane.widthProperty.addListener(() => this.columnWidthFix());
    this.scrollPane.getNode().widthProperty.addListener((_old, now) => {
      if (now === null) return;
      this.emptyTableLabel.setPrefWidth(now);
      this.columnWidthFix();
    });
    this.scrollPane.getNode().heightProperty.addListener((_old, now) => {
      if (now === null) return;
      this.emptyTableLabel.setPrefHeight(now - 10);
    });
    this.rootVBox.heightProperty.addListener(() =>
      this.scrollPane.getNode().setPrefHeight(this.rootVBox.getHeight() - this.columnPane.getHeight()),
    );
    this.columnPane.heightProperty.addListener(() =>
      this.scrollPane.getNode().setPrefHeight(this.rootVBox.getHeight() - this.columnPane.getHeight()),
    );

    columnPane.getChildren().addAll(this.columnPane, this.fixColumnWidthColum);

    this.fixColumnWidthColum.setBackground(VTableColumn.BG);
    this.fixColumnWidthColum.setPrefWidth(0);

    FXUtils.makeTopOnlyRoundedClipFor(columnPane, 4);
    FXUtils.makeBottomOnlyRoundedClipFor(this.dataPane, 4);
  }

  getNode(): Pane {
    return this.root;
  }

  getColumns(): ObservableList<VTableColumn<S, unknown>> {
    return this.columns;
  }

  getItems(): VTableRowListDelegate<S> {
    return this.itemsDelegate;
  }

  setItems(items: S[]): void {
    this.items.removeListener(this.itemsListener);
    this.items.clear();
    for (const item of items) {
      const row = new VTableRow<S>(item, this.shared);
      row.setCols(this.columns.toArray());
      this.items.add(row);
    }
    this.items.addListener(this.itemsListener);
    this.sort();
    this.updateWidth();
    if (items.length === 0) {
      this.scrollPane.setContent(this.emptyTableLabel);
    } else {
      this.scrollPane.setContent(this.dataPane);
    }
  }

  // Arrow-function fields so `this` is bound and the listener identity is
  // stable for add/removeListener (mirrors Java's final field lambdas).
  private readonly colsListener: ListChangeListener<VTableColumn<S, unknown>> = ({ added, removed }) => {
    // Process removals in reverse order so indices remain valid.
    for (let i = removed.length - 1; i >= 0; --i) {
      const col = removed[i]!;
      const index = this.lastColumns.indexOf(col);
      this.lastColumns.splice(index, 1);
      for (const row of this.items) {
        row.removeCol(index);
      }
      this.dataPane.getChildren().removeAt(index);
      this.columnPane.getChildren().removeAt(index);
      this.clearSort(col);
      col.shared = null;
    }
    for (const col of added) {
      const index = this.columns.indexOf(col);
      this.lastColumns.splice(index, 0, col);
      for (const row of this.items) {
        row.addCol(index, col);
      }
      this.dataPane.getChildren().insert(index, col.vbox);
      this.columnPane.getChildren().insert(index, col.columnNode);
      col.shared = this.shared;
    }
    this.updateWidth();
  };

  private readonly itemsListener: ListChangeListener<VTableRow<S>> = ({ added, removed }) => {
    for (const row of removed) {
      row.remove();
    }
    for (const row of added) {
      row.setCols(this.columns.toArray());
      const index = this.items.indexOf(row);
      row.addAt(index);
    }
    for (let i = 0; i < this.items.size(); i++) {
      const row = this.items.get(i);
      row.setBgColor(i);
    }
    if (this.items.isEmpty()) {
      this.scrollPane.setContent(this.emptyTableLabel);
    } else {
      this.scrollPane.setContent(this.dataPane);
      this.updateWidth();
    }
    let hasSort = false;
    for (const col of this.columns) {
      if (col.getSortPriority() > 0) {
        hasSort = true;
        break;
      }
    }
    if (hasSort) {
      this.sort();
    }
  };

  private columnWidthFix(): void {
    const columnW = this.columnPane.getWidth();
    const scrollW = this.scrollPane.getNode().getWidth();
    if (scrollW > columnW) {
      this.fixColumnWidthColum.setPrefWidth(scrollW - columnW);
    } else {
      this.fixColumnWidthColum.setPrefWidth(0);
    }
  }

  updateWidth(): void {
    this.updateWidthWith(this.scrollPane.getNode().getWidth());
  }

  private updateWidthWith(width: number): void {
    if (width <= 0) return;
    if (this.columns.isEmpty()) return;
    let plan = this.buildUpdateWithPrefWidthPlan(width);
    if (plan !== null) {
      this.applyWidthPlan(plan);
      return;
    }
    plan = this.buildUpdateAvgConsiderMinMaxPlan(width);
    if (plan !== null) {
      this.applyWidthPlan(plan);
      return;
    }
    plan = this.buildAvgPlan(width);
    this.applyWidthPlan(plan);
  }

  private buildUpdateWithPrefWidthPlan(width: number): Map<VTableColumn<S, unknown>, number> | null {
    const ret = new Map<VTableColumn<S, unknown>, number>();
    const prefWCols: VTableColumn<S, unknown>[] = [];

    let remain = width;
    let remainCnt = this.columns.size();
    for (const c of this.columns) {
      if (c.prefWidth > 0) {
        remain -= c.prefWidth;
        ret.set(c, c.prefWidth);
        prefWCols.push(c);
        --remainCnt;
      }
    }
    if (remain < 0) {
      return null;
    }
    if (prefWCols.length === this.columns.size()) {
      return ret;
    }

    return this.buildUpdateAvgConsiderMinMaxPlan2(ret, prefWCols, remain, remainCnt);
  }

  private buildUpdateAvgConsiderMinMaxPlan(width: number): Map<VTableColumn<S, unknown>, number> | null {
    const ret = new Map<VTableColumn<S, unknown>, number>();
    return this.buildUpdateAvgConsiderMinMaxPlan2(ret, [], width, this.columns.size());
  }

  private buildUpdateAvgConsiderMinMaxPlan2(
    ret: Map<VTableColumn<S, unknown>, number>,
    prefWCols: VTableColumn<S, unknown>[],
    remainIn: number,
    remainCntIn: number,
  ): Map<VTableColumn<S, unknown>, number> | null {
    const exceedsMin: VTableColumn<S, unknown>[] = [];
    const exceedsMax: VTableColumn<S, unknown>[] = [];

    let remain = remainIn;
    let remainCnt = remainCntIn;
    let avg = remain / remainCnt;
    while (true) {
      const exceedsMin0: VTableColumn<S, unknown>[] = [];
      const exceedsMax0: VTableColumn<S, unknown>[] = [];
      for (const c of this.columns) {
        if (prefWCols.includes(c)) continue;
        if (exceedsMin.includes(c)) continue;
        if (exceedsMax.includes(c)) continue;
        if (c.minWidth > 0) {
          if (c.minWidth > avg) {
            if (remain < c.minWidth) {
              return null;
            }
            remain -= c.minWidth;
            --remainCnt;
            exceedsMin0.push(c);
            ret.set(c, c.minWidth);
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
            exceedsMax0.push(c);
            ret.set(c, c.maxWidth);
            continue;
          }
        }
      }
      exceedsMin.push(...exceedsMin0);
      exceedsMax.push(...exceedsMax0);
      if (remainCnt === 0) {
        return ret;
      }
      avg = remain / remainCnt;
      if (exceedsMin0.length === 0 && exceedsMax0.length === 0) {
        for (const c of this.columns) {
          if (prefWCols.includes(c)) continue;
          if (exceedsMin.includes(c)) continue;
          if (exceedsMax.includes(c)) continue;
          ret.set(c, avg);
        }
        return ret;
      }
    }
  }

  private buildAvgPlan(width: number): Map<VTableColumn<S, unknown>, number> {
    const avg = width / this.columns.size();
    const ret = new Map<VTableColumn<S, unknown>, number>();
    for (const c of this.columns) {
      ret.set(c, avg);
    }
    return ret;
  }

  private applyWidthPlan(plan: Map<VTableColumn<S, unknown>, number>): void {
    for (let i = 0; i < this.columns.size(); i++) {
      const c = this.columns.get(i);
      const w = plan.get(c)!;
      if (this.items.isEmpty()) {
        c.columnNode.setPrefWidth(w);
      }
      for (const row of this.items) {
        row.updateColWidth(i, w);
      }
    }
  }

  refresh(): void {
    for (const c of this.columns) {
      c.vbox.getChildren().clear();
    }
    for (let i = 0; i < this.items.size(); i++) {
      const row = this.items.get(i);
      row.add();
      row.setBgColor(i);
    }
  }

  updateRowNodeForColumn(col: VTableColumn<S, unknown>): void {
    for (const row of this.items) {
      row.updateRowNodeForColumn(col);
    }
  }

  selectRow(r: VTableRow<S>): void {
    if (this.selectedRow !== null) {
      const index = this.items.indexOf(this.selectedRow);
      if (index !== -1) {
        this.selectedRow.setSelected(false);
        this.selectedRow.setBgColor(index);
      }
    }
    r.setSelected(true);
    this.selectedRow = r;
  }

  getSelectedItem(): S | null {
    if (this.selectedRow === null) return null;
    if (!this.items.contains(this.selectedRow)) {
      return null;
    }
    return this.selectedRow.item;
  }

  sortBy(c: VTableColumn<S, unknown>, order: VTableSortOrder): void {
    if (c.comparator === null) {
      return;
    }
    if (c.getSortPriority() === 0) {
      let p = 0;
      for (const col of this.columns) {
        if (col.getSortPriority() > p) {
          p = col.getSortPriority();
        }
      }
      ++p;
      c.setSort(p, order);
    } else {
      c.setSort(c.getSortPriority(), order);
    }
    this.sort();
  }

  clearSort(c: VTableColumn<S, unknown>): void {
    c.resetSortOrder();
    if (c.getSortPriority() === 0) {
      return;
    }
    for (const col of this.columns) {
      if (col === c) continue;
      if (col.getSortPriority() < c.getSortPriority()) continue;
      col.decSortPriority();
    }
    c.resetSortPriority();
    this.sort();
  }

  sort(): void {
    const cols = [...this.columns]
      .filter((c) => c.getSortPriority() > 0 && c.comparator !== null)
      .sort((a, b) => a.getSortPriority() - b.getSortPriority());
    const tmp = [...this.items];
    tmp.sort((a, b) => {
      for (const c of cols) {
        const va = c.valueRetriever(a.item);
        const vb = c.valueRetriever(b.item);
        const comparator = c.comparator!;
        const res = comparator(va, vb);
        if (res === 0) {
          continue;
        }
        if (c.getSortOrder() === VTableSortOrder.ASC) {
          return res;
        } else {
          return -res;
        }
      }
      // Java: Long.compare(a.rowId, b.rowId)
      if (a.rowId < b.rowId) return -1;
      if (a.rowId > b.rowId) return 1;
      return 0;
    });

    this.items.removeListener(this.itemsListener);
    this.items.clear();
    this.items.addAll(...tmp);
    this.items.addListener(this.itemsListener);
    this.refresh();
  }

  getScrollPane(): VScrollPane {
    return this.scrollPane;
  }

  getSelfNode(): Pane {
    return this.getNode();
  }
}
