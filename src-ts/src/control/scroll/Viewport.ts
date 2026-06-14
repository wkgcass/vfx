import { Pane } from '../../javafx/Pane.js';
import { Group } from '../../javafx/Pane.js';
import { Node } from '../../javafx/Node.js';
import { Parent } from '../../javafx/Parent.js';
import { Property } from '../../javafx/Property.js';

export class Viewport {
  private readonly root: Pane;
  private readonly container: Group;
  private lastContentHeight = 0;
  private lastContentWidth = 0;
  onContentExtentChanged: (() => void) | null = null;

  private readonly _vposProperty: Property<number>;
  private readonly _hposProperty: Property<number>;

  constructor() {
    this.root = new Pane();
    this.root.el.style.overflow = 'hidden';
    this.container = new Group();
    this.root.getChildren().add(this.container);

    this._vposProperty = new Property<number>(0);
    this._hposProperty = new Property<number>(0);

    this.root.widthProperty.addListener(() => this.updateHPos());
    this.root.heightProperty.addListener(() => this.updateVPos());

    this.container.layoutXProperty.addListener((_, n) => {
      if (n !== null) this._hposProperty.set(n);
    });
    this.container.layoutYProperty.addListener((_, n) => {
      if (n !== null) this._vposProperty.set(n);
    });

    this._vposProperty.addListener((_, n) => {
      if (n !== null) this.setVpos(n);
    });
    this._hposProperty.addListener((_, n) => {
      if (n !== null) this.setHpos(n);
    });
  }

  private updateVPos(): void {
    if (this.container.getChildrenUnmodifiable().length === 0) return;
    const height = this.lastContentHeight;
    const viewportH = this.root.getHeight();
    if (viewportH >= height) {
      this.container.setLayoutY(0);
      return;
    }
    const y = this.container.getLayoutY();
    if (height - viewportH + y < 0) {
      this.container.setLayoutY(viewportH - height);
    }
  }

  getVvalue(): number {
    if (this.container.getChildrenUnmodifiable().length === 0) return 0;
    const height = this.lastContentHeight;
    const viewportH = this.root.getHeight();
    const y = this.container.getLayoutY();
    if (y === 0) return 0;
    if (viewportH >= height) return 0;
    return -y / (height - viewportH);
  }

  setVvalue(vvalue: number): void {
    if (this.container.getChildrenUnmodifiable().length === 0) return;
    if (vvalue < 0) {
      this.container.setLayoutY(0);
      return;
    }
    if (vvalue > 1) vvalue = 1;
    const height = this.lastContentHeight;
    const viewportH = this.root.getHeight();
    if (viewportH >= height) return;
    const y = (height - viewportH) * vvalue;
    this.container.setLayoutY(-y);
  }

  private updateHPos(): void {
    if (this.container.getChildrenUnmodifiable().length === 0) return;
    const width = this.lastContentWidth;
    const viewportW = this.root.getWidth();
    if (viewportW >= width) {
      this.container.setLayoutX(0);
      return;
    }
    const x = this.container.getLayoutX();
    if (width - viewportW + x < 0) {
      this.container.setLayoutX(viewportW - width);
    }
  }

  getHvalue(): number {
    if (this.container.getChildrenUnmodifiable().length === 0) return 0;
    const width = this.lastContentWidth;
    const viewportW = this.root.getWidth();
    const x = this.container.getLayoutX();
    if (x === 0) return 0;
    if (viewportW >= width) return 0;
    return -x / (width - viewportW);
  }

  setHvalue(hvalue: number): void {
    if (this.container.getChildrenUnmodifiable().length === 0) return;
    if (hvalue < 0) {
      this.container.setLayoutX(0);
      return;
    }
    if (hvalue > 1) hvalue = 1;
    const width = this.lastContentWidth;
    const viewportW = this.root.getWidth();
    if (viewportW >= width) return;
    const x = (width - viewportW) * hvalue;
    this.container.setLayoutX(-x);
  }

  vposProperty(): Property<number> { return this._vposProperty; }

  getVpos(): number { return this.container.getLayoutY(); }

