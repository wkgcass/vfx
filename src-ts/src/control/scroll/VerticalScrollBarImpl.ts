import { Node } from '../../javafx/Node.js';
import { backgroundFill, CornerRadii } from '../../javafx/layout.js';

export class VerticalScrollBarImpl extends Node {
  static get SCROLL_WIDTH(): number { return 4; }

  private _length: number;
  private _width: number;

  constructor(scrollWidth: number) {
    super(document.createElement('div'));
    this._length = 1;
    this._width = scrollWidth;
    this.el.style.width = `${scrollWidth}px`;
    this.el.style.height = '1px';
    this.el.style.borderRadius = `${scrollWidth / 2}px`;
  }

  setStrokeColor(css: string): void {
    this.setBackground(backgroundFill(
      css,
      CornerRadii.uniform(VerticalScrollBarImpl.SCROLL_WIDTH / 2),
    ));
  }

  setWidth(w: number): void {
    this._width = w;
    this.el.style.width = `${w}px`;
    this.el.style.borderRadius = `${w / 2}px`;
  }

  setLength(length: number): void {
    this._length = length;
    this.el.style.height = `${length}px`;
  }

  getLength(): number {
    return this._length;
  }
}
