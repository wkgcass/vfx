import { Property } from './Property.js';
import { Paint, paintToCss } from './color.js';
import {
  Background,
  BackgroundFill,
  Border,
  CornerRadii,
  Insets,
} from './layout.js';

let _idCounter = 0;
function nextId(): string {
  _idCounter += 1;
  return `vfx-${_idCounter}`;
}

/**
 * Frame-batched scheduler for Node width/height property updates coming
 * out of ResizeObserver callbacks.
 *
 * Why this exists: a ResizeObserver callback that synchronously mutates
 * another element's size re-feeds the browser's RO delivery loop, and
 * Chrome eventually fires the "ResizeObserver loop completed with
 * undelivered notifications" error. Deferring the mutation via
 * `queueMicrotask` is NOT sufficient — Chrome drains the microtask queue
 * between RO callbacks, still inside the RO processing step. Moving the
 * mutation to a `requestAnimationFrame` callback provably puts it outside
 * RO delivery (rAF runs after RO processing in the render step); any
 * style change made there lands in the next frame's RO gather pass.
 *
 * To avoid one rAF registration per observed node per frame (which would
 * be a lot — every Node has its own RO), we batch: a single rAF per
 * frame flushes every queued update. Each node only keeps its most
 * recently captured size, so rapid RO deliveries for the same node
 * coalesce.
 */
const _pendingNodeSizeUpdates = new Map<Node, { w: number; h: number }>();
let _nodeSizeRafScheduled = false;
function scheduleNodeSizeUpdate(node: Node, w: number, h: number): void {
  _pendingNodeSizeUpdates.set(node, { w, h });
  if (_nodeSizeRafScheduled) return;
  _nodeSizeRafScheduled = true;
  requestAnimationFrame(() => {
    _nodeSizeRafScheduled = false;
    // Snapshot the pending entries and clear the map so any updates
    // scheduled DURING the flush (e.g. a listener that synchronously
    // resizes its own element and re-triggers RO) land in a new batch
    // for the next frame, not the one we're currently iterating.
    const pending = [..._pendingNodeSizeUpdates.entries()];
    _pendingNodeSizeUpdates.clear();
    for (const [n, { w: nw, h: nh }] of pending) {
      if (Math.abs(nw - n.widthProperty.get()) > 0.001) {
        n.widthProperty.set(nw);
      }
      if (Math.abs(nh - n.heightProperty.get()) > 0.001) {
        n.heightProperty.set(nh);
      }
    }
  });
}

export interface VMouseEvent {
  source: Node;
  domEvent: MouseEvent | PointerEvent;
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  button: number;
}

export type MouseEventHanlder = (e: VMouseEvent) => void;
export type MouseEnteredHandler = (e: VMouseEvent) => void;
export type MouseExitedHandler = (e: VMouseEvent) => void;
export type MousePressedHandler = (e: VMouseEvent) => void;
export type MouseReleasedHandler = (e: VMouseEvent) => void;
export type MouseClickedHandler = (e: VMouseEvent) => void;
export type MouseDraggedHandler = (e: VMouseEvent) => void;
export type MouseMovedHandler = (e: VMouseEvent) => void;

/**
 * The base class. Subclasses must call super() with an HTMLElement
 * already created. Subclasses may override `applyCss()` to extend the
 * style application; the default writes the standard fields (layout,
 * opacity, background, border, etc.).
 */
export abstract class Node {
  readonly id: string;
  readonly el: HTMLElement;

  parent: Node | null = null;

  readonly layoutXProperty = new Property<number>(0);
  readonly layoutYProperty = new Property<number>(0);
  readonly widthProperty = new Property<number>(0);
  readonly heightProperty = new Property<number>(0);
  // Exposed as Properties so subscribers (e.g. VTableView) can observe
  // prefWidth changes before actual width propagates.
  readonly prefWidthProperty = new Property<number>(-1);
  readonly prefHeightProperty = new Property<number>(-1);

  prefWidth = -1;
  prefHeight = -1;
  minWidth = 0;
  minHeight = 0;
  maxWidth = Number.POSITIVE_INFINITY;
  maxHeight = Number.POSITIVE_INFINITY;

  private _opacity = 1;
  private _managed = true;
  private _visible = true;
  private _mouseTransparent = false;
  private _clip: Node | null = null;
  private _background: Background = Background.EMPTY;
  private _border: Border = Border.EMPTY;
  private _padding: Insets = Insets.EMPTY;
  private _cursor: string | null = null;
  private _extraStyle: Partial<CSSStyleDeclaration> = {};
  private _styleString: string | null = null;

