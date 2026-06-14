
import { Node } from '../javafx/Node.js';
import { Parent } from '../javafx/Parent.js';
import { Label, Text } from '../javafx/Label.js';
import { Color, toHSB, fromHSB, paintToCss } from '../javafx/color.js';
import { Stage } from '../javafx/stage.js';

export type ChangeListenerNumber = (oldValue: number | null, newValue: number | null) => void;

export class Rectangle2D {
  constructor(
    public readonly minX: number,
    public readonly minY: number,
    public readonly width: number,
    public readonly height: number,
  ) {}

  get maxX(): number { return this.minX + this.width; }
  get maxY(): number { return this.minY + this.height; }
}

export class FXUtils {
  static generalInitialization(_args: string[]): void { }

  static setDefaultFontFamily(family: string, size: number): void {
    document.body.style.fontFamily = family;
    document.body.style.fontSize = `${size}px`;
  }

  static runOnFX(r: () => void): void {
    r();
  }

  static runOnFXAndReturn<T>(f: () => T): T {
    return f();
  }

  static runDelay(millis: number, r: () => void): void {
    setTimeout(r, millis);
  }

  static calculateTextBounds(labelOrText: Label | Text): Rectangle2D {
    const text = labelOrText instanceof Text ? labelOrText.getText() : labelOrText.getText();
    const font = labelOrText.getFont() ?? `${getComputedStyle(labelOrText.el).fontSize} ${getComputedStyle(labelOrText.el).fontFamily}`;
    const canvas = getTextMeasureCanvas();
    const ctx = canvas.getContext('2d')!;
    ctx.font = font;
    const fontMatch = font.match(/(\d+(?:\.\d+)?)px/);
    const fontSize = fontMatch ? parseFloat(fontMatch[1]!) : 14;
    // Mirror JavaFX's `Text(text).getLayoutBounds()`: an explicit "\n" in the
    // input produces a multi-line node whose width is the longest line and
    // whose height is numberOfLines * lineHeight. The canvas measureText
    // treats the whole string as one line (including the \n glyph), which
    // makes multi-line labels — e.g. "This is a\nFusionButton" on a
    // FusionButton — report an overstated width and an understated height,
    // breaking both horizontal and vertical centering. Split on \n and
    // measure each line individually.
    const lines = text.split('\n');
    let w = 0;
    for (const line of lines) {
      const m = ctx.measureText(line);
      if (m.width > w) w = m.width;
    }
    const lineCount = Math.max(1, lines.length);
    return new Rectangle2D(0, 0, w, fontSize * 1.2 * lineCount);
  }

  static toHSB(c: Color): [number, number, number] {
    return toHSB(c);
  }

  static fromHSB(h: number, s: number, b: number, alpha: number): Color {
    return fromHSB(h, s, b, alpha);
  }

  static observeWidthHeight(observed: Parent, modified: Parent): ChangeListenerNumber[];
  static observeWidthHeight(observed: Parent, modified: Parent, wDelta: number, hDelta: number): ChangeListenerNumber[];
  static observeWidthHeight(observed: Parent, modified: Parent, wDelta: number = 0, hDelta: number = 0): ChangeListenerNumber[] {
    return [
      FXUtils.observeWidth(observed, modified, wDelta),
      FXUtils.observeHeight(observed, modified, hDelta),
    ];
  }

  static observeWidth(observed: Parent, modified: Parent, wDelta: number = 0): ChangeListenerNumber {
    const lsn: ChangeListenerNumber = (_o, now) => {
      if (now === null) return;
      const target = now + wDelta;
      // Skip sub-pixel no-ops. Without this guard, floating-point jitter
      // between an observed element's reported DOM size and the modified
      // element's current prefWidth (e.g. 100.5 vs 100) keeps re-firing
      // the listener → setPrefWidth → ResizeObserver → property update →
      // listener cycle, which Chrome flags as "ResizeObserver loop
      // completed with undelivered notifications" once it spans a couple
      // of frames. Half-pixel tolerance is well below visible precision.
      if (Math.abs(target - modified.getPrefWidth()) < 0.5) return;
      modified.setPrefWidth(target);
    };
    observed.widthProperty.addListener(lsn);
    const current = observed.getWidth();
    if (current > 0) lsn(null, current);
    return lsn;
  }

