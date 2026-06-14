import { Node } from './Node.js';

export type ListChangeListener<T> = (change: {
  added: T[];
  removed: T[];
  list: ObservableList<T>;
}) => void;

export class ObservableList<T> {
  private items: T[] = [];
  private listeners = new Set<ListChangeListener<T>>();

  constructor(private readonly owner?: { onChildrenChanged?(added: T[], removed: T[]): void }) {}

  get(i: number): T {
    return this.items[i]!;
  }
  size(): number {
    return this.items.length;
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  toArray(): T[] {
    return [...this.items];
  }
  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  add(item: T): void {
    this.items.push(item);
    this.fire([item], []);
  }
  addAll(...items: T[]): void {
    if (items.length === 0) return;
    this.items.push(...items);
    this.fire(items, []);
  }
  insert(index: number, item: T): void {
    this.items.splice(index, 0, item);
    this.fire([item], []);
  }
  remove(item: T): boolean {
    const i = this.items.indexOf(item);
    if (i < 0) return false;
    this.items.splice(i, 1);
    this.fire([], [item]);
    return true;
  }
  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) return undefined;
    const removed = this.items.splice(index, 1)[0];
    this.fire([], removed ? [removed] : []);
    return removed;
  }
  clear(): void {
    const removed = this.items;
    this.items = [];
    if (removed.length > 0) this.fire([], removed);
  }
  contains(item: T): boolean {
    return this.items.includes(item);
  }
  indexOf(item: T): number {
    return this.items.indexOf(item);
  }

  addListener(l: ListChangeListener<T>): void { this.listeners.add(l); }
  removeListener(l: ListChangeListener<T>): void { this.listeners.delete(l); }

  private fire(added: T[], removed: T[]): void {
    this.owner?.onChildrenChanged?.(added, removed);
    for (const l of [...this.listeners]) {
      try {
        l({ added, removed, list: this });
      } catch (e) {
        console.error('ObservableList listener threw:', e);
      }
    }
  }
}

export abstract class Parent extends Node {
  readonly children = new ObservableList<Node>({
    onChildrenChanged: (added, removed) => this._onChildrenChanged(added, removed),
  });

  protected readonly childrenAddable: boolean = true;

  getChildren(): ObservableList<Node> {
    if (!this.childrenAddable) {
      throw new Error(`${this.constructor.name} does not allow direct getChildren() access`);
    }
    return this.children;
  }

  getChildrenUnmodifiable(): Node[] {
    return this.children.toArray();
  }

  protected _onChildrenChanged(added: Node[], removed: Node[]): void {
    for (const r of removed) {
      if (r.el.parentElement === this.el) {
        this.el.removeChild(r.el);
      }
      r.parent = null;
      r.stopObservingSize();
    }
    for (const a of added) {
      if (a.parent !== null && a.parent instanceof Parent) {
        a.parent.children.remove(a);
      }
      a.parent = this;
      this.el.appendChild(a.el);
      a.observeSize();
    }
    this.requestLayout();
  }

  layoutChildren(): void {}

  requestLayout(): void {
    LayoutQueue.scheduleLayout(this);
  }

  paint(): void {
    super.paint();
    this.layoutChildren();
    for (const c of this.children) c.paint();
  }
}

class LayoutQueue {
  private static dirty = new Set<Parent>();
  private static scheduled = false;

  static scheduleLayout(p: Parent): void {
    this.dirty.add(p);
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.scheduled = false;
      const dirty = this.dirty;
      this.dirty = new Set();
      for (const p of dirty) {
        try {
          p.layoutChildren();
        } catch (e) {
          console.error('layoutChildren threw:', e);
        }
      }
    });
  }
}
