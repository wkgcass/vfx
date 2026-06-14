import { ImageView, FXImage } from '../../javafx/ImageView.js';
import { ClickEventHandler } from '../../control/click/ClickEventHandler.js';
import { ImageManager } from '../../manager/image/ImageManager.js';

export type ImageButtonHandler = (e: unknown) => void;

export class ImageButton extends ImageView {
  private readonly w: number;
  private readonly h: number;
  private handler: ImageButtonHandler | null = null;

  constructor(prefix: string, suffix: string) {
    super();
    this.setCursor('pointer');

    const normalImage = ImageManager.get().load(prefix + '-normal' + '.' + suffix);
    const normalImg: FXImage = normalImage ?? new FXImage('');
    this.w = normalImg.width;
    this.h = normalImg.height;
    const hoverImage = ImageManager.get().load(prefix + '-hover' + '.' + suffix) ?? normalImg;
    const downImage = ImageManager.get().load(prefix + '-down' + '.' + suffix) ?? normalImg;
    this.setImage(normalImg);

    const outer = this;
    const clickHandler = new (class extends ClickEventHandler {
      protected override onMouseEntered(): void {
        outer.setImage(hoverImage);
      }

      protected override onMouseExited(): void {
        outer.setImage(normalImg);
      }

      protected override onMousePressed(): void {
        outer.setImage(downImage);
      }

      protected override onMouseReleased(): void {
        outer.setImage(hoverImage);
      }

      protected override onMouseClicked(): void {
        const h = outer.handler;
        if (h === null) {
          return;
        }
        h(null);
      }
    })();
    this.setOnMouseEntered(clickHandler.handleEntered);
    this.setOnMouseExited(clickHandler.handleExited);
    this.setOnMousePressed(clickHandler.handlePressed);
    this.setOnMouseReleased(clickHandler.handleReleased);
  }

  setOnAction(handler: ImageButtonHandler | null): void {
    this.handler = handler;
  }

  setScale(v: number): void {
    this.setFitWidth(this.w * v);
    this.setFitHeight(this.h * v);
  }
}
