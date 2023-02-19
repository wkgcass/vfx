package io.vproxy.vfx.theme;

import io.vproxy.vfx.manager.font.FontProvider;
import io.vproxy.vfx.theme.impl.DarkTheme;
import javafx.scene.image.Image;
import javafx.scene.paint.*;

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

    public abstract Color borderColor();

    public abstract Color borderColorLight();

    public abstract Color borderColorDark();

    public Color windowBorderColor() {
        return borderColor();
    }

    public Color windowBorderColorLight() {
        return borderColorLight();
    }

    public Color windowBorderColorDark() {
        return borderColorDark();
    }

    public abstract Color sceneBackgroundColor();

    public abstract Color subSceneBackgroundColor();

    public LinearGradient makeVerticalSubSceneBackgroundGradient() {
        return new LinearGradient(0, 0, 0, 1, true,
            CycleMethod.NO_CYCLE,
            new Stop(0, Theme.current().sceneBackgroundColor()),
            new Stop(1, Theme.current().subSceneBackgroundColor()));
    }

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

    public Color transparentFusionButtonNormalBackgroundColor() {
        return transparentFusionPaneNormalBackgroundColor();
    }

    public Color transparentFusionButtonHoverBackgroundColor() {
        return transparentFusionPaneHoverBackgroundColor();
    }

    public abstract Color transparentFusionButtonDownBackgroundColor();

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

    public abstract Color coverBackgroundColor();

    public LinearGradient makeCoverGradientBackground() {
        var color = coverBackgroundColor();
        var initial = new Color(color.getRed(), color.getGreen(), color.getBlue(), 0);
        return new LinearGradient(
            0, 0, 0, 1, true, CycleMethod.NO_CYCLE,
            new Stop(0, initial),
            new Stop(0.6, color),
            new Stop(1, color)
        );
    }

    public Color tableTextColor() {
        return normalTextColor();
    }

    public Color tableHeaderTextColor() {
        return normalTextColor();
    }

    public abstract Color tableSortLabelColor();

    public abstract Color tableCellSelectedBackgroundColor();

    public Color tableCellBackgroundColor1() {
        return sceneBackgroundColor();
    }

    public abstract Color tableCellBackgroundColor2();

    public abstract Color tableHeaderTopBackgroundColor();

    public abstract Color tableHeaderBottomBackgroundColor();

    public abstract Color progressBarProgressColor();

    public abstract Color progressBarBackgroundColor();

    public Color toggleSwitchBorderColor() {
        return borderColor();
    }

    public Color toggleSwitchUnselectedButtonColor() {
        return fusionButtonNormalBackgroundColor();
    }

    public Color toggleSwitchUnselectedButtonHoverColor() {
        return fusionButtonHoverBackgroundColor();
    }

    public Color toggleSwitchSelectedButtonColor() {
        return fusionButtonDownBackgroundColor();
    }

    public abstract Color toggleSwitchUnselectedTrayColor();

    public abstract Color toggleSwitchSelectedTrayColor();

    public Color sliderButtonNormalColor() {
        return fusionButtonNormalBackgroundColor();
    }

    public Color sliderButtonHoverColor() {
        return fusionButtonHoverBackgroundColor();
    }

    public Color sliderButtonDownColor() {
        return fusionButtonDownBackgroundColor();
    }

    public Color sliderButtonBorderColor() {
        return borderColor();
    }

    public Color rangeSliderButtonNormalColor() {
        return fusionButtonNormalBackgroundColor();
    }

    public Color rangeSliderButtonHoverColor() {
        return fusionButtonHoverBackgroundColor();
    }

    public Color rangeSliderButtonDownColor() {
        return fusionButtonDownBackgroundColor();
    }

    public Color rangeSliderButtonBorderColor() {
        return borderColor();
    }

    public Color rangeSliderBackgroundColor() {
        return progressBarBackgroundColor();
    }

    public Color rangeSliderRangeColor() {
        return progressBarProgressColor();
    }

    public Color fusionWrapperBackgroundColor() {
        return sceneBackgroundColor();
    }
}
