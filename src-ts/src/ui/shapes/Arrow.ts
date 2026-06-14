// Recolors a BASE black arrow image to the target fill color via
// FXUtils.changeColorOfBlackImage (Canvas 2D pixel manipulation).
// The offsets are set on the imageView (child of this Group), NOT on the
// Group itself — VLine sets the Group's layoutX/Y to the line endpoint;
// the internal offset positions the arrow so its tip lands exactly on
// that endpoint.

import { Group } from '../../javafx/Pane.js';
import { FXImage, ImageView } from '../../javafx/ImageView.js';
import { ImageManager } from '../../manager/image/ImageManager.js';
import { FXUtils } from '../../util/FXUtils.js';
import { Color, type Paint } from '../../javafx/color.js';

function colorToArgb(c: Color): number {
  const a = Math.round(c.opacity * 255);
  const r = Math.round(c.red * 255);
  const g = Math.round(c.green * 255);
  const b = Math.round(c.blue * 255);
  // Force opaque — alpha in the recolor formula only controls output
  // alpha based on the source pixel's alpha (the arrow silhouette).
  // Letting the line color's opacity through would make the arrow
  // semi-transparent, which doesn't match Java's tinted-rect visual.
  return (0xff << 24) | (r << 16) | (g << 8) | b;
}

export class Arrow extends Group {
  private readonly baseImg: HTMLImageElement | null;
  private readonly fxImage: FXImage = new FXImage('');
  private readonly imageView: ImageView;
  private pendingFill: Color | null = null;

  constructor() {
    super();
    // Load the BASE black arrow — changeColorOfBlackImage expects a black
    // source and produces a target-colored output.
    const img = ImageManager.get().load('io/vproxy/vfx/res/image/arrow.png');
    this.baseImg = img?.getHtmlImage() ?? null;
    this.imageView = new ImageView();
    this.imageView.setImage(this.fxImage);
    this.getChildren().add(this.imageView);
    this.setScale(1);
  }

  setFill(paint: Paint | null): void {
    if (paint === null) {
      this.pendingFill = null;
      this.fxImage.setUrl('');
      return;
    }
    if (!(paint instanceof Color)) {
      // Non-Color Paint (e.g. LinearGradient) isn't supported by the
      // per-pixel ARGB recoloring path. The Java rect would have drawn
      // a gradient-filled arrow; for the common single-color case used
      // by every caller in this codebase (broken-line strokes use
      // Theme.current().normalTextColor(), a Color), this is fine.
      return;
    }
    this.pendingFill = paint;
    void this.applyFill(paint);
  }

  private async applyFill(color: Color): Promise<void> {
    const base = this.baseImg;
    if (base === null) return;
    const recolor = (): Promise<string> => FXUtils.changeColorOfBlackImage(base, colorToArgb(color));
    let dataUrl: string;
    if (base.complete && base.naturalWidth > 0) {
      dataUrl = await recolor();
    } else {
      await new Promise<void>((resolve) => {
        base.addEventListener('load', () => resolve(), { once: true });
        base.addEventListener('error', () => resolve(), { once: true });
      });
      if (base.naturalWidth === 0) return;
      dataUrl = await recolor();
    }
    // Guard against a newer setFill call superseding us while we were
    // awaiting image load / recoloring.
    if (this.pendingFill !== color) return;
    this.fxImage.setUrl(dataUrl);
  }

  setScale(ratio: number): void {
    const imgW = this.baseImg?.naturalWidth ?? 0;
    const imgH = this.baseImg?.naturalHeight ?? 0;
    this.imageView.setFitWidth(imgW * ratio);
    this.imageView.setFitHeight(imgH * ratio);
    // These offsets are on the imageView (child of this Group), NOT on
    // the Group itself. VLine sets the Group's layoutX/Y to the line
    // endpoint; the internal offset positions the arrow so its tip
    // lands exactly on that endpoint. Setting layoutX/Y here on `this`
    // would be overwritten by VLine and the arrow would shift off the
    // endpoint — the bug from the previous mask-image rewrite.
    this.imageView.setLayoutX(-imgW * ratio * 0.7);
    this.imageView.setLayoutY(-imgH * ratio / 2);
  }
}
