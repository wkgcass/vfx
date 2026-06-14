import { AlgebraData } from './AlgebraData.js';

export class XYZData implements AlgebraData<XYZData> {
  constructor(public readonly x: number, public readonly y: number, public readonly z: number) {}

  plus(o: XYZData): XYZData { return new XYZData(this.x + o.x, this.y + o.y, this.z + o.z); }
  minus(o: XYZData): XYZData { return new XYZData(this.x - o.x, this.y - o.y, this.z - o.z); }
  multiply(v: number): XYZData { return new XYZData(this.x * v, this.y * v, this.z * v); }
  dividedBy(v: number): XYZData { return new XYZData(this.x / v, this.y / v, this.z / v); }

  toString(): string { return `XYZData(${this.x}, ${this.y}, ${this.z})`; }
}
