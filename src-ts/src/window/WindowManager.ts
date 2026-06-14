import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { Window as TauriWindow } from '@tauri-apps/api/window';
import { emitTo, listen } from '@tauri-apps/api/event';
import type { StageSpec } from './StageSpec.js';
import { WindowHandle } from './WindowHandle.js';
import { EV_READY, EV_READY_FOR_SPEC, EV_SPEC } from './events.js';

type WebviewWindowLike = WebviewWindow & TauriWindow;

/**
 * Parent-side singleton that spawns child webview windows and tracks them.
 * `initMainSide()` is called automatically by `open()`; it wires up the
 * spec-delivery and ready-signal listeners exactly once.
 *
 * Child→main flow:
 *   1. main: `open(spec)` stashes spec by specId, creates hidden WebviewWindow
 *   2. child: boots, registers factories, emits `EV_READY_FOR_SPEC` with its label
 *   3. main: receives `EV_READY_FOR_SPEC`, `emitTo(child, EV_SPEC, {specId, spec})`
 *   4. child: builds stage via factory, emits `EV_READY`
 *   5. main: receives `EV_READY`, `WebviewWindow.show()`, returns handle
 */
class WindowManager {
  private handles = new Map<string, WindowHandle>();
  private pendingSpecs = new Map<string, StageSpec>();
  private mainInitialized = false;

  initMainSide(): void {
    if (this.mainInitialized) return;
    this.mainInitialized = true;
    void listen(EV_READY_FOR_SPEC, (e) => {
      const p = e.payload as { specId: string; label: string } | null;
      if (!p) return;
      const spec = this.pendingSpecs.get(p.specId);
      if (!spec) return;
      this.pendingSpecs.delete(p.specId);
      void emitTo(p.label, EV_SPEC, { specId: p.specId, spec });
    });
    void listen(EV_READY, (e) => {
      const p = e.payload as { specId: string; label: string } | null;
      if (!p) return;
      const h = this.handles.get(p.label);
      if (!h || h.specId !== p.specId) return;
      h._markReady();
    });
  }

  async open(spec: StageSpec): Promise<WindowHandle> {
    this.initMainSide();
    const specId = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    // Embed the specId in the label so the child can identify itself via
    // getCurrentWindow().label — no URL query params needed (more robust
    // across Tauri versions and avoids any URL encoding edge cases).
    const label = `child-${specId}`;
    this.pendingSpecs.set(specId, spec);

    const wv = new WebviewWindow(label, {
      url: 'index.html',
      decorations: false,
      transparent: true,
      // Always non-resizable at the OS level: resizing is driven exclusively
      // by VStage's right-bottom handle (see VStage.resizeButton). Keeping the
      // OS borders non-resizable avoids "everything is resizable" and is also
      // required because startResizeDragging is a no-op on non-resizable
      // windows — VStage runs its own drag loop instead.
      resizable: false,
      shadow: true,
      visible: false,
      width: spec.width,
      height: spec.height,
      title: spec.title ?? 'VFX',
      center: true,
    }) as WebviewWindowLike;

    // Surface webview creation errors so they aren't swallowed silently.
    wv.once('tauri://error', (e: unknown) => {
      // eslint-disable-next-line no-console
      console.error(`[vfx:Windows] tauri://error on ${label}:`, e);
    });
    // Safety net: if the child never reports ready (e.g. factory crashed
    // during stage construction), at least show the window so the error
    // surfaced via showErrorOnPage is visible instead of an invisible hang.
    const showFallback = setTimeout(() => {
      void wv.show().catch(() => { /* ignore */ });
    }, 5000);

    const handle = new WindowHandle(label, specId, spec, wv, () => {
      clearTimeout(showFallback);
      this.handles.delete(label);
    });
    this.handles.set(label, handle);

    try {
      await handle.ready;
      clearTimeout(showFallback);
      await wv.show();
    } catch (e) {
      clearTimeout(showFallback);
      this.handles.delete(label);
      throw e;
    }
    return handle;
  }

  /** Close every open child. Used when the main window is closing. */
  async closeAll(): Promise<void[]> {
    const ps: Promise<void>[] = [];
    for (const h of this.handles.values()) {
      ps.push(h.close().catch(() => { /* ignore */ }));
    }
    this.handles.clear();
    return Promise.all(ps);
  }
}

export const Windows = new WindowManager();
