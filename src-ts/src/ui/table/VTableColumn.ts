import { Node } from '../../javafx/Node.js';
import { Label } from '../../javafx/Label.js';
import { HBox } from '../../javafx/HBox.js';
import { VBox } from '../../javafx/VBox.js';
import {
  Background,
  BackgroundFill,
  CornerRadii,
  Insets,
  Pos,
} from '../../javafx/layout.js';
import { LinearGradient } from '../../javafx/color.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { Theme } from '../../theme/Theme.js';
import { FXUtils } from '../../util/FXUtils.js';
import { HPadding } from '../layout/HPadding.js';
import { VTableSortOrder } from './VTableSortOrder.js';
import type { VTableCellPane } from './VTableCellPane.js';
import type { VTableSharedData } from './VTableSharedData.js';

type Region = Node;

export class VTableColumn<S, T> {
  private static _BG: Background | null = null;
  static get BG(): Background {
    if (VTableColumn._BG === null) {
      VTableColumn._BG = new Background(
        new BackgroundFill(
          new LinearGradient(0, 0, 0, 1, true, 'NO_CYCLE', [
            { offset: 0, color: Theme.current().tableHeaderTopBackgroundColor() },
            { offset: 1, color: Theme.current().tableHeaderBottomBackgroundColor() },
          ]),
          CornerRadii.EMPTY,
          Insets.EMPTY,
        ),
      );
    }
    return VTableColumn._BG;
  }
  private static readonly sortWidth = 15;

  public readonly name: string;
  readonly valueRetriever: (s: S) => T;
  comparator: ((a: T, b: T) => number) | null = null;
  readonly columnNode: HBox = new HBox();
  private sortLabel!: Label;
  nodeBuilder: ((t: T) => Node) | null = null;

  shared: VTableSharedData<S> | null = null;

  readonly vbox: VBox = new VBox();
  minWidth: number = 0;
  maxWidth: number = 0;
  prefWidth: number = 0;
  alignment: Pos | null = null;

  private sortPriority: number = 0;
  private sortOrder: VTableSortOrder = VTableSortOrder.DESC;

  constructor(name: string, valueRetriever: (s: S) => T);
  constructor(name: string, columnContentNode: Region, valueRetriever: (s: S) => T);
  constructor(name: string, columnContentNodeOrRetriever: Region | ((s: S) => T), valueRetrieverMaybe?: (s: S) => T) {
    this.name = name;
    if (typeof columnContentNodeOrRetriever === 'function') {
      const valueRetriever = columnContentNodeOrRetriever as (s: S) => T;
      this.valueRetriever = valueRetriever;
      const headerLabel = new Label(name);
      headerLabel.setAlignment(Pos.CENTER);
      headerLabel.setTextFill(Theme.current().tableHeaderTextColor());
      headerLabel.setPrefHeight(25);
      this.finishCtor(headerLabel);
    } else {
      const columnContentNode = columnContentNodeOrRetriever as Region;
      this.valueRetriever = valueRetrieverMaybe!;
      this.finishCtor(columnContentNode);
    }
  }

  private finishCtor(columnContentNode: Region): void {
    this.sortLabel = new Label();
    this.sortLabel.setPadding(new Insets(0, 4, 0, 4));
    this.sortLabel.setPrefWidth(VTableColumn.sortWidth);
    this.sortLabel.setTextFill(Theme.current().tableSortLabelColor());

    this.columnNode.getChildren().addAll(
      new HPadding(VTableColumn.sortWidth),
      columnContentNode,
      this.sortLabel,
    );
    this.columnNode.setBackground(VTableColumn.BG);
    FXUtils.observeHeight(columnContentNode as unknown as import('../../javafx/Parent.js').Parent, this.columnNode);
    this.columnNode.setAlignment(Pos.CENTER);

    this.columnNode.setOnMouseClicked(() => {
      if (this.comparator === null) {
        if (this.sortPriority !== 0) {
          this.shared!.tableView.clearSort(this as VTableColumn<S, unknown>);
        }
        return;
      }
      if (this.shared !== null) {
        if (this.sortPriority !== 0 && this.sortOrder === VTableSortOrder.DESC) {
          this.shared.tableView.clearSort(this as VTableColumn<S, unknown>);
        } else {
          this.shared.tableView.sortBy(this as VTableColumn<S, unknown>, this.sortOrder === VTableSortOrder.ASC ? VTableSortOrder.DESC : VTableSortOrder.ASC);
        }
      }
    });

    this.columnNode.widthProperty.addListener((_old, now) => {
      if (now === null) return;
      columnContentNode.setPrefWidth(now - 2 * VTableColumn.sortWidth);
    });
    this.vbox.widthProperty.addListener((_old, now) => {
      if (now === null) return;
      this.columnNode.setPrefWidth(now);
      this.columnNode.setMinWidth(now);
      this.columnNode.setMaxWidth(now);
    });
  }

