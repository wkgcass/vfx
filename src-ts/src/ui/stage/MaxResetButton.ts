import { Theme } from '../../theme/Theme.js';
import type { FXImage } from '../../javafx/ImageView.js';
import { WindowControlButton } from './WindowControlButton.js';
import { VStage } from './VStage.js';
import { VStageInitParams } from './VStageInitParams.js';

export class MaxResetButton extends WindowControlButton {
  private readonly maxImg: [FXImage, FXImage];
  private readonly rstImg: [FXImage, FXImage];
  private cornerRadiiCssStr = '';

  constructor(stage: VStage, initParams: VStageInitParams) {
    super(stage, initParams);
    this.maxImg = [
      Theme.current().windowMaximizeButtonNormalImage(),
      Theme.current().windowMaximizeButtonHoverImage(),
    ];
    this.rstImg = [
      Theme.current().windowResetWindowSizeButtonNormalImage(),
      Theme.current().windowResetWindowSizeButtonHoverImage(),
    ];
    this.updateImage();
  }

  protected init(initParams: VStageInitParams): void {
    if (initParams.iconifyButton) {
      this.cornerRadiiCssStr = '0';
    } else {
      this.cornerRadiiCssStr = '0 0 0 4px';
    }
  }

  protected onMouseEntered(): void {
    super.onMouseEntered();
    this.imageView.setImage(this.currentImageGroup()[1]);
  }

  protected onMouseExited(): void {
    super.onMouseExited();
    this.imageView.setImage(this.currentImageGroup()[0]);
  }

  protected onMouseClicked(): void {
    void this.stage.setMaximized(!this.stage.isMaximized());
  }

  protected getCornerRadiiCss(): string { return this.cornerRadiiCssStr; }

  protected getNormalImage(): FXImage {
    return Theme.current().windowMaximizeButtonNormalImage();
  }
  protected getHoverImage(): FXImage {
    return Theme.current().windowMaximizeButtonHoverImage();
  }

  private currentImageGroup(): [FXImage, FXImage] {
    return this.stage.isMaximized() ? this.rstImg : this.maxImg;
  }

  updateImage(): void {
    if (this.stage.isMaximized()) {
      this.imageView.setFitWidth(22);
      this.imageView.setFitHeight(22);
      this.imageView.setLayoutX((WindowControlButton.WIDTH - 22) / 2);
      this.imageView.setLayoutY((WindowControlButton.HEIGHT - 22) / 2);
      // Java: imageView.setScaleX(-1) — horizontal mirror only. The TS
      // port previously called setScale(-1), which scaled both axes and
      // relied on the source images being vertically symmetric; using
      // setScaleX preserves the exact Java semantic.
      this.imageView.setScaleX(-1);
    } else {
      this.imageView.setFitWidth(20);
      this.imageView.setFitHeight(20);
      this.imageView.setLayoutX((WindowControlButton.WIDTH - 20) / 2);
      this.imageView.setLayoutY((WindowControlButton.HEIGHT - 20) / 2);
      this.imageView.setScaleX(-1);
    }
    if (this.isMouseEntered()) {
      this.imageView.setImage(this.currentImageGroup()[1]);
    } else {
      this.imageView.setImage(this.currentImageGroup()[0]);
    }
  }
}
