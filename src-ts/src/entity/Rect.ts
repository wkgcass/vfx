export class Rect {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor();
  constructor(x: number, y: number, w: number, h: number);
  constructor(x?: number, y?: number, w?: number, h?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.w = w ?? 0;
    this.h = h ?? 0;
  }

  toJson(): { x: number; y: number; w: number; h: number } {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  static fromJson(obj: { x: number; y: number; w: number; h: number }): Rect {
    return new Rect(obj.x, obj.y, obj.w, obj.h);
  }
}
