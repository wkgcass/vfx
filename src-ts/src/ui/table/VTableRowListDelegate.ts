import type { ObservableList } from '../../javafx/Parent.js';
import { VTableRow } from './VTableRow.js';
import { VTableRowIteratorDelegate } from './VTableRowIteratorDelegate.js';
import type { VTableSharedData } from './VTableSharedData.js';

export class VTableRowListDelegate<E> {
  private readonly ls: ObservableList<VTableRow<E>>;
  private readonly shared: VTableSharedData<E>;

  constructor(ls: ObservableList<VTableRow<E>>, shared: VTableSharedData<E>) {
    this.ls = ls;
    this.shared = shared;
  }

  size(): number {
    return this.ls.size();
  }

  isEmpty(): boolean {
    return this.ls.isEmpty();
  }

  contains(o: E): boolean {
    for (const e of this.ls) {
      if (Object.is(e.item, o)) return true;
    }
    return false;
  }

  iterator(): VTableRowIteratorDelegate<E> {
    return new VTableRowIteratorDelegate(this.ls, this.shared);
  }

  toArray(): E[] {
    const arr: E[] = [];
    for (const e of this.ls) arr.push(e.item);
    return arr;
  }

  add(e: E): boolean {
    this.ls.add(new VTableRow<E>(e, this.shared));
    return true;
  }

  remove(o: E): boolean {
    const index = this.indexOf(o);
    if (index === -1) {
      return false;
    }
    this.ls.removeAt(index);
    return true;
  }

  containsAll(c: E[]): boolean {
    const items: E[] = [];
    for (const e of this.ls) items.push(e.item);
    for (const o of c) {
      if (!items.includes(o)) return false;
    }
    return true;
  }

  addAll(c: E[]): boolean {
    const all: VTableRow<E>[] = [];
    for (const e of c) {
      all.push(new VTableRow<E>(e, this.shared));
    }
    this.ls.addAll(...all);
    return true;
  }

  addAllAt(index: number, c: E[]): boolean {
    const all: VTableRow<E>[] = [];
    for (const e of c) {
      all.push(new VTableRow<E>(e, this.shared));
    }
    for (let i = 0; i < all.length; i++) {
      this.ls.insert(index + i, all[i]!);
    }
    return true;
  }

  removeAll(c: E[]): boolean {
    const before = this.ls.size();
    const toRemove: VTableRow<E>[] = [];
    for (const e of this.ls) {
      if (c.includes(e.item)) toRemove.push(e);
    }
    for (const r of toRemove) this.ls.remove(r);
    return this.ls.size() !== before;
  }

  retainAll(c: E[]): boolean {
    const before = this.ls.size();
    const toRemove: VTableRow<E>[] = [];
    for (const e of this.ls) {
      if (!c.includes(e.item)) toRemove.push(e);
    }
    for (const r of toRemove) this.ls.remove(r);
    return this.ls.size() !== before;
  }

  clear(): void {
    this.ls.clear();
  }

  get(index: number): E {
    return this.ls.get(index).item;
  }

  set(index: number, element: E): E {
    const old = this.ls.get(index);
    this.ls.removeAt(index);
    this.ls.insert(index, new VTableRow<E>(element, this.shared));
    return old.item;
  }

  addAt(index: number, element: E): void {
    this.ls.insert(index, new VTableRow<E>(element, this.shared));
  }

  removeAt(index: number): E {
    return this.ls.removeAt(index)!.item;
  }

  indexOf(o: E): number {
    let i = 0;
    for (const e of this.ls) {
      if (Object.is(e.item, o)) return i;
      i++;
    }
    return -1;
  }

  lastIndexOf(o: E): number {
    for (let i = this.ls.size() - 1; i >= 0; i--) {
      const e = this.ls.get(i);
      if (Object.is(e.item, o)) return i;
    }
    return -1;
  }

  listIterator(): VTableRowIteratorDelegate<E> {
    return new VTableRowIteratorDelegate(this.ls, this.shared);
  }

  listIteratorAt(index: number): VTableRowIteratorDelegate<E> {
    return new VTableRowIteratorDelegate(this.ls, this.shared, index);
  }

  subList(fromIndex: number, toIndex: number): E[] {
    const out: E[] = [];
    for (let i = fromIndex; i < toIndex; i++) {
      out.push(this.ls.get(i).item);
    }
    return out;
  }
}
