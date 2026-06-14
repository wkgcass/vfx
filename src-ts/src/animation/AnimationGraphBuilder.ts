import type { AlgebraData } from '../util/algebradata/AlgebraData.js';
import { GraphBuilder } from '../commons-graph/Graph.js';
import { AnimationNode } from './AnimationNode.js';
import { AnimationEdge } from './AnimationEdge.js';
import { AnimationGraph } from './AnimationGraph.js';
import type { AnimationApplyFunction } from './AnimationApplyFunction.js';
import type { AnimationStateTransferBeginCallback } from './AnimationStateTransferBeginCallback.js';
import type { DoubleDoubleFunction } from './DoubleDoubleFunction.js';
import { identityDoubleDoubleFunction } from './DoubleDoubleFunction.js';

export class AnimationGraphBuilder<T extends AlgebraData<T>> {
  private readonly builder = new GraphBuilder<AnimationNode<T>>();
  private stateTransferBeginCallback: AnimationStateTransferBeginCallback<T> | null = null;
  private apply: AnimationApplyFunction<T> | null = null;

  static simpleTwoNodeGraph<T extends AlgebraData<T>>(
    a: AnimationNode<T>,
    b: AnimationNode<T>,
    millis: number,
  ): AnimationGraphBuilder<T> {
    return new AnimationGraphBuilder<T>()
      .addNode(a)
      .addNode(b)
      .addTwoWayEdge(a, b, millis);
  }

  addNode(n: AnimationNode<T>): this {
    this.builder.addNode(n);
    return this;
  }

  addEdge(from: AnimationNode<T>, to: AnimationNode<T>, durationMillis: number): this;
  addEdge(from: AnimationNode<T>, to: AnimationNode<T>, durationMillis: number, fn: DoubleDoubleFunction): this;
  addEdge(from: AnimationNode<T>, to: AnimationNode<T>, durationMillis: number, fn: DoubleDoubleFunction = identityDoubleDoubleFunction): this {
    if (durationMillis < 0) throw new Error('`durationMillis` < 0');
    this.builder.addEdge(new AnimationEdge<T>(from, to, durationMillis, fn));
    return this;
  }

  addTwoWayEdge(from: AnimationNode<T>, to: AnimationNode<T>, durationMillis: number): this;
  addTwoWayEdge(from: AnimationNode<T>, to: AnimationNode<T>, durationMillis: number, fn: DoubleDoubleFunction): this;
  addTwoWayEdge(from: AnimationNode<T>, to: AnimationNode<T>, durationMillis: number, fn: DoubleDoubleFunction = identityDoubleDoubleFunction): this {
    if (durationMillis < 0) throw new Error('`durationMillis` < 0');
    this.builder.addEdge(new AnimationEdge<T>(from, to, durationMillis, fn));
    this.builder.addEdge(new AnimationEdge<T>(to, from, durationMillis, fn));
    return this;
  }

  setApply(apply: AnimationApplyFunction<T>): this {
    this.apply = apply;
    return this;
  }

  setStateTransferBeginCallback(cb: AnimationStateTransferBeginCallback<T>): this {
    this.stateTransferBeginCallback = cb;
    return this;
  }

  build(initialNode: AnimationNode<T>): AnimationGraph<T> {
    if (this.apply === null) throw new Error('`apply` not set');
    const beginCB: AnimationStateTransferBeginCallback<T> =
      this.stateTransferBeginCallback ?? (() => { /* no-op */ });
    // Java fires `apply.apply(null, initialNode, initialNode.value)` here,
    // and the AnimationGraph ctor fires it again. We mirror that exact
    // double-fire so consumer apply functions see the same invocation
    // count on build (matters for non-idempotent applies).
    this.apply(null, initialNode, initialNode.value);
    return new AnimationGraph<T>(
      this.builder.build(),
      this.apply,
      beginCB,
      initialNode,
    );
  }
}
