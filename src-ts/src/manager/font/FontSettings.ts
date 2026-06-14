import { FontManager } from './FontManager.js';

export type FontWeight =
  | 'normal'
  | 'bold'
  | 'lighter'
  | 'bolder'
  | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type FontPosture = 'normal' | 'italic' | 'oblique';

export class FontSettings {
  family: string | null = null;
  size: number = -1;
  weight: FontWeight | null = null;
  posture: FontPosture | null = null;

  setFamily(family: string): this {
    this.family = family;
    return this;
  }
  setSize(size: number): this {
    this.size = size;
    return this;
  }
  setWeight(weight: FontWeight): this {
    this.weight = weight;
    return this;
  }
  setPosture(posture: FontPosture): this {
    this.posture = posture;
    return this;
  }

  build(): string {
    const family = this.family ?? FontManager.FONT_NAME_Default();
    const style = this.posture ?? 'normal';
    const weight = this.weight ?? 'normal';
    const size = this.size > 0 ? this.size : 16;
    return `${style} ${weight} ${size}px ${family}`;
  }
}
