// Java's `super(null, null, false, false)` produces a stack-trace-less
// exception; here we extend Error and zero out the stack for cheapness.

export class AnimationInterrupted extends Error {
  constructor() {
    super('animation interrupted');
    this.name = 'AnimationInterrupted';
    this.stack = undefined;
  }
}
