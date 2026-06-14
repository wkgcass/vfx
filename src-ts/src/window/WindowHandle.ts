import type { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { Window as TauriWindow } from '@tauri-apps/api/window';
import { emitTo, listen, type UnlistenFn } from '@tauri-apps/api/event';
import { EV_CLOSE, EV_CHILD_MSG, EV_RESULT } from './events.js';

/**
 * Combined type. WebviewWindow at runtime has all Window methods, but the
 * type defs in @tauri-apps/api 2.x declare the class separately from the
 * `interface WebviewWindow extends Webview, Window` — so we intersect here
 * to access them statically.
 */
type WebviewWindowLike = WebviewWindow & TauriWindow;

/**
 * Handle returned by `WindowManager.open()`. Lives in the parent window's
 * JS context and communicates with the child via Tauri events.
 *
 * Lifecycle:
 *  - `result()` resolves with the child's emitted result, or null if the
 *    child closed without emitting one.
 *  - `closed` resolves when the child window closes (any reason).
 *  - `emit(name, payload)` / `on(name, cb)` are escape-hatch channels for
 *    factories that need ongoing parent↔child traffic (e.g. LoadingStage).
 */
export class WindowHandle {
  private unlisteners: UnlistenFn[] = [];
  private resultResolvers: Array<(v: unknown) => void> = [];
  private resultResolved = false;
  private resultValue: unknown = null;
  private cleaned = false;

  private _closedResolve!: () => void;
  readonly closed: Promise<void> = new Promise((r) => { this._closedResolve = r; });

  private readyResolve!: () => void;
  readonly ready: Promise<void> = new Promise((r) => { this.readyResolve = r; });

  constructor(
    public readonly label: string,
    public readonly specId: string,
    public readonly spec: unknown,
    private readonly wv: WebviewWindowLike,
    /** Invoked once by cleanup() so the WindowManager can drop its handle entry. */
    private readonly onCleanup: () => void,
  ) {
    // Capture all unlisten functions so cleanup() can revoke them. Otherwise
    // each open child would leak a pair of global listeners for the parent
    // window's lifetime.
    void listen(EV_RESULT, (e) => {
      const p = e.payload as { specId: string; value: unknown } | null;
      if (!p || p.specId !== this.specId) return;
      this.resultValue = p.value;
      this.resultResolved = true;
      for (const r of this.resultResolvers) r(p.value);
      this.resultResolvers = [];
    }).then((un) => { this.unlisteners.push(un); });
    void listen(EV_CLOSE, (e) => {
      const p = e.payload as { specId: string } | null;
      if (!p || p.specId !== this.specId) return;
      this.cleanup();
    }).then((un) => { this.unlisteners.push(un); });
    // Native close (OS X button, alt+F4, …) — also cleanup.
    void this.wv.onCloseRequested(() => { this.cleanup(); }).then((un) => {
      this.unlisteners.push(un as UnlistenFn);
    });
  }

  /** Internal: WindowManager marks the child as ready (DOM mounted). */
  _markReady(): void { this.readyResolve(); }

  result<T = unknown>(): Promise<T | null> {
    if (this.resultResolved) return Promise.resolve(this.resultValue as T | null);
    return new Promise<T | null>((r) => { this.resultResolvers.push((v) => r(v as T | null)); });
  }

  emit(name: string, payload?: unknown): Promise<void> {
    return emitTo(this.label, EV_CHILD_MSG, { specId: this.specId, name, payload });
  }

  async on(name: string, cb: (payload: unknown) => void): Promise<UnlistenFn> {
    const un = await listen(EV_CHILD_MSG, (e) => {
      const p = e.payload as { specId: string; name: string; payload: unknown } | null;
      if (!p || p.specId !== this.specId || p.name !== name) return;
      cb(p.payload);
    });
    this.unlisteners.push(un);
    return un;
  }

  close(): Promise<void> {
    return this.wv.close().catch(() => { /* window may already be closed */ });
  }

  private cleanup(): void {
    if (this.cleaned) return;
    this.cleaned = true;
    for (const u of this.unlisteners) { try { u(); } catch { /* ignore */ } }
    this.unlisteners = [];
    if (!this.resultResolved) {
      this.resultResolved = true;
      this.resultValue = null;
      for (const r of this.resultResolvers) r(null);
      this.resultResolvers = [];
    }
    this._closedResolve();
    try { this.onCleanup(); } catch { /* ignore */ }
  }
}
