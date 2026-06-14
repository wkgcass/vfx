import { FontSettings } from './FontSettings.js';
import type { FontUsage } from './FontUsage.js';

export interface FontProvider {
  apply(usage: FontUsage, settings: FontSettings): void;
}
