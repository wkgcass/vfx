import { Node } from './Node.js';
import { Paint, paintToCss, Color } from './color.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createSvgElement(tag: string): SVGElement {
  return document.createElementNS(SVG_NS, tag);
}

export abstract class Shape extends Node {
  protected readonly shapeEl: SVGElement;
  protected _fill: Paint | null = null;
  protected _stroke: Paint | null = null;
  protected _strokeWidth: number = 1;

  constructor(shapeTag: string) {
    super(createSvgElement('svg') as unknown as HTMLElement);
    const svgEl = this.el as unknown as SVGSVGElement;
    svgEl.setAttribute('overflow', 'visible');
    svgEl.style.width = '0';
    svgEl.style.height = '0';
    svgEl.style.pointerEvents = 'none';
    this.shapeEl = createSvgElement(shapeTag);
    this.shapeEl.style.pointerEvents = 'auto';
    svgEl.appendChild(this.shapeEl);
  }

  setFill(p: Paint | null): void {
    this._fill = p;
    this.shapeEl.setAttribute('fill', p === null ? 'none' : paintToCss(p));
  }
  setStroke(p: Paint | null): void {
    this._stroke = p;
    this.shapeEl.setAttribute('stroke', p === null ? 'none' : paintToCss(p));
  }
  setStrokeWidth(w: number): void {
    this._strokeWidth = w;
    this.shapeEl.setAttribute('stroke-width', String(w));
  }

}

export class Circle extends Node {
  private _radius = 0;
  private _centerX = 0;
  private _centerY = 0;
  private _fill: Paint | null = null;
  private _stroke: Paint | null = null;
  private _strokeWidth = 0;

  constructor(radius: number = 0) {
    super(document.createElement('div'));
    this._radius = radius;
    this.el.style.borderRadius = '50%';
    this.el.style.pointerEvents = 'auto';
    this.updateSize();
    this.updateFill();
  }

  private updateSize(): void {
    const d = this._radius * 2;
    this.el.style.width = `${d}px`;
    this.el.style.height = `${d}px`;
    this.el.style.marginLeft = `${-this._radius + this._centerX}px`;
    this.el.style.marginTop = `${-this._radius + this._centerY}px`;
  }

  private updateFill(): void {
    if (this._fill === null) {
      this.el.style.background = 'none';
    } else {
      this.el.style.background = paintToCss(this._fill);
    }
    if (this._stroke === null || this._strokeWidth <= 0) {
      this.el.style.border = 'none';
    } else {
      this.el.style.border = `${this._strokeWidth}px solid ${paintToCss(this._stroke)}`;
    }
  }

  setRadius(r: number): void { this._radius = r; this.updateSize(); }
  getRadius(): number { return this._radius; }
  setCenterX(x: number): void { this._centerX = x; this.updateSize(); }
  setCenterY(y: number): void { this._centerY = y; this.updateSize(); }
  getCenterX(): number { return this._centerX; }
  getCenterY(): number { return this._centerY; }
  setFill(p: Paint | null): void { this._fill = p; this.updateFill(); }
  setStroke(p: Paint | null): void { this._stroke = p; this.updateFill(); }
  setStrokeWidth(w: number): void { this._strokeWidth = w; this.updateFill(); }
}

export class LineShape extends Node {
  private _startX = 0;
  private _startY = 0;
  private _endX = 0;
  private _endY = 0;
  private _stroke: Paint | null = null;
  private _strokeWidth = 1;

  constructor(startX: number = 0, startY: number = 0, endX: number = 0, endY: number = 0) {
    super(document.createElement('div'));
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    // Rotate around the visible start point (left edge, vertical center of the
    // border-box). "0 50%" in border-box coordinates — the border-box left edge
    // sits at (layoutX + marginLeft) = (layoutX + startX) in screen space, and
    // 50% of the border-box height is strokeWidth/2, so the origin lands at
    // (layoutX + startX, layoutY + startY) — the intended start point.
    this.el.style.transformOrigin = '0 50%';
    this.updateLine();
  }

  private updateLine(): void {
    const dx = this._endX - this._startX;
    const dy = this._endY - this._startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // Use marginLeft/marginTop for startX/startY offset so they compose with
    // setLayoutX/setLayoutY (which write to CSS left/top via property
    // listeners). Using left/top here would conflict — whichever was written
    // last would win.
    this.el.style.marginLeft = `${this._startX}px`;
    this.el.style.marginTop = `${this._startY - this._strokeWidth / 2}px`;
    this.el.style.width = `${len}px`;
    this.el.style.height = `${this._strokeWidth}px`;
    this.el.style.transform = `rotate(${angle}deg)`;
    this.updateStroke();
  }

  private updateStroke(): void {
    if (this._stroke === null) {
      this.el.style.background = 'none';
    } else {
      this.el.style.background = paintToCss(this._stroke);
    }
  }

  setStartX(x: number): void { this._startX = x; this.updateLine(); }
  setStartY(y: number): void { this._startY = y; this.updateLine(); }
  setEndX(x: number): void { this._endX = x; this.updateLine(); }
  setEndY(y: number): void { this._endY = y; this.updateLine(); }
  setStroke(p: Paint | null): void { this._stroke = p; this.updateStroke(); }
  setStrokeWidth(w: number): void { this._strokeWidth = w; this.updateLine(); }
}

export const Line = LineShape;

export class RectangleShape extends Shape {
  private _x = 0;
  private _y = 0;
  private _width = 0;
  private _height = 0;
  private _arcWidth = 0;
  private _arcHeight = 0;

  constructor(width: number = 0, height: number = 0) {
    super('rect');
    this._width = width;
    this._height = height;
    const el = this.shapeEl as unknown as SVGRectElement;
    el.setAttribute('width', String(width));
    el.setAttribute('height', String(height));
  }

  setX(x: number): void { this._x = x; (this.shapeEl as unknown as SVGRectElement).setAttribute('x', String(x)); }
  setY(y: number): void { this._y = y; (this.shapeEl as unknown as SVGRectElement).setAttribute('y', String(y)); }
  setWidth(w: number): void { this._width = w; (this.shapeEl as unknown as SVGRectElement).setAttribute('width', String(w)); }
  setHeight(h: number): void { this._height = h; (this.shapeEl as unknown as SVGRectElement).setAttribute('height', String(h)); }
  setArcWidth(w: number): void {
    this._arcWidth = w;
    (this.shapeEl as unknown as SVGRectElement).setAttribute('rx', String(w));
  }
  setArcHeight(h: number): void {
    this._arcHeight = h;
    (this.shapeEl as unknown as SVGRectElement).setAttribute('ry', String(h));
  }
}

/** Alias preserving the JavaFX name. */
export const Rectangle = RectangleShape;

export function paintToSvg(p: Paint | null): string {
  if (p === null) return 'none';
  return paintToCss(p);
}

export const TRANSPARENT_FILL: Color = Color.TRANSPARENT;
