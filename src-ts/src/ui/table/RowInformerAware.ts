import type { RowInformer } from './RowInformer.js';

export interface RowInformerAware {
  setRowInformer(rowInformer: RowInformer): void;
}

// Runtime duck-type check (TS interfaces are erased at runtime).
export function isRowInformerAware<S>(item: S | RowInformerAware): item is RowInformerAware {
  return typeof (item as RowInformerAware).setRowInformer === 'function';
}
