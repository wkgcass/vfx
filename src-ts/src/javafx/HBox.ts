import { Parent } from './Parent.js';
import { Insets, Pos } from './layout.js';
import { Node } from './Node.js';

export class HBox extends Parent {
  spacing: number = 0;
  padding: Insets = Insets.EMPTY;
  alignment: Pos = Pos.CENTER_LEFT;

  constructor(...children: Node[]) {
    super(document.createElement('div'));
    this.el.style.display = 'flex';
    this.el.style.flexDirection = 'row';
    this.el.style.position = 'relative';
    for (const c of children) this.getChildren().add(c);
  }

  // HBox uses flex flow, so children must be position:relative (the Node
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

  setAlignment(p: Pos): void {
    this.alignment = p;
    const map: Record<string, [string, string]> = {
      [Pos.TOP_LEFT]: ['flex-start', 'flex-start'],
      [Pos.TOP_CENTER]: ['center', 'flex-start'],
      [Pos.TOP_RIGHT]: ['flex-end', 'flex-start'],
      [Pos.CENTER_LEFT]: ['flex-start', 'center'],
      [Pos.CENTER]: ['center', 'center'],
      [Pos.CENTER_RIGHT]: ['flex-end', 'center'],
      [Pos.BOTTOM_LEFT]: ['flex-start', 'flex-end'],
      [Pos.BOTTOM_CENTER]: ['center', 'flex-end'],
      [Pos.BOTTOM_RIGHT]: ['flex-end', 'flex-end'],
    };
    const [justifyContent, alignItems] = map[p] ?? ['flex-start', 'center'];
    this.el.style.alignItems = alignItems;
    this.el.style.justifyContent = justifyContent;
  }
}
