import type { AlgebraData } from '../util/algebradata/AlgebraData.js';
import { GraphEdge } from '../commons-graph/Graph.js';
import type { AnimationNode } from './AnimationNode.js';
import type { DoubleDoubleFunction } from './DoubleDoubleFunction.js';

export class AnimationEdge<T extends AlgebraData<T>> extends GraphEdge<AnimationNode<T>> {
  override readonly from: AnimationNode<T>;
  override readonly to: AnimationNode<T>;
  readonly durationMillis: number;
  readonly function: DoubleDoubleFunction;

  constructor(
    from: AnimationNode<T>,
    to: AnimationNode<T>,
    durationMillis: number,
    fn: DoubleDoubleFunction,
  ) {
    super(from, to, durationMillis);
    this.from = from;
    this.to = to;
    this.durationMillis = durationMillis;
    this.function = fn;
  }
}
