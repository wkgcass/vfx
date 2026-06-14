// Each constant is a unique symbol — reference equality mirrors the
// anonymous-inner-class identity semantics of the Java original.

import { FontUsage } from './FontUsage.js';

export const FontUsages = {
  defaultUsage: FontUsage(),
  loading: FontUsage(),
  alert: FontUsage(),
  movableShapeLabel: FontUsage(),
  tableEmptyTableLabel: FontUsage(),
  windowTitle: FontUsage(),
  fusionButtonText: FontUsage(),
  dialogText: FontUsage(),
  tableCellText: FontUsage(),
} as const;

export type FontUsages = typeof FontUsages;

export function fontUsageToKey(usage: FontUsage): string | null {
  for (const key of Object.keys(FontUsages) as (keyof typeof FontUsages)[]) {
    if (FontUsages[key] === usage) return key;
  }
  return null;
}

export function fontUsageFromKey(key: string): FontUsage {
  const u = (FontUsages as Record<string, FontUsage>)[key];
  if (!u) throw new Error(`Unknown FontUsage key: ${key}`);
  return u;
}

