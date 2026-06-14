import { FontManager } from '../manager/font/FontManager.js';
import type { FontProvider } from '../manager/font/FontProvider.js';
import type { FontSettings } from '../manager/font/FontSettings.js';
import { DarkTheme } from '../theme/impl/DarkTheme.js';
import { DarkThemeFontProvider } from '../theme/impl/DarkThemeFontProvider.js';

export class IntroTheme extends DarkTheme {
  override fontProvider(): FontProvider {
    return new IntroFontProvider();
  }
}

export class IntroFontProvider extends DarkThemeFontProvider {
  protected override defaultFont(settings: FontSettings): void {
    super.defaultFont(settings);
    settings.setFamily(FontManager.FONT_NAME_JetBrainsMono);
  }
}
