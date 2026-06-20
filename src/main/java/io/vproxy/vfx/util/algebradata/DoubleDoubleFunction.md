# DoubleDoubleFunction.java vs DoubleDoubleFunction.ts
## Summary
Functional interface for double→double function. TS uses `(x: number) => number` type.
## Note
Although `AnimationEdge.function` is of type `DoubleDoubleFunction`, it is **not actually used** by `AnimationGraph` — linear interpolation is hardcoded in both Java and TS. The TS file includes the comment: *"Not used by AnimationGraph (linear interpolation is hardcoded); kept for API parity."*

## Verdict
CONSISTENT.
