export enum MouseWheelDirection {
  UP = 'UP',
  DOWN = 'DOWN',
}

export class MouseWheelScroll {
  constructor(public readonly direction: MouseWheelDirection, public readonly value: number = 0) {}

  toJson(): { direction: string; value: number } {
    return { direction: this.direction, value: this.value };
  }

  static fromJson(obj: { direction: string; value: number }): MouseWheelScroll {
    return new MouseWheelScroll(obj.direction as MouseWheelDirection, obj.value);
  }

  equals(o: unknown): boolean {
    return (
      o instanceof MouseWheelScroll &&
      o.direction === this.direction &&
      o.value === this.value
    );
  }

  hashCode(): number {
    let h = hashStr(this.direction);
    h = 31 * h + this.value;
    return h;
  }

  toString(): string {
    const dir = this.direction.toLowerCase();
    if (this.value === 0) return `scroll-${dir}`;
    return `scroll-${dir}:${this.value}`;
  }
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (31 * h + s.charCodeAt(i)) | 0;
  }
  return h;
}
