import { AlgebraData } from './AlgebraData.js';

export class XYData implements AlgebraData<XYData> {
  constructor(public readonly x: number, public readonly y: number) {}

  plus(other: XYData): XYData { return new XYData(this.x + other.x, this.y + other.y); }
  minus(other: XYData): XYData { return new XYData(this.x - other.x, this.y - other.y); }
  multiply(v: number): XYData { return new XYData(this.x * v, this.y * v); }
  dividedBy(v: number): XYData { return new XYData(this.x / v, this.y / v); }

  toString(): string { return `XYData(${this.x}, ${this.y})`; }
}
