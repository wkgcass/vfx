import type { AlgebraData } from '../util/algebradata/AlgebraData.js';
import type { AnimationNode } from './AnimationNode.js';

export type AnimationStateTransferFinishCallback<T extends AlgebraData<T>> =
  (from: AnimationNode<T>, to: AnimationNode<T>) => void;
