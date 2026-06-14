import { Node } from './Node.js';

export class FXImage {
  url: string;
  private _width = 0;
  private _height = 0;
  private readonly htmlImage: HTMLImageElement;
  private urlChangeListeners: Array<(url: string) => void> = [];

  constructor(url: string) {
    this.url = url;
    this.htmlImage = new Image();
    this.htmlImage.onload = () => {
      this._width = this.htmlImage.naturalWidth;
      this._height = this.htmlImage.naturalHeight;
    };
    this.htmlImage.src = url;
  }

  get width(): number { return this._width; }
  get height(): number { return this._height; }

  getHtmlImage(): HTMLImageElement { return this.htmlImage; }

  setUrl(url: string): void {
    if (url === this.url) return;
    this.url = url;
    this.htmlImage.src = url;
    for (const l of [...this.urlChangeListeners]) {
      try { l(url); } catch { }
    }
  }

  addUrlChangeListener(l: (url: string) => void): void {
    this.urlChangeListeners.push(l);
  }

  removeUrlChangeListener(l: (url: string) => void): void {
    const i = this.urlChangeListeners.indexOf(l);
    if (i >= 0) this.urlChangeListeners.splice(i, 1);
  }
}

export class ImageView extends Node {
  protected _image: FXImage | null = null;
  protected _fitWidth = -1;
  protected _fitHeight = -1;
  protected _preserveRatio = true;
  protected _scaleX = 1;
  protected _scaleY = 1;
  protected _scale = 1;

  private readonly _urlChangeListener = (url: string): void => {
    (this.el as HTMLImageElement).src = url;
  };

  constructor();
  constructor(image: FXImage);
  constructor(image?: FXImage) {
    super(document.createElement('img'));
    this.el.style.display = 'block';
    this.el.style.objectFit = 'fill';
    if (image) this.setImage(image);
  }

  setImage(img: FXImage | null): void {
    if (this._image !== null) {
      this._image.removeUrlChangeListener(this._urlChangeListener);
    }
    this._image = img;
    if (img === null) {
      (this.el as HTMLImageElement).src = '';
      return;
    }
    (this.el as HTMLImageElement).src = img.url;
    img.addUrlChangeListener(this._urlChangeListener);
    this.applyFit();
  }
  getImage(): FXImage | null { return this._image; }

  setFitWidth(w: number): void {
    this._fitWidth = w;
    this.el.style.width = w < 0 ? '' : `${w}px`;
  }
  getFitWidth(): number { return this._fitWidth; }
  setFitHeight(h: number): void {
    this._fitHeight = h;
    this.el.style.height = h < 0 ? '' : `${h}px`;
  }
  getFitHeight(): number { return this._fitHeight; }
  setPreserveRatio(v: boolean): void {
    this._preserveRatio = v;
    this.applyFit();
  }
  setScale(s: number): void {
    this._scale = s;
    this._scaleX = s;
    this._scaleY = s;
    this.applyTransform();
  }
  getScale(): number { return this._scale; }
  setScaleX(x: number): void {
    this._scaleX = x;
    this._scale = this._scaleX === this._scaleY ? x : this._scale;
    this.applyTransform();
  }
  getScaleX(): number { return this._scaleX; }
  setScaleY(y: number): void {
    this._scaleY = y;
    this._scale = this._scaleX === this._scaleY ? y : this._scale;
    this.applyTransform();
  }
  getScaleY(): number { return this._scaleY; }

  private applyTransform(): void {
    if (this._scaleX === 1 && this._scaleY === 1) {
      this.el.style.transform = '';
    } else {
      this.el.style.transform = `scale(${this._scaleX}, ${this._scaleY})`;
    }
  }

  private applyFit(): void {
    if (this._fitWidth > 0 && this._fitHeight > 0) {
      this.el.style.objectFit = this._preserveRatio ? 'contain' : 'fill';
    } else if (this._fitWidth > 0) {
      this.el.style.width = `${this._fitWidth}px`;
      this.el.style.height = 'auto';
    } else if (this._fitHeight > 0) {
      this.el.style.height = `${this._fitHeight}px`;
      this.el.style.width = 'auto';
    }
  }
}
