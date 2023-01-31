package io.vproxy.vfx.theme.impl;

import io.vproxy.vfx.manager.font.FontProvider;
import io.vproxy.vfx.manager.image.ImageManager;
import io.vproxy.vfx.theme.Theme;
import javafx.scene.image.Image;
import javafx.scene.paint.*;

public class DarkTheme extends Theme {
    private final FontProvider __fontProvider = new DarkThemeFontProvider();

    @Override
    public FontProvider fontProvider() {
        return __fontProvider;
    }

    @Override
    public Color normalTextColor() {
        return new Color(0xec / 255d, 0xec / 255d, 0xec / 255d, 1);
    }

    @Override
    public Color borderColor() {
        return borderColorLight();
    }

    @Override
    public Color borderColorLight() {
        return new Color(0xc3 / 255d, 0xc3 / 255d, 0xc3 / 255d, 1);
    }

    @Override
    public Color borderColorDark() {
        return sceneBackgroundColor();
    }

    @Override
    public Color sceneBackgroundColor() {
        return new Color(0x24 / 255d, 0x29 / 255d, 0x2e / 255d, 1);
    }

    @Override
    public Color subSceneBackgroundColor() {
        return new Color(0x17 / 255d, 0x1b / 255d, 0x1e / 255d, 1);
    }

    @Override
    public Image windowCloseButtonNormalImage() {
        return ImageManager.get().load("io/vproxy/vfx/res/image/close.png:white");
    }

    @Override
    public Image windowCloseButtonHoverImage() {
        return ImageManager.get().load("io/vproxy/vfx/res/image/close.png:red");
    }

    @Override
    public Image windowMaximizeButtonNormalImage() {
        return ImageManager.get().load("io/vproxy/vfx/res/image/maximize.png:white");
    }

    @Override
    public Image windowMaximizeButtonHoverImage() {
        return ImageManager.get().load("io/vproxy/vfx/res/image/maximize.png:green");
    }

    @Override
    public Image windowResetWindowSizeButtonNormalImage() {
        return ImageManager.get().load("io/vproxy/vfx/res/image/reset-window-size.png:white");
    }

    @Override
    public Image windowResetWindowSizeButtonHoverImage() {
        return ImageManager.get().load("io/vproxy/vfx/res/image/reset-window-size.png:green");
    }

    @Override
    public Image windowIconifyButtonNormalImage() {
        return ImageManager.get().load("io/vproxy/vfx/res/image/iconify.png:white");
    }

    @Override
    public Image windowIconifyButtonHoverImage() {
        return ImageManager.get().load("io/vproxy/vfx/res/image/iconify.png:yellow");
    }

    @Override
    public Color fusionButtonHoverBackgroundColor() {
        return new Color(0x52 / 255d, 0x5a / 255d, 0x5e / 255d, 1);
    }

    @Override
    public Color fusionButtonDownBackgroundColor() {
        return new Color(0x1f / 255d, 0x22 / 255d, 0x25 / 255d, 1);
    }

    @Override
    public Color fusionButtonAnimatingBorderLightColor() {
        return new Color(0x4d / 255d, 0x6e / 255d, 0xbe / 255d, 1);
    }

    @Override
    public Color transparentFusionButtonDownBackgroundColor() {
        return new Color(0x1a / 255d, 0x1e / 255d, 0x21 / 255d, 0.3);
    }

    @Override
    public Color fusionPaneHoverBackgroundColor() {
        return new Color(0x31 / 255d, 0x37 / 255d, 0x3d / 255d, 1);
    }

    @Override
    public Color fusionPaneBorderColor() {
        return new Color(0x9f / 255d, 0x9f / 255d, 0x9f / 255d, 1);
    }

    @Override
    public Color transparentFusionPaneHoverBackgroundColor() {
        return new Color(0x31 / 255d, 0x37 / 255d, 0x3d / 255d, 0.3);
    }

    @Override
    public Color scrollBarColor() {
        return new Color(0xc3 / 255d, 0xc3 / 255d, 0xc3 / 255d, 1);
    }

    @Override
    public Color fusionButtonDisabledTextColor() {
        return new Color(0x83 / 255d, 0x83 / 255d, 0x83 / 255d, 1);
    }

    @Override
    public Color coverBackgroundColor() {
        return new Color(1, 1, 1, 0.1);
    }

    @Override
    public Color tableSortLabelColor() {
        return Color.GRAY;
    }

    @Override
    public Color tableCellSelectedBackgroundColor() {
        return new Color(0x40 / 255d, 0x49 / 255d, 0x52 / 255d, 1);
    }

    @Override
    public Color tableCellBackgroundColor2() {
        return new Color(0x29 / 255d, 0x30 / 255d, 0x36 / 255d, 1);
    }

    @Override
    public Color tableHeaderTopBackgroundColor() {
        return new Color(0x1a / 255d, 0x1f / 255d, 0x21 / 255d, 1);
    }

    @Override
    public Color tableHeaderBottomBackgroundColor() {
        return new Color(0x1b / 255d, 0x20 / 255d, 0x23 / 255d, 1);
    }

    @Override
    public Color progressBarProgressColor() {
        return new Color(0x59 / 255d, 0xb6 / 255d, 0x55 / 255d, 1);
    }

    @Override
    public Color progressBarBackgroundColor() {
        return new Color(0x40 / 255d, 0x49 / 255d, 0x52 / 255d, 1);
    }

    @Override
    public Color toggleSwitchSelectedButtonColor() {
        return toggleSwitchBorderColor();
    }

    @Override
    public Color toggleSwitchUnselectedTrayColor() {
        return new Color(0x40 / 255d, 0x49 / 255d, 0x52 / 255d, 1);
    }

    @Override
    public Color toggleSwitchSelectedTrayColor() {
        return new Color(0x5d / 255d, 0x66 / 255d, 0x6e / 255d, 1);
    }
}
