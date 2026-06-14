export interface AlgebraData<T extends AlgebraData<T>> {
  plus(other: T): T;
  minus(other: T): T;
  multiply(v: number): T;
  dividedBy(v: number): T;
}
