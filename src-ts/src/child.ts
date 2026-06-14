// Child window bootstrap. Loaded via dynamic import from index.ts when the
// current window's label is `child-<specId>`.

import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ImageManager } from './manager/image/ImageManager.js';
import { FontManager } from './manager/font/FontManager.js';
import { Theme } from './theme/Theme.js';
import { IntroTheme } from './intro/IntroTheme.js';
import { buildStage } from './window/factory.js';
import { childEmitResult } from './window/childComms.js';
import './window/factories/index.js'; // side-effect: registers all factories
import {
  EV_CLOSE,
  EV_READY,
  EV_READY_FOR_SPEC,
  EV_SPEC,
} from './window/events.js';
import type { StageSpec } from './window/StageSpec.js';
import { resetBodyStyles, showErrorOnPage, waitForFonts } from './bootstrap-utils.js';

export async function childBootstrap(specId: string): Promise<void> {
  try {
    resetBodyStyles();

    // Initialize theme + font provider — every factory constructs VStage
    // subclasses which read Theme.current() during construction, so this
    // must happen before buildStage(). Mirrors what mainIntro() does.
    Theme.setTheme(new IntroTheme());
    FontManager.get().setFontProvider(Theme.current().fontProvider());

    void ImageManager.get().preload();

    // waitForFonts with a hard timeout — in a fresh child webview the
    // document.fonts.ready promise has been observed to never resolve
    // (likely because no @font-face CSS has been registered yet, but the
    // browser still waits). Don't block bootstrap on it.
    await Promise.race([
      waitForFonts(),
      new Promise<void>((r) => setTimeout(r, 2000)),
    ]);

    const myLabel = getCurrentWindow().label;

    // Step 1: register the EV_SPEC listener AND await its registration so
    // we know Tauri has it in place before we ask the parent to send the
    // spec. Without this await, our emit(EV_READY_FOR_SPEC) could
    // round-trip faster than the listen registration and the parent's
    // emitTo(EV_SPEC) reply would be dropped.
    let resolveSpec!: (s: StageSpec) => void;
    const specPromise = new Promise<StageSpec>((r) => { resolveSpec = r; });
    let specReceived = false;
    const unlisten = await listen(EV_SPEC, (e) => {
      const p = e.payload as { specId: string; spec: StageSpec } | null;
      if (!p || p.specId !== specId || specReceived) return;
      specReceived = true;
      resolveSpec(p.spec);
    });

    void emit(EV_READY_FOR_SPEC, { specId, label: myLabel });

    let spec: StageSpec;
    try {
      spec = await Promise.race([
        specPromise,
        new Promise<never>((_, reject) => setTimeout(
          () => reject(new Error('EV_SPEC timeout (10s) — parent never sent spec')),
          10000,
        )),
      ]);
    } finally {
      try { unlisten(); } catch { /* ignore */ }
    }

    const ctx = {
      specId,
      emitResult: (v: unknown) => childEmitResult(specId, v),
    };
    await buildStage(spec, ctx);

    void emit(EV_READY, { specId, label: myLabel });

    // When the OS/window closes, notify the parent so it can clean up.
    // Swallow the "window not found" race: by the time the parent's
    // listener processes this, the webview may already be torn down.
    void getCurrentWindow().onCloseRequested(() => {
      emit(EV_CLOSE, { specId, label: myLabel }).catch(() => { /* ignore */ });
    });
  } catch (e) {
    const err = e as Error;
    const msg = `childBootstrap failed: ${err?.name ?? typeof e}: ${err?.message ?? String(e)}\n${err?.stack ?? ''}`;
    // eslint-disable-next-line no-console
    console.error(msg);
    showErrorOnPage(msg);
  }
}
