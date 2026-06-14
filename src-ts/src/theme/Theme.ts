// Theme ↔ DarkTheme is a static-import cycle that crashes ESM loaders.
// The Java lazy default is removed; bootstrap always calls setTheme() first.

import type { FontProvider } from '../manager/font/FontProvider.js';
import { Color, LinearGradient } from '../javafx/color.js';
import type { FXImage } from '../javafx/ImageView.js';

export abstract class Theme {
  private static currentTheme: Theme | null = null;

  static current(): Theme {
    if (Theme.currentTheme !== null) return Theme.currentTheme;
    throw new Error('Theme.current() called before Theme.setTheme(...). Call setTheme() during bootstrap.');
  }

  static setTheme(theme: Theme): void {
    if (Theme.currentTheme !== null) {
      throw new Error('currentTheme is already set');
    }
    Theme.currentTheme = theme;
  }

  abstract fontProvider(): FontProvider;

  abstract normalTextColor(): Color;
  abstract borderColor(): Color;
  abstract borderColorLight(): Color;
  abstract borderColorDark(): Color;

  windowBorderColor(): Color { return this.borderColor(); }
  windowBorderColorLight(): Color { return this.borderColorLight(); }
  windowBorderColorDark(): Color { return this.borderColorDark(); }

  abstract sceneBackgroundColor(): Color;
  abstract subSceneBackgroundColor(): Color;

  makeVerticalSubSceneBackgroundGradient(): LinearGradient {
    return new LinearGradient(0, 0, 0, 1, true, 'NO_CYCLE', [
      { offset: 0, color: Theme.current().sceneBackgroundColor() },
      { offset: 1, color: Theme.current().subSceneBackgroundColor() },
    ]);
  }

  abstract windowCloseButtonNormalImage(): FXImage;
  abstract windowCloseButtonHoverImage(): FXImage;
  abstract windowMaximizeButtonNormalImage(): FXImage;
  abstract windowMaximizeButtonHoverImage(): FXImage;
  abstract windowResetWindowSizeButtonNormalImage(): FXImage;
  abstract windowResetWindowSizeButtonHoverImage(): FXImage;
  abstract windowIconifyButtonNormalImage(): FXImage;
  abstract windowIconifyButtonHoverImage(): FXImage;

  fusionButtonNormalBackgroundColor(): Color { return this.sceneBackgroundColor(); }
  abstract fusionButtonHoverBackgroundColor(): Color;
  abstract fusionButtonDownBackgroundColor(): Color;
  abstract fusionButtonAnimatingBorderLightColor(): Color;

  transparentFusionButtonNormalBackgroundColor(): Color {
    return this.transparentFusionPaneNormalBackgroundColor();
  }
  transparentFusionButtonHoverBackgroundColor(): Color {
    return this.transparentFusionPaneHoverBackgroundColor();
  }
  abstract transparentFusionButtonDownBackgroundColor(): Color;

  enableFusionButtonAnimation(): boolean { return true; }

  fusionPaneNormalBackgroundColor(): Color { return this.sceneBackgroundColor(); }
  abstract fusionPaneHoverBackgroundColor(): Color;
  abstract fusionPaneBorderColor(): Color;

  transparentFusionPaneNormalBackgroundColor(): Color {
    return new Color(0, 0, 0, 0);
  }
  abstract transparentFusionPaneHoverBackgroundColor(): Color;

  abstract scrollBarColor(): Color;

  fusionButtonTextColor(): Color { return this.normalTextColor(); }
  abstract fusionButtonDisabledTextColor(): Color;
  abstract coverBackgroundColor(): Color;

  makeCoverGradientBackground(): LinearGradient {
    const c = this.coverBackgroundColor();
    const initial = new Color(c.red, c.green, c.blue, 0);
    return new LinearGradient(0, 0, 0, 1, true, 'NO_CYCLE', [
      { offset: 0, color: initial },
      { offset: 0.6, color: c },
      { offset: 1, color: c },
    ]);
  }

  tableTextColor(): Color { return this.normalTextColor(); }
  tableHeaderTextColor(): Color { return this.normalTextColor(); }
  abstract tableSortLabelColor(): Color;
  abstract tableCellSelectedBackgroundColor(): Color;
  tableCellBackgroundColor1(): Color { return this.sceneBackgroundColor(); }
  abstract tableCellBackgroundColor2(): Color;
  abstract tableHeaderTopBackgroundColor(): Color;
  abstract tableHeaderBottomBackgroundColor(): Color;

  abstract progressBarProgressColor(): Color;
  abstract progressBarBackgroundColor(): Color;

  toggleSwitchBorderColor(): Color { return this.borderColor(); }
  toggleSwitchUnselectedButtonColor(): Color { return this.fusionButtonNormalBackgroundColor(); }
  toggleSwitchUnselectedButtonHoverColor(): Color { return this.fusionButtonHoverBackgroundColor(); }
  toggleSwitchSelectedButtonColor(): Color { return this.fusionButtonDownBackgroundColor(); }
  abstract toggleSwitchUnselectedTrayColor(): Color;
  abstract toggleSwitchSelectedTrayColor(): Color;

  sliderButtonNormalColor(): Color { return this.fusionButtonNormalBackgroundColor(); }
  sliderButtonHoverColor(): Color { return this.fusionButtonHoverBackgroundColor(); }
  sliderButtonDownColor(): Color { return this.fusionButtonDownBackgroundColor(); }
  sliderButtonBorderColor(): Color { return this.borderColor(); }

  rangeSliderButtonNormalColor(): Color { return this.fusionButtonNormalBackgroundColor(); }
  rangeSliderButtonHoverColor(): Color { return this.fusionButtonHoverBackgroundColor(); }
  rangeSliderButtonDownColor(): Color { return this.fusionButtonDownBackgroundColor(); }
  rangeSliderButtonBorderColor(): Color { return this.borderColor(); }
  rangeSliderBackgroundColor(): Color { return this.progressBarBackgroundColor(); }
  rangeSliderRangeColor(): Color { return this.progressBarProgressColor(); }

  fusionWrapperBackgroundColor(): Color { return this.sceneBackgroundColor(); }
}
