import { Theme } from '../../theme/Theme.js';
import type { FXImage } from '../../javafx/ImageView.js';
import { WindowControlButton } from './WindowControlButton.js';
import { VStage } from './VStage.js';
import { VStageInitParams } from './VStageInitParams.js';

export class IconifyButton extends WindowControlButton {
  constructor(stage: VStage, initParams: VStageInitParams) {
    super(stage, initParams);
  }

  protected onMouseClicked(): void {
    void this.stage.setIconified(true);
  }

  protected getCornerRadiiCss(): string {
    // CSS border-radius shorthand: top-left top-right bottom-right bottom-left.
    // Iconify sits at the LEFT of the (iconify, maximize, close) cluster, so
    // its outer corner is bottom-left.
    return '0 0 0 4px';
  }

  protected getNormalImage(): FXImage {
    return Theme.current().windowIconifyButtonNormalImage();
  }
  protected getHoverImage(): FXImage {
    return Theme.current().windowIconifyButtonHoverImage();
  }
}
