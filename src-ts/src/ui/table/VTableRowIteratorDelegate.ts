import type { ObservableList } from '../../javafx/Parent.js';
import { VTableRow } from './VTableRow.js';
import type { VTableSharedData } from './VTableSharedData.js';

export class VTableRowIteratorDelegate<E> {
  private readonly ls: ObservableList<VTableRow<E>>;
  private readonly shared: VTableSharedData<E>;
  private cursor: number;
  private lastReturned: number = -1;

  constructor(ls: ObservableList<VTableRow<E>>, shared: VTableSharedData<E>, index: number = 0) {
    this.ls = ls;
    this.shared = shared;
    this.cursor = index;
  }

  hasNext(): boolean {
    return this.cursor !== this.ls.size();
  }

  next(): E {
    const i = this.cursor;
    const next = this.ls.get(i);
    this.lastReturned = i;
    this.cursor = i + 1;
    return next.item;
  }

  hasPrevious(): boolean {
    return this.cursor !== 0;
  }

  previous(): E {
    const i = this.cursor - 1;
    const prev = this.ls.get(i);
    this.lastReturned = i;
    this.cursor = i;
    return prev.item;
  }

  nextIndex(): number {
    return this.cursor;
  }

  previousIndex(): number {
    return this.cursor - 1;
  }

  remove(): void {
    if (this.lastReturned < 0) {
      throw new Error('IllegalStateException: next() or previous() not called, or remove() already called');
    }
    this.ls.removeAt(this.lastReturned);
    if (this.lastReturned < this.cursor) {
      this.cursor--;
    }
    this.lastReturned = -1;
  }

  set(e: E): void {
    if (this.lastReturned < 0) {
      throw new Error('IllegalStateException: next() or previous() not called, or remove() already called');
    }
    this.ls.removeAt(this.lastReturned);
    this.ls.insert(this.lastReturned, new VTableRow<E>(e, this.shared));
  }

  add(e: E): void {
    const i = this.cursor;
    this.ls.insert(i, new VTableRow<E>(e, this.shared));
    this.cursor = i + 1;
    this.lastReturned = -1;
  }
}
