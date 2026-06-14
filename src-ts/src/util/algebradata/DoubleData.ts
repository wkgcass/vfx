import { AlgebraData } from './AlgebraData.js';

export class DoubleData implements AlgebraData<DoubleData> {
  constructor(public readonly value: number) {}

  plus(o: DoubleData): DoubleData { return new DoubleData(this.value + o.value); }
  minus(o: DoubleData): DoubleData { return new DoubleData(this.value - o.value); }
  multiply(v: number): DoubleData { return new DoubleData(this.value * v); }
  dividedBy(v: number): DoubleData { return new DoubleData(this.value / v); }

  toString(): string { return `DoubleData(${this.value})`; }
}
