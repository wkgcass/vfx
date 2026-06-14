import { Logger } from '../../vproxy-base/Logger.js';

export type AudioClip = HTMLAudioElement;

function toAudioAssetUrl(path: string): string {
  // Java strips leading '/'; we map "io/vproxy/..." to "./res/audio/...".
  // vfx does not bundle audio resources, so this is a placeholder mapping.
  if (path.startsWith('/')) path = path.substring(1);
  const idx = path.indexOf('io/vproxy/vfx/res/audio/');
  if (idx >= 0) {
    return './res/audio/' + path.substring(idx + 'io/vproxy/vfx/res/audio/'.length);
  }
  if (path.startsWith('io/vproxy/vfx/res/')) {
    return './res/' + path.substring('io/vproxy/vfx/res/'.length);
  }
  return './' + path;
}

export class AudioManager {
  static readonly instance = new AudioManager();

  static get(): AudioManager { return AudioManager.instance; }

  private readonly map = new Map<string, AudioClip>();
  private readonly weakMap = new Map<string, WeakRef<AudioClip>>();

  private constructor() {}

  loadAudio(path: string): AudioClip | null {
    if (path.startsWith('/')) path = path.substring(1);
    const cached = this.map.get(path);
    if (cached) return cached;
    const weak = this.weakMap.get(path)?.deref();
    if (weak) return weak;

    try {
      const url = toAudioAssetUrl(path);
      const clip = new Audio(url);
      clip.preload = 'auto';
      this.map.set(path, clip);
      return clip;
    } catch (e) {
      Logger.error('FILE_ERROR', `failed loading audio ${path}`, e as Error);
      return null;
    }
  }

  weakRefAudio(path: string): AudioClip | null {
    const audio = this.map.get(path);
    if (!audio) return null;
    this.map.delete(path);
    this.weakMap.set(path, new WeakRef(audio));
    return audio;
  }

  removeAudio(path: string): void {
    if (path.startsWith('/')) path = path.substring(1);
    if (!this.map.has(path) && !this.weakMap.has(path)) return;
    this.map.delete(path);
    this.weakMap.delete(path);
  }
}
