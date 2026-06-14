import { Color } from '../javafx/color.js';

export class MiscUtils {
  static formatDateTime(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  static roughFloat(v: number): string {
    return v.toFixed(2);
  }

  static threadSleep(millis: number): Promise<void> {
    return new Promise((r) => setTimeout(r, millis));
  }

  static almostEquals(a: Color, b: Color, delta: number): boolean {
    return (
      Math.abs(a.red - b.red) < delta &&
      Math.abs(a.green - b.green) < delta &&
      Math.abs(a.blue - b.blue) < delta
    );
  }

  static almostIn(c: Color, set: Set<Color>, delta: number): boolean {
    for (const other of set) {
      if (MiscUtils.almostEquals(c, other, delta)) return true;
    }
    return false;
  }

  static subtractGE0(a: number, b: number): number {
    const r = a - b;
    return r < 0 ? 0 : r;
  }

  static returnNullIfBlank(s: string | null): string | null {
    if (s === null) return null;
    if (s.trim().length === 0) return null;
    return s;
  }
}
