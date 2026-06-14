import { AlgebraData } from './AlgebraData.js';
import { Color, toHSB, fromHSB } from '../../javafx/color.js';

export class ColorData implements AlgebraData<ColorData> {
  private _color: Color | null;
  private readonly h: number;
  private readonly s: number;
  private readonly b: number;
  private readonly alpha: number;

  constructor(color: Color);
  constructor(h: number, s: number, b: number, alpha: number);
  constructor(hsb: [number, number, number], alpha: number);
  constructor(arg0: Color | number | [number, number, number], sOrAlpha?: number, b?: number, alpha?: number) {
    if (arg0 instanceof Color) {
      this._color = arg0;
      const hsb = toHSB(arg0);
      this.h = hsb[0];
      this.s = hsb[1];
      this.b = hsb[2];
      this.alpha = arg0.opacity;
    } else if (Array.isArray(arg0)) {
      this._color = null;
      this.h = arg0[0];
      this.s = arg0[1];
      this.b = arg0[2];
      this.alpha = sOrAlpha ?? 1;
    } else {
      this._color = null;
      this.h = arg0;
      this.s = sOrAlpha ?? 0;
      this.b = b ?? 0;
      this.alpha = alpha ?? 1;
    }
  }

  get color(): Color {
    if (this._color === null) {
      let a = this.alpha;
      if (a > 1) a = 1;
      else if (a < 0) a = 0;
      this._color = fromHSB(this.h, this.s, this.b, a);
    }
    return this._color;
  }

  plus(o: ColorData): ColorData {
    return new ColorData(this.h + o.h, this.s + o.s, this.b + o.b, this.alpha + o.alpha);
  }
  minus(o: ColorData): ColorData {
    return new ColorData(this.h - o.h, this.s - o.s, this.b - o.b, this.alpha - o.alpha);
  }
  multiply(v: number): ColorData {
    return new ColorData(this.h * v, this.s * v, this.b * v, this.alpha * v);
  }
  dividedBy(v: number): ColorData {
    return new ColorData(this.h / v, this.s / v, this.b / v, this.alpha / v);
  }
}
