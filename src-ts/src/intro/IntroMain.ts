import { Theme } from '../theme/Theme.js';
import { IntroTheme } from './IntroTheme.js';
import { IntroFXMain } from './IntroFXMain.js';
import { FontManager } from '../manager/font/FontManager.js';

export async function mainIntro(): Promise<void> {
  Theme.setTheme(new IntroTheme());
  // Pre-install the theme's FontProvider before any scene is constructed.
  // FontManager.getProvider() otherwise returns a fallback on its first
  // call (default family, size 16) and only installs the real provider
  // after an async dynamic import resolves. Scenes built synchronously
  // during IntroFXMain.start() — including the initial 10 rows of the
  // VTableView demo — would otherwise pick up the fallback font, while
  // rows added later (e.g. via the Add button) would pick up the real
  // tableCellText font, making the new row visibly inconsistent with
  // the initial rows. Installing the provider here makes every setFont()
  // call go through the real theme provider.
  FontManager.get().setFontProvider(Theme.current().fontProvider());
  const app = new IntroFXMain();
  await app.start();
}
