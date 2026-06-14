import { LoadingItem } from './LoadingItem.js';

export class LoadingFailure extends Error {
  readonly failedItem: LoadingItem | null;

  constructor(failedItem: LoadingItem | null, cause: unknown);
  constructor(msg: string);
  constructor(failedItemOrMsg: LoadingItem | null | string, cause?: unknown) {
    if (typeof failedItemOrMsg === 'string') {
      super(failedItemOrMsg);
      this.failedItem = null;
    } else {
      super(cause instanceof Error ? cause.message : String(cause));
      if (cause instanceof Error) {
        this.cause = cause;
      }
      this.failedItem = failedItemOrMsg;
    }
    this.name = 'LoadingFailure';
  }
}
