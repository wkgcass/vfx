import { getCurrentWindow } from '@tauri-apps/api/window';
import type { LogicalSize, LogicalPosition } from '@tauri-apps/api/window';
import { Color } from './color.js';
import { Property } from './Property.js';

export type StageStyle = 'DECORATED' | 'TRANSPARENT' | 'UNDECORATED' | 'UTILITY';

export class Stage {
  readonly tauriWindow = getCurrentWindow();
  readonly widthProperty = new Property<number>(0);
  readonly heightProperty = new Property<number>(0);
  readonly xProperty = new Property<number>(0);
  readonly yProperty = new Property<number>(0);
  private _title: string = '';
  private _style: StageStyle = 'DECORATED';
  private _width = 0;
  private _height = 0;
  private _x = 0;
  private _y = 0;
  private _opacity = 1;
  private _alwaysOnTop = false;
  private _resizable = true;
  // When true, widthProperty/heightProperty updates are absorbed silently
  // (the value is stored but listeners are NOT dispatched) so the entire
  // observe-width/height layout cascade is frozen. Used while the user drags
  // the resize handle: the OS window resizes every frame but the UI only
  // reflows once, when the gesture ends. setResizing(false) replays the final
  // size to listeners so content snaps to the new dimensions in one pass.
  private _layoutPaused = false;

  onCloseRequestedHandlers = new Set<(e: { consume(): void }) => void>();

