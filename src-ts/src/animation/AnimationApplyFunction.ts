// Plain function type (not interface with `apply` method) because `apply`
// collides with `Function.prototype.apply` — raw arrow functions would
// silently invoke the prototype method instead of the user's callback.
import type { AlgebraData } from '../util/algebradata/AlgebraData.js';
import type { AnimationNode } from './AnimationNode.js';

export type AnimationApplyFunction<T extends AlgebraData<T>> = (
  from: AnimationNode<T> | null,
  to: AnimationNode<T>,
  data: T,
) => void;