  static observeHeight(observed: Parent, modified: Parent, hDelta: number = 0): ChangeListenerNumber {
    const lsn: ChangeListenerNumber = (_o, now) => {
      if (now === null) return;
      const target = now + hDelta;
      if (Math.abs(target - modified.getPrefHeight()) < 0.5) return;
      modified.setPrefHeight(target);
    };
    observed.heightProperty.addListener(lsn);
    const current = observed.getHeight();
    if (current > 0) lsn(null, current);
    return lsn;
  }

  static observeWidthHeightWithPreferred(observed: Parent, modified: Parent, wDelta: number = 0, hDelta: number = 0): ChangeListenerNumber[] {
    return [
      FXUtils.observeWidthWithPreferred(observed, modified, wDelta),
      FXUtils.observeHeightWithPreferred(observed, modified, hDelta),
    ];
  }

  static observeWidthWithPreferred(observed: Parent, modified: Parent, wDelta: number = 0): ChangeListenerNumber {
    const lsn: ChangeListenerNumber = (_o, now) => {
      if (now === null) return;
      const target = now + wDelta;
      if (Math.abs(target - modified.getPrefWidth()) < 0.5) return;
      modified.setPrefWidth(target);
    };
    observed.widthProperty.addListener(lsn);
    // Java also registers on prefWidthProperty so that callers who
    // setPrefWidth() (without an actual rendered width change) still
    // propagate — matches the Java original's dual-listener pattern.
    observed.prefWidthProperty.addListener(lsn);
    const current = observed.getWidth() || observed.getPrefWidth();
    if (current > 0) lsn(null, current);
    return lsn;
  }

  static observeHeightWithPreferred(observed: Parent, modified: Parent, hDelta: number = 0): ChangeListenerNumber {
    const lsn: ChangeListenerNumber = (_o, now) => {
      if (now === null) return;
      const target = now + hDelta;
      if (Math.abs(target - modified.getPrefHeight()) < 0.5) return;
      modified.setPrefHeight(target);
    };
    observed.heightProperty.addListener(lsn);
    // Java also registers on prefHeightProperty (mirrors the width version).
    observed.prefHeightProperty.addListener(lsn);
    const current = observed.getHeight() || observed.getPrefHeight();
    if (current > 0) lsn(null, current);
    return lsn;
  }

  static observeWidthHeightCenter(observed: Parent, modified: Parent): ChangeListenerNumber[] {
    return [
      FXUtils.observeWidthCenter(observed, modified),
      FXUtils.observeHeightCenter(observed, modified),
    ];
  }

  static observeWidthCenter(observed: Parent, modified: Parent): ChangeListenerNumber {
    const lsn: ChangeListenerNumber = () => {
      modified.setLayoutX((observed.getWidth() - modified.getWidth()) / 2);
    };
    observed.widthProperty.addListener(lsn);
    modified.widthProperty.addListener(lsn);
    lsn(null, null);
    return lsn;
  }

  static observeHeightCenter(observed: Parent, modified: Parent): ChangeListenerNumber {
    const lsn: ChangeListenerNumber = () => {
      modified.setLayoutY((observed.getHeight() - modified.getHeight()) / 2);
    };
    observed.heightProperty.addListener(lsn);
    modified.heightProperty.addListener(lsn);
    lsn(null, null);
    return lsn;
  }

  static makeClipFor(node: Parent): Node {
    node.el.style.overflow = 'hidden';
    return node;
  }

  static makeRoundedClipFor(node: Parent, cornerRadii: number): Node {
    node.el.style.overflow = 'hidden';
    node.el.style.borderRadius = `${cornerRadii}px`;
    return node;
  }

  static makeBottomOnlyRoundedClipFor(node: Parent, cornerRadii: number): Node {
    node.el.style.overflow = 'hidden';
    node.el.style.borderTopLeftRadius = '0';
    node.el.style.borderTopRightRadius = '0';
    node.el.style.borderBottomLeftRadius = `${cornerRadii}px`;
    node.el.style.borderBottomRightRadius = `${cornerRadii}px`;
    return node;
  }

  static makeTopOnlyRoundedClipFor(node: Parent, cornerRadii: number): Node {
    node.el.style.overflow = 'hidden';
    node.el.style.borderTopLeftRadius = `${cornerRadii}px`;
    node.el.style.borderTopRightRadius = `${cornerRadii}px`;
    node.el.style.borderBottomLeftRadius = '0';
    node.el.style.borderBottomRightRadius = '0';
    return node;
  }

