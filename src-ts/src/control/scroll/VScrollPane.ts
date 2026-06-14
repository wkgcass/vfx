import { Pane } from '../../javafx/Pane.js';
import { Node } from '../../javafx/Node.js';
import { Property } from '../../javafx/Property.js';
import { Theme } from '../../theme/Theme.js';
import { AnimationGraphBuilder } from '../../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { DoubleData } from '../../util/algebradata/DoubleData.js';
import { FXUtils } from '../../util/FXUtils.js';
import { DragHandler } from '../drag/DragHandler.js';
import { Viewport } from './Viewport.js';
import { ScrollDirection } from './ScrollDirection.js';
import { VerticalScrollBarImpl } from './VerticalScrollBarImpl.js';
import { HorizontalScrollBarImpl } from './HorizontalScrollBarImpl.js';
import type { NodeWithVScrollPane } from './NodeWithVScrollPane.js';

export class VScrollPane implements NodeWithVScrollPane {
  static readonly SCROLL_WIDTH = 4;
  static readonly SCROLL_PADDING = 2;
  private static readonly SCROLL_MIN_LENGTH = 25;

  private scrollSpeed = 5;
  private readonly root: Pane;
  private readonly viewport: Viewport;
  private readonly scrollBarV: VerticalScrollBarImpl;
  private readonly scrollBarH: HorizontalScrollBarImpl;
  private verticalScrollBarLayoutX: number | null = null;
  private horizontalScrollBarLayoutY: number | null = null;

  private readonly animationHide: AnimationNode<DoubleData>;
  private readonly animationShow: AnimationNode<DoubleData>;
  private readonly animationHideShow;
  private scrollDirection: ScrollDirection;

