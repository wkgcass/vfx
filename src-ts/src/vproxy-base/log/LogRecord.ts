import { LogLevel } from './LogLevel.js';
import type { LogType } from '../LogType.js';

export class LogRecord {
  constructor(
    public timestamp: number,
    public level: LogLevel,
    public logType: LogType,
    public message: string,
    public cause?: unknown,
    public callerClass?: string,
    public callerMethod?: string,
    public callerLine?: number,
  ) {}

  toStringNoColor(): string {
    const ts = new Date(this.timestamp).toISOString();
    const caller = this.callerClass && this.callerMethod
      ? `${this.callerClass}#${this.callerMethod}${this.callerLine !== undefined ? `(${this.callerLine})` : ''}`
      : '';
    const causeStr = this.cause instanceof Error ? `\n${this.cause.stack ?? this.cause.message}` : '';
    return `[${ts}][${this.level.toUpperCase()}] - ${caller} - ${this.logType} - ${this.message}${causeStr}`;
  }
}
