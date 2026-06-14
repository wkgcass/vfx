import { Parent } from './Parent.js';
import { Insets } from './layout.js';
import { Node } from './Node.js';

export class VBox extends Parent {
  spacing: number = 0;
  padding: Insets = Insets.EMPTY;
  fillWidth: boolean = true;

  constructor(...children: Node[]) {
    super(document.createElement('div'));
    this.el.style.display = 'flex';
    this.el.style.flexDirection = 'column';
    this.el.style.position = 'relative';
    for (const c of children) this.getChildren().add(c);
  }

  // VBox uses flex flow, so children must be position:relative (the Node
  // base constructor leaves them at position:absolute by default).
  protected override _onChildrenChanged(added: Node[], removed: Node[]): void {
    super._onChildrenChanged(added, removed);
    for (const a of added) {
      a.el.style.position = 'relative';
    }
  }

  setSpacing(v: number): void {
    this.spacing = v;
    this.el.style.gap = `${v}px`;
  }

  setPadding(i: Insets): void {
    this.padding = i;
    this.el.style.padding = `${i.top}px ${i.right}px ${i.bottom}px ${i.left}px`;
  }

  setFillWidth(v: boolean): void {
    this.fillWidth = v;
  }

  layoutChildren(): void {
    if (this.fillWidth) {
      for (const c of this.children) {
        c.el.style.flex = '0 0 auto';
        c.el.style.alignSelf = 'stretch';
      }
    }
  }
}
