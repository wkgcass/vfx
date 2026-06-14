import { Theme } from '../../theme/Theme.js';
import type { FXImage } from '../../javafx/ImageView.js';
import { WindowControlButton } from './WindowControlButton.js';
import { VStage } from './VStage.js';
import { VStageInitParams } from './VStageInitParams.js';

export class CloseButton extends WindowControlButton {
  private cornerRadiiCssStr = '';

  constructor(stage: VStage, initParams: VStageInitParams) {
    super(stage, initParams);
  }

  protected init(initParams: VStageInitParams): void {
    if (initParams.iconifyButton || initParams.maximizeAndResetButton) {
      this.cornerRadiiCssStr = '0';
    } else {
      this.cornerRadiiCssStr = '0 0 0 4px';
    }
  }

  protected onMouseClicked(): void {
    void this.stage.close();
  }

  protected getCornerRadiiCss(): string { return this.cornerRadiiCssStr; }

  protected getNormalImage(): FXImage {
    return Theme.current().windowCloseButtonNormalImage();
  }
  protected getHoverImage(): FXImage {
    return Theme.current().windowCloseButtonHoverImage();
  }
}