  private _onMousePressed: MousePressedHandler | null = null;
  private _onMouseReleased: MouseReleasedHandler | null = null;
  private _onMouseClicked: MouseClickedHandler | null = null;
  private _onMouseEntered: MouseEnteredHandler | null = null;
  private _onMouseExited: MouseExitedHandler | null = null;
  private _onMouseDragged: MouseDraggedHandler | null = null;
  private _onMouseMoved: MouseMovedHandler | null = null;

  private readonly _boundMousePressed: (e: MouseEvent) => void;
  private readonly _boundMouseReleased: (e: MouseEvent) => void;
  private readonly _boundMouseClicked: (e: MouseEvent) => void;
  private readonly _boundMouseEntered: (e: MouseEvent) => void;
  private readonly _boundMouseExited: (e: MouseEvent) => void;
  private readonly _boundMouseDragged: (e: MouseEvent) => void;
  private readonly _boundMouseMoved: (e: MouseEvent) => void;

  private _resizeObserver: ResizeObserver | null = null;

  protected constructor(el: HTMLElement) {
    this.id = nextId();
    this.el = el;
    this.el.id = this.id;
    this.el.classList.add(`vfx-${this.constructor.name}`);

    this.el.style.position = 'absolute';
    this.el.style.boxSizing = 'border-box';

    this._boundMousePressed = (e) => this._dispatchMouse('pressed', e);
    this._boundMouseReleased = (e) => this._dispatchMouse('released', e);
    this._boundMouseClicked = (e) => this._dispatchMouse('clicked', e);
    this._boundMouseEntered = (e) => this._dispatchMouse('entered', e);
    this._boundMouseExited = (e) => this._dispatchMouse('exited', e);
    this._boundMouseDragged = (e) => this._dispatchMouse('dragged', e);
    this._boundMouseMoved = (e) => this._dispatchMouse('moved', e);

    this.layoutXProperty.addListener((_, v) => {
      this.el.style.left = `${v}px`;
    });
    this.layoutYProperty.addListener((_, v) => {
      this.el.style.top = `${v}px`;
    });
  }

  getLayoutX(): number { return this.layoutXProperty.get(); }
  setLayoutX(v: number): void { this.layoutXProperty.set(v); }
  getLayoutY(): number { return this.layoutYProperty.get(); }
  setLayoutY(v: number): void { this.layoutYProperty.set(v); }

  setPrefWidth(w: number): void {
    this.prefWidth = w;
    this.prefWidthProperty.set(w);
    if (w >= 0) this.el.style.width = `${w}px`;
  }
  setPrefHeight(h: number): void {
    this.prefHeight = h;
    this.prefHeightProperty.set(h);
    if (h >= 0) this.el.style.height = `${h}px`;
  }
  getPrefWidth(): number { return this.prefWidth; }
  getPrefHeight(): number { return this.prefHeight; }

  setMinWidth(w: number): void { this.minWidth = w; this.el.style.minWidth = `${w}px`; }
  setMinHeight(h: number): void { this.minHeight = h; this.el.style.minHeight = `${h}px`; }
  setMaxWidth(w: number): void {
    this.maxWidth = w;
    this.el.style.maxWidth = Number.isFinite(w) ? `${w}px` : 'none';
  }
  setMaxHeight(h: number): void {
    this.maxHeight = h;
    this.el.style.maxHeight = Number.isFinite(h) ? `${h}px` : 'none';
  }

  getWidth(): number { return this.widthProperty.get(); }
  getHeight(): number { return this.heightProperty.get(); }

  getWidthOrPref(): number {
    const w = this.getWidth();
    return w > 0 ? w : Math.max(0, this.prefWidth);
  }
  getHeightOrPref(): number {
    const h = this.getHeight();
    return h > 0 ? h : Math.max(0, this.prefHeight);
  }

  getOpacity(): number { return this._opacity; }
  setOpacity(v: number): void {
    this._opacity = v;
    this.el.style.opacity = String(v);
  }

  isManaged(): boolean { return this._managed; }
  setManaged(v: boolean): void {
    this._managed = v;
    this.el.style.display = v ? '' : 'none';
  }

  isVisible(): boolean { return this._visible; }
  setVisible(v: boolean): void {
    this._visible = v;
    this.el.style.visibility = v ? '' : 'hidden';
  }

  isMouseTransparent(): boolean { return this._mouseTransparent; }
  setMouseTransparent(v: boolean): void {
    this._mouseTransparent = v;
    this.el.style.pointerEvents = v ? 'none' : '';
  }

  getClip(): Node | null { return this._clip; }
  setClip(c: Node | null): void {
    this._clip = c;
    this.el.style.overflow = c !== null ? 'hidden' : '';
  }

