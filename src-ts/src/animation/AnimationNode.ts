import type { AlgebraData } from '../util/algebradata/AlgebraData.js';
import { GraphNode } from '../commons-graph/Graph.js';
import type { AnimationStateTransferFinishCallback } from './AnimationStateTransferFinishCallback.js';

const noopFinish: <T extends AlgebraData<T>>(from: AnimationNode<T>, to: AnimationNode<T>) => void =
  () => { /* no-op */ };

export class AnimationNode<T extends AlgebraData<T>> extends GraphNode<AnimationNode<T>> {
  override readonly name: string;
  readonly value: T;
  readonly stateTransferFinish: AnimationStateTransferFinishCallback<T>;

  constructor(name: string, value: T);
  constructor(name: string, value: T, stateTransferFinish: AnimationStateTransferFinishCallback<T>);
  constructor(
    name: string,
    value: T,
    stateTransferFinish: AnimationStateTransferFinishCallback<T> = noopFinish as AnimationStateTransferFinishCallback<T>,
  ) {
    super(name);
    this.name = name;
    this.value = value;
    this.stateTransferFinish = stateTransferFinish;
  }
}
