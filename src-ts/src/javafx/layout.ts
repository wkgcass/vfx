import { Color, Paint, paintToCss } from './color.js';

export class Insets {
  constructor(
    public readonly top: number,
    public readonly right: number,
    public readonly bottom: number,
    public readonly left: number,
  ) {}

  static EMPTY = new Insets(0, 0, 0, 0);

  static uniform(v: number): Insets {
    return new Insets(v, v, v, v);
  }

  static of(topRightBottomLeft: number): Insets;
  static of(topBottom: number, leftRight: number): Insets;
  static of(top: number, right: number, bottom: number, left: number): Insets;
  static of(a: number, b?: number, c?: number, d?: number): Insets {
    if (b === undefined) return new Insets(a, a, a, a);
    if (c === undefined) return new Insets(a, b, a, b);
    if (d === undefined) return new Insets(a, b!, c, b!);
    return new Insets(a, b!, c, d);
  }
}

export class CornerRadii {
  constructor(
    public readonly topLeft: number,
    public readonly topRight: number,
    public readonly bottomRight: number,
    public readonly bottomLeft: number,
    public readonly uniform: boolean = false,
    public readonly asPercent: boolean = false,
  ) {}

  static EMPTY = new CornerRadii(0, 0, 0, 0, true);

  static uniform(radius: number, percent: boolean = false): CornerRadii {
    return new CornerRadii(radius, radius, radius, radius, true, percent);
  }

  toCss(): string {
    return `${this.topLeft}px ${this.topRight}px ${this.bottomRight}px ${this.bottomLeft}px`;
  }
}

export enum Pos {
  TOP_LEFT = 'TOP_LEFT',
  TOP_CENTER = 'TOP_CENTER',
  TOP_RIGHT = 'TOP_RIGHT',
  CENTER_LEFT = 'CENTER_LEFT',
  CENTER = 'CENTER',
  CENTER_RIGHT = 'CENTER_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_CENTER = 'BOTTOM_CENTER',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  BASELINE_LEFT = 'BASELINE_LEFT',
  BASELINE_CENTER = 'BASELINE_CENTER',
  BASELINE_RIGHT = 'BASELINE_RIGHT',
}

export function posToFlex(p: Pos): { justify: string; align: string } {
  const m: Record<Pos, { justify: string; align: string }> = {
    [Pos.TOP_LEFT]: { justify: 'flex-start', align: 'flex-start' },
    [Pos.TOP_CENTER]: { justify: 'center', align: 'flex-start' },
    [Pos.TOP_RIGHT]: { justify: 'flex-end', align: 'flex-start' },
    [Pos.CENTER_LEFT]: { justify: 'flex-start', align: 'center' },
    [Pos.CENTER]: { justify: 'center', align: 'center' },
    [Pos.CENTER_RIGHT]: { justify: 'flex-end', align: 'center' },
    [Pos.BOTTOM_LEFT]: { justify: 'flex-start', align: 'flex-end' },
    [Pos.BOTTOM_CENTER]: { justify: 'center', align: 'flex-end' },
    [Pos.BOTTOM_RIGHT]: { justify: 'flex-end', align: 'flex-end' },
    [Pos.BASELINE_LEFT]: { justify: 'flex-start', align: 'baseline' },
    [Pos.BASELINE_CENTER]: { justify: 'center', align: 'baseline' },
    [Pos.BASELINE_RIGHT]: { justify: 'flex-end', align: 'baseline' },
  };
  return m[p];
}

export enum BorderStrokeStyle {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  NONE = 'none',
}

export class BorderWidths {
  constructor(
    public readonly top: number = 0,
    public readonly right: number = 0,
    public readonly bottom: number = 0,
    public readonly left: number = 0,
  ) {}

  static EMPTY = new BorderWidths(0, 0, 0, 0);
  static uniform(v: number): BorderWidths {
    return new BorderWidths(v, v, v, v);
  }
}

export class BorderStroke {
  constructor(
    public readonly strokes: BorderStrokeDescriptor | BorderStrokeDescriptor[],
  ) {}
}

export class BorderStrokeDescriptor {
  constructor(
    public readonly stroke: Paint,
    public readonly style: BorderStrokeStyle,
    public readonly radii: CornerRadii,
    public readonly widths: BorderWidths,
  ) {}
}

export class Border {
  constructor(public readonly strokes: BorderStroke | BorderStroke[] = []) {}

  static EMPTY = new Border([]);

  toCss(): string {
    const all = Array.isArray(this.strokes) ? this.strokes : [this.strokes];
    const parts: string[] = [];
    for (const s of all) {
      const desc = Array.isArray(s.strokes) ? s.strokes : [s.strokes];
      for (const d of desc) {
        parts.push(`${d.widths.top}px ${d.style} ${paintToCss(d.stroke)}`);
      }
    }
    return parts.join(', ');
  }

  toBorderRadiusCss(): string {
    const all = Array.isArray(this.strokes) ? this.strokes : [this.strokes];
    for (const s of all) {
      const desc = Array.isArray(s.strokes) ? s.strokes[0] : s.strokes;
      return desc ? desc.radii.toCss() : '0';
    }
    return '0';
  }

  hasBorder(): boolean {
    const all = Array.isArray(this.strokes) ? this.strokes : [this.strokes];
    return all.length > 0 && all.some((s) => {
      const desc = Array.isArray(s.strokes) ? s.strokes : [s.strokes];
      return desc.some((d) => d.widths.top > 0 || d.widths.right > 0 || d.widths.bottom > 0 || d.widths.left > 0);
    });
  }
}

export class BackgroundFill {
  constructor(
    public readonly fill: Paint,
    public readonly radii: CornerRadii,
    public readonly insets: Insets,
  ) {}
}

export class Background {
  constructor(fills: BackgroundFill | BackgroundFill[] = []) {
    this.fills = Array.isArray(fills) ? fills : [fills];
  }

  fills: BackgroundFill[];

  static EMPTY = new Background([]);

  static of(...fills: BackgroundFill[]): Background {
    return new Background(fills);
  }

  toCss(): string {
    if (this.fills.length === 0) return 'transparent';
    return this.fills
      .map((f) => paintToCss(f.fill))
      .join(', ');
  }

  toRadiusCss(): string {
    if (this.fills.length === 0) return '0';
    return this.fills[0]!.radii.toCss();
  }

  toInsetsCss(): string | null {
    if (this.fills.length === 0) return null;
    const i = this.fills[0]!.insets;
    return `${i.top}px ${i.right}px ${i.bottom}px ${i.left}px`;
  }

  hasBackground(): boolean {
    return this.fills.length > 0;
  }
}

export function backgroundFill(fill: Paint, radii?: CornerRadii, insets?: Insets): Background {
  return new Background([
    new BackgroundFill(fill, radii ?? CornerRadii.EMPTY, insets ?? Insets.EMPTY),
  ]);
}

export { Color };
