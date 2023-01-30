package io.vproxy.vfx.util.algebradata;

public class XYZData implements AlgebraData<XYZData> {
    public final double x;
    public final double y;
    public final double z;

    public XYZData(double x, double y, double z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    @Override
    public XYZData plus(XYZData other) {
        return new XYZData(x + other.x, y + other.y, z + other.z);
    }

    @Override
    public XYZData minus(XYZData other) {
        return new XYZData(x - other.x, y - other.y, z - other.z);
    }

    @Override
    public XYZData multiply(double v) {
        return new XYZData(x * v, y * v, z * v);
    }

    @Override
    public XYZData dividedBy(double v) {
        return new XYZData(x / v, y / v, z / v);
    }

    @Override
    public String toString() {
        return "XYZData(" + x + ", " + y + ", " + z + ")";
    }
}
