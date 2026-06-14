import { AudioWrapper } from './AudioWrapper.js';
import { FXUtils } from '../../util/FXUtils.js';

export class AudioGroup {
  private readonly queue: AudioWrapper[] = [];

  constructor(clips: Array<AudioWrapper | null>) {
    for (const c of clips) {
      if (c === null) continue;
      this.queue.push(c);
    }
    this.queue.sort(this.comparator);
  }

  private comparator = (a: AudioWrapper, b: AudioWrapper): number => {
    if (a.isLastPlayed()) return 1;
    if (b.isLastPlayed()) return -1;
    return a.getCount() - b.getCount();
  };

  play(): void {
    FXUtils.runOnFX(() => this.playFX());
  }

  private playFX(): void {
    if (this.queue.length === 0) return;
    if (this.queue.length === 1) {
      this.queue[0]!.play();
      return;
    }
    let last = this.queue[this.queue.length - 1]!;
    let lastRemoved = false;
    if (last.isLastPlayed()) {
      this.queue.pop();
      last.setLastPlayed(false);
      lastRemoved = true;
    }
    const ls: AudioWrapper[] = [];
    let lastCount = -1;
    for (const a of this.queue) {
      if (lastCount === -1) {
        lastCount = a.getCount();
        ls.push(a);
      } else {
        if (lastCount !== a.getCount()) break;
        ls.push(a);
      }
    }
    const pick = ls[Math.floor(Math.random() * ls.length)]!;
    const idx = this.queue.indexOf(pick);
    if (idx >= 0) this.queue.splice(idx, 1);
    pick.play();
    pick.setLastPlayed(true);
    if (lastRemoved) this.queue.push(last);
    this.queue.push(pick);
  }
}
