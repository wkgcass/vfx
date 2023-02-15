package io.vproxy.vfx.robot;

import io.vproxy.vfx.entity.input.Key;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.Logger;
import javafx.embed.swing.SwingFXUtils;
import javafx.geometry.Point2D;
import javafx.scene.image.Image;
import javafx.scene.image.WritableImage;
import javafx.scene.robot.Robot;
import javafx.stage.Screen;

import java.awt.*;

public class RobotWrapper {
    private final Robot robot;
    private final java.awt.Robot awtRobot;
    private final boolean log;

    public RobotWrapper() {
        this(false);
    }

    public RobotWrapper(boolean log) {
        this.log = log;
        this.robot = new Robot();
        java.awt.Robot awtRobot;
        try {
            awtRobot = new java.awt.Robot();
        } catch (AWTException e) {
            Logger.error("failed creating awt robot", e);
            awtRobot = null;
        }
        this.awtRobot = awtRobot;
    }

    public void press(Key key) {
        if (key.button != null) {
            robot.mousePress(key.button);
            if (log) Logger.debug("mouse press: " + key);
        } else if (key.key != null) {
            robot.keyPress(key.key.java);
            if (log) Logger.debug("key press: " + key);
        }
    }

    public void release(Key key) {
        if (key.button != null) {
            robot.mouseRelease(key.button);
            if (log) Logger.debug("mouse release: " + key);
        } else if (key.key != null) {
            robot.keyRelease(key.key.java);
            if (log) Logger.debug("key release: " + key);
        }
    }

    public Image captureScreen(Screen screen) {
        if (log) Logger.debug("screen capture: " + screen);
        var bounds = screen.getBounds();
        return capture0(null, bounds.getMinX(), bounds.getMinY(), (int) bounds.getWidth(), (int) bounds.getHeight(), true);
    }

    public Image capture(double x, double y, int width, int height) {
        return capture(null, x, y, width, height);
    }

    public Image capture(WritableImage img, double x, double y, int width, int height) {
        return capture(img, x, y, width, height, false);
    }

    public Image capture(WritableImage img, double x, double y, int width, int height, boolean tryAwt) {
        if (log) Logger.debug("partial capture: (" + x + ", " + y + ") + (" + width + " * " + height + ")");
        return capture0(img, x, y, width, height, tryAwt);
    }

    private Image capture0(WritableImage img, double x, double y, int width, int height, boolean tryAwt) {
        if (tryAwt && awtRobot != null) {
            var mi = awtRobot.createMultiResolutionScreenCapture(new Rectangle((int) x, (int) y, width, height));
            var ls = mi.getResolutionVariants();
            if (!ls.isEmpty()) {
                var i = ls.get(ls.size() - 1);
                boolean useAwt = false;
                if (img == null) {
                    useAwt = true;
                } else {
                    var w = i.getWidth(null);
                    var h = i.getHeight(null);
                    if (w <= img.getWidth() && h <= img.getHeight()) {
                        useAwt = true;
                    }
                }
                if (useAwt) {
                    if (log) Logger.debug("using awt captured image");
                    return SwingFXUtils.toFXImage(FXUtils.convertToBufferedImage(i), img);
                }
            }
        }
        if (log) Logger.debug("using javafx captured image");
        return robot.getScreenCapture(img, x, y, width, height);
    }

    public java.awt.Image awtCapture(int x, int y, int width, int height) {
        var mi = awtRobot.createMultiResolutionScreenCapture(new Rectangle(x, y, width, height));
        var ls = mi.getResolutionVariants();
        if (ls.isEmpty()) return null;
        return ls.get(ls.size() - 1);
    }

    public void mouseMove(double x, double y) {
        if (log) Logger.debug("mouse move: (" + x + ", " + y + ")");
        robot.mouseMove(x, y);
    }

    public Point2D getMousePosition() {
        return robot.getMousePosition();
    }

    public void mouseWheel(int wheelAmt) {
        if (log) Logger.debug("mouse wheel: " + wheelAmt);
        robot.mouseWheel(wheelAmt);
    }
}
