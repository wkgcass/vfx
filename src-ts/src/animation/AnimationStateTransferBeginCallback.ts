// Plain function type to avoid Function.prototype method-name collision.
import type { AlgebraData } from '../util/algebradata/AlgebraData.js';
import type { AnimationNode } from './AnimationNode.js';

export type AnimationStateTransferBeginCallback<T extends AlgebraData<T>> = (
  from: AnimationNode<T>,
  to: AnimationNode<T>,
) => void;
