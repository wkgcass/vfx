import { Node } from '../../javafx/Node.js';
import { backgroundFill, CornerRadii } from '../../javafx/layout.js';

export class HorizontalScrollBarImpl extends Node {
  static get SCROLL_WIDTH(): number { return 4; }

  private _length: number;
  private _height: number;

  constructor(scrollWidth: number) {
    super(document.createElement('div'));
    this._length = 1;
    this._height = scrollWidth;
    this.el.style.width = '1px';
    this.el.style.height = `${scrollWidth}px`;
    this.el.style.borderRadius = `${scrollWidth / 2}px`;
  }

  setStrokeColor(css: string): void {
    this.setBackground(backgroundFill(
      css,
      CornerRadii.uniform(HorizontalScrollBarImpl.SCROLL_WIDTH / 2),
    ));
  }

  setHeight(h: number): void {
    this._height = h;
    this.el.style.height = `${h}px`;
    this.el.style.borderRadius = `${h / 2}px`;
  }

  setLength(length: number): void {
    this._length = length;
    this.el.style.width = `${length}px`;
  }

  getLength(): number {
    return this._length;
  }
}
