import { LogDispatcher } from './log/LogDispatcher.js';
import { LogLevel } from './log/LogLevel.js';
import { LogRecord } from './log/LogRecord.js';
import type { LogType } from './LogType.js';

export class Logger {
  static logDispatcher: LogDispatcher = new LogDispatcher();

  static lowLevelDebugOn: boolean = Boolean(
    (typeof globalThis !== 'undefined' &&
      (globalThis as { __VFX_DEBUG?: boolean }).__VFX_DEBUG) ?? false,
  );

  // Returns true so it can be used inside assert-like expressions.
  static lowLevelDebug(msg: string): boolean {
    if (this.lowLevelDebugOn) {
      console.debug('[low-level]', msg);
    }
    return true;
  }

  static trace(t: LogType, msg: string, ex?: unknown): void {
    this.publish(LogLevel.TRACE, t, msg, ex);
  }

  static info(t: LogType, msg: string, ex?: unknown): void {
    this.publish(LogLevel.INFO, t, msg, ex);
    console.info(`[${t}] ${msg}`, ex ?? '');
  }

  static warn(t: LogType, msg: string, ex?: unknown): void {
    this.publish(LogLevel.WARN, t, msg, ex);
    console.warn(`[${t}] ${msg}`, ex ?? '');
  }

  static error(t: LogType, msg: string, ex?: unknown): void {
    this.publish(LogLevel.ERROR, t, msg, ex);
    console.error(`[${t}] ${msg}`, ex ?? '');
  }

  static fatal(t: LogType, msg: string, ex?: unknown): void {
    this.publish(LogLevel.FATAL, t, msg, ex);
    console.error(`[FATAL][${t}] ${msg}`, ex ?? '');
  }

  static alert(msg: string): void {
    this.info('ALERT', msg);
  }

  static shouldNotHappen(msg: string, ex?: unknown): void {
    this.error('IMPROPER_USE', msg, ex);
  }

  private static publish(level: LogLevel, t: LogType, msg: string, ex?: unknown): void {
    let callerClass: string | undefined;
    let callerMethod: string | undefined;
    let callerLine: number | undefined;
    // Best-effort caller attribution via Error.stack.
    try {
      const frames = (new Error().stack ?? '').split('\n');
      // [0] = "Error", [1] = this publish(), [2] = trace/info/warn/..., [3] = caller
      const frame = frames[3];
      if (frame) {
        const m = frame.match(/\s+at (.+?) \((.+?):(\d+):\d+\)/);
        if (m) {
          callerMethod = m[1];
          callerClass = m[2];
          callerLine = parseInt(m[3], 10);
          if (Number.isNaN(callerLine)) callerLine = undefined;
        }
      }
    } catch {}
    this.logDispatcher.publish(
      new LogRecord(Date.now(), level, t, msg, ex, callerClass, callerMethod, callerLine),
    );
  }
}

export default Logger;
