import type { LogHandler } from './LogHandler.js';
import type { LogRecord } from './LogRecord.js';

export class LogDispatcher {
  private handlers = new Set<LogHandler>();

  addLogHandler(h: LogHandler): void {
    this.handlers.add(h);
  }

  removeLogHandler(h: LogHandler): void {
    this.handlers.delete(h);
  }

  publish(record: LogRecord): void {
    for (const h of this.handlers) {
      try {
        h.publish(record);
      } catch (e) {
        console.error('log handler threw', e);
      }
    }
  }
}
