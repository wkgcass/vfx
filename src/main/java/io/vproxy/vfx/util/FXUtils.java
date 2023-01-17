package io.vproxy.vfx.util;

import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import io.vproxy.vfx.ui.alert.SimpleAlert;
import javafx.animation.AnimationTimer;
import javafx.application.Platform;
import javafx.geometry.Rectangle2D;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.paint.Color;
import javafx.scene.text.Text;
import javafx.stage.Screen;
import javafx.stage.Stage;
import javafx.stage.Window;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.function.Supplier;

public class FXUtils {
    public static void runOnFX(Runnable r) {
        if (Platform.isFxApplicationThread()) {
            r.run();
        } else {
            Platform.runLater(r);
        }
    }

    public static <T> T runOnFXAndReturn(Supplier<T> f) {
        boolean[] finished = new boolean[]{false};
        Object[] obj = new Object[]{null};
        Runnable r = () -> {
            obj[0] = f.get();
            finished[0] = true;
        };
        if (Platform.isFxApplicationThread()) {
            r.run();
        } else {
            Platform.runLater(r);
        }
        while (!finished[0]) {
            try {
                //noinspection BusyWait
                Thread.sleep(1);
            } catch (InterruptedException ignore) {
            }
        }
        //noinspection unchecked
        return (T) obj[0];
    }

    public static void runDelay(int millis, Runnable r) {
        var ptr = new AnimationTimer[1];
        ptr[0] = new AnimationTimer() {
            private long begin;

            @Override
            public void handle(long now) {
                if (begin == 0) {
                    begin = now;
                    return;
                }
                if (now - begin < millis * 1_000_000L) {
                    return;
                }
                ptr[0].stop();

                r.run();
            }
        };
        ptr[0].start();
    }

    public static Rectangle2D calculateTextBounds(Label label) {
        Text text = new Text(label.getText());
        text.setFont(label.getFont());
        return calculateTextBounds(text);
    }

    public static Rectangle2D calculateTextBounds(Text text) {
        double textWidth;
        double textHeight;
        {
            textWidth = text.getLayoutBounds().getWidth();
            textHeight = text.getLayoutBounds().getHeight();
        }
        return new Rectangle2D(0, 0, textWidth, textHeight);
    }

    public static void showWindow(Window window) {
        try {
            ((Stage) window).setIconified(false);
            ((Stage) window).setAlwaysOnTop(true);
            Platform.runLater(() -> ((Stage) window).setAlwaysOnTop(false));
        } catch (Throwable ignore) {
        }
    }

    public static void iconifyWindow(Window window) {
        try {
            ((Stage) window).setIconified(true);
        } catch (Throwable ignore) {
        }
    }

    public static float[] toHSB(Color color) {
        float[] ff = new float[3];
        java.awt.Color.RGBtoHSB((int) (color.getRed() * 255), (int) (color.getGreen() * 255), (int) (color.getBlue() * 255), ff);
        return ff;
    }

    public static Screen getScreenOf(Window window) {
        if (window == null) return null;
        var screenOb = Screen.getScreensForRectangle(window.getX(), window.getY(), window.getWidth(), window.getHeight());
        Screen screen;
        if (screenOb.isEmpty()) {
            screen = Screen.getPrimary();
        } else {
            screen = screenOb.get(0);
        }
        if (screen == null) {
            SimpleAlert.showAndWait(Alert.AlertType.WARNING, InternalI18n.get().cannotFindAnyDisplay());
            return null;
        }
        return screen;
    }

    public static BufferedImage convertToBufferedImage(java.awt.Image awtImage) {
        if (awtImage instanceof BufferedImage) return (BufferedImage) awtImage;
        BufferedImage bImage = new BufferedImage(awtImage.getWidth(null), awtImage.getHeight(null), BufferedImage.TYPE_INT_ARGB);
        Graphics2D bGr = bImage.createGraphics();
        bGr.drawImage(awtImage, 0, 0, null);
        bGr.dispose();
        return bImage;
    }
}
