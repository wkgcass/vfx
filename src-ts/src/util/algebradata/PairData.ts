import { AlgebraData } from './AlgebraData.js';

export class PairData<
  A extends AlgebraData<A>,
  B extends AlgebraData<B>,
> implements AlgebraData<PairData<A, B>> {
  constructor(public readonly a: A, public readonly b: B) {}

  plus(o: PairData<A, B>): PairData<A, B> {
    return new PairData<A, B>(this.a.plus(o.a), this.b.plus(o.b));
  }
  minus(o: PairData<A, B>): PairData<A, B> {
    return new PairData<A, B>(this.a.minus(o.a), this.b.minus(o.b));
  }
  multiply(v: number): PairData<A, B> {
    return new PairData<A, B>(this.a.multiply(v), this.b.multiply(v));
  }
  dividedBy(v: number): PairData<A, B> {
    return new PairData<A, B>(this.a.dividedBy(v), this.b.dividedBy(v));
  }

  toString(): string { return `PairData(${this.a}, ${this.b})`; }
}