  static getWidthOrPref(r: Parent): number {
    const w = r.getWidth();
    return w === 0 ? r.getPrefWidth() : w;
  }

  static getHeightOrPref(r: Parent): number {
    const h = r.getHeight();
    return h === 0 ? r.getPrefHeight() : h;
  }

  static forceUpdate(stage: Stage): void;
  static forceUpdate(region: Parent): void;
  static forceUpdate(target: Stage | Parent): void {
    if (target instanceof Stage) {
      const w = target.getWidth();
      target.setWidth(w + 0.001);
      setTimeout(() => target.setWidth(w), 50);
    } else {
      const w = target.getPrefWidth();
      target.setPrefWidth(w + 0.001);
      setTimeout(() => target.setPrefWidth(w), 50);
    }
  }

  // Reads pixel data from an HTMLImageElement via a Canvas, applies the
  // ARGB formula, and returns a data: URL representing the recolored image.
  // The source image is assumed black; output is the (1-src) blended color.
  static changeColorOfBlackImage(src: HTMLImageElement | string, setArgb: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = typeof src === 'string' ? new Image() : src.cloneNode(true) as HTMLImageElement;
      if (typeof src === 'string') img.src = src;
      const onReady = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w === 0 || h === 0) {
          reject(new Error('image has zero dimensions'));
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const r = (setArgb >> 16) & 0xff;
        const g = (setArgb >> 8) & 0xff;
        const b = setArgb & 0xff;
        for (let i = 0; i < data.length; i += 4) {
          const sr = data[i]!;
          const sg = data[i + 1]!;
          const sb = data[i + 2]!;
          const sa = data[i + 3]!;
          if (sa === 0) continue;
          const opacity = sa / 255;
          const red = sr / 255;
          const green = sg / 255;
          const blue = sb / 255;
          data[i] = Math.round(r * (1 - red));
          data[i + 1] = Math.round(g * (1 - green));
          data[i + 2] = Math.round(b * (1 - blue));
          data[i + 3] = Math.round(opacity * 255);
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      if (img.complete && img.naturalWidth > 0) {
        onReady();
      } else {
        img.onload = onReady;
        img.onerror = (e) => reject(new Error(`failed to load image: ${e}`));
      }
    });
  }

  static disableFocusColor(node: Node): void {
    node.setExtraStyle({ outline: 'none' });
  }

  static setOnMouseEntered(node: Node, f: (e: MouseEvent) => void): void {
    appendMouseHandler(node, 'entered', f);
  }

  static setOnMouseExited(node: Node, f: (e: MouseEvent) => void): void {
    appendMouseHandler(node, 'exited', f);
  }

  static setOnMousePressed(node: Node, f: (e: MouseEvent) => void): void {
    appendMouseHandler(node, 'pressed', f);
  }

  static setOnMouseReleased(node: Node, f: (e: MouseEvent) => void): void {
    appendMouseHandler(node, 'released', f);
  }
}

type AppendKind = 'entered' | 'exited' | 'pressed' | 'released';
const appendedKey = (k: AppendKind) => `__appendedMouse_${k}` as const;

function appendMouseHandler(node: Node, kind: AppendKind, f: (e: MouseEvent) => void): void {
  const key = appendedKey(kind);
  const store = node as unknown as Record<string, ((e: MouseEvent) => void)[] | undefined>;
  const existing = store[key] ?? [];
  existing.push(f);
  store[key] = existing;
  if (existing.length === 1) {
    const setter = {
      entered: node.setOnMouseEntered.bind(node),
      exited: node.setOnMouseExited.bind(node),
      pressed: node.setOnMousePressed.bind(node),
      released: node.setOnMouseReleased.bind(node),
    }[kind];
    setter((ev) => {
      for (const fn of existing) fn(ev.domEvent);
    });
  }
}

let _measureCanvas: HTMLCanvasElement | null = null;
function getTextMeasureCanvas(): HTMLCanvasElement {
  if (_measureCanvas === null) {
    _measureCanvas = document.createElement('canvas');
  }
  return _measureCanvas;
}

export { Color, paintToCss };