  setVpos(vpos: number): void {
    const height = this.lastContentHeight;
    const viewportH = this.root.getHeight();
    if (vpos < viewportH - height) vpos = viewportH - height;
    if (vpos > 0) vpos = 0;
    this._vposProperty.set(vpos);
    this.container.setLayoutY(vpos);
  }

  hposProperty(): Property<number> { return this._hposProperty; }

  getHpos(): number { return this.container.getLayoutX(); }

  setHpos(hpos: number): void {
    const width = this.lastContentWidth;
    const viewportW = this.root.getWidth();
    if (hpos < viewportW - width) hpos = viewportW - width;
    if (hpos > 0) hpos = 0;
    this._hposProperty.set(hpos);
    this.container.setLayoutX(hpos);
  }

  setContent(node: Node | null): void {
    const kids = this.container.getChildren();
    if (node === null) {
      if (!kids.isEmpty()) kids.removeAt(0);
      return;
    }
    if (kids.isEmpty()) {
      kids.add(node);
    } else {
      kids.removeAt(0);
      kids.add(node);
    }

    // Content extent mirrors JavaFX: `content.getLayoutBounds().getWidth/
    // getHeight()` returns the content node's OWN dimensions, not the
    // bounding box of its children. Using the node's own size prevents a
    // child that intentionally overflows its parent (e.g. the VStage
    // movingPane, sized to stage.width, living inside the rootContent
    // contentPane sized to stage.width-2) from widening the scroll extent
    // — which would otherwise give the drag-scroll handler a couple of
    // pixels of slack and shift the whole UI on every drag.
    //
    // There is one TS-specific wrinkle: the JavaFX Pane auto-sizes its
    // prefWidth/prefHeight from its children, but the TS port does not.
    // So a Pane with absolutely-positioned children and no explicit
    // prefHeight (e.g. the menu scene's contentPane, which only calls
    // enableAutoContentWidth) reports getHeight() == 0 from the DOM
    // because CSS absolute children don't contribute to the parent's
    // height. In Java, getLayoutBounds() would still return the
    // children-derived height. To match that observable behavior we
    // fall back to the children's bounding box ONLY when the node's own
    // reported dimension is 0 — never when it's positive, so the
    // movingPane-style overflow case above stays clamped.
    const computeExtent = (): void => {
      let h = node.getHeight();
      let w = node.getWidth();
      if (node instanceof Parent) {
        let childrenH = 0;
        let childrenW = 0;
        for (const child of node.getChildrenUnmodifiable()) {
          const bottom = child.getLayoutY() + child.getHeight();
          const right = child.getLayoutX() + child.getWidth();
          if (bottom > childrenH) childrenH = bottom;
          if (right > childrenW) childrenW = right;
        }
        if (h === 0) h = childrenH;
        if (w === 0) w = childrenW;
      }
      this.lastContentHeight = h;
      this.lastContentWidth = w;
      this.updateVPos();
      this.updateHPos();
      this.onContentExtentChanged?.();
    };

    node.widthProperty.addListener(computeExtent);
    node.heightProperty.addListener(computeExtent);

    // When the content is a Parent whose own height/width is 0 (so the
    // extent relies on the children fallback above), we must recompute
    // when its children resize or are added/removed. Track each child's
    // width/height and the children list itself.
    if (node instanceof Parent) {
      const trackChild = (child: Node): void => {
        if (!(child as unknown as { _extentTracked?: boolean })._extentTracked) {
          child.widthProperty.addListener(computeExtent);
          child.heightProperty.addListener(computeExtent);
          (child as unknown as { _extentTracked?: boolean })._extentTracked = true;
        }
      };
      for (const child of node.getChildrenUnmodifiable()) trackChild(child);
      node.children.addListener(() => {
        for (const child of node.getChildrenUnmodifiable()) trackChild(child);
        computeExtent();
      });
    }

    computeExtent();
  }

  getNode(): Pane { return this.root; }

  getContent(): Node | null {
    const kids = this.container.getChildrenUnmodifiable();
    return kids.length === 0 ? null : kids[0] ?? null;
  }

  getContentHeight(): number { return this.lastContentHeight; }
  getContentWidth(): number { return this.lastContentWidth; }
}
