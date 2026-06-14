// Java uses AnimationTimer with nanosecond `now`; DOM rAF gives milliseconds.
// We multiply by 1_000_000 to keep the original `delta / 1_000_000` divisions.

import type { AlgebraData } from '../util/algebradata/AlgebraData.js';
import type { Graph, GraphPath } from '../commons-graph/Graph.js';
import { AnimationNode } from './AnimationNode.js';
import type { AnimationEdge } from './AnimationEdge.js';
import type { AnimationApplyFunction } from './AnimationApplyFunction.js';
import type { AnimationStateTransferBeginCallback } from './AnimationStateTransferBeginCallback.js';
import { Callback } from '../vproxy-base/Callback.js';
import { Logger } from '../vproxy-base/Logger.js';
import { AnimationInterrupted } from './AnimationInterrupted.js';

class PeekableIterator<T> {
  private readonly iter: Iterator<T>;
  private buf: T | undefined;
  private bufHas = false;
  private done = false;

  constructor(iter: Iterator<T>) {
    this.iter = iter;
  }

  hasNext(): boolean {
    if (this.bufHas) return true;
    if (this.done) return false;
    const r = this.iter.next();
    if (r.done) {
      this.done = true;
      return false;
    }
    this.buf = r.value;
    this.bufHas = true;
    return true;
  }

  next(): T {
    if (this.bufHas) {
      const v = this.buf!;
      this.buf = undefined;
      this.bufHas = false;
      return v;
    }
    const r = this.iter.next();
    if (r.done) {
      this.done = true;
      throw new Error('iterator exhausted');
    }
    return r.value;
  }
}

export class AnimationGraph<T extends AlgebraData<T>> {
  private readonly graph: Graph<AnimationNode<T>>;
  private readonly applyFn: AnimationApplyFunction<T>;
  private readonly stateTransferBeginCallback: AnimationStateTransferBeginCallback<T>;
  private currentNode: AnimationNode<T>;
  private currentEdge: AnimationEdge<T> | null = null;
  private iterator: PeekableIterator<AnimationEdge<T>> | null = null;

  private rafId: number | null = null;
  private animBeginTs = 0;
  private animLastOverflow = 0;
  private animCB: Callback<void, Error> | null = null;
  private animIsReverting = false;
  private animTerminateAtNext = false;
  private animRevertBeginTime = 0;

  constructor(
    graph: Graph<AnimationNode<T>>,
    apply: AnimationApplyFunction<T>,
    stateTransferBeginCallback: AnimationStateTransferBeginCallback<T>,
    initialNode: AnimationNode<T>,
  ) {
    this.graph = graph;
    this.applyFn = apply;
    this.stateTransferBeginCallback = stateTransferBeginCallback;
    if (!graph.containsNode(initialNode)) {
      throw new Error('`initialNode` is not contained in `nodes`');
    }
    this.currentNode = initialNode;
    this.applyFinal(null, initialNode);
  }

  isPlaying(): boolean {
    return this.rafId !== null;
  }

  isReverting(): boolean {
    return this.rafId !== null && this.animIsReverting;
  }

  stopAndSetNode(node: AnimationNode<T>): void {
    if (!this.graph.containsNode(node)) throw new Error('node not in graph');
    this.currentNode = node;
    this.currentEdge = null;
    this.iterator = null;
    this.stopTimer();
    this.applyFinal(null, this.currentNode);
  }

  getCurrentNode(): AnimationNode<T> {
    return this.currentNode;
  }

  getNextNode(): AnimationNode<T> | null {
    return this.currentEdge === null ? null : this.currentEdge.to;
  }

  play(key: AnimationNode<T>): void;
  play(key: AnimationNode<T>, cb: Callback<void, Error>): void;
  play(keys: AnimationNode<T>[], cb: Callback<void, Error>): void;
  play(keyOrKeys: AnimationNode<T> | AnimationNode<T>[], cb?: Callback<void, Error>): void {
    if (Array.isArray(keyOrKeys)) {
      this.playList(keyOrKeys, cb ?? Callback.ofIgnoreExceptionFunction(() => { /* no-op */ }));
      return;
    }
    if (cb === undefined) {
      this.playList([keyOrKeys], Callback.ofIgnoreExceptionFunction(() => { /* no-op */ }));
    } else {
      this.playList([keyOrKeys], cb);
    }
  }

