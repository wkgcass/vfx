import type { ImageBox } from './ImageBox.js';
import type { CanvasBox } from './CanvasBox.js';
import { FX2BufferedImageCanvasBox } from './FX2BufferedImageCanvasBox.js';
import { FXImage } from '../../javafx/ImageView.js';

export class FXWritableImageBox implements ImageBox {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly scale: number;

  constructor(canvas: HTMLCanvasElement, scale: number = 1) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('FXWritableImageBox: 2D context unavailable for canvas');
    }
    this.ctx = ctx;
    this.scale = scale;
  }

  getWidth(): number {
    return Math.floor(this.canvas.width * this.scale);
  }

  getHeight(): number {
    return Math.floor(this.canvas.height * this.scale);
  }

  getRGB(x: number, y: number): number {
    const nx = Math.round(x / this.scale);
    const ny = Math.round(y / this.scale);
    if (nx < 0 || ny < 0 || nx >= this.canvas.width || ny >= this.canvas.height) {
      return 0;
    }
    const d = this.ctx.getImageData(nx, ny, 1, 1).data;
    return ((d[3]! & 0xff) << 24) | ((d[0]! & 0xff) << 16) | ((d[1]! & 0xff) << 8) | (d[2]! & 0xff);
  }

  createGraphics(): CanvasBox {
    return new FX2BufferedImageCanvasBox(this.canvas, this.scale);
  }

  toFXImage(): FXImage {
    return new FXImage(this.canvas.toDataURL('image/png'));
  }
}
