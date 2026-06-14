import { Logger } from './Logger.js';

export abstract class Callback<T, E extends Error = Error> {
  private called = false;

  protected abstract onSucceeded(value: T | null): void;
  protected abstract onFailed(err: E): void;
  protected doFinally(): void {}

  isCalled(): boolean {
    return this.called;
  }

  succeeded(): void;
  succeeded(value: T): void;
  succeeded(value?: T): void {
    if (this.called) {
      Logger.error(
        'IMPROPER_USE',
        'callback already called',
        new Error(`already called when getting result ${value}`),
      );
      return;
    }
    this.called = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.onSucceeded((value ?? null) as any);
    this.doFinally();
  }

  failed(err: E): void {
    if (this.called) {
      Logger.error(
        'IMPROPER_USE',
        'callback already called',
        new Error('already called when getting an exception'),
      );
      return;
    }
    this.called = true;
    this.onFailed(err);
    this.doFinally();
  }

  finish(err: E | null): void;
  finish(err: E | null, value: T | null): void;
  finish(err: E | null, value?: T | null): void {
    if (err !== null) {
      this.failed(err);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.succeeded((value ?? null) as any);
    }
  }

  static ofFunction<T, E extends Error = Error>(
    cb: (err: E | null, value: T | null) => void,
  ): Callback<T, E> {
    return new (class extends Callback<T, E> {
      protected onSucceeded(value: T | null): void {
        cb(null, value);
      }
      protected onFailed(err: E): void {
        cb(err, null);
      }
    })();
  }

  static ofIgnoreExceptionFunction<T, E extends Error = Error>(
    cb: (value: T | null) => void,
  ): Callback<T, E> {
    return new (class extends Callback<T, E> {
      protected onSucceeded(value: T | null): void {
        cb(value);
      }
      protected onFailed(_err: E): void { }
    })();
  }
}