  playList(keys: AnimationNode<T>[], cb: Callback<void, Error>): void {
    if (keys.length === 0) {
      cb.succeeded();
      return;
    }
    if (this.isPlaying()) {
      this.cancelAndPlay(keys, cb);
      return;
    }
    while (keys.length > 0 && keys[0] === this.currentNode) {
      keys = keys.slice(1);
    }
    if (keys.length === 0) {
      cb.succeeded();
      return;
    }
    if (new Set(keys).size !== keys.length) {
      throw new Error(`duplicated nodes in ${keys.map((k) => k.name).join(',')}`);
    }
    for (const k of keys) {
      if (k === this.currentNode) {
        throw new Error(`node in ${keys.map((x) => x.name).join(',')} conflict with current node: ${this.currentNode.name}`);
      }
    }
    let lastNode = this.currentNode;
    let path: GraphPath<AnimationNode<T>> | null = null;
    for (const k of keys) {
      let newPath: GraphPath<AnimationNode<T>>;
      try {
        newPath = this.prepareForPlaying(lastNode, k, path, keys);
      } catch (e) {
        Logger.warn('ALERT', `unable to find path for playing animation: from ${lastNode.name} to ${k.name}`);
        cb.failed(e as Error);
        return;
      }
      lastNode = newPath.to;
      if (path === null) {
        path = newPath;
      } else {
        path = path.concat(newPath);
      }
    }
    if (path === null) {
      cb.succeeded();
      return;
    }
    this.iterator = new PeekableIterator<AnimationEdge<T>>(
      path.path[Symbol.iterator]() as Iterator<AnimationEdge<T>>,
    );
    this.animCB = cb;
    this.animBeginTs = 0;
    this.animLastOverflow = 0;
    this.animIsReverting = false;
    this.animTerminateAtNext = false;
    this.animRevertBeginTime = 0;
    this.startTimer();
  }

  private cancelAndPlay(keys: AnimationNode<T>[], cb: Callback<void, Error>): void {
    if (this.currentEdge === null) {
      this.stopAndSetNode(this.currentNode);
      this.playList(keys, cb);
      return;
    }
    const firstNode = keys[0]!;
    const currentNode = this.currentNode;
    if (currentNode === firstNode) {
      this.playAfterRevert(currentNode, keys, cb);
      return;
    }
    const nextNode = this.currentEdge.to;
    if (nextNode === firstNode) {
      this.playAtNext(nextNode, keys, cb);
      return;
    }
    let currentNodePath: GraphPath<AnimationNode<T>>;
    try {
      currentNodePath = this.findShortestPaths(currentNode, firstNode, new Set());
    } catch (e) {
      Logger.warn('ALERT', `unable to find path for playing animation from ${currentNode.name} to ${firstNode.name}`);
      cb.failed(e as Error);
      return;
    }
    let nextNodePath: GraphPath<AnimationNode<T>>;
    try {
      nextNodePath = this.findShortestPaths(nextNode, firstNode, new Set());
    } catch (e) {
      Logger.warn('ALERT', `unable to find path for playing animation from ${nextNode.name} to ${firstNode.name}`);
      cb.failed(e as Error);
      return;
    }
    if (currentNodePath.length > nextNodePath.length) {
      this.playAtNext(nextNode, keys, cb);
    } else {
      this.playAfterRevert(currentNode, keys, cb);
    }
  }

  private playAtNext(n: AnimationNode<T>, keys: AnimationNode<T>[], cb: Callback<void, Error>): void {
    if (this.isReverting()) {
      this.cancelRevertAndStopAtNext(cb);
      return;
    }
    this.stopAtNext(Callback.ofFunction<void, Error>((err) => {
      if (err !== null) {
        cb.failed(err);
        return;
      }
      this.stopAndSetNode(n);
      this.playList(keys, cb);
    }));
  }

  private playAfterRevert(n: AnimationNode<T>, keys: AnimationNode<T>[], cb: Callback<void, Error>): void {
    if (this.isReverting()) {
      this.setCB(cb);
      return;
    }
    this.revertToLastNode(Callback.ofFunction<void, Error>((err) => {
      if (err !== null) {
        cb.failed(err);
        return;
      }
      this.stopAndSetNode(n);
      this.playList(keys, cb);
    }));
  }

  private findShortestPaths(from: AnimationNode<T>, to: AnimationNode<T>, skip: Set<AnimationNode<T>>): GraphPath<AnimationNode<T>> {
    const paths = this.graph.shortestPaths(from, skip);
    const p = paths.get(to);
    if (!p) {
      throw new Error(`cannot find path from ${from.name} to ${to.name}`);
    }
    return p;
  }

