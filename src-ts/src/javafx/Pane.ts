import { Node } from './Node.js';
import { Parent } from './Parent.js';

export class Pane extends Parent {
  constructor() {
    super(document.createElement('div'));
    // position:relative lets this Pane act as the containing block for its
    // absolutely-positioned children. (The children's position is forced to
    // 'absolute' in _onChildrenChanged below.)
    this.el.style.position = 'relative';
  }

  protected override _onChildrenChanged(added: Node[], removed: Node[]): void {
    super._onChildrenChanged(added, removed);
    // Children of a free-form Pane participate in absolute positioning, even
    // if they are Panes themselves (whose constructor would otherwise leave
    // them at position:relative and cause them to flow/block-stack).
    for (const a of added) {
      a.el.style.position = 'absolute';
    }
  }

  protected applyCss(): void {
    super.applyCss();
  }

  layoutChildren(): void {}
}

export class Group extends Parent {
  constructor() {
    super(document.createElement('div'));
    this.el.style.position = 'relative';
    this.el.style.display = 'inline-block';
  }

  protected override _onChildrenChanged(added: Node[], removed: Node[]): void {
    super._onChildrenChanged(added, removed);
    for (const a of added) {
      a.el.style.position = 'absolute';
    }
  }

  layoutChildren(): void {
    let maxX = 0;
    let maxY = 0;
    for (const c of this.children) {
      maxX = Math.max(maxX, c.getLayoutX() + c.getWidthOrPref());
      maxY = Math.max(maxY, c.getLayoutY() + c.getHeightOrPref());
    }
    if (maxX > 0 && maxY > 0) {
      this.el.style.width = `${maxX}px`;
      this.el.style.height = `${maxY}px`;
    }
  }
}

export class StackPane extends Pane {
  constructor() {
    super();
    this.el.style.display = 'flex';
    this.el.style.alignItems = 'center';
    this.el.style.justifyContent = 'center';
  }

  // Pane's _onChildrenChanged forces children to position:absolute, but
  // StackPane uses flex centering so children must participate in flow
  // (position:relative). Re-assert relative after Pane's behavior runs.
  protected override _onChildrenChanged(added: Node[], removed: Node[]): void {
    super._onChildrenChanged(added, removed);
    for (const a of added) {
      a.el.style.position = 'relative';
    }
  }

  layoutChildren(): void {
  }
}
