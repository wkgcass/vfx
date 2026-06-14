import { Pane } from '../../javafx/Pane.js';
import { Parent } from '../../javafx/Parent.js';
import { VBox } from '../../javafx/VBox.js';
import { VScrollPane } from '../../control/scroll/VScrollPane.js';
import { ScrollDirection } from '../../control/scroll/ScrollDirection.js';
import { ClickableFusionPane } from '../../ui/pane/ClickableFusionPane.js';
import { FusionPane } from '../../ui/pane/FusionPane.js';
import { ThemeLabel } from '../../ui/wrapper/ThemeLabel.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FXUtils } from '../../util/FXUtils.js';
import { Logger } from '../../vproxy-base/Logger.js';
import { LogDispatcher } from '../../vproxy-base/log/LogDispatcher.js';
import type { LogHandler } from '../../vproxy-base/log/LogHandler.js';
import { LogRecord } from '../../vproxy-base/log/LogRecord.js';

export class LogConsole {
  private readonly preserveLogCount: number;
  private readonly clearLogCount: number;
  private readonly pane: VScrollPane;
  private readonly vbox: VBox;
  private readonly logHandler: LogHandler;
  private alwaysScrollToEnd = true;

  constructor();
  constructor(preserveLogCount: number, clearLogCount: number);
  constructor(logDispatcher: LogDispatcher, preserveLogCount: number, clearLogCount: number);
  constructor(
    logDispatcherOrPreserve?: LogDispatcher | number,
    preserveLogCount?: number,
    clearLogCount?: number,
  ) {
    let dispatcher: LogDispatcher;
    let preserve: number;
    let clear: number;
    if (logDispatcherOrPreserve instanceof LogDispatcher) {
      dispatcher = logDispatcherOrPreserve;
      preserve = preserveLogCount!;
      clear = clearLogCount!;
    } else if (typeof logDispatcherOrPreserve === 'number') {
      dispatcher = Logger.logDispatcher;
      preserve = logDispatcherOrPreserve;
      clear = preserveLogCount!;
    } else {
      dispatcher = Logger.logDispatcher;
      preserve = 200;
      clear = 250;
    }

    if (clear < preserve) {
      throw new IllegalArgumentException(
        `clearLogCount = ${clear} must not smaller than preserveLogCount = ${preserve}`,
      );
    }
    this.preserveLogCount = preserve;
    this.clearLogCount = clear;

    this.pane = new VScrollPane();
    this.vbox = new VBox();
    this.vbox.setSpacing(5);
    FXUtils.observeWidth(this.pane.getNode(), this.vbox);
    this.pane.setContent(this.vbox);

    this.logHandler = { publish: (record) => this.handleLog(record) };
    dispatcher.addLogHandler(this.logHandler);

    this.vbox.heightProperty.addListener((_old, _now) => {
      if (this.alwaysScrollToEnd) {
        FXUtils.runOnFX(() => this.pane.setVvalue(1));
      }
    });
  }

  isAlwaysScrollToEnd(): boolean {
    return this.alwaysScrollToEnd;
  }

  setAlwaysScrollToEnd(alwaysScrollToEnd: boolean): void {
    this.alwaysScrollToEnd = alwaysScrollToEnd;
    if (alwaysScrollToEnd) {
      this.pane.setVvalue(1);
    }
  }

  private handleLog(record: LogRecord): void {
    this.add(record.toStringNoColor());
  }

  private add(log: string): void {
    FXUtils.runOnFX(() => this.add0(log));
  }

  private add0(log0: string): void {
    const log = log0.trim();

    const label = new ThemeLabel(log);
    label.setFont(`'${FontManager.FONT_NAME_JetBrainsMono}' 16px`);

    const hscroll = new VScrollPane(ScrollDirection.NONE);
    hscroll.setContent(label);
    // observeHeight expects Parent; cast needed due to type gap
    FXUtils.observeHeight(label as unknown as Parent, hscroll.getNode(), 2);

    const logPane = new ClickableFusionPane(false);
    logPane.setOnAction(() => {
      void navigator.clipboard.writeText(log);
    });
    logPane.getContentPane().getChildren().add(hscroll.getNode());
    FXUtils.observeWidth(logPane.getNode(), hscroll.getNode(), -FusionPane.PADDING_H * 2);

    this.vbox.getChildren().add(logPane.getNode());
    const children = this.vbox.getChildren();
    if (children.size() > this.clearLogCount) {
      // Java: `remove(0, size - preserveLogCount)` (range remove).
      // The TS ObservableList port has only remove(item) and removeAt(i);
      // loop removeAt(0) for equivalent behaviour.
      const toRemove = children.size() - this.preserveLogCount;
      for (let i = 0; i < toRemove; i++) {
        children.removeAt(0);
      }
    }
  }

  getNode(): Pane {
    return this.pane.getNode();
  }
}

/**
 * Minimal stand-in for java.lang.IllegalArgumentException so the LogConsole
 * constructor can throw the same conceptual error type without pulling in a
 * broader JDK shim. The message format matches the Java original.
 */
class IllegalArgumentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalArgumentException';
  }
}
