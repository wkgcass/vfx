import type { AudioClip } from './AudioManager.js';
import { FXUtils } from '../../util/FXUtils.js';

export class AudioWrapper {
  private readonly clip: AudioClip;
  private count = 0;
  private lastPlayed = false;

  constructor(clip: AudioClip) {
    this.clip = clip;
  }

  getCount(): number { return this.count; }

  play(): void {
    FXUtils.runOnFX(() => {
      this.count += 1;
      // Reset to start so repeated plays restart the clip.
      try {
        this.clip.currentTime = 0;
        void this.clip.play();
      } catch {
        // autoplay policy may reject
      }
    });
  }

  isLastPlayed(): boolean { return this.lastPlayed; }
  setLastPlayed(v: boolean): void { this.lastPlayed = v; }
}
