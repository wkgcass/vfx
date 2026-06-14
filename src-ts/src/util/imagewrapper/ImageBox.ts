// getRGB returns 0xAARRGGBB to match Java's convention.

import type { CanvasBox } from './CanvasBox.js';
import type { FXImage } from '../../javafx/ImageView.js';

export interface ImageBox {
  getWidth(): number;

  getHeight(): number;

  getRGB(x: number, y: number): number;

  createGraphics(): CanvasBox;

  toFXImage(): FXImage;
}
