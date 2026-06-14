import { StackPane } from '../../javafx/Pane.js';
import { Node } from '../../javafx/Node.js';
import { Insets, Pos, Background } from '../../javafx/layout.js';
import { posToFlex } from '../../javafx/layout.js';
import type { ChangeListener } from '../../javafx/Property.js';
import type { VTableRow } from './VTableRow.js';
import type { VTableSharedData } from './VTableSharedData.js';

export class VTableCellPane<S> extends StackPane {
  private readonly row: VTableRow<S>;
  readonly heightWatcher: ChangeListener<number> = (_old, now) => {
    if (now === null) return;
    const dNow = now;
    const thisHeight = this.getHeight();
    if (thisHeight < dNow) {
      this.setPrefHeight(dNow);
    }
  };
  private backgroundSetByUser: Background | null = null;

  constructor(node: Node | null, row: VTableRow<S>, shared: VTableSharedData<S>) {
    super();
    this.row = row;
    if (node !== null) {
      this.getChildren().add(node);
    }
    this.setMinHeight(30);
    this.setAlignment(Pos.CENTER_LEFT);
    this.setPadding(new Insets(2, 5, 2, 5));

    this.setOnMouseClicked(() => shared.tableView.selectRow(this.row));
  }

  // TS StackPane is a flex container, so Pos is translated into
  // align-items/justify-content.
  setAlignment(p: Pos): void {
    const { justify, align } = posToFlex(p);
    this.el.style.alignItems = align;
    this.el.style.justifyContent = justify;
  }

  resetBg(): void {
    this.backgroundSetByUser = null;
    this.row.setBgColor();
  }

  setBackground0(bg: Background): void {
    if (this.backgroundSetByUser !== null) {
      this.setBackground(this.backgroundSetByUser);
    } else {
      this.setBackground(bg);
    }
  }

  setBg(bg: Background): void {
    this.backgroundSetByUser = bg;
    this.row.setBgColor();
  }
}
