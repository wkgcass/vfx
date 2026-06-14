import type { VTableColumn } from './VTableColumn.js';
import type { VTableCellPane } from './VTableCellPane.js';

export interface CellAware<S> {
  setCell(col: VTableColumn<S, unknown>, pane: VTableCellPane<S>): void;
}

// Runtime duck-type check (TS interfaces are erased at runtime).
export function isCellAware<S>(item: S | CellAware<S>): item is CellAware<S> {
  return typeof (item as CellAware<S>).setCell === 'function';
}
