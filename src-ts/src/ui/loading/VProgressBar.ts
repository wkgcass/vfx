import { Group } from '../../javafx/Pane.js';
import { DoubleProperty } from '../../javafx/Property.js';
import { VLine } from '../shapes/VLine.js';
import { Theme } from '../../theme/Theme.js';
import { TaskManager } from '../../manager/task/TaskManager.js';
import { FXUtils } from '../../util/FXUtils.js';
import { MiscUtils } from '../../util/MiscUtils.js';
import { Callback } from '../../vproxy-base/Callback.js';
import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';
import { LoadingItem } from './LoadingItem.js';
import { LoadingFailure } from './LoadingFailure.js';

export class VProgressBar extends Group {
  private static readonly radius = 1;
  private static readonly width = VProgressBar.radius * 2;

  private length = 0;
  private progress = 0;
  private readonly backgroundLine: VLine = new VLine(VProgressBar.width);
  private readonly progressLine: VLine = new VLine(VProgressBar.width);

  private readonly progressProperty: DoubleProperty = new DoubleProperty(0);

  private items: LoadingItem[] = [];
  private interval = 0;
  private cb: Callback<void, LoadingFailure> | null = null;
  private isDone = false;
  private currentLoadingItemCallback: ((item: LoadingItem) => void) | null = null;

  constructor() {
    super();
    this.getChildren().addAll(this.backgroundLine, this.progressLine);
    this.backgroundLine.setStartX(VProgressBar.radius);
    this.backgroundLine.setStroke(Theme.current().progressBarBackgroundColor());

    this.progressLine.setStartX(VProgressBar.radius);
    this.progressLine.setStroke(Theme.current().progressBarProgressColor());

    this.progressProperty.addListener((_old, now) => {
      this.setProgress(now);
    });
  }

  getLength(): number {
    return this.length;
  }

  setLength(length: number): void {
    this.length = length;
    this.backgroundLine.setEndX(length - VProgressBar.radius);
    this.updateProgressLine();
  }

  progressPropertyProperty(): DoubleProperty {
    return this.progressProperty;
  }

  getProgress(): number {
    return this.progress;
  }

  setProgress(progress: number): void {
    if (progress < 0) {
      progress = 0;
    } else if (progress > 1) {
      progress = 1;
    }
    this.progress = progress;
    // Re-entry: this will fire the listener, which calls setProgress(now).
    // Since the clamped value equals what the listener received, Object.is
    // short-circuits and the call stabilizes.
    this.progressProperty.set(progress);
    this.updateProgressLine();
  }

  private updateProgressLine(): void {
    const l = this.length * this.progress;
    this.progressLine.setEndX(l - VProgressBar.radius);
  }

  setCurrentLoadingItemCallback(cb: (item: LoadingItem) => void): void {
    this.currentLoadingItemCallback = cb;
  }

  setItems(items: LoadingItem[]): void {
    this.items = items;
  }

  setInterval(interval: number): void {
    this.interval = interval;
  }

  load(cb: Callback<void, LoadingFailure>): void {
    this.cb = cb;

    let total = 0;
    for (const item of this.items) {
      total += item.weight;
    }
    this.loadItem(total, 0, 0, () => {
      FXUtils.runOnFX(() => {
        this.isDone = true;
        FXUtils.runOnFX(() => {
          FXUtils.runOnFX(() => cb.succeeded());
        });
      });
    });
  }

  private loadItem(
    total: number,
    current: number,
    index: number,
    finalCb: () => void,
  ): void {
    if (index >= this.items.length) {
      finalCb();
      return;
    }
    if (this.isDone) {
      return;
    }
    const item = this.items[index]!;
    FXUtils.runOnFX(() => {
      const currentCB = this.currentLoadingItemCallback;
      if (currentCB !== null) {
        currentCB(item);
      }
    });
    TaskManager.get().execute(async () => {
      let ok: boolean;
      let loadingException: unknown;
      try {
        ok = item.loadFunc();
        loadingException = null as unknown;
      } catch (e) {
        loadingException = e;
        ok = false;
      }
      if (ok) {
        if (this.interval > 0) {
          await MiscUtils.threadSleep(this.interval);
        }
      }
      FXUtils.runOnFX(() => {
        if (!ok) {
          this.isDone = true;
          const cb = this.cb!;
          const ex = loadingException;
          FXUtils.runOnFX(() => {
            cb.failed(new LoadingFailure(item, ex));
          });
          return;
        }
        const newCurr = current + item.weight;
        this.setProgress(newCurr / total);
        this.loadItem(total, newCurr, index + 1, finalCb);
      });
    });
  }

  terminate(): boolean {
    if (this.isDone) {
      return false;
    }
    this.isDone = true;
    const cb = this.cb!;
    FXUtils.runOnFX(() => {
      cb.failed(new LoadingFailure(InternalI18n.get().loadingCanceled()));
    });
    return true;
  }
}
