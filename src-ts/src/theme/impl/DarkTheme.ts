import { Color } from '../../javafx/color.js';
import type { FXImage } from '../../javafx/ImageView.js';
import { ImageManager } from '../../manager/image/ImageManager.js';
import type { FontProvider } from '../../manager/font/FontProvider.js';
import { DarkThemeFontProvider } from './DarkThemeFontProvider.js';
import { Theme } from '../Theme.js';

export class DarkTheme extends Theme {
  private readonly _fontProvider = new DarkThemeFontProvider();

  fontProvider(): FontProvider {
    return this._fontProvider;
  }

  normalTextColor(): Color { return new Color(0xec / 255, 0xec / 255, 0xec / 255, 1); }
  borderColor(): Color { return this.borderColorLight(); }
  borderColorLight(): Color { return new Color(0xc3 / 255, 0xc3 / 255, 0xc3 / 255, 1); }
  borderColorDark(): Color { return this.sceneBackgroundColor(); }
  sceneBackgroundColor(): Color { return new Color(0x24 / 255, 0x29 / 255, 0x2e / 255, 1); }
  subSceneBackgroundColor(): Color { return new Color(0x17 / 255, 0x1b / 255, 0x1e / 255, 1); }

  windowCloseButtonNormalImage(): FXImage {
    return ImageManager.get().load('io/vproxy/vfx/res/image/close.png:white')!;
  }
  windowCloseButtonHoverImage(): FXImage {
    return ImageManager.get().load('io/vproxy/vfx/res/image/close.png:red')!;
  }
  windowMaximizeButtonNormalImage(): FXImage {
    return ImageManager.get().load('io/vproxy/vfx/res/image/maximize.png:white')!;
  }
  windowMaximizeButtonHoverImage(): FXImage {
    return ImageManager.get().load('io/vproxy/vfx/res/image/maximize.png:green')!;
  }
  windowResetWindowSizeButtonNormalImage(): FXImage {
    return ImageManager.get().load('io/vproxy/vfx/res/image/reset-window-size.png:white')!;
  }
  windowResetWindowSizeButtonHoverImage(): FXImage {
    return ImageManager.get().load('io/vproxy/vfx/res/image/reset-window-size.png:green')!;
  }
  windowIconifyButtonNormalImage(): FXImage {
    return ImageManager.get().load('io/vproxy/vfx/res/image/iconify.png:white')!;
  }
  windowIconifyButtonHoverImage(): FXImage {
    return ImageManager.get().load('io/vproxy/vfx/res/image/iconify.png:yellow')!;
  }

  fusionButtonHoverBackgroundColor(): Color { return new Color(0x52 / 255, 0x5a / 255, 0x5e / 255, 1); }
  fusionButtonDownBackgroundColor(): Color { return new Color(0x1f / 255, 0x22 / 255, 0x25 / 255, 1); }
  fusionButtonAnimatingBorderLightColor(): Color { return new Color(0x4d / 255, 0x6e / 255, 0xbe / 255, 1); }
  transparentFusionButtonDownBackgroundColor(): Color { return new Color(0x1a / 255, 0x1e / 255, 0x21 / 255, 0.3); }
  fusionPaneHoverBackgroundColor(): Color { return new Color(0x31 / 255, 0x37 / 255, 0x3d / 255, 1); }
  fusionPaneBorderColor(): Color { return new Color(0x9f / 255, 0x9f / 255, 0x9f / 255, 1); }
  transparentFusionPaneHoverBackgroundColor(): Color { return new Color(0x31 / 255, 0x37 / 255, 0x3d / 255, 0.3); }
  scrollBarColor(): Color { return new Color(0xc3 / 255, 0xc3 / 255, 0xc3 / 255, 1); }
  fusionButtonDisabledTextColor(): Color { return new Color(0x83 / 255, 0x83 / 255, 0x83 / 255, 1); }
  coverBackgroundColor(): Color { return new Color(1, 1, 1, 0.1); }
  tableSortLabelColor(): Color { return Color.GRAY; }
  tableCellSelectedBackgroundColor(): Color { return new Color(0x40 / 255, 0x49 / 255, 0x52 / 255, 1); }
  tableCellBackgroundColor2(): Color { return new Color(0x29 / 255, 0x30 / 255, 0x36 / 255, 1); }
  tableHeaderTopBackgroundColor(): Color { return new Color(0x1a / 255, 0x1f / 255, 0x21 / 255, 1); }
  tableHeaderBottomBackgroundColor(): Color { return new Color(0x1b / 255, 0x20 / 255, 0x23 / 255, 1); }
  progressBarProgressColor(): Color { return new Color(0x59 / 255, 0xb6 / 255, 0x55 / 255, 1); }
  progressBarBackgroundColor(): Color { return new Color(0x40 / 255, 0x49 / 255, 0x52 / 255, 1); }

  toggleSwitchSelectedButtonColor(): Color { return this.toggleSwitchBorderColor(); }
  toggleSwitchUnselectedTrayColor(): Color { return new Color(0x40 / 255, 0x49 / 255, 0x52 / 255, 1); }
  toggleSwitchSelectedTrayColor(): Color { return new Color(0x5d / 255, 0x66 / 255, 0x6e / 255, 1); }
}
