export interface CanvasBox {
  setPaint(rgb: number): void;

  fillOval(x: number, y: number, w: number, h: number): void;

  setFont(name: string, bold: boolean, size: number): void;

  drawString(s: string, x: number, y: number): void;

  flush(): void;
}
