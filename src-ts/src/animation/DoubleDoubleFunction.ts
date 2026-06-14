// Not used by AnimationGraph (linear interpolation is hardcoded); kept for API parity.
export type DoubleDoubleFunction = (v: number) => number;

export const identityDoubleDoubleFunction: DoubleDoubleFunction = (v) => v;
