import { Pane } from '../../javafx/Pane.js';
import { ImageView, type FXImage } from '../../javafx/ImageView.js';
import type { VStage } from './VStage.js';
import { VStageInitParams } from './VStageInitParams.js';
import { Theme } from '../../theme/Theme.js';

export abstract class WindowControlButton extends Pane {
  static readonly WIDTH = 64;
  // Mirrors VStage.TITLE_BAR_HEIGHT; duplicated here to avoid a circular
  // import (VStage → buttons → WindowControlButton → VStage).
  static readonly HEIGHT = 28;

  protected readonly stage: VStage;
  protected readonly imageView: ImageView = new ImageView();
  protected cornerRadiiCss: string;
  private normalImage: FXImage;
  private hoverImage: FXImage;
  private mouseEntered = false;
  private readonly hoverBgCss: string;

  protected constructor(stage: VStage, initParams: VStageInitParams) {
    super();
    this.stage = stage;
    this.init(initParams);

    this.setPrefWidth(WindowControlButton.WIDTH);
    this.setPrefHeight(WindowControlButton.HEIGHT);

    this.cornerRadiiCss = this.getCornerRadiiCss();
    this.normalImage = this.getNormalImage();
    this.hoverImage = this.getHoverImage();
    this.hoverBgCss = Theme.current().fusionButtonHoverBackgroundColor().toCss();

    this.el.style.position = 'absolute';
    this.el.style.cursor = 'default';
    this.el.style.borderRadius = this.cornerRadiiCss;
    this.el.style.background = 'transparent';
    this.el.style.transition = 'background-color 0.12s ease';

    this.imageView.setFitWidth(12);
    this.imageView.setFitHeight(12);
    this.imageView.setLayoutX((WindowControlButton.WIDTH - 12) / 2);
    this.imageView.setLayoutY((WindowControlButton.HEIGHT - 12) / 2);
    this.imageView.setImage(this.normalImage);
    this.getChildren().add(this.imageView);

    this.el.addEventListener('mouseenter', () => {
      this.mouseEntered = true;
      this.el.style.background = this.hoverBgCss;
      this.onMouseEntered();
    });
    this.el.addEventListener('mouseleave', () => {
      this.mouseEntered = false;
      this.el.style.background = 'transparent';
      this.onMouseExited();
    });
    this.el.addEventListener('click', () => {
      this.onMouseClicked();
    });
  }

  isMouseEntered(): boolean { return this.mouseEntered; }

  protected init(_initParams: VStageInitParams): void { }

  protected onMouseEntered(): void {
    this.imageView.setImage(this.hoverImage);
  }

  protected onMouseExited(): void {
    this.imageView.setImage(this.normalImage);
  }

  protected abstract onMouseClicked(): void;
  protected abstract getNormalImage(): FXImage;
  protected abstract getHoverImage(): FXImage;
  protected abstract getCornerRadiiCss(): string;
}
