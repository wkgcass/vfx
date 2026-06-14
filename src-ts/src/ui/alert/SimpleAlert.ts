import { FontManager } from '../../manager/font/FontManager.js';
import type { FontUsage } from '../../manager/font/FontUsage.js';
import { FontUsages, fontUsageFromKey, fontUsageToKey } from '../../manager/font/FontUsages.js';
import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';
import { Logger } from '../../vproxy-base/Logger.js';
import { Parent } from '../../javafx/Parent.js';
import { FXUtils } from '../../util/FXUtils.js';
import { ThemeLabel } from '../wrapper/ThemeLabel.js';
import { Windows } from '../../window/WindowManager.js';
import { ThemeAlertBase } from './ThemeAlertBase.js';

export class SimpleAlert extends ThemeAlertBase {
  constructor(title: string, contentText: string, fontUsage: FontUsage) {
    super();
    Logger.alert(`SimpleAlert: [${title}] ${contentText}`);

    this.setTitle(title);

    const alertMessage = new ThemeLabel(contentText);
    alertMessage.setWrapText(true);
    FontManager.get().setFont(fontUsage, alertMessage);

    FXUtils.observeWidth(
      this.getSceneGroup().getNode(),
      alertMessage as unknown as Parent,
      -SimpleAlert.PADDING_H * 2,
    );

    this.alertMessagePane.getChildren().add(alertMessage);
  }

  private static typeToTitle(type: SimpleAlert.AlertType): string {
    if (type === SimpleAlert.AlertType.INFORMATION) {
      return InternalI18n.get().alertInfoTitle();
    } else if (type === SimpleAlert.AlertType.WARNING) {
      return InternalI18n.get().alertWarningTitle();
    } else if (type === SimpleAlert.AlertType.ERROR) {
      return InternalI18n.get().alertErrorTitle();
    } else {
      return SimpleAlert.AlertType[type];
    }
  }

  static show(type: SimpleAlert.AlertType, contentText: string): void;
  static show(type: SimpleAlert.AlertType, contentText: string, fontUsage: FontUsage): void;
  static show(title: string, contentText: string): void;
  static show(title: string, contentText: string, fontUsage: FontUsage): void;
  static show(
    titleOrType: string | SimpleAlert.AlertType,
    contentText: string,
    fontUsage: FontUsage = FontUsages.alert,
  ): void {
    if (typeof titleOrType !== 'string') {
      SimpleAlert.show(SimpleAlert.typeToTitle(titleOrType), contentText, fontUsage);
      return;
    }
    void SimpleAlert.openWindow(titleOrType, contentText, fontUsage);
  }

  static showAndWait(type: SimpleAlert.AlertType, contentText: string): Promise<void>;
  static showAndWait(type: SimpleAlert.AlertType, contentText: string, fontUsage: FontUsage): Promise<void>;
  static showAndWait(title: string, contentText: string): Promise<void>;
  static showAndWait(title: string, contentText: string, fontUsage: FontUsage): Promise<void>;
  static async showAndWait(
    titleOrType: string | SimpleAlert.AlertType,
    contentText: string,
    fontUsage: FontUsage = FontUsages.alert,
  ): Promise<void> {
    if (typeof titleOrType !== 'string') {
      await SimpleAlert.showAndWait(SimpleAlert.typeToTitle(titleOrType), contentText, fontUsage);
      return;
    }
    const handle = await SimpleAlert.openWindow(titleOrType, contentText, fontUsage);
    await handle.closed;
  }

  private static async openWindow(
    title: string,
    contentText: string,
    fontUsage: FontUsage,
  ) {
    const key = fontUsageToKey(fontUsage);
    if (key === null) {
      throw new Error(`Cannot serialize FontUsage for cross-window transport`);
    }
    return Windows.open({
      kind: 'simple-alert',
      title,
      width: 720,
      height: 200,
      params: {
        title,
        message: contentText,
        fontUsage: key,
      },
    });
  }
}

export namespace SimpleAlert {
  export enum AlertType {
    NONE,
    INFORMATION,
    WARNING,
    ERROR,
  }
}

export const _resolveFontUsage = fontUsageFromKey;
