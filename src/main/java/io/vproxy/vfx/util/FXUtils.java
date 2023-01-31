package io.vproxy.vfx.util;

import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import io.vproxy.vfx.ui.alert.SimpleAlert;
import javafx.animation.AnimationTimer;
import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.geometry.Rectangle2D;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.image.WritableImage;
import javafx.scene.layout.Region;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Text;
import javafx.stage.Screen;
import javafx.stage.Stage;
import javafx.stage.Window;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.List;
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

                Platform.runLater(r);
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

    public static Color fromHSB(float[] hsb, double alpha) {
        var rgb = java.awt.Color.HSBtoRGB(hsb[0], hsb[1], hsb[2]);
        var r = (rgb >> 16) & 0xff;
        var g = (rgb >> 8) & 0xff;
        var b = rgb & 0xff;
        return new Color(r / 255d, g / 255d, b / 255d, alpha);
    }

    public static Color fromHSB(float h, float s, float b, double alpha) {
        return fromHSB(new float[]{h, s, b}, alpha);
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

    public static List<ChangeListener<? super Number>> observeWidthHeight(Region observed, Region modified) {
        return observeWidthHeight(observed, modified, 0, 0);
    }

    @SuppressWarnings("DuplicatedCode")
    public static List<ChangeListener<? super Number>> observeWidthHeight(Region observed, Region modified, double wDelta, double hDelta) {
        return List.of(
            observeWidth(observed, modified, wDelta),
            observeHeight(observed, modified, hDelta)
        );
    }

    public static ChangeListener<? super Number> observeWidth(Region observed, Region modified) {
        return observeWidth(observed, modified, 0);
    }

    @SuppressWarnings("DuplicatedCode")
    public static ChangeListener<? super Number> observeWidth(Region observed, Region modified, double wDelta) {
        ChangeListener<? super Number> lsn = (ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            modified.setPrefWidth(w + wDelta);
        };
        observed.widthProperty().addListener(lsn);
        var current = observed.getWidth();
        if (current > 0) {
            lsn.changed(null, null, current);
        }
        return lsn;
    }

    public static ChangeListener<? super Number> observeHeight(Region observed, Region modified) {
        return observeHeight(observed, modified, 0);
    }

    @SuppressWarnings("DuplicatedCode")
    public static ChangeListener<? super Number> observeHeight(Region observed, Region modified, double hDelta) {
        ChangeListener<? super Number> lsn = (ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            modified.setPrefHeight(h + hDelta);
        };
        observed.heightProperty().addListener(lsn);
        var current = observed.getHeight();
        if (current > 0) {
            lsn.changed(null, null, current);
        }
        return lsn;
    }

    public static List<ChangeListener<? super Number>> observeWidthHeightWithPreferred(Region observed, Region modified) {
        return observeWidthHeightWithPreferred(observed, modified, 0, 0);
    }

    @SuppressWarnings("DuplicatedCode")
    public static List<ChangeListener<? super Number>> observeWidthHeightWithPreferred(Region observed, Region modified, double wDelta, double hDelta) {
        return List.of(
            observeWidthWithPreferred(observed, modified, wDelta),
            observeHeightWithPreferred(observed, modified, hDelta)
        );
    }

    public static ChangeListener<? super Number> observeWidthWithPreferred(Region observed, Region modified) {
        return observeWidthWithPreferred(observed, modified, 0);
    }

    @SuppressWarnings("DuplicatedCode")
    public static ChangeListener<? super Number> observeWidthWithPreferred(Region observed, Region modified, double wDelta) {
        ChangeListener<? super Number> lsn = (ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            modified.setPrefWidth(w + wDelta);
        };
        observed.widthProperty().addListener(lsn);
        observed.prefWidthProperty().addListener(lsn);
        var current = observed.getWidth();
        if (current <= 0) {
            current = observed.getPrefWidth();
        }
        if (current > 0) {
            lsn.changed(null, null, current);
        }
        return lsn;
    }

    public static ChangeListener<? super Number> observeHeightWithPreferred(Region observed, Region modified) {
        return observeHeightWithPreferred(observed, modified, 0);
    }

    @SuppressWarnings("DuplicatedCode")
    public static ChangeListener<? super Number> observeHeightWithPreferred(Region observed, Region modified, double hDelta) {
        ChangeListener<? super Number> lsn = (ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            modified.setPrefHeight(h + hDelta);
        };
        observed.heightProperty().addListener(lsn);
        observed.prefHeightProperty().addListener(lsn);
        var current = observed.getHeight();
        if (current <= 0) {
            current = observed.getWidth();
        }
        if (current > 0) {
            lsn.changed(null, null, current);
        }
        return lsn;
    }

    public static List<ChangeListener<? super Number>> observeWidthHeightCenter(Region observed, Region modified) {
        return List.of(
            observeWidthCenter(observed, modified),
            observeHeightCenter(observed, modified)
        );
    }

    public static ChangeListener<? super Number> observeWidthCenter(Region observed, Region modified) {
        ChangeListener<? super Number> lsn = (ob, old, now) ->
            modified.setLayoutX((observed.getWidth() - modified.getWidth()) / 2);
        observed.widthProperty().addListener(lsn);
        modified.widthProperty().addListener(lsn);
        lsn.changed(null, null, null);
        return lsn;
    }

    public static ChangeListener<? super Number> observeHeightCenter(Region observed, Region modified) {
        ChangeListener<? super Number> lsn = (ob, old, now) ->
            modified.setLayoutY((observed.getHeight() - modified.getHeight()) / 2);
        observed.heightProperty().addListener(lsn);
        modified.heightProperty().addListener(lsn);
        lsn.changed(null, null, null);
        return lsn;
    }

    public static Node makeClipFor(Region node) {
        var cut = new Rectangle();
        node.setClip(cut);
        node.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            cut.setWidth(w);
        });
        node.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            cut.setHeight(h);
        });
        cut.setWidth(node.getWidth());
        cut.setHeight(node.getHeight());
        return cut;
    }

    private static final int overlapLen = 1;

    @SuppressWarnings("DuplicatedCode")
    public static Group makeClipFor(Region node, double cornerRadii) {
        var nodeCutTL = new Circle() {{
            setLayoutX(cornerRadii);
            setLayoutY(cornerRadii);
            setRadius(cornerRadii);
        }};
        var nodeCutTR = new Circle() {{
            setLayoutY(cornerRadii);
            setRadius(cornerRadii);
        }};
        var nodeCutTopMid = new javafx.scene.shape.Rectangle() {{
            setLayoutX(cornerRadii);
            setHeight(cornerRadii + overlapLen);
        }};
        var nodeCutBL = new Circle() {{
            setLayoutX(cornerRadii);
            setRadius(cornerRadii);
        }};
        var nodeCutBR = new Circle() {{
            setRadius(cornerRadii);
        }};
        var nodeCutBotMid = new javafx.scene.shape.Rectangle() {{
            setLayoutX(cornerRadii);
            setHeight(cornerRadii + overlapLen);
        }};
        var nodeCutMid = new Rectangle() {{
            setLayoutY(cornerRadii);
        }};
        var nodeCut = new Group(nodeCutTL, nodeCutTR, nodeCutTopMid, nodeCutBL, nodeCutBR, nodeCutBotMid, nodeCutMid);
        node.setClip(nodeCut);
        ChangeListener<? super Number> widthListener = (ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            nodeCutTR.setLayoutX(w - cornerRadii);
            nodeCutTopMid.setWidth(w - cornerRadii * 2);
            nodeCutBR.setLayoutX(w - cornerRadii);
            nodeCutBotMid.setWidth(w - cornerRadii * 2);
            nodeCutMid.setWidth(w);
        };
        node.widthProperty().addListener(widthListener);
        ChangeListener<? super Number> heightListener = (ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            nodeCutBL.setLayoutY(h - cornerRadii);
            nodeCutBR.setLayoutY(h - cornerRadii);
            nodeCutBotMid.setLayoutY(h - cornerRadii - overlapLen);
            nodeCutMid.setHeight(h - cornerRadii * 2);
        };
        node.heightProperty().addListener(heightListener);
        widthListener.changed(null, null, node.getWidth());
        heightListener.changed(null, null, node.getHeight());
        return nodeCut;
    }

    @SuppressWarnings("DuplicatedCode")
    public static Group makeBottomOnlyRoundedClipFor(Region node, double cornerRadii) {
        var nodeCutBL = new Circle() {{
            setLayoutX(cornerRadii);
            setRadius(cornerRadii);
        }};
        var nodeCutBR = new Circle() {{
            setRadius(cornerRadii);
        }};
        var nodeCutBotMid = new javafx.scene.shape.Rectangle() {{
            setLayoutX(cornerRadii);
            setHeight(cornerRadii + overlapLen);
        }};
        var nodeCutMid = new Rectangle();
        var nodeCut = new Group(nodeCutBL, nodeCutBR, nodeCutBotMid, nodeCutMid);
        node.setClip(nodeCut);
        ChangeListener<? super Number> widthListener = (ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            nodeCutBR.setLayoutX(w - cornerRadii);
            nodeCutBotMid.setWidth(w - cornerRadii * 2);
            nodeCutMid.setWidth(w);
        };
        node.widthProperty().addListener(widthListener);
        ChangeListener<? super Number> heightListener = (ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            nodeCutBL.setLayoutY(h - cornerRadii);
            nodeCutBR.setLayoutY(h - cornerRadii);
            nodeCutBotMid.setLayoutY(h - cornerRadii - overlapLen);
            nodeCutMid.setHeight(h - cornerRadii);
        };
        node.heightProperty().addListener(heightListener);
        widthListener.changed(null, null, node.getWidth());
        heightListener.changed(null, null, node.getHeight());
        return nodeCut;
    }

    @SuppressWarnings("DuplicatedCode")
    public static Group makeTopOnlyRoundedClipFor(Region node, double cornerRadii) {
        var nodeCutTL = new Circle() {{
            setLayoutX(cornerRadii);
            setLayoutY(cornerRadii);
            setRadius(cornerRadii);
        }};
        var nodeCutTR = new Circle() {{
            setLayoutY(cornerRadii);
            setRadius(cornerRadii);
        }};
        var nodeCutTopMid = new javafx.scene.shape.Rectangle() {{
            setLayoutX(cornerRadii);
            setHeight(cornerRadii + overlapLen);
        }};
        var nodeCutMid = new Rectangle() {{
            setLayoutY(cornerRadii);
        }};
        var nodeCut = new Group(nodeCutTL, nodeCutTR, nodeCutTopMid, nodeCutMid);
        node.setClip(nodeCut);
        ChangeListener<? super Number> widthListener = (ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            nodeCutTR.setLayoutX(w - cornerRadii);
            nodeCutTopMid.setWidth(w - cornerRadii * 2);
            nodeCutMid.setWidth(w);
        };
        node.widthProperty().addListener(widthListener);
        ChangeListener<? super Number> heightListener = (ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            nodeCutMid.setHeight(h - cornerRadii);
        };
        node.heightProperty().addListener(heightListener);
        widthListener.changed(null, null, node.getWidth());
        heightListener.changed(null, null, node.getHeight());
        return nodeCut;
    }

    public static double getWidthOrPref(Region r) {
        var w = r.getWidth();
        if (w == 0) return r.getPrefWidth();
        return w;
    }

    public static double getHeightOrPref(Region r) {
        var h = r.getHeight();
        if (h == 0) return r.getPrefHeight();
        return h;
    }

    public static void forceUpdate(Stage stage) {
        FXUtils.runDelay(50, () -> {
            var w = stage.getWidth();
            stage.setWidth(w + 0.001);
            FXUtils.runDelay(50, () -> stage.setWidth(w));
        });
    }

    public static void forceUpdate(Region region) {
        FXUtils.runDelay(50, () -> {
            var w = region.getPrefWidth();
            region.setPrefWidth(w + 0.001);
            FXUtils.runDelay(50, () -> region.setPrefWidth(w));
        });
    }

    public static WritableImage changeColorOfBlackImage(javafx.scene.image.Image img, int setArgb) {
        var w = (int) img.getWidth();
        var h = (int) img.getHeight();
        var reader = img.getPixelReader();

        var wImg = new WritableImage(w, h);
        var writer = wImg.getPixelWriter();
        for (int x = 0; x < w; ++x) {
            for (int y = 0; y < h; ++y) {
                var argb = reader.getArgb(x, y);
                if (argb != 0) {
                    var color = reader.getColor(x, y);
                    var r = (setArgb >> 16) & 0xff;
                    var g = (setArgb >> 8) & 0xff;
                    var b = (setArgb) & 0xff;
                    writer.setArgb(x, y, ((int) color.getOpacity() * 255) << 24
                                         | ((int) (r * (1 - color.getRed())) << 16)
                                         | ((int) (g * (1 - color.getGreen())) << 8)
                                         | (int) (b * (1 - color.getBlue()))
                    );
                } else {
                    writer.setArgb(x, y, argb);
                }
            }
        }
        return wImg;
    }
}
