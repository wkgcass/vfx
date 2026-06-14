// Entry point for the Tauri app.
//
// The same `index.html` is loaded by both the main window (declared in
// `tauri.conf.json`) and any child windows created at runtime via
// `WindowManager.open()`. We dispatch based on the current window's label:
//   - "main"          → mainBootstrap (intro demo)
//   - "child-<specId>" → childBootstrap(specId) via dynamic import

import { getCurrentWindow } from '@tauri-apps/api/window';
import { ImageManager } from './manager/image/ImageManager.js';
import { mainIntro } from './intro/IntroMain.js';
import { resetBodyStyles, showErrorOnPage, waitForFonts } from './bootstrap-utils.js';
import { Windows } from './window/WindowManager.js';

// Global error catch — any uncaught error in this window will be surfaced
// on the page so it's visible without devtools.
//
// "window not found" / "webview not found" are expected during teardown
// (Stage's onResized listener, pending outerPosition promises, etc. fire
// after Rust has dropped the window from its map). Demote them to debug
// so they don't trigger the visible error overlay.
function isTeardownNoise(msg: string): boolean {
  return /window not found|webview not found/i.test(msg);
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    const msg = `${e.message} @ ${e.filename}:${e.lineno}:${e.colno}`;
    if (isTeardownNoise(msg)) return;
    const full = `[vfx:window-error] ${msg}\n${e.error?.stack ?? ''}`;
    // eslint-disable-next-line no-console
    console.error(full);
    showErrorOnPage(full);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const err = e.reason as Error;
    const msg = err?.message ?? String(e.reason);
    if (isTeardownNoise(msg)) return;
    const full = `[vfx:unhandled-rejection] ${msg}\n${err?.stack ?? ''}`;
    // eslint-disable-next-line no-console
    console.error(full);
    showErrorOnPage(full);
  });
}

resetBodyStyles();

async function mainBootstrap(): Promise<void> {
  try {
    void ImageManager.get().preload();
    await waitForFonts();

    void getCurrentWindow().onCloseRequested(() => { void Windows.closeAll(); });

    await mainIntro();
  } catch (e) {
    const err = e as Error;
    const msg = `bootstrap failed: ${err?.name ?? typeof e}: ${err?.message ?? String(e)}\n${err?.stack ?? ''}`;
    // eslint-disable-next-line no-console
    console.error(msg);
    showErrorOnPage(msg);
  }
}

let label: string;
try {
  label = getCurrentWindow().label;
} catch (e) {
  showErrorOnPage(`getCurrentWindow failed: ${String(e)}`);
  throw e;
}

if (label.startsWith('child-')) {
  const specId = label.substring('child-'.length);
  void import('./child.js')
    .then(({ childBootstrap }) => { void childBootstrap(specId); })
    .catch((e) => {
      const err = e as Error;
      const msg = `failed to load child bootstrap: ${err?.message ?? String(e)}\n${err?.stack ?? ''}`;
      // eslint-disable-next-line no-console
      console.error(msg);
      showErrorOnPage(msg);
    });
} else {
  void mainBootstrap();
}