  constructor();
  constructor(direction: ScrollDirection);
  constructor(direction: ScrollDirection = ScrollDirection.VERTICAL) {
    this.scrollDirection = direction;
    this.root = new Pane();
    this.viewport = new Viewport();
    this.scrollBarV = new VerticalScrollBarImpl(VScrollPane.SCROLL_WIDTH);
    this.scrollBarV.setMouseTransparent(true);
    this.scrollBarH = new HorizontalScrollBarImpl(VScrollPane.SCROLL_WIDTH);
    this.scrollBarH.setMouseTransparent(true);

    const sbColor = Theme.current().scrollBarColor().toCss();
    this.scrollBarV.setStrokeColor(sbColor);
    this.scrollBarH.setStrokeColor(sbColor);

    this.scrollBarV.setWidth(VScrollPane.SCROLL_WIDTH);
    this.scrollBarH.setHeight(VScrollPane.SCROLL_WIDTH);

    this.animationHide = new AnimationNode<DoubleData>('hide', new DoubleData(0));
    this.animationShow = new AnimationNode<DoubleData>('show', new DoubleData(1));
    this.animationHideShow = AnimationGraphBuilder.simpleTwoNodeGraph<DoubleData>(
      this.animationHide, this.animationShow, 300,
    )
      .setApply((_f: AnimationNode<DoubleData> | null, _t: AnimationNode<DoubleData>, d: DoubleData) => {
        this.scrollBarV.setOpacity(d.value);
        this.scrollBarH.setOpacity(d.value);
      })
      .build(this.animationHide);

    this.viewport.getNode().el.addEventListener('wheel', (e: WheelEvent) => {
      if (this.scrollDirection === ScrollDirection.NONE) return;
      const ll = this.scrollDirection === ScrollDirection.HORIZONTAL
        ? this.viewport.getContentWidth()
        : this.viewport.getContentHeight();
      if (ll === 0) return;
      if (this.scrollDirection === ScrollDirection.HORIZONTAL) {
        if (ll <= this.root.getWidth()) return;
      } else {
        if (ll <= this.root.getHeight()) return;
      }
      const dd = (e.deltaY * this.scrollSpeed) / ll;
      if (this.scrollDirection === ScrollDirection.HORIZONTAL) {
        this.setHvalue(this.getHvalue() - dd);
      } else {
        this.setVvalue(this.getVvalue() - dd);
      }
      e.preventDefault();
      // Stop the wheel event from bubbling into ancestor VScrollPanes.
      // The demo's "very long VTableView in a horizontal VScrollPane" nests
      // an inner vertical VScrollPane (the table's own row scroller) inside
      // the outer horizontal one. The wheel listener lives on each
      // viewport's element; without stopPropagation, a wheel over a cell
      // bubbles through BOTH viewports and triggers horizontal AND vertical
      // scroll simultaneously. Consuming the event here means only the
      // innermost scroll pane (the one whose viewport received the wheel)
      // reacts — matching the natural "wheel scrolls what you're pointing
      // at" expectation.
      e.stopPropagation();
    });

    const dragScrollHandler = new (class extends DragHandler {
      owner: VScrollPane;
      constructor(owner: VScrollPane) {
        super();
        this.owner = owner;
      }
      protected set(x: number, y: number): void {
        this.owner.setHpos(x);
        this.owner.setVpos(y);
      }
      protected get(): [number, number] {
        return [this.owner.viewport.getHpos(), this.owner.viewport.getVpos()];
      }
    })(this);
    this.viewport.getNode().setOnMousePressed((e) => dragScrollHandler.handlePressed(e));
    this.viewport.getNode().setOnMouseDragged((e) => dragScrollHandler.handleDragged(e));

    this.root.widthProperty.addListener((_o, now) => {
      if (now === null) return;
      const w = now;
      this.viewport.getNode().setPrefWidth(w);
      this.updateScrollHWidthAndPosition();
      if (this.verticalScrollBarLayoutX === null) {
        this.scrollBarV.setLayoutX(w - VScrollPane.SCROLL_WIDTH - VScrollPane.SCROLL_PADDING);
      } else {
        this.scrollBarH.setLayoutX(this.verticalScrollBarLayoutX);
      }
    });
    this.root.heightProperty.addListener((_o, now) => {
      if (now === null) return;
      const h = now;
      this.viewport.getNode().setPrefHeight(h);
      this.updateScrollVHeightAndPosition();
      if (this.horizontalScrollBarLayoutY === null) {
        this.scrollBarH.setLayoutY(h - VScrollPane.SCROLL_WIDTH - VScrollPane.SCROLL_PADDING);
      } else {
        this.scrollBarH.setLayoutY(this.horizontalScrollBarLayoutY);
      }
    });

    this.root.getChildren().addAll(this.viewport.getNode(), this.scrollBarV, this.scrollBarH);

    this.root.setOnMouseEntered(() => this.animationHideShow.play(this.animationShow));
    this.root.setOnMouseExited(() => this.animationHideShow.play(this.animationHide));
  }

  private updateScrollVHeightAndPosition(): void {
    const h = this.root.getHeight();
    if (h === 0) return;
    const content = this.viewport.getContent();
    if (content === null) {
      this.scrollBarV.setVisible(false);
      return;
    }
    const boundsH = this.viewport.getContentHeight();
    if (boundsH <= h) {
      this.scrollBarV.setVisible(false);
      return;
    }
    const p = h / boundsH;
    let length = p * h;
    if (length < VScrollPane.SCROLL_MIN_LENGTH) length = VScrollPane.SCROLL_MIN_LENGTH;
    this.scrollBarV.setLength(length);
    this.updateScrollVPosition(h, length);
    this.scrollBarV.setVisible(true);
  }

  private updateScrollVPosition(): void;
  private updateScrollVPosition(scrollPaneHeight: number, scrollBarLength: number): void;
  private updateScrollVPosition(scrollPaneHeight?: number, scrollBarLength?: number): void {
    if (scrollPaneHeight === undefined) {
      const h = this.root.getHeight();
      if (h === 0) return;
      scrollPaneHeight = h;
      scrollBarLength = this.scrollBarV.getLength();
    }
    const p = this.getVvalue();
    const y = (scrollPaneHeight - (scrollBarLength as number)) * p;
    this.scrollBarV.setLayoutY(y);
  }

