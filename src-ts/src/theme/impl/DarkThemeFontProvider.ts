import { FontManager } from '../../manager/font/FontManager.js';
import type { FontSettings } from '../../manager/font/FontSettings.js';
import type { FontUsage } from '../../manager/font/FontUsage.js';
import { ThemeFontProvider } from '../ThemeFontProvider.js';

export class DarkThemeFontProvider extends ThemeFontProvider {
  protected defaultFont(settings: FontSettings): void {
    settings.setFamily(FontManager.FONT_NAME_NotoSansSCRegular);
  }

  protected windowTitle(settings: FontSettings): void {
    this.defaultFont(settings);
    settings.setSize(15);
  }

  protected tableCellText(settings: FontSettings): void {
    this.defaultFont(settings);
    settings.setSize(12);
  }

  protected _default(_usage: FontUsage, settings: FontSettings): void {
    this.defaultFont(settings);
    settings.setSize(16);
  }
}
