package io.vproxy.vfx.theme;

import io.vproxy.vfx.manager.font.FontProvider;
import io.vproxy.vfx.theme.impl.DarkTheme;
import javafx.scene.image.Image;
import javafx.scene.paint.Color;
import javafx.scene.paint.Paint;

public abstract class Theme {
    private static Theme currentTheme;

    public static Theme current() {
        if (currentTheme != null) {
            return currentTheme;
        }
        synchronized (Theme.class) {
            if (currentTheme != null) {
                return currentTheme;
            }
            currentTheme = new DarkTheme();
        }
        return currentTheme;
    }

    public static void setTheme(Theme theme) {
        synchronized (Theme.class) {
            if (currentTheme != null)
                throw new IllegalStateException("currentTheme is already set");
            currentTheme = theme;
        }
    }

    public abstract FontProvider fontProvider();

    public abstract Color normalTextColor();

    public abstract int windowTitleFontSize();

    public abstract Color borderColor();

    public Color windowBorderColor() {
        return borderColor();
    }

    public abstract Color sceneBackgroundColor();

    public abstract Image windowCloseButtonNormalImage();

    public abstract Image windowCloseButtonHoverImage();

    public abstract Image windowMaximizeButtonNormalImage();

    public abstract Image windowMaximizeButtonHoverImage();

    public abstract Image windowResetWindowSizeButtonNormalImage();

    public abstract Image windowResetWindowSizeButtonHoverImage();

    public abstract Image windowIconifyButtonNormalImage();

    public abstract Image windowIconifyButtonHoverImage();

    public Color fusionButtonNormalBackgroundColor() {
        return sceneBackgroundColor();
    }

    public abstract Color fusionButtonHoverBackgroundColor();

    public abstract Color fusionButtonDownBackgroundColor();

    public abstract Color fusionButtonAnimatingBorderLightColor();

    public boolean enableFusionButtonAnimation() {
        return true;
    }

    public Color fusionPaneNormalBackgroundColor() {
        return sceneBackgroundColor();
    }

    public abstract Color fusionPaneHoverBackgroundColor();

    public abstract Color fusionPaneBorderColor();

    public Color transparentFusionPaneNormalBackgroundColor() {
        return new Color(0, 0, 0, 0);
    }

    public abstract Color transparentFusionPaneHoverBackgroundColor();

    public abstract Color scrollBarColor();

    public Color fusionButtonTextColor() {
        return normalTextColor();
    }

    public abstract Color fusionButtonDisabledTextColor();

    public abstract Paint coverBackgroundColor();

    public Color tableTextColor() {
        return normalTextColor();
    }

    public Color tableHeaderTextColor() {
        return normalTextColor();
    }

    public abstract Color tableCellSelectedBackgroundColor();

    public Color tableCellBackgroundColor1() {
        return sceneBackgroundColor();
    }

    public abstract Color tableCellBackgroundColor2();

    public abstract Color tableHeaderTopBackgroundColor();

    public abstract Color tableHeaderBottomBackgroundColor();
}