  constructor() {
    // Use the DOM's window.innerWidth/innerHeight as the source of truth for
    // the visible webview area. Tauri's outerSize() can include OS-level
    // shadow/resize margins that extend past the actually-renderable CSS
    // pixel area, leading to content positioned past the visible edge.
    const readDomSize = (): void => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 0;
      const h = typeof window !== 'undefined' ? window.innerHeight : 0;
      if (w <= 0 || h <= 0) return;
      this._width = w;
      this._height = h;
      if (Math.abs(w - this.widthProperty.get()) > 0.001) {
        this.widthProperty.set(w);
      }
      if (Math.abs(h - this.heightProperty.get()) > 0.001) {
        this.heightProperty.set(h);
      }
    };
    // Defer the initial read so consumers that add listeners in their own
    // constructors (e.g. VStage, constructed immediately after Stage) have
    // a chance to register before the initial widthProperty/heightProperty
    // fire. The microtask runs after the current synchronous construction
    // chain (Stage + VStage + ...) completes.
    queueMicrotask(readDomSize);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', readDomSize);
      // ResizeObserver on documentElement catches the initial layout pass
      // (which 'resize' may miss) and any DPI/scale changes.
      //
      // The callback MUST defer readDomSize via requestAnimationFrame (not
      // queueMicrotask). Calling it synchronously inside the RO delivery
      // phase updates widthProperty/heightProperty, which fires VStage's
      // listener, which calls `rootContainer.setPrefWidth/Height(...)` — a
      // synchronous CSS mutation that the browser immediately sees as a
      // new documentElement size change, queues another RO observation in
      // the same iteration, and trips the "ResizeObserver loop completed
      // with undelivered notifications" warning. queueMicrotask runs
      // between RO callbacks (still inside RO processing in Chrome), so
      // it isn't enough — rAF is the smallest hammer that's provably
      // outside the RO delivery phase. Mutations made here land in the
      // NEXT frame's RO gather pass.
      try {
        const ro = new ResizeObserver(() => { requestAnimationFrame(readDomSize); });
        ro.observe(document.documentElement);
      } catch { /* ResizeObserver unavailable */ }
    }
    // Tauri's onResized covers maximize/unmaximize which the DOM 'resize'
    // event sometimes doesn't fire on.
    this.tauriWindow.onResized(() => {
      readDomSize();
      void this.tauriWindow.outerPosition().then((p) => {
        this._x = p.x;
        this._y = p.y;
        this.xProperty.set(p.x);
        this.yProperty.set(p.y);
      });
    });

    void this.tauriWindow.outerPosition().then((p) => {
      this._x = p.x;
      this._y = p.y;
      this.xProperty.set(p.x);
      this.yProperty.set(p.y);
    });
  }

  initStyle(style: StageStyle): void {
    this._style = style;
  }

  setTitle(t: string): Promise<void> {
    this._title = t;
    return this.tauriWindow.setTitle(t);
  }
  getTitle(): string { return this._title; }

  /**
   * Tracks whether a setSize dispatch is already queued for the current
   * microtask. Batching is needed because callers (e.g. LoadingStage,
   * ThemeAlertBase) frequently call setWidth and setHeight back-to-back
   * during construction — before the Stage constructor's queueMicrotask
   * has had a chance to populate `_width`/`_height` from the actual DOM
   * size. Without batching, setWidth(w) would immediately dispatch
   * setSize(w, 0), shrinking the OS window to height 0 before the
   * layout has a chance to settle — which then traps the alert/loading
   * window in a tiny-height feedback loop.
   *
   * The microtask defers the dispatch until both dimensions are known
   * (positive) and coalesces adjacent setWidth/setHeight calls into one
   * IPC round-trip.
   */
  private sizeDispatchScheduled = false;
  private lastDispatchedW = -1;
  private lastDispatchedH = -1;
  private scheduleSizeDispatch(): void {
    if (this.sizeDispatchScheduled) return;
    this.sizeDispatchScheduled = true;
    queueMicrotask(() => {
      this.sizeDispatchScheduled = false;
      if (this._width > 0 && this._height > 0) {
        // Tauri's webview fires onResized (and the DOM window resize
        // event) even when `setSize` is called with the same values the
        // OS window already has. That resize event feeds back into
        // `readDomSize` → widthProperty/heightProperty updates → height
        // listeners in ThemeAlertBase / LoadingStage → setHeight → right
        // back here. Without this last-dispatched guard the loop is
        // self-sustaining and Chrome flags it as "ResizeObserver loop
        // completed with undelivered notifications" once it spans a
        // couple of frames. Skipping the IPC when values haven't changed
        // breaks the feedback path.
        if (
          Math.abs(this._width - this.lastDispatchedW) < 0.5 &&
          Math.abs(this._height - this.lastDispatchedH) < 0.5
        ) {
          return;
        }
        this.lastDispatchedW = this._width;
        this.lastDispatchedH = this._height;
        void this.tauriWindow.setSize({
          type: 'Logical',
          width: this._width,
          height: this._height,
        } as LogicalSize);
      }
    });
  }

  setWidth(w: number): Promise<void> {
    // Skip no-op updates so a spurious OS onResized for the same size
    // can't re-fire widthProperty listeners and chain back into setWidth.
    if (Math.abs(w - this._width) < 0.5) return Promise.resolve();
    this._width = w;
    this.widthProperty.set(w);
    this.scheduleSizeDispatch();
    return Promise.resolve();
  }
  setHeight(h: number): Promise<void> {
    if (Math.abs(h - this._height) < 0.5) return Promise.resolve();
    this._height = h;
    this.heightProperty.set(h);
    this.scheduleSizeDispatch();
    return Promise.resolve();
  }
  getWidth(): number { return this._width; }
  getHeight(): number { return this._height; }

  setX(x: number): Promise<void> {
    this._x = x;
    this.xProperty.set(x);
    return this.tauriWindow.setPosition({ type: 'Logical', x, y: this._y } as LogicalPosition);
  }
  setY(y: number): Promise<void> {
    this._y = y;
    this.yProperty.set(y);
    return this.tauriWindow.setPosition({ type: 'Logical', x: this._x, y } as LogicalPosition);
  }
  getX(): number { return this._x; }
  getY(): number { return this._y; }

  setOpacity(o: number): Promise<void> {
    this._opacity = o;
    // Tauri v2: setOpacity may or may not be exposed depending on platform.
    const w = this.tauriWindow as unknown as { setOpacity?: (v: number) => Promise<void> };
    if (typeof w.setOpacity === 'function') {
      return w.setOpacity(o);
    }
    return Promise.resolve();
  }

  setAlwaysOnTop(v: boolean): Promise<void> {
    this._alwaysOnTop = v;
    return this.tauriWindow.setAlwaysOnTop(v);
  }
  isAlwaysOnTop(): boolean { return this._alwaysOnTop; }

  setResizable(v: boolean): void { this._resizable = v; }
  isResizable(): boolean { return this._resizable; }

  /**
   * Toggle layout-freeze mode. While `resizing` is true, widthProperty/
   * heightProperty still track the real window size but don't dispatch to
   * listeners — so the whole observe-width/height reflow cascade is paused
   * and content stays visually frozen during a resize drag. Setting it back
   * to false flushes the final size to listeners so the UI reflows exactly
   * once, snapping to the new dimensions.
   */
  setResizing(resizing: boolean): void {
    if (this._layoutPaused === resizing) return;
    this._layoutPaused = resizing;
    this.widthProperty.suppressDispatch = resizing;
    this.heightProperty.suppressDispatch = resizing;
    if (!resizing) {
      this.widthProperty.flush();
      this.heightProperty.flush();
    }
  }

  setMaximized(v: boolean): Promise<void> {
    return v ? this.tauriWindow.maximize() : this.tauriWindow.unmaximize();
  }
  isMaximized(): Promise<boolean> {
    return this.tauriWindow.isMaximized();
  }

  setIconified(v: boolean): Promise<void> {
    if (v) return this.tauriWindow.minimize();
    return Promise.resolve();
  }

  setIconifiedFallback(): Promise<void> {
    return this.tauriWindow.setFocus();
  }

  close(): Promise<void> {
    return this.tauriWindow.close();
  }

  show(): Promise<void> {
    return this.tauriWindow.show();
  }

  async showAndWait(): Promise<void> {
    await this.show();
  }

  centerOnScreen(): Promise<void> {
    return this.tauriWindow.center();
  }

  toFront(): Promise<void> { return this.tauriWindow.setFocus(); }
  toBack(): Promise<void> {
    return Promise.resolve();
  }
}

export { Color };