  private prepareForPlaying(from: AnimationNode<T>, to: AnimationNode<T>, path: GraphPath<AnimationNode<T>> | null, keys: AnimationNode<T>[]): GraphPath<AnimationNode<T>> {
    const skip = new Set<AnimationNode<T>>();
    if (path !== null) {
      for (const e of path.path) {
        skip.add(e.from);
        skip.add(e.to);
      }
    }
    for (const k of keys) skip.add(k);
    skip.delete(from);
    skip.delete(to);
    return this.findShortestPaths(from, to, skip);
  }

  private applyData(from: AnimationNode<T>, to: AnimationNode<T>, data: T): void {
    this.applyFn(from, to, data);
  }

  private applyFinal(from: AnimationNode<T> | null, to: AnimationNode<T>): void {
    this.applyFn(from, to, to.value);
    to.stateTransferFinish(from as AnimationNode<T>, to);
  }

  private startTimer(): void {
    const tick = (nowMs: number) => {
      this.handle(Math.floor(nowMs * 1_000_000));
      if (this.rafId !== null) {
        this.rafId = requestAnimationFrame(tick);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopTimer(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private handle(now: number): void {
    if (this.animBeginTs === 0) {
      this.animBeginTs = now;
      return;
    }
    if (this.animIsReverting) {
      if (this.animRevertBeginTime === 0) {
        this.animRevertBeginTime = now;
        return;
      }
    }
    if (this.currentEdge === null) {
      if (this.checkEnd()) return;
      this.currentEdge = this.iterator!.next();
      this.stateTransferBeginCallback(
        this.currentEdge.from, this.currentEdge.to,
      );
      this.animBeginTs = now - this.animLastOverflow;
    }
    const currentEdge0 = this.currentEdge;
    let data: T;
    if (!this.animIsReverting) {
      const delta = (now - this.animBeginTs) / 1_000_000;
      if (delta >= currentEdge0.durationMillis) {
        data = currentEdge0.to.value;
        this.animLastOverflow = delta - currentEdge0.durationMillis;
        this.currentNode = currentEdge0.to;
        this.currentEdge = null;
        currentEdge0.to.stateTransferFinish(currentEdge0.from, currentEdge0.to);
        this.checkEnd();
      } else {
        const p = delta / currentEdge0.durationMillis;
        data = currentEdge0.from.value.plus(
          currentEdge0.to.value.minus(currentEdge0.from.value).multiply(p),
        );
      }
    } else {
      const delta = (now - this.animRevertBeginTime) / 1_000_000;
      const elapsed = (this.animRevertBeginTime - this.animBeginTs) / 1_000_000;
      if (delta >= elapsed) {
        data = currentEdge0.from.value;
        this.currentNode = currentEdge0.from;
        this.currentEdge = null;
        currentEdge0.from.stateTransferFinish(currentEdge0.to, currentEdge0.from);
        this.checkEnd();
      } else {
        const p = (elapsed - delta) / currentEdge0.durationMillis;
        data = currentEdge0.from.value.plus(
          currentEdge0.to.value.minus(currentEdge0.from.value).multiply(p),
        );
      }
    }
    this.applyData(currentEdge0.from, currentEdge0.to, data);
  }

  private checkEnd(): boolean {
    if (this.animTerminateAtNext || (this.iterator === null || !this.iterator.hasNext())) {
      this.currentEdge = null;
      this.iterator = null;
      const cb = this.animCB;
      this.animCB = null;
      this.stopTimer();
      if (cb) cb.succeeded();
      return true;
    }
    return false;
  }

  private revertToLastNode(cb: Callback<void, Error>): void {
    if (this.rafId === null) {
      cb.succeeded();
      return;
    }
    this.doRevertCurrentAnimation(cb);
  }

  private doRevertCurrentAnimation(cb: Callback<void, Error>): void {
    this.animIsReverting = true;
    this.animTerminateAtNext = true;
    if (this.currentEdge !== null) {
      // currentNode is still the source node during a mid-animation revert.
      this.currentNode.stateTransferFinish(this.currentEdge.to, this.currentEdge.from);
    }
    this.setCB(cb);
  }

  private stopAtNext(cb: Callback<void, Error>): void {
    this.animTerminateAtNext = true;
    this.setCB(cb);
  }

  private setCB(cb: Callback<void, Error>): void {
    if (this.animCB) this.animCB.failed(new AnimationInterrupted());
    this.animCB = cb;
  }

  private cancelRevertAndStopAtNext(cb: Callback<void, Error>): void {
    this.animIsReverting = false;
    this.animTerminateAtNext = true;
    if (this.currentEdge !== null) {
      this.stateTransferBeginCallback(
        this.currentEdge.from, this.currentEdge.to,
      );
    }
    this.setCB(cb);
  }
}
