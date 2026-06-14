export class TaskManager {
  static readonly instance = new TaskManager();

  static get(): TaskManager { return TaskManager.instance; }

  private constructor() {}

  execute(r: () => void): void {
    // Use queueMicrotask for synchronous-finish tasks; for longer work
    // setTimeout(0) yields to the event loop. We pick setTimeout for parity
    // with ExecutorService semantics (runnable submitted, may not run inline).
    setTimeout(r, 0);
  }

  terminate(): void {
    // No-op in the DOM port; setTimeout tasks cannot be cancelled globally
    // without tracking their handles. vfx only calls terminate() on shutdown.
  }
}
