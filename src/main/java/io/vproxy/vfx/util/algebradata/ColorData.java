package io.vproxy.vfx.util.algebradata;

import io.vproxy.vfx.util.FXUtils;
import javafx.scene.paint.Color;

import java.util.Arrays;

public class ColorData implements AlgebraData<ColorData> {
    private Color color;
    private final float[] hsb;
    private final double alpha;

    public ColorData(Color color) {
        this.color = color;
        hsb = FXUtils.toHSB(color);
        alpha = color.getOpacity();
    }

    public ColorData(float h, float s, float b, double alpha) {
        this.hsb = new float[]{h, s, b};
        this.alpha = alpha;
    }

    public ColorData(float[] hsb, double alpha) {
        this.hsb = Arrays.copyOf(hsb, 3);
        this.alpha = alpha;
    }

    public Color getColor() {
        if (color == null) {
            color = FXUtils.fromHSB(hsb, alpha);
        }
        return color;
    }

    @Override
    public ColorData plus(ColorData other) {
        return new ColorData(hsb[0] + other.hsb[0], hsb[1] + other.hsb[1], hsb[2] + other.hsb[2], alpha + other.alpha);
    }

    @Override
    public ColorData minus(ColorData other) {
        return new ColorData(hsb[0] - other.hsb[0], hsb[1] - other.hsb[1], hsb[2] - other.hsb[2], alpha - other.alpha);
    }

    @Override
    public ColorData multiply(double v) {
        return new ColorData((float) (hsb[0] * v), (float) (hsb[1] * v), (float) (hsb[2] * v), alpha * v);
    }

    @Override
    public ColorData dividedBy(double v) {
        return new ColorData((float) (hsb[0] / v), (float) (hsb[1] / v), (float) (hsb[2] / v), alpha / v);
    }
}
