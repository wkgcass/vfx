import { AlgebraData } from './AlgebraData.js';

export class XYZTData implements AlgebraData<XYZTData> {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly t: number,
  ) {}

  plus(o: XYZTData): XYZTData {
    return new XYZTData(this.x + o.x, this.y + o.y, this.z + o.z, this.t + o.t);
  }
  minus(o: XYZTData): XYZTData {
    return new XYZTData(this.x - o.x, this.y - o.y, this.z - o.z, this.t - o.t);
  }
  multiply(v: number): XYZTData {
    return new XYZTData(this.x * v, this.y * v, this.z * v, this.t * v);
  }
  dividedBy(v: number): XYZTData {
    return new XYZTData(this.x / v, this.y / v, this.z / v, this.t / v);
  }

  toString(): string { return `XYZTData(${this.x}, ${this.y}, ${this.z}, ${this.t})`; }
}
