export type ChangeListener<T> = (oldValue: T, newValue: T) => void;

export class Property<T> {
  private value: T;
  private listeners = new Set<ChangeListener<T>>();
  // When true, set() stores the new value without dispatching to listeners.
  // Used to freeze layout cascades during a resize drag: width/height keep
  // updating internally but no observer reflows until the gesture ends.
  suppressDispatch = false;

  constructor(initial: T) {
    this.value = initial;
  }

  get(): T {
    return this.value;
  }

  set(v: T): void {
    if (Object.is(v, this.value)) return;
    const old = this.value;
    this.value = v;
    if (this.suppressDispatch) return;
    for (const l of [...this.listeners]) {
      try {
        l(old, v);
      } catch (e) {
        console.error('Property listener threw:', e);
      }
    }
  }

  /**
   * Force-dispatch the current value to listeners even while
   * `suppressDispatch` is true (or when the value hasn't changed). Used after
   * a suppressed batch to replay the final state — listeners see a change
   * from the last value they were notified about to the current one.
   */
  flush(): void {
    const v = this.value;
    for (const l of [...this.listeners]) {
      try {
        l(v, v);
      } catch (e) {
        console.error('Property listener threw:', e);
      }
    }
  }

  addListener(l: ChangeListener<T>): void {
    this.listeners.add(l);
  }

  removeListener(l: ChangeListener<T>): void {
    this.listeners.delete(l);
  }

  onChange(fn: (newValue: T, oldValue: T) => void): (this: Property<T>) => void {
    const l: ChangeListener<T> = (o, n) => fn(n, o);
    this.addListener(l);
    return () => this.removeListener(l);
  }
}

export class ReadOnlyProperty<T> {
  constructor(private readonly backing: Property<T>) {}
  get(): T {
    return this.backing.get();
  }
  addListener(l: ChangeListener<T>): void {
    this.backing.addListener(l);
  }
  removeListener(l: ChangeListener<T>): void {
    this.backing.removeListener(l);
  }
}

export class DoubleProperty extends Property<number> {}
