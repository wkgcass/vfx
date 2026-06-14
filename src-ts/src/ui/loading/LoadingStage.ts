import { VStage } from '../stage/VStage.js';
import { VStageInitParams } from '../stage/VStageInitParams.js';
import { HBox } from '../../javafx/HBox.js';
import { VBox } from '../../javafx/VBox.js';
import { HPadding } from '../layout/HPadding.js';
import { VPadding } from '../layout/VPadding.js';
import { Callback } from '../../vproxy-base/Callback.js';
import { LoadingItem } from './LoadingItem.js';
import { LoadingFailure } from './LoadingFailure.js';
import { LoadingPane } from './LoadingPane.js';
import { Windows } from '../../window/WindowManager.js';
import type { WindowHandle } from '../../window/WindowHandle.js';
import { MiscUtils } from '../../util/MiscUtils.js';
import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';

export class LoadingStage extends VStage {
  protected readonly loadingPane: LoadingPane;

  constructor(title: string) {
    super(new VStageInitParams()
      .setIconifyButton(false)
      .setMaximizeAndResetButton(false)
      .setResizable(false));

    this.loadingPane = new LoadingPane(title);

    this.setTitle(title);
    void this.getStage().setWidth(670);
    void this.getStage().setHeight(120);

    const pane = this.getInitialScene().getContentPane();
    pane.getChildren().add(new HBox(
      new HPadding(10),
      new VBox(
        new VPadding(15),
        this.loadingPane,
      ),
    ));
    this.loadingPane.setLength(640);
  }

  override close(): Promise<void> {
    const p = super.close();
    this.terminate();
    return p;
  }

  setItems(items: LoadingItem[]): void {
    this.loadingPane.getProgressBar().setItems(items);
  }

  setInterval(interval: number): void {
    this.loadingPane.getProgressBar().setInterval(interval);
  }

  setProgress(ratio: number): void {
    this.loadingPane.getProgressBar().setProgress(ratio);
  }

  setCurrentItemName(name: string): void {
    this.loadingPane.setCurrentItemName(name);
  }

  load(cb: Callback<void, LoadingFailure>): void {
    void this.show();
    // Capture the enclosing LoadingStage so doFinally can close it.
    // (Inside the anonymous subclass methods, `this` would refer to the
    // Callback instance, so we close over the outer reference explicitly.)
    const self = this;
    this.loadingPane.getProgressBar().load(
      new (class extends Callback<void, LoadingFailure> {
        protected onSucceeded(_value: void | null): void {
          cb.succeeded();
        }
        protected onFailed(failure: LoadingFailure): void {
          cb.failed(failure);
        }
        protected doFinally(): void {
          void self.close();
        }
      })(),
    );
  }

  terminate(): void {
    this.loadingPane.getProgressBar().terminate();
  }

  /**
   * Open a LoadingStage in a new OS window. The returned handle drives the
   * actual loading loop (item.loadFunc closures cannot cross webview
   * boundaries) and emits progress events to the child for display.
   */
  static async open(title: string): Promise<LoadingStageHandle> {
    const handle = await Windows.open({
      kind: 'loading',
      title,
      width: 670,
      height: 120,
      params: { title },
    });
    return new LoadingStageHandle(handle);
  }
}

export class LoadingStageHandle {
  private items: LoadingItem[] = [];
  private interval = 0;

  constructor(private readonly handle: WindowHandle) {}

  async setItems(items: LoadingItem[]): Promise<void> {
    this.items = items;
    await this.handle.emit('set-items', items.map((i) => ({ name: i.name, weight: i.weight })));
  }

  async setInterval(ms: number): Promise<void> {
    this.interval = ms;
    await this.handle.emit('set-interval', ms);
  }

  /**
   * Run the loading loop. Each item's `loadFunc` runs in this (parent)
   * context; progress events drive the child's progress bar. The callback
   * is invoked exactly once on completion (success or failure).
   *
   * If the child window is closed (its close button clicked) before loading
   * finishes, the load is canceled and `cb.failed(loadingCanceled)` is fired —
   * matching the Java `LoadingStage` where closing the window terminates the
   * progress bar and surfaces a "loading process canceled" failure.
   *
   * Note: unlike the legacy single-window `LoadingStage.load`, this does
   * NOT close the window on completion — the caller decides (typically
   * `await handle.close()` in `doFinally`).
   */
  async load(cb: Callback<void, LoadingFailure>): Promise<void> {
    let total = 0;
    for (const item of this.items) total += item.weight;

    // Race the load loop against a user-initiated cancel. The child emits
    // 'canceled' (via onChildCustom) when its close button is clicked; if the
    // window is destroyed by other means, `handle.closed` also resolves.
    let canceled = false;
    const cancelUnlisten = await this.handle.on('canceled', () => { canceled = true; });
    const onClosed = (): void => { canceled = true; };
    void this.handle.closed.then(onClosed);

    try {
      let current = 0;
      for (const item of this.items) {
        if (canceled) {
          cb.failed(new LoadingFailure(InternalI18n.get().loadingCanceled()));
          return;
        }
        await this.handle.emit('current-item', item.name);
        // Re-check after every await — the child may have closed during the
        // emit round-trip, and without this check the loop would process one
        // more item before noticing.
        if (canceled) {
          cb.failed(new LoadingFailure(InternalI18n.get().loadingCanceled()));
          return;
        }
        let ok = false;
        let ex: unknown = null;
        try {
          ok = item.loadFunc();
        } catch (e) {
          ex = e;
        }
        if (!ok) {
          cb.failed(new LoadingFailure(item, ex));
          return;
        }
        current += item.weight;
        await this.handle.emit('progress', current / total);
        if (canceled) {
          cb.failed(new LoadingFailure(InternalI18n.get().loadingCanceled()));
          return;
        }
        if (this.interval > 0) {
          await MiscUtils.threadSleep(this.interval);
        }
      }
      // Final check before declaring success. The cancel event or
      // `handle.closed` may have resolved during the last iteration's sleep.
      if (canceled) {
        cb.failed(new LoadingFailure(InternalI18n.get().loadingCanceled()));
        return;
      }
      cb.succeeded();
    } finally {
      cancelUnlisten();
    }
  }

  close(): Promise<void> {
    return this.handle.close();
  }
}
