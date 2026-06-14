import { Logger } from '../../vproxy-base/Logger.js';
import { FXUtils } from '../../util/FXUtils.js';
import { FXImage } from '../../javafx/ImageView.js';

const RES_BASE = './res/image/';

function toAssetPath(path: string): string {
  if (!path.startsWith('/')) path = '/' + path;
  const idx = path.indexOf('/io/vproxy/vfx/res/image/');
  if (idx >= 0) {
    return RES_BASE + path.substring(idx + '/io/vproxy/vfx/res/image/'.length);
  }
  if (path.startsWith('/io/vproxy/vfx/res/')) {
    return './res/' + path.substring('/io/vproxy/vfx/res/'.length);
  }
  return '.' + path;
}

export class ImageManager {
  static readonly instance = new ImageManager();

  static get(): ImageManager {
    return ImageManager.instance;
  }

  private readonly map = new Map<string, FXImage>();
  private readonly weakMap = new Map<string, WeakRef<FXImage>>();
  private readonly pending = new Map<string, Promise<void>>();
  private preloaded = false;

  private constructor() {
    this.loadBlackAndChangeColor('io/vproxy/vfx/res/image/close.png', {
      red: 0xffed6a5e, white: 0xffffffff,
    });
    this.loadBlackAndChangeColor('io/vproxy/vfx/res/image/maximize.png', {
      white: 0xffffffff, green: 0xff61c454,
    });
    this.loadBlackAndChangeColor('io/vproxy/vfx/res/image/reset-window-size.png', {
      white: 0xffffffff, green: 0xff61c454,
    });
    this.loadBlackAndChangeColor('io/vproxy/vfx/res/image/iconify.png', {
      white: 0xffffffff, yellow: 0xfff4bd4f,
    });
    this.loadBlackAndChangeColor('io/vproxy/vfx/res/image/arrow.png', {
      white: 0xffffffff,
    });
  }

  async preload(): Promise<void> {
    if (this.preloaded) return;
    await Promise.all([...this.pending.values()].map((p) => p.catch(() => undefined)));
    this.preloaded = true;
  }

  load(path: string): FXImage | null {
    if (!path.startsWith('/')) path = '/' + path;
    const cached = this.map.get(path);
    if (cached) return cached;
    const weak = this.weakMap.get(path)?.deref();
    if (weak) return weak;

    // Recolored paths ("foo.png:color") are produced asynchronously by
    // loadBlackAndChangeColor. If a recolored entry is requested before
    // its promise resolves, fall back to the base image.
    const colonIdx = path.indexOf(':');
    if (colonIdx >= 0) {
      const base = path.substring(0, colonIdx);
      const baseImg = this.map.get(base);
      if (baseImg) {
        const placeholder = new FXImage(baseImg.url);
        this.map.set(path, placeholder);
        const pending = this.pending.get(path);
        if (pending) {
          void pending.then(() => {
            const recolored = this.map.get(path);
            if (recolored && recolored !== placeholder) {
              placeholder.setUrl(recolored.url);
            }
          });
        }
        return placeholder;
      }
    }

    const assetPath = toAssetPath(path);
    const img = new FXImage(assetPath);
    this.map.set(path, img);
    return img;
  }

  loadBlackAndChangeColor(path: string, argbs: Record<string, number>): void {
    if (!path.startsWith('/')) path = '/' + path;
    const baseImg = this.load(path);
    if (baseImg === null) return;

    for (const [name, setArgb] of Object.entries(argbs)) {
      const newPath = path + ':' + name;
      const target = new FXImage('');
      this.map.set(newPath, newPath in this.map ? this.map.get(newPath)! : target);

      const promise = new Promise<void>((resolve) => {
        const baseHtml = baseImg.getHtmlImage();
        const start = () => {
          FXUtils.changeColorOfBlackImage(baseHtml, setArgb)
            .then((dataUrl) => {
              target.setUrl(dataUrl);
              resolve();
            })
            .catch((e) => {
              Logger.error('FILE_ERROR', `failed recoloring ${newPath}`, e);
              resolve();
            });
        };
        if (baseHtml.complete && baseHtml.naturalWidth > 0) {
          start();
        } else {
          baseHtml.addEventListener('load', start, { once: true });
          baseHtml.addEventListener('error', () => resolve(), { once: true });
        }
      });
      this.pending.set(newPath, promise);
    }
  }

  loadSubImageOrMake(
    baseName: string,
    subName: string,
    makeFunc: (img: FXImage) => FXImage,
  ): FXImage | null {
    if (!baseName.startsWith('/')) baseName = '/' + baseName;
    const key = baseName + ':' + subName;
    const cached = this.map.get(key);
    if (cached) return cached;
    const weak = this.weakMap.get(key)?.deref();
    if (weak) return weak;
    const base = this.map.get(baseName) ?? this.weakMap.get(baseName)?.deref();
    if (!base) {
      Logger.warn('ALERT', `unable to find base image ${baseName}, cannot make sub image for it`);
      return null;
    }
    const made = makeFunc(base);
    if (!made) {
      Logger.warn('ALERT', `failed making image for ${key}, the make function returns null`);
      return null;
    }
    this.map.set(key, made);
    return made;
  }

  weakRef(path: string): FXImage | null {
    const img = this.map.get(path);
    if (!img) return null;
    this.map.delete(path);
    this.weakMap.set(path, new WeakRef(img));
    return img;
  }

  remove(path: string): void {
    if (!path.startsWith('/')) path = '/' + path;
    if (!this.map.has(path) && !this.weakMap.has(path)) return;
    this.map.delete(path);
    this.weakMap.delete(path);
  }
}