  setBackground(bg: Background): void {
    this._background = bg;
    if (bg.hasBackground()) {
      this.el.style.background = bg.toCss();
      const r = bg.toRadiusCss();
      if (r !== '0') this.el.style.borderRadius = r;
      const insets = bg.toInsetsCss();
      if (insets) {
        this.el.style.backgroundClip = 'padding-box';
      }
    } else {
      this.el.style.background = '';
    }
  }
  getBackground(): Background { return this._background; }

  setBorder(b: Border): void {
    this._border = b;
    if (b.hasBorder()) {
      this.el.style.border = b.toCss();
      const radius = b.toBorderRadiusCss();
      if (radius !== '0') {
        if (!this.el.style.borderRadius) {
          this.el.style.borderRadius = radius;
        }
      }
    } else {
      this.el.style.border = '';
    }
  }
  getBorder(): Border { return this._border; }

  setPadding(i: Insets): void {
    this._padding = i;
    this.el.style.padding = `${i.top}px ${i.right}px ${i.bottom}px ${i.left}px`;
  }
  getPadding(): Insets { return this._padding; }

  setCursor(c: string | null): void {
    this._cursor = c;
    this.el.style.cursor = c ?? '';
  }
  getCursor(): string | null { return this._cursor; }

  /**
   * Merge extra CSS declarations. Useful for one-off styling like
   * JavaFX's setStyle("-fx-focus-color: transparent"). Keys are
   * camelCase (CSSStyleDeclaration property names).
   */
  setExtraStyle(patch: Partial<CSSStyleDeclaration>): void {
    Object.assign(this._extraStyle, patch);
    for (const [k, v] of Object.entries(patch)) {
      // @ts-expect-error CSSStyleDeclaration is a complex index type
      this.el.style[k] = v ?? '';
    }
  }

  /** Set CSS style by string (e.g. "color: red; border-radius: 4px;"). */
  setStyleString(s: string | null): void {
    this._styleString = s;
    if (s === null) {
      this.el.removeAttribute('style');
      this.applyCss();
    } else {
      this.el.setAttribute('style', s);
    }
  }

  setOnMousePressed(h: MousePressedHandler | null): void {
    if (this._onMousePressed === null && h !== null) {
      this.el.addEventListener('pointerdown', this._boundMousePressed);
    } else if (this._onMousePressed !== null && h === null) {
      this.el.removeEventListener('pointerdown', this._boundMousePressed);
    }
    this._onMousePressed = h;
  }
  setOnMouseReleased(h: MouseReleasedHandler | null): void {
    if (this._onMouseReleased === null && h !== null) {
      this.el.addEventListener('pointerup', this._boundMouseReleased);
    } else if (this._onMouseReleased !== null && h === null) {
      this.el.removeEventListener('pointerup', this._boundMouseReleased);
    }
    this._onMouseReleased = h;
  }
  setOnMouseClicked(h: MouseClickedHandler | null): void {
    if (this._onMouseClicked === null && h !== null) {
      this.el.addEventListener('click', this._boundMouseClicked);
    } else if (this._onMouseClicked !== null && h === null) {
      this.el.removeEventListener('click', this._boundMouseClicked);
    }
    this._onMouseClicked = h;
  }
  setOnMouseEntered(h: MouseEnteredHandler | null): void {
    if (this._onMouseEntered === null && h !== null) {
      this.el.addEventListener('mouseenter', this._boundMouseEntered);
    } else if (this._onMouseEntered !== null && h === null) {
      this.el.removeEventListener('mouseenter', this._boundMouseEntered);
    }
    this._onMouseEntered = h;
  }
  setOnMouseExited(h: MouseExitedHandler | null): void {
    if (this._onMouseExited === null && h !== null) {
      this.el.addEventListener('mouseleave', this._boundMouseExited);
    } else if (this._onMouseExited !== null && h === null) {
      this.el.removeEventListener('mouseleave', this._boundMouseExited);
    }
    this._onMouseExited = h;
  }
  setOnMouseDragged(h: MouseDraggedHandler | null): void {
    if (this._onMouseDragged === null && h !== null) {
      this.el.addEventListener('pointermove', this._boundMouseDragged);
    } else if (this._onMouseDragged !== null && h === null) {
      this.el.removeEventListener('pointermove', this._boundMouseDragged);
    }
    this._onMouseDragged = h;
  }
  setOnMouseMoved(h: MouseMovedHandler | null): void {
    if (this._onMouseMoved === null && h !== null) {
      this.el.addEventListener('pointermove', this._boundMouseMoved);
    } else if (this._onMouseMoved !== null && h === null) {
      this.el.removeEventListener('pointermove', this._boundMouseMoved);
    }
    this._onMouseMoved = h;
  }