  setComparator(comparator: ((a: T, b: T) => number) | null): void {
    this.comparator = comparator;
    if (this.sortPriority > 0 && this.shared !== null) {
      if (comparator === null) {
        this.shared.tableView.clearSort(this as VTableColumn<S, unknown>);
      } else {
        this.shared.tableView.sort();
      }
    }
  }

  setMinWidth(minWidth: number): void {
    this.minWidth = minWidth;
    if (this.shared !== null) {
      this.shared.tableView.updateWidth();
    }
  }

  setMaxWidth(maxWidth: number): void {
    this.maxWidth = maxWidth;
    if (this.shared !== null) {
      this.shared.tableView.updateWidth();
    }
  }

  setPrefWidth(prefWidth: number): void {
    this.prefWidth = prefWidth;
    if (this.shared !== null) {
      this.shared.tableView.updateWidth();
    }
  }

  setAlignment(alignment: Pos): void {
    this.alignment = alignment;
    if (this.shared !== null) {
      this.shared.tableView.updateRowNodeForColumn(this as VTableColumn<S, unknown>);
    }
  }

  setTextBuilder(textBuilder: (t: T) => string): void {
    this.setNodeBuilder((t) => {
      const str = textBuilder(t);
      const label = new Label(str);
      label.setTextFill(Theme.current().tableTextColor());
      FontManager.get().setFont(FontUsages.tableCellText, label);
      return label;
    });
  }

  setNodeBuilder(nodeBuilder: ((t: T) => Node) | null): void {
    this.nodeBuilder = nodeBuilder;
    if (this.shared !== null) {
      this.shared.tableView.refresh();
    }
  }

  initCell(cell: VTableCellPane<S>): void {
    if (this.alignment !== null) {
      cell.setAlignment(this.alignment);
    }
  }

  getSortPriority(): number {
    return this.sortPriority;
  }

  getSortOrder(): VTableSortOrder {
    return this.sortOrder;
  }

  setSort(priority: number, order: VTableSortOrder): void {
    this.sortPriority = priority;
    this.sortOrder = order;
    this.updateSortLabel();
  }

  private updateSortLabel(): void {
    if (this.sortPriority === 0) {
      this.sortLabel.setText('');
      this.sortLabel.el.style.transform = '';
      return;
    }
    if (this.sortOrder === VTableSortOrder.ASC) {
      this.sortLabel.el.style.transform = 'rotate(0deg)';
      this.sortLabel.setAlignment(Pos.CENTER_RIGHT);
    } else {
      this.sortLabel.el.style.transform = 'rotate(180deg)';
      this.sortLabel.setAlignment(Pos.CENTER_LEFT);
    }
    this.sortLabel.setText('' + this.sortPriority);
  }

  resetSortOrder(): void {
    this.sortOrder = VTableSortOrder.DESC;
  }

  resetSortPriority(): void {
    this.sortPriority = 0;
    this.sortLabel.setText('');
    this.sortLabel.el.style.transform = '';
  }

  decSortPriority(): void {
    --this.sortPriority;
    this.updateSortLabel();
  }
}
