
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';
import { Logger } from '../../vproxy-base/Logger.js';
import { Parent } from '../../javafx/Parent.js';
import { FXUtils } from '../../util/FXUtils.js';
import { ClickableFusionPane } from '../pane/ClickableFusionPane.js';
import { FusionPane } from '../pane/FusionPane.js';
import { VPadding } from '../layout/VPadding.js';
import { ThemeLabel } from '../wrapper/ThemeLabel.js';
import { Windows } from '../../window/WindowManager.js';
import { ThemeAlertBase } from './ThemeAlertBase.js';

export class StackTraceAlert extends ThemeAlertBase {
  constructor(desc: string, throwable: unknown) {
    super();
    Logger.error('ALERT', `StackTraceAlert: ${desc}`, throwable);

    this.setTitle(InternalI18n.get().stacktraceAlertTitle());

    const headerText = new ThemeLabel(InternalI18n.get().stacktraceAlertHeaderText());
    FontManager.get().setFont(FontUsages.alert, headerText);

    const descText = new ThemeLabel();
    FontManager.get().setFont(FontUsages.alert, descText);
    if (desc !== null && desc.trim() !== '') {
      descText.setText(desc);
    }

    const aboutStacktraceText = new ThemeLabel(InternalI18n.get().stacktraceAlertLabel());
    FontManager.get().setFont(FontUsages.alert, aboutStacktraceText);

    const exceptionText: string = throwable instanceof Error
      ? (throwable.stack ?? `${throwable.name}: ${throwable.message}`)
      : String(throwable);

    const stacktracePane = new ClickableFusionPane();
    stacktracePane.setOnAction(() => {
      void navigator.clipboard.writeText(exceptionText);
    });
    stacktracePane.getNode().setPrefWidth(this.getStage().getWidth() - 2 * StackTraceAlert.PADDING_H - 5);

    const stacktraceText = new ThemeLabel(exceptionText);
    stacktraceText.setFont(`'${FontManager.FONT_NAME_JetBrainsMono}' 14px`);
    stacktraceText.setWrapText(true);
    stacktraceText.setPrefWidth(stacktracePane.getNode().getPrefWidth() - FusionPane.PADDING_H * 2);

    stacktracePane.getContentPane().getChildren().add(stacktraceText);
    // observeHeight's signature requires Parent but only invokes setPrefHeight,
    // which exists on Node. Cast for the type-system gap (see SimpleAlert for
    // the same workaround).
    FXUtils.observeHeight(
      stacktraceText as unknown as Parent,
      stacktracePane.getNode(),
      FusionPane.PADDING_V * 2,
    );

    FXUtils.runDelay(50, () => stacktraceText.setMinHeight(stacktraceText.getHeight() + 1));

    this.alertMessagePane.getChildren().addAll(
      headerText,
      descText,
      new VPadding(20),
      aboutStacktraceText,
      stacktracePane.getNode(),
    );
  }

  static show(throwable: unknown): void;
  static show(desc: string, throwable: unknown): void;
  static show(descOrThrowable: string | unknown, throwable?: unknown): void {
    if (typeof descOrThrowable === 'string') {
      void StackTraceAlert.openWindow(descOrThrowable, throwable!);
      return;
    }
    void StackTraceAlert.openWindow('', descOrThrowable);
  }

  static showAndWait(throwable: unknown): Promise<void>;
  static showAndWait(desc: string, throwable: unknown): Promise<void>;
  static async showAndWait(descOrThrowable: string | unknown, throwable?: unknown): Promise<void> {
    let handle;
    if (typeof descOrThrowable === 'string') {
      handle = await StackTraceAlert.openWindow(descOrThrowable, throwable!);
    } else {
      handle = await StackTraceAlert.openWindow('', descOrThrowable);
    }
    await handle.closed;
  }

  private static async openWindow(desc: string, throwable: unknown) {
    const stack = throwable instanceof Error
      ? (throwable.stack ?? `${throwable.name}: ${throwable.message}`)
      : String(throwable);
    return Windows.open({
      kind: 'stack-trace-alert',
      title: 'StackTrace',
      width: 720,
      height: 400,
      params: { desc, stack },
    });
  }
}
