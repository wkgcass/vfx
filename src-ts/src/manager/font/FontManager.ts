import { Logger } from '../../vproxy-base/Logger.js';
import { FontProvider } from './FontProvider.js';
import { FontSettings } from './FontSettings.js';
import { FontUsages } from './FontUsages.js';
import type { FontUsage } from './FontUsage.js';
import type { Label, Text } from '../../javafx/Label.js';

const FONT_PATH_SmileySansOblique = './res/font/SmileySans-Oblique.otf';
const FONT_PATH_NotoSansSCRegular = './res/font/NotoSansSC-Regular.otf';
const FONT_PATH_JetBrainsMono = './res/font/JetBrainsMono-Regular.ttf';

let fontsInjected = false;
function injectFonts(): void {
  if (fontsInjected) return;
  fontsInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: "Smiley Sans Oblique";
      src: url("${FONT_PATH_SmileySansOblique}") format("opentype");
      font-display: block;
    }
    @font-face {
      font-family: "Noto Sans SC Regular";
      src: url("${FONT_PATH_NotoSansSCRegular}") format("opentype");
      font-display: block;
    }
    @font-face {
      font-family: "JetBrains Mono";
      src: url("${FONT_PATH_JetBrainsMono}") format("truetype");
      font-display: block;
    }
  `;
  document.head.appendChild(style);
}

export type Fontable = Label | Text | { setFont(css: string): void };

export class FontManager {
  static readonly instance = new FontManager();

  static get(): FontManager {
    return FontManager.instance;
  }

  static FONT_NAME_Default(): string {
    return 'Noto Sans SC Regular';
  }
  static readonly FONT_NAME_SmileySansOblique = 'Smiley Sans Oblique';
  static readonly FONT_NAME_NotoSansSCRegular = 'Noto Sans SC Regular';
  static readonly FONT_NAME_JetBrainsMono = 'JetBrains Mono';

  private provider: FontProvider | null = null;
  private providerLoading = false;

  private constructor() {
    injectFonts();
    // In the browser, font files are loaded asynchronously. We do not get a
    // synchronous "loaded?" signal like JavaFX's Font.loadFont returns null
    // on failure. We log here for parity with the Java error path; the actual
    // font files are verified at build time by scripts/copy-resources.mjs.
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.load(`16px "Smiley Sans Oblique"`).catch(() => {
        Logger.error('FILE_ERROR', 'failed loading font: SmileySans-Oblique');
      });
      document.fonts.load(`16px "Noto Sans SC Regular"`).catch(() => {
        Logger.error('FILE_ERROR', 'failed loading font: NotoSansSC-Regular');
      });
      document.fonts.load(`16px "JetBrains Mono"`).catch(() => {
        Logger.error('FILE_ERROR', 'failed loading font: JetBrainsMono');
      });
    }
  }

  setFontProvider(provider: FontProvider): void {
    this.provider = provider;
    this.providerLoading = false;
  }

  /**
   * Synchronously returns the provider. The provider is fetched from
   * `Theme.current()` on first use. Because Theme → DarkTheme →
   * DarkThemeFontProvider → FontManager forms a cycle, we use a deferred
   * dynamic import to break it: the first call returns a fallback provider
   * that emits default-family size-16, and the real provider is installed
   * asynchronously by the dynamic import.
   */
  private getProvider(): FontProvider {
    if (this.provider !== null) return this.provider;
    if (!this.providerLoading) {
      this.providerLoading = true;
      void import('../../theme/Theme.js').then(({ Theme }) => {
        if (this.provider === null) {
          this.provider = Theme.current().fontProvider();
        }
      });
    }
    return {
      apply(_u: FontUsage, s: FontSettings) {
        s.setFamily(FontManager.FONT_NAME_Default()).setSize(16);
      },
    };
  }

  setFont(target: Fontable): void;
  setFont(target: Fontable, apply: (s: FontSettings) => FontSettings): void;
  setFont(usage: FontUsage, target: Fontable): void;
  setFont(usage: FontUsage, target: Fontable, apply: (s: FontSettings) => FontSettings): void;
  setFont(
    usageOrTarget: FontUsage | Fontable,
    targetOrApply?: Fontable | ((s: FontSettings) => FontSettings),
    applyMaybe?: (s: FontSettings) => FontSettings,
  ): void {
    let usage: FontUsage;
    let target: Fontable;
    let apply: ((s: FontSettings) => FontSettings) | undefined;
    if (typeof usageOrTarget === 'symbol') {
      usage = usageOrTarget;
      target = targetOrApply as Fontable;
      apply = applyMaybe;
    } else {
      usage = FontUsages.defaultUsage;
      target = usageOrTarget as Fontable;
      apply = targetOrApply as ((s: FontSettings) => FontSettings) | undefined;
    }
    const settings = new FontSettings();
    this.getProvider().apply(usage, settings);
    if (apply) apply(settings);
    target.setFont(settings.build());
  }
}
