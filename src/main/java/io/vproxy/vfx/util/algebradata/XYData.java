package io.vproxy.vfx.util.algebradata;

public class XYData implements AlgebraData<XYData> {
    public final double x;
    public final double y;

    public XYData(double x, double y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public XYData plus(XYData other) {
        return new XYData(x + other.x, y + other.y);
    }

    @Override
    public XYData minus(XYData other) {
        return new XYData(x - other.x, y - other.y);
    }

    @Override
    public XYData multiply(double v) {
        return new XYData(x * v, y * v);
    }

    @Override
    public XYData dividedBy(double v) {
        return new XYData(x / v, y / v);
    }

    @Override
    public String toString() {
        return "XYData(" + x + ", " + y + ")";
    }
}