  private updateScrollHWidthAndPosition(): void {
    const w = this.root.getWidth();
    if (w === 0) return;
    const content = this.viewport.getContent();
    if (content === null) {
      this.scrollBarH.setVisible(false);
      return;
    }
    const boundsW = this.viewport.getContentWidth();
    if (boundsW <= w) {
      this.scrollBarH.setVisible(false);
      return;
    }
    const p = w / boundsW;
    let length = p * w;
    if (length < VScrollPane.SCROLL_MIN_LENGTH) length = VScrollPane.SCROLL_MIN_LENGTH;
    this.scrollBarH.setLength(length);
    this.updateScrollHPosition(w, length);
    this.scrollBarH.setVisible(true);
  }

  private updateScrollHPosition(): void;
  private updateScrollHPosition(scrollPaneWidth: number, scrollBarLength: number): void;
  private updateScrollHPosition(scrollPaneWidth?: number, scrollBarLength?: number): void {
    if (scrollPaneWidth === undefined) {
      const w = this.root.getWidth();
      if (w === 0) return;
      scrollPaneWidth = w;
      scrollBarLength = this.scrollBarH.getLength();
    }
    const p = this.getHvalue();
    const x = (scrollPaneWidth - (scrollBarLength as number)) * p;
    this.scrollBarH.setLayoutX(x);
  }

  getScrollSpeed(): number { return this.scrollSpeed; }
  setScrollSpeed(v: number): void { this.scrollSpeed = v; }

  getNode(): Pane { return this.root; }

  getVvalue(): number { return this.viewport.getVvalue(); }
  getHvalue(): number { return this.viewport.getHvalue(); }

  setVvalue(v: number): void {
    this.viewport.setVvalue(v);
    this.updateScrollVPosition();
  }
  setHvalue(v: number): void {
    this.viewport.setHvalue(v);
    this.updateScrollHPosition();
  }

  vposProperty(): Property<number> { return this.viewport.vposProperty(); }
  getVpos(): number { return this.viewport.getVpos(); }
  setVpos(v: number): void {
    this.viewport.setVpos(v);
    this.updateScrollVPosition();
  }

  hposProperty(): Property<number> { return this.viewport.hposProperty(); }
  getHpos(): number { return this.viewport.getHpos(); }
  setHpos(v: number): void {
    this.viewport.setHpos(v);
    this.updateScrollHPosition();
  }

  setContent(node: Node): void {
    this.viewport.setContent(node);
    this.viewport.onContentExtentChanged = () => {
      this.updateScrollVHeightAndPosition();
      this.updateScrollHWidthAndPosition();
    };
  }

  setVerticalScrollBarLayoutX(x: number | null): void {
    this.verticalScrollBarLayoutX = x;
    if (x !== null) this.scrollBarV.setLayoutX(x);
  }

  setHorizontalScrollBarLayoutY(y: number | null): void {
    this.horizontalScrollBarLayoutY = y;
    if (y !== null) this.scrollBarH.setLayoutY(y);
  }

  getScrollDirection(): ScrollDirection { return this.scrollDirection; }
  setScrollDirection(d: ScrollDirection): void { this.scrollDirection = d; }

  getScrollPane(): VScrollPane { return this; }
  getSelfNode(): Pane { return this.getNode(); }

  static makeHorizontalScrollPaneToManage(node: NodeWithVScrollPane): VScrollPane {
    const pane = new VScrollPane(ScrollDirection.HORIZONTAL);
    pane.setContent(node.getSelfNode());
    const update = () => {
      node.getScrollPane().setVerticalScrollBarLayoutX(
        -pane.getHpos() + pane.getNode().getWidth() - VScrollPane.SCROLL_WIDTH - VScrollPane.SCROLL_PADDING,
      );
    };
    pane.getNode().widthProperty.addListener(() => update());
    pane.hposProperty().addListener(() => update());
    FXUtils.observeHeight(node.getSelfNode(), pane.getNode());
    return pane;
  }
}
