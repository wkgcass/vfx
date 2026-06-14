import { ImageView, FXImage } from '../../javafx/ImageView.js';
import { FusionButton } from './FusionButton.js';

export class FusionImageButton extends FusionButton {
  private readonly imageView: ImageView = new ImageView();

  constructor();
  constructor(image: FXImage | null);
  constructor(image: FXImage | null = null) {
    super();
    if (image !== null) {
      this.imageView.setImage(image);
    }
    this.imageView.setPreserveRatio(true);
    this.getChildren().add(this.imageView);

    this.widthProperty.addListener(() => this.updateImagePosition());
    this.heightProperty.addListener(() => this.updateImagePosition());
    // The ImageView's rendered size arrives asynchronously (image load +
    // ResizeObserver). Re-center when it changes, otherwise the icon stays
    // stuck at layoutX = (W - 0) / 2 = W/2 (too far right).
    this.imageView.widthProperty.addListener(() => this.updateImagePosition());
    this.imageView.heightProperty.addListener(() => this.updateImagePosition());
    this.setDisableAnimation(true);
  }

  getImageView(): ImageView {
    return this.imageView;
  }

  private updateImagePosition(): void {
    // Mirrors JavaFX `imageView.getLayoutBounds()` — for an <img> in DOM,
    // the layout bounds equal the rendered width/height (0 when no fit set).
    const bw = this.imageView.getWidth();
    const bh = this.imageView.getHeight();
    this.imageView.setLayoutX((this.getWidth() - bw) / 2);
    this.imageView.setLayoutY((this.getHeight() - bh) / 2);
  }
}
