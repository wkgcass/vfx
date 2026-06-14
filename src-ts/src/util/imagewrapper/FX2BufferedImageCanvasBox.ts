import type { CanvasBox } from './CanvasBox.js';
import { BufferedImageCanvasBox } from './BufferedImageCanvasBox.js';

export class FX2BufferedImageCanvasBox implements CanvasBox {
  private readonly box: BufferedImageCanvasBox;
  private readonly scale: number;

  constructor(writableCanvas: HTMLCanvasElement, scale: number) {
    const ctx = writableCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('FX2BufferedImageCanvasBox: 2D context unavailable for canvas');
    }
    this.box = new BufferedImageCanvasBox(writableCanvas, ctx);
    this.scale = scale;
  }

  setPaint(rgb: number): void {
    this.box.setPaint(rgb);
  }

  fillOval(x: number, y: number, w: number, h: number): void {
    this.box.fillOval(
      Math.floor(x / this.scale),
      Math.floor(y / this.scale),
      Math.floor(w / this.scale),
      Math.floor(h / this.scale),
    );
  }

  setFont(name: string, bold: boolean, size: number): void {
    this.box.setFont(name, bold, Math.floor(size / this.scale));
  }

  drawString(s: string, x: number, y: number): void {
    this.box.drawString(s, Math.floor(x / this.scale), Math.floor(y / this.scale));
  }

  flush(): void {
    // No-op. Java copies pixels back to the WritableImage here; in the DOM
    // port we already drew directly onto the writable canvas.
    this.box.flush();
  }
}
