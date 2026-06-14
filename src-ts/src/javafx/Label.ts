import { Node } from './Node.js';
import { Pos } from './layout.js';
import { Property } from './Property.js';
import type { Color, Paint } from './color.js';

export class Label extends Node {
  protected _text: string = '';
  protected _textFill: Color | null = null;
  protected _font: string | null = null;
  protected _wrapText: boolean = false;
  protected _alignment: Pos = Pos.CENTER_LEFT;
  protected _graphic: Node | null = null;
  readonly textProperty = new Property<string>('');

  constructor(text: string = '') {
    super(document.createElement('div'));
    this._text = text;
    this.textProperty.set(text);
    this.el.textContent = text;
    this.el.style.whiteSpace = 'pre';
    this.el.style.userSelect = 'none';
    this.el.style.fontFamily = 'sans-serif';
    this.el.style.fontSize = '14px';
    this.el.style.display = 'inline-block';
  }

  setText(t: string): void {
    this._text = t;
    this.textProperty.set(t);
    this.el.textContent = t;
  }
  getText(): string { return this._text; }

  setTextFill(c: Paint): void {
    this._textFill = c as Color;
    this.el.style.color = typeof c === 'string' ? c : (c as Color).toCss();
  }

  setWrapText(v: boolean): void {
    this._wrapText = v;
    this.el.style.whiteSpace = v ? 'pre-wrap' : 'pre';
    this.el.style.wordBreak = v ? 'break-word' : 'normal';
  }

  setFont(css: string): void {
    this._font = css;
    this.el.style.font = css;
  }
  getFont(): string | null { return this._font; }

  setAlignment(p: Pos): void {
    this._alignment = p;
    const map: Record<string, [string, string]> = {
      [Pos.CENTER_LEFT]: ['left', 'center'],
      [Pos.CENTER]: ['center', 'center'],
      [Pos.CENTER_RIGHT]: ['right', 'center'],
      [Pos.TOP_LEFT]: ['left', 'top'],
      [Pos.TOP_CENTER]: ['center', 'top'],
      [Pos.TOP_RIGHT]: ['right', 'top'],
      [Pos.BOTTOM_LEFT]: ['left', 'bottom'],
      [Pos.BOTTOM_CENTER]: ['center', 'bottom'],
      [Pos.BOTTOM_RIGHT]: ['right', 'bottom'],
    };
    const [ta, va] = map[p] ?? ['left', 'center'];
    this.el.style.textAlign = ta;
    this.el.style.display = 'flex';
    this.el.style.alignItems = va === 'top' ? 'flex-start' : va === 'bottom' ? 'flex-end' : 'center';
    this.el.style.justifyContent = ta === 'left' ? 'flex-start' : ta === 'right' ? 'flex-end' : 'center';
  }

  setGraphic(node: Node | null): void {
    if (this._graphic !== null && this._graphic.el.parentElement === this.el) {
      this.el.removeChild(this._graphic.el);
    }
    this._graphic = node;
    if (node !== null) {
      this.el.appendChild(node.el);
    }
  }
}

/**
 * javafx.scene.text.Text — same as Label but without box-model niceties.
 * vfx uses it for measuring text bounds.
 */
export class Text extends Label {}