  private _dispatchMouse(kind: string, e: MouseEvent): void {
    const ev: VMouseEvent = {
      source: this,
      domEvent: e,
      x: e.offsetX,
      y: e.offsetY,
      screenX: e.screenX,
      screenY: e.screenY,
      button: e.button,
    };
    switch (kind) {
      case 'pressed':
        // JavaFX implicitly captures mouse events to the *picked* (pressed)
        // node until release — `mouseDragged` keeps firing even when the
        // cursor leaves the node. The DOM analog is Pointer Capture.
        //
        // Crucially, capture must be taken on `e.target` (the deepest
        // element that received the press), NOT on `e.currentTarget` (the
        // element whose handler is running). Ancestors see the press via
        // standard bubbling — if an ancestor's handler captured the
        // pointer, it would steal events from the actual target. That
        // breaks click synthesis on descendants: e.g. a button inside a
        // VScrollPane viewport would no longer receive `pointerup` (it'd
        // be rerouted to the viewport), so the browser wouldn't synthesize
        // a `click`, and the button would appear dead.
        //
        // Capturing `e.target` matches JavaFX semantics: the picked node
        // gets all subsequent pointer events, ancestors still see them via
        // bubbling, and click synthesis works because both pointerdown and
        // pointerup land on the same element.
        if (typeof PointerEvent !== 'undefined' && e instanceof PointerEvent) {
          const target = e.target as (Element & { setPointerCapture?: (id: number) => void }) | null;
          if (target !== null && typeof target.setPointerCapture === 'function') {
            try {
              target.setPointerCapture(e.pointerId);
            } catch {
              // setPointerCapture can throw if the pointer is already
              // released; ignore — the press still dispatches normally.
            }
          }
        }
        this._onMousePressed?.(ev);
        break;
      case 'released': this._onMouseReleased?.(ev); break;
      case 'clicked': this._onMouseClicked?.(ev); break;
      case 'entered': this._onMouseEntered?.(ev); break;
      case 'exited': this._onMouseExited?.(ev); break;
      case 'dragged':
        if (e.buttons === 0) return;
        this._onMouseDragged?.(ev);
        break;
      case 'moved':
        if (e.buttons !== 0) return;
        this._onMouseMoved?.(ev);
        break;
    }
  }

  paint(): void {
    this.applyCss();
  }

  /** Apply this node's CSS state to `el`. Subclasses override. */
  protected applyCss(): void {
    this.el.style.opacity = String(this._opacity);
    this.el.style.visibility = this._visible ? '' : 'hidden';
    if (this._mouseTransparent) this.el.style.pointerEvents = 'none';
    if (this._background.hasBackground()) {
      this.el.style.background = this._background.toCss();
      const r = this._background.toRadiusCss();
      if (r !== '0') this.el.style.borderRadius = r;
    }
    if (this._border.hasBorder()) {
      this.el.style.border = this._border.toCss();
    }
    this.el.style.padding = `${this._padding.top}px ${this._padding.right}px ${this._padding.bottom}px ${this._padding.left}px`;
    if (this._cursor) this.el.style.cursor = this._cursor;
    if (this._clip !== null) this.el.style.overflow = 'hidden';
    if (this._styleString) this.el.setAttribute('style', this._styleString);
    for (const [k, v] of Object.entries(this._extraStyle)) {
      // @ts-expect-error index access
      this.el.style[k] = v ?? '';
    }
  }

  /**
   * Start observing this node's element size and updating widthProperty/
   * heightProperty. Called automatically when the node is attached to the
   * document via a Parent.
   */
  observeSize(): void {
    if (this._resizeObserver !== null) return;
    this._resizeObserver = new ResizeObserver(() => {
      // Use offsetWidth/offsetHeight (border-box) to match JavaFX's
      // widthProperty/heightProperty semantics, which reflect the node's
      // layout bounds INCLUDING border. contentRect would exclude the
      // border, causing e.g. a 60px element with a 0.5px border to report
      // 59px — breaking height calculations for containers like FusionPane
      // whose root always carries a (possibly transparent) border.
      const w = this.el.offsetWidth;
      const h = this.el.offsetHeight;
      scheduleNodeSizeUpdate(this, w, h);
    });
    this._resizeObserver.observe(this.el);
  }

  stopObservingSize(): void {
    if (this._resizeObserver !== null) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  forceUpdate(): void {
    const w = this.el.style.width;
    this.el.style.width = '0.001px';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.el.offsetHeight;
    this.el.style.width = w;
  }

  toFront(): void {
    if (this.parent) {
      this.parent.el.appendChild(this.el);
    }
  }
  toBack(): void {
    if (this.parent && this.el.parentElement === this.parent.el) {
      this.parent.el.insertBefore(this.el, this.parent.el.firstChild);
    }
  }
}
