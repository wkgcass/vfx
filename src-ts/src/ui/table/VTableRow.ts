import { Node } from '../../javafx/Node.js';
import { Label } from '../../javafx/Label.js';
import { ObservableList } from '../../javafx/Parent.js';
import { Background, BackgroundFill, CornerRadii, Insets } from '../../javafx/layout.js';
import { Theme } from '../../theme/Theme.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { FXUtils } from '../../util/FXUtils.js';
import type { RowInformer } from './RowInformer.js';
import { isRowInformerAware } from './RowInformerAware.js';
import { isCellAware } from './CellAware.js';
import { VTableCellPane } from './VTableCellPane.js';
import type { VTableColumn } from './VTableColumn.js';
import type { VTableSharedData } from './VTableSharedData.js';

export class VTableRow<S> implements RowInformer {
  // Lazy statics: Theme.current() cannot run at class-load time because
  // Theme.setTheme(...) is only called during bootstrap, after all modules
  // have finished loading.
  private static _BG_SELECTED: Background | null = null;
  private static get BG_SELECTED(): Background {
    if (VTableRow._BG_SELECTED === null) {
      VTableRow._BG_SELECTED = new Background(
        new BackgroundFill(Theme.current().tableCellSelectedBackgroundColor(), CornerRadii.EMPTY, Insets.EMPTY),
      );
    }
    return VTableRow._BG_SELECTED;
  }
  private static _BG_1: Background | null = null;
  private static get BG_1(): Background {
    if (VTableRow._BG_1 === null) {
      VTableRow._BG_1 = new Background(
        new BackgroundFill(Theme.current().tableCellBackgroundColor1(), CornerRadii.EMPTY, Insets.EMPTY),
      );
    }
    return VTableRow._BG_1;
  }
  private static _BG_2: Background | null = null;
  private static get BG_2(): Background {
    if (VTableRow._BG_2 === null) {
      VTableRow._BG_2 = new Background(
        new BackgroundFill(Theme.current().tableCellBackgroundColor2(), CornerRadii.EMPTY, Insets.EMPTY),
      );
    }
    return VTableRow._BG_2;
  }

  readonly rowId: number;
  readonly item: S;
  readonly shared: VTableSharedData<S>;
  readonly nodes: ObservableList<VTableCellPane<S>> = new ObservableList<VTableCellPane<S>>();
  private selected = false;

  constructor(item: S, shared: VTableSharedData<S>) {
    this.rowId = ++shared.rowAdder;
    this.item = item;
    this.shared = shared;
    if (isRowInformerAware(item)) {
      item.setRowInformer(this);
    }

    this.nodes.addListener(({ added, removed }) => {
      for (const r of removed) {
        for (const n of this.nodes) {
          n.heightProperty.removeListener(r.heightWatcher);
        }
      }
      for (const a of added) {
        for (const n of this.nodes) {
          if (a === n) continue;
          n.heightProperty.addListener(a.heightWatcher);
          a.heightProperty.addListener(n.heightWatcher);
        }
      }
    });
  }

  add(): void {
    const columns = this.shared.tableView.getColumns();
    for (let i = 0; i < columns.size(); ++i) {
      const col = columns.get(i);
      col.vbox.getChildren().add(this.nodes.get(i));
    }
  }

  addAt(index: number): void {
    const columns = this.shared.tableView.getColumns();
    for (let i = 0; i < columns.size(); ++i) {
      const col = columns.get(i);
      col.vbox.getChildren().insert(index, this.nodes.get(i));
    }
  }

  remove(): void {
    const columns = this.shared.tableView.getColumns();
    for (let i = 0; i < columns.size(); ++i) {
      const col = columns.get(i);
      col.vbox.getChildren().remove(this.nodes.get(i));
    }
  }

  removeCol(index: number): void {
    this.nodes.removeAt(index);
  }

  addCol(index: number, col: VTableColumn<S, unknown>): void {
    const cell = new VTableCellPane<S>(this.buildNode(col), this, this.shared);
    this.nodes.insert(index, cell);
    if (isCellAware(this.item)) {
      this.item.setCell(col, cell);
    }
  }

  setCols(cols: VTableColumn<S, unknown>[]): void {
    this.nodes.clear();
    for (const col of cols) {
      const cell = this.buildCell(col);
      this.nodes.add(cell);
    }
  }

  updateRowNodeForColumn(col: VTableColumn<S, unknown>): void {
    const rowIndex = this.shared.tableView.items.indexOf(this);
    const colIndex = this.shared.tableView.getColumns().indexOf(col);
    const n = this.nodes.removeAt(colIndex)!;
    col.vbox.getChildren().remove(n);
    const cell = this.buildCell(col);
    this.nodes.insert(colIndex, cell);
    col.vbox.getChildren().insert(rowIndex, cell);
  }

  private buildCell(col: VTableColumn<S, unknown>): VTableCellPane<S> {
    const cell = new VTableCellPane<S>(this.buildNode(col), this, this.shared);
    if (isCellAware(this.item)) {
      this.item.setCell(col, cell);
    }
    col.initCell(cell);
    return cell;
  }

  private buildNode(col: VTableColumn<S, unknown>): Node {
    const v = col.valueRetriever(this.item);
    if (col.nodeBuilder === null) {
      if (v === null || v === undefined) {
        return new Label();
      }
      const label = new Label(String(v));
      label.setTextFill(Theme.current().tableTextColor());
      FontManager.get().setFont(FontUsages.tableCellText, label);
      return label;
    }
    return col.nodeBuilder(v as never);
  }

  informRowUpdate(): void {
    FXUtils.runOnFX(() => this.informRowUpdate0());
  }

  private informRowUpdate0(): void {
    const columns = this.shared.tableView.getColumns();
    for (let i = 0; i < columns.size(); ++i) {
      const col = columns.get(i);
      const node = this.buildNode(col);
      const pane = this.nodes.get(i);
      pane.getChildren().clear();
      if (node !== null) {
        pane.getChildren().add(node);
      }
    }
  }

  updateColWidth(i: number, w: number): void {
    this.nodes.get(i).setPrefWidth(w);
    this.nodes.get(i).setMinWidth(w);
    this.nodes.get(i).setMaxWidth(w);
  }

  isSelected(): boolean {
    return this.selected;
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    if (selected) {
      this.setBgColor(-1);
    }
  }

  setBgColor(rowNumber?: number): void {
    if (rowNumber === undefined) {
      const rowIndex = this.shared.tableView.items.indexOf(this);
      this.setBgColor(rowIndex);
      return;
    }
    for (const n of this.nodes) {
      if (this.selected) {
        n.setBackground(VTableRow.BG_SELECTED);
      } else if (rowNumber % 2 === 0) {
        n.setBackground0(VTableRow.BG_1);
      } else {
        n.setBackground0(VTableRow.BG_2);
      }
    }
  }
}
