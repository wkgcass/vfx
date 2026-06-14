import { Parent } from './Parent.js';
import { Color, Paint, paintToCss } from './color.js';

export class Scene {
  readonly root: Parent;
  readonly container: HTMLElement;

  constructor(root: Parent, container?: HTMLElement) {
    this.root = root;
    this.container = container ?? document.body;
    root.el.style.position = 'absolute';
    root.el.style.left = '0';
    root.el.style.top = '0';
    root.el.style.width = '100%';
    root.el.style.height = '100%';
    root.el.style.overflow = 'hidden';
    this.container.appendChild(root.el);
    root.parent = null;
    root.observeSize();
    this.root.paint();
  }

  setFill(paint: Paint): void {
    this.container.style.background = paintToCss(paint);
  }

  getRoot(): Parent { return this.root; }
}

export { Color };
