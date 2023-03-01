package io.vproxy.vfx.robot;

import io.vproxy.base.util.LogType;
import io.vproxy.base.util.Logger;
import io.vproxy.vfx.entity.input.Key;
import io.vproxy.vfx.util.FXUtils;
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

    public RobotWrapper() {
        this.robot = new Robot();
        java.awt.Robot awtRobot;
        try {
            awtRobot = new java.awt.Robot();
        } catch (AWTException e) {
            Logger.error(LogType.SYS_ERROR, "failed creating awt robot", e);
            awtRobot = null;
        }
        this.awtRobot = awtRobot;
    }

    public void press(Key key) {
        if (key.button != null) {
            robot.mousePress(key.button);
            assert Logger.lowLevelDebug("mouse press: " + key);
        } else if (key.key != null) {
            robot.keyPress(key.key.java);
            assert Logger.lowLevelDebug("key press: " + key);
        }
    }

    public void release(Key key) {
        if (key.button != null) {
            robot.mouseRelease(key.button);
            assert Logger.lowLevelDebug("mouse release: " + key);
        } else if (key.key != null) {
            robot.keyRelease(key.key.java);
            assert Logger.lowLevelDebug("key release: " + key);
        }
    }

    public Image captureScreen(Screen screen) {
        assert Logger.lowLevelDebug("screen capture: " + screen);
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
        assert Logger.lowLevelDebug("partial capture: (" + x + ", " + y + ") + (" + width + " * " + height + ")");
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
                    assert Logger.lowLevelDebug("using awt captured image");
                    return SwingFXUtils.toFXImage(FXUtils.convertToBufferedImage(i), img);
                }
            }
        }
        assert Logger.lowLevelDebug("using javafx captured image");
        return robot.getScreenCapture(img, x, y, width, height);
    }

    public java.awt.Image awtCapture(int x, int y, int width, int height) {
        var mi = awtRobot.createMultiResolutionScreenCapture(new Rectangle(x, y, width, height));
        var ls = mi.getResolutionVariants();
        if (ls.isEmpty()) return null;
        return ls.get(ls.size() - 1);
    }

    public void mouseMove(double x, double y) {
        assert Logger.lowLevelDebug("mouse move: (" + x + ", " + y + ")");
        robot.mouseMove(x, y);
    }

    public Point2D getMousePosition() {
        return robot.getMousePosition();
    }

    public void mouseWheel(int wheelAmt) {
        assert Logger.lowLevelDebug("mouse wheel: " + wheelAmt);
        robot.mouseWheel(wheelAmt);
    }
}
