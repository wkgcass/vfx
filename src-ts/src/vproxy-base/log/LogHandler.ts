import type { LogRecord } from './LogRecord.js';

export interface LogHandler {
  publish(record: LogRecord): void;
}

export type LogHandlerFn = (record: LogRecord) => void;
