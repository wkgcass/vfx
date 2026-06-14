import { Node } from './Node.js';
import { Property } from './Property.js';
import { Theme } from '../theme/Theme.js';
import { FontManager } from '../manager/font/FontManager.js';
import type { Color, Paint } from './color.js';

export class CheckBox extends Node {
  readonly selectedProperty = new Property<boolean>(false);

  private _text: string;
  private _textFill: Color | null = null;
  private readonly boxEl: HTMLElement;
  private readonly checkEl: SVGElement;
  private readonly labelEl: HTMLElement;

  private _onAction: ((e: { consume(): void }) => void) | null = null;

  constructor(text: string = '') {
    super(document.createElement('label'));
    this._text = text;

    this.el.style.display = 'inline-flex';
    this.el.style.alignItems = 'center';
    this.el.style.gap = '6px';
    this.el.style.cursor = 'pointer';
    this.el.style.userSelect = 'none';
    this.el.style.fontFamily = 'sans-serif';
    this.el.style.fontSize = '14px';

    this.boxEl = document.createElement('span');
    this.boxEl.style.display = 'inline-block';
    this.boxEl.style.width = '14px';
    this.boxEl.style.height = '14px';
    this.boxEl.style.border = `1px solid ${Theme.current().normalTextColor().toCss()}`;
    this.boxEl.style.borderRadius = '2px';
    this.boxEl.style.boxSizing = 'border-box';
    this.boxEl.style.position = 'relative';
    this.boxEl.style.flex = '0 0 auto';

    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg') as SVGElement;
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.setAttribute('viewBox', '0 0 12 12');
    svg.style.position = 'absolute';
    svg.style.left = '1px';
    svg.style.top = '1px';
    svg.style.pointerEvents = 'none';
    svg.style.display = 'none';
    const path = document.createElementNS(svgNs, 'path');
    path.setAttribute('d', 'M2 6 L5 9 L10 3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', Theme.current().normalTextColor().toCss());
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    this.checkEl = svg;
    this.boxEl.appendChild(svg);

    this.labelEl = document.createElement('span');
    this.labelEl.textContent = text;
    this.labelEl.style.color = Theme.current().normalTextColor().toCss();

    this.el.appendChild(this.boxEl);
    this.el.appendChild(this.labelEl);

    this.el.addEventListener('click', (e) => {
      e.preventDefault();
      this.setSelected(!this.selectedProperty.get());
      this._onAction?.({ consume: () => { /* no-op */ } });
    });
  }

  getText(): string { return this._text; }
  setText(t: string): void {
    this._text = t;
    this.labelEl.textContent = t;
  }

  setTextFill(c: Paint): void {
    this._textFill = c as Color;
    const css = typeof c === 'string' ? c : (c as Color).toCss();
    this.labelEl.style.color = css;
  }
  getTextFill(): Color | null { return this._textFill; }

  isSelected(): boolean { return this.selectedProperty.get(); }
  setSelected(v: boolean): void {
    if (this.selectedProperty.get() === v) return;
    this.selectedProperty.set(v);
    this.checkEl.style.display = v ? '' : 'none';
  }

  setOnAction(h: ((e: { consume(): void }) => void) | null): void { this._onAction = h; }

  setFont(css: string): void {
    this.el.style.font = css;
  }
}

export function createCheckBox(text: string): CheckBox {
  const cb = new CheckBox(text);
  FontManager.get().setFont(cb);
  return cb;
}

export { Color };
