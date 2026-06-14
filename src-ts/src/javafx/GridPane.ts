import { Pane } from './Pane.js';
import { Node } from './Node.js';
import { Pos } from './layout.js';

interface CellSlot {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

const posToGridAlign: Record<Pos, { justify: string; align: string }> = {
  [Pos.TOP_LEFT]: { justify: 'start', align: 'start' },
  [Pos.TOP_CENTER]: { justify: 'center', align: 'start' },
  [Pos.TOP_RIGHT]: { justify: 'end', align: 'start' },
  [Pos.CENTER_LEFT]: { justify: 'start', align: 'center' },
  [Pos.CENTER]: { justify: 'center', align: 'center' },
  [Pos.CENTER_RIGHT]: { justify: 'end', align: 'center' },
  [Pos.BOTTOM_LEFT]: { justify: 'start', align: 'end' },
  [Pos.BOTTOM_CENTER]: { justify: 'center', align: 'end' },
  [Pos.BOTTOM_RIGHT]: { justify: 'end', align: 'end' },
  [Pos.BASELINE_LEFT]: { justify: 'start', align: 'baseline' },
  [Pos.BASELINE_CENTER]: { justify: 'center', align: 'baseline' },
  [Pos.BASELINE_RIGHT]: { justify: 'end', align: 'baseline' },
};

export class GridPane extends Pane {
  private _hgap = 0;
  private _vgap = 0;
  private _alignment: Pos = Pos.TOP_LEFT;
  private readonly slots = new Map<Node, CellSlot>();
  private _autoCol = 0;
  private _autoRow = 0;

  constructor() {
    super();
    this.el.style.display = 'grid';
    this.el.style.gridAutoFlow = 'row dense';
    this.applyGridStyles();
  }

  setHgap(px: number): void {
    this._hgap = px;
    this.applyGridStyles();
  }
  getHgap(): number { return this._hgap; }

  setVgap(px: number): void {
    this._vgap = px;
    this.applyGridStyles();
  }
  getVgap(): number { return this._vgap; }

  setAlignment(pos: Pos): void {
    this._alignment = pos;
    this.applyGridStyles();
  }
  getAlignment(): Pos { return this._alignment; }

  add(node: Node, col: number, row: number): void;
  add(node: Node, col: number, row: number, colSpan: number, rowSpan: number): void;
  add(node: Node, col: number, row: number, colSpan: number = 1, rowSpan: number = 1): void {
    this.slots.set(node, { col, row, colSpan, rowSpan });
    // Reset the auto-flow cursor so a subsequent `getChildren().add()` (which
    // has no explicit coordinates) resumes after this cell.
    this._autoCol = Math.max(this._autoCol, col + colSpan);
    this._autoRow = Math.max(this._autoRow, row + rowSpan);
    this.applyCellStyles(node);
    this.getChildren().add(node);
  }

  protected override _onChildrenChanged(added: Node[], removed: Node[]): void {
    super._onChildrenChanged(added, removed);
    for (const a of added) {
      // Pane's _onChildrenChanged forces children to position:absolute, which
      // would pull them out of CSS Grid flow and stack them at (0,0). Re-assert
      // `relative` so:
      //   1. The child still participates in grid flow (unlike absolute).
      //   2. The child remains a containing block for ITS own absolute-positioned
      //      descendants (Pane subclasses like FusionButton place their text/
      //      border-light absolutely and rely on the button being relative).
      // Using `static` would break #2 — absolute descendants would resolve
      // against a window-level ancestor and visually detach.
      a.el.style.position = 'relative';
      // Children added via getChildren().add() directly (not through GridPane.add)
      // get a default slot at the next free auto-position.
      if (!this.slots.has(a)) {
        this.slots.set(a, { col: this._autoCol, row: this._autoRow, colSpan: 1, rowSpan: 1 });
        this._autoCol += 1;
      }
      this.applyCellStyles(a);
    }
    for (const r of removed) {
      this.slots.delete(r);
    }
  }

  private applyGridStyles(): void {
    this.el.style.columnGap = `${this._hgap}px`;
    this.el.style.rowGap = `${this._vgap}px`;
    const a = posToGridAlign[this._alignment] ?? posToGridAlign[Pos.TOP_LEFT];
    this.el.style.justifyContent = a.justify;
    this.el.style.alignContent = a.align;
  }

  private applyCellStyles(node: Node): void {
    const slot = this.slots.get(node);
    if (!slot) return;
    // CSS Grid is 1-indexed; JavaFX GridPane is 0-indexed.
    const style = node.el.style;
    if (slot.colSpan > 1 || slot.rowSpan > 1) {
      style.gridColumn = `${slot.col + 1} / span ${slot.colSpan}`;
      style.gridRow = `${slot.row + 1} / span ${slot.rowSpan}`;
    } else {
      style.gridColumnStart = String(slot.col + 1);
      style.gridRowStart = String(slot.row + 1);
    }
  }
}
