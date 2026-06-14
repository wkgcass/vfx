import type { StageSpec } from './StageSpec.js';

export type StageFactoryContext = {
  specId: string;
  emitResult: (value: unknown) => Promise<void>;
};

export type StageFactory = (
  spec: StageSpec,
  ctx: StageFactoryContext,
) => Promise<void> | void;

const factories = new Map<string, StageFactory>();

export function registerStageFactory(kind: string, factory: StageFactory): void {
  if (factories.has(kind)) {
    throw new Error(`Factory already registered for stage kind: ${kind}`);
  }
  factories.set(kind, factory);
}

export async function buildStage(spec: StageSpec, ctx: StageFactoryContext): Promise<void> {
  const f = factories.get(spec.kind);
  if (!f) throw new Error(`No factory registered for stage kind: ${spec.kind}`);
  await f(spec, ctx);
}
