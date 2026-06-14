export type Paint = Color | LinearGradient | string;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export class Color {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly opacity: number;

  constructor(red: number, green: number, blue: number, opacity: number = 1) {
    this.red = clamp(red, 0, 1);
    this.green = clamp(green, 0, 1);
    this.blue = clamp(blue, 0, 1);
    this.opacity = clamp(opacity, 0, 1);
  }

  static color(r: number, g: number, b: number, opacity: number = 1): Color {
    return new Color(r, g, b, opacity);
  }

  static rgb(r: number, g: number, b: number, opacity: number = 1): Color {
    return new Color(r / 255, g / 255, b / 255, opacity);
  }

  static gray(v: number, opacity: number = 1): Color {
    return new Color(v, v, v, opacity);
  }

  /**
   * HSB factory. h is 0..360 (degrees), s and b are 0..1.
   */
  static hsb(h: number, s: number, b: number, opacity: number = 1): Color {
    return fromHSB(h, s, b, opacity);
  }

  static web(spec: string, opacity: number = 1): Color {
    const trimmed = spec.trim();
    if (trimmed.startsWith('#')) {
      const hex = trimmed.substring(1);
      if (hex.length === 3) {
        return new Color(
          parseInt(hex[0]! + hex[0]!, 16) / 255,
          parseInt(hex[1]! + hex[1]!, 16) / 255,
          parseInt(hex[2]! + hex[2]!, 16) / 255,
          opacity,
        );
      }
      if (hex.length === 6) {
        return new Color(
          parseInt(hex.substring(0, 2), 16) / 255,
          parseInt(hex.substring(2, 4), 16) / 255,
          parseInt(hex.substring(4, 6), 16) / 255,
          opacity,
        );
      }
      if (hex.length === 8) {
        const a = parseInt(hex.substring(6, 8), 16) / 255;
        return new Color(
          parseInt(hex.substring(0, 2), 16) / 255,
          parseInt(hex.substring(2, 4), 16) / 255,
          parseInt(hex.substring(4, 6), 16) / 255,
          opacity * a,
        );
      }
    }
    if (trimmed.startsWith('rgb')) {
      const m = trimmed.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const parts = m[1]!.split(',').map((s) => parseFloat(s.trim()));
        if (parts.length >= 3) {
          const a = parts.length >= 4 ? parts[3]! : 1;
          if (parts.some((p) => p > 1)) {
            return new Color(parts[0]! / 255, parts[1]! / 255, parts[2]! / 255, a * opacity);
          }
          return new Color(parts[0]!, parts[1]!, parts[2]!, a * opacity);
        }
      }
    }
    throw new Error(`cannot parse color: ${spec}`);
  }

  static transparent(): Color {
    return new Color(0, 0, 0, 0);
  }

  static derive(base: Color, factor: number): Color {
    return new Color(
      clamp(base.red + factor, 0, 1),
      clamp(base.green + factor, 0, 1),
      clamp(base.blue + factor, 0, 1),
      base.opacity,
    );
  }

  static readonly TRANSPARENT = new Color(0, 0, 0, 0);
  static readonly WHITE = new Color(1, 1, 1, 1);
  static readonly BLACK = new Color(0, 0, 0, 1);
  static readonly RED = new Color(1, 0, 0, 1);
  static readonly GREEN = new Color(0, 1, 0, 1);
  static readonly BLUE = new Color(0, 0, 1, 1);
  static readonly LIGHTGRAY = new Color(0.83, 0.83, 0.83, 1);
  static readonly GRAY = new Color(0.5, 0.5, 0.5, 1);
  static readonly DARKGRAY = new Color(0.17, 0.17, 0.17, 1);

  toCss(): string {
    const r = Math.round(this.red * 255);
    const g = Math.round(this.green * 255);
    const b = Math.round(this.blue * 255);
    if (this.opacity >= 1) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
  }

  toString(): string {
    return this.toCss();
  }
}

export class LinearGradient {
  constructor(
    public readonly startX: number,
    public readonly startY: number,
    public readonly endX: number,
    public readonly endY: number,
    public readonly proportional: boolean,
    public readonly cycleMethod: 'NO_CYCLE' | 'REFLECT' | 'REPEAT' = 'NO_CYCLE',
    public readonly stops: Array<{ offset: number; color: Color }> = [],
  ) {}

  toCss(angleDeg?: number): string {
    const angle = angleDeg ?? Math.atan2(this.endY - this.startY, this.endX - this.startX) * 180 / Math.PI;
    const cssAngle = (angle + 90 + 360) % 360;
    const stopsCss = this.stops
      .map((s) => `${s.color.toCss()} ${(s.offset * 100).toFixed(2)}%`)
      .join(', ');
    return `linear-gradient(${cssAngle}deg, ${stopsCss})`;
  }

  toString(): string {
    return this.toCss();
  }
}

export function toHSB(c: Color): [number, number, number] {
  const r = c.red;
  const g = c.green;
  const b = c.blue;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d) % 6;
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

export function fromHSB(h: number, s: number, b: number, opacity: number): Color {
  const hh = ((h % 360) + 360) % 360 / 60;
  const f = hh - Math.floor(hh);
  const p = b * (1 - s);
  const q = b * (1 - s * f);
  const t = b * (1 - s * (1 - f));
  let r: number, g: number, blue: number;
  switch (Math.floor(hh) % 6) {
    case 0: r = b; g = t; blue = p; break;
    case 1: r = q; g = b; blue = p; break;
    case 2: r = p; g = b; blue = t; break;
    case 3: r = p; g = q; blue = b; break;
    case 4: r = t; g = p; blue = b; break;
    default: r = b; g = p; blue = q; break;
  }
  return new Color(r, g, blue, opacity);
}

export function paintToCss(p: Paint): string {
  if (typeof p === 'string') return p;
  if (p instanceof Color) return p.toCss();
  if (p instanceof LinearGradient) return p.toCss();
  return String(p);
}
