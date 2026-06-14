import type { CanvasBox } from './CanvasBox.js';

function cssColorFromArgb(argb: number): string {
  const a = (argb >>> 24) & 0xff;
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(4)})`;
}

export class BufferedImageCanvasBox implements CanvasBox {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  setPaint(rgb: number): void {
    this.ctx.fillStyle = cssColorFromArgb(rgb);
  }

  fillOval(x: number, y: number, w: number, h: number): void {
    if (w <= 0 || h <= 0) return;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  setFont(name: string, bold: boolean, size: number): void {
    this.ctx.font = `${bold ? 'bold ' : ''}${size}px ${name}`;
  }

  drawString(s: string, x: number, y: number): void {
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillText(s, x, y);
  }

  flush(): void {
    // No-op. Java's BufferedImage.flush() releases native pixel buffers
    // for accelerated surfaces; an HTMLCanvasElement has no equivalent.
    void this.canvas;
  }
}
