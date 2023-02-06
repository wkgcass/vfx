package io.vproxy.vfx.util.algebradata;

import io.vproxy.vfx.util.FXUtils;
import javafx.scene.paint.Color;

public class ColorData implements AlgebraData<ColorData> {
    private Color color;
    private final float h;
    private final float s;
    private final float b;
    private final double alpha;

    public ColorData(Color color) {
        this.color = color;
        var hsb = FXUtils.toHSB(color);
        h = hsb[0];
        s = hsb[1];
        b = hsb[2];
        alpha = color.getOpacity();
    }

    public ColorData(float h, float s, float b, double alpha) {
        this.h = h;
        this.s = s;
        this.b = b;
        this.alpha = alpha;
    }

    public ColorData(float[] hsb, double alpha) {
        h = hsb[0];
        s = hsb[1];
        b = hsb[2];
        this.alpha = alpha;
    }

    public Color getColor() {
        if (color == null) {
            double alpha = this.alpha;
            if (alpha > 1) {
                alpha = 1;
            } else if (alpha < 0) {
                alpha = 0;
            }
            color = FXUtils.fromHSB(h, s, b, alpha);
        }
        return color;
    }

    @Override
    public ColorData plus(ColorData other) {
        return new ColorData(h + other.h, s + other.s, b + other.b, alpha + other.alpha);
    }

    @Override
    public ColorData minus(ColorData other) {
        return new ColorData(h - other.h, s - other.s, b - other.b, alpha - other.alpha);
    }

    @Override
    public ColorData multiply(double v) {
        return new ColorData((float) (h * v), (float) (s * v), (float) (b * v), alpha * v);
    }

    @Override
    public ColorData dividedBy(double v) {
        return new ColorData((float) (h / v), (float) (s / v), (float) (b / v), alpha / v);
    }
}
