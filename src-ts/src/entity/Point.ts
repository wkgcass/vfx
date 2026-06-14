export class Point {
  x: number;
  y: number;

  constructor();
  constructor(x: number, y: number);
  constructor(x?: number, y?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
  }

  static midOf(a: Point, b: Point): Point {
    return new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
  }

  toJson(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  static fromJson(obj: { x: number; y: number }): Point {
    return new Point(obj.x, obj.y);
  }

  equals(o: unknown): boolean {
    return o instanceof Point && o.x === this.x && o.y === this.y;
  }

  hashCode(): number {
    return 31 * doubleBits(this.x) + doubleBits(this.y);
  }
}

function doubleBits(d: number): number {
  // Mirrors Java's Double.doubleToLongBits + mix.
  const buf = new Float64Array(1);
  buf[0] = d;
  const view = new DataView(buf.buffer);
  const lo = view.getUint32(0, true);
  const hi = view.getUint32(4, true);
  return (lo ^ hi) | 0;
}
