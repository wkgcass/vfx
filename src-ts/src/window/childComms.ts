import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { EV_CHILD_MSG, EV_RESULT } from './events.js';

/** Swallow the "window not found" race during teardown — the window is
 *  going away anyway and any in-flight IPC may arrive after Rust has
 *  dropped the window from its map. */
function swallowTeardownError(p: Promise<unknown>): void {
  void p.catch(() => { /* ignore — window is tearing down */ });
}

export async function childEmitResult(specId: string, value: unknown): Promise<void> {
  await emit(EV_RESULT, { specId, value });
  swallowTeardownError(getCurrentWindow().close());
}

/**
 * Emit a custom named event from the child to the parent. The parent listens
 * via `WindowHandle.on(name, cb)` (or `onChildCustom` on the child side for
 * parent→child traffic). Payload must be structured-cloneable.
 *
 * `specId` identifies which child window emitted the event so that the parent
 * can route it to the correct `WindowHandle` when multiple children are open.
 */
export async function childEmitCustom(specId: string, name: string, payload: unknown = null): Promise<void> {
  await emit(EV_CHILD_MSG, { specId, name, payload }).catch(() => { /* window may be tearing down */ });
}

export async function onChildCustom(
  specId: string,
  name: string,
  cb: (payload: unknown) => void,
): Promise<UnlistenFn> {
  return listen(EV_CHILD_MSG, (e) => {
    const p = e.payload as { specId: string; name: string; payload: unknown } | null;
    if (!p || p.specId !== specId || p.name !== name) return;
    cb(p.payload);
  });
}

