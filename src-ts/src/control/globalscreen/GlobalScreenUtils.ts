import { Logger } from '../../vproxy-base/Logger.js';

let warned = false;
function warnOnce(): void {
  if (warned) return;
  warned = true;
  Logger.warn('SYS_ERROR', 'GlobalScreenUtils: jnativehook is not available in the DOM port; global key/mouse hooks are stubbed');
}

export class GlobalScreenUtils {
  static releaseJNativeHookNativeToLibraryPath(_input?: unknown): void {
    warnOnce();
  }

  private static readonly enableKeys = new Map<object, number>();

  static enable(key: object): void {
    warnOnce();
    const n = (GlobalScreenUtils.enableKeys.get(key) ?? 0) + 1;
    GlobalScreenUtils.enableKeys.set(key, n);
  }

  static disable(key: object): void {
    const n = GlobalScreenUtils.enableKeys.get(key);
    if (n === undefined) {
      Logger.error('IMPROPER_USE', `GlobalScreenUtils.disable called with ${String(key)}, but it was never enabled`);
      return;
    }
    if (n <= 1) {
      GlobalScreenUtils.enableKeys.delete(key);
    } else {
      GlobalScreenUtils.enableKeys.set(key, n - 1);
    }
  }

  static unregister(): void {
  }
}
