import type { FontProvider } from '../manager/font/FontProvider.js';
import type { FontSettings } from '../manager/font/FontSettings.js';
import type { FontUsage } from '../manager/font/FontUsage.js';
import { FontUsages } from '../manager/font/FontUsages.js';

export abstract class ThemeFontProvider implements FontProvider {
  apply(usage: FontUsage, settings: FontSettings): void {
    if (usage === FontUsages.windowTitle) {
      this.windowTitle(settings);
    } else if (usage === FontUsages.tableCellText) {
      this.tableCellText(settings);
    } else {
      this._default(usage, settings);
    }
  }

  protected abstract windowTitle(settings: FontSettings): void;
  protected abstract tableCellText(settings: FontSettings): void;
  protected abstract _default(usage: FontUsage, settings: FontSettings): void;
}
