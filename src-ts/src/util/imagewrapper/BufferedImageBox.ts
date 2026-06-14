import type { ImageBox } from './ImageBox.js';
import type { CanvasBox } from './CanvasBox.js';
import { BufferedImageCanvasBox } from './BufferedImageCanvasBox.js';
import { FXImage } from '../../javafx/ImageView.js';

export class BufferedImageBox implements ImageBox {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('BufferedImageBox: 2D context unavailable for canvas');
    }
    this.ctx = ctx;
  }

  getWidth(): number {
    return this.canvas.width;
  }

  getHeight(): number {
    return this.canvas.height;
  }

  getRGB(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
      return 0;
    }
    const d = this.ctx.getImageData(x, y, 1, 1).data;
    return ((d[3]! & 0xff) << 24) | ((d[0]! & 0xff) << 16) | ((d[1]! & 0xff) << 8) | (d[2]! & 0xff);
  }

  createGraphics(): CanvasBox {
    return new BufferedImageCanvasBox(this.canvas, this.ctx);
  }

  toFXImage(): FXImage {
    return new FXImage(this.canvas.toDataURL('image/png'));
  }
}
