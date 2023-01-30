package io.vproxy.vfx.util.algebradata;

public class XYZTData implements AlgebraData<XYZTData> {
    public final double x;
    public final double y;
    public final double z;
    public final double t;

    public XYZTData(double x, double y, double z, double t) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.t = t;
    }

    @Override
    public XYZTData plus(XYZTData other) {
        return new XYZTData(x + other.x, y + other.y, z + other.z, t + other.t);
    }

    @Override
    public XYZTData minus(XYZTData other) {
        return new XYZTData(x - other.x, y - other.y, z - other.z, t - other.t);
    }

    @Override
    public XYZTData multiply(double v) {
        return new XYZTData(x * v, y * v, z * v, t * v);
    }

    @Override
    public XYZTData dividedBy(double v) {
        return new XYZTData(x / v, y / v, z / v, t / v);
    }

    @Override
    public String toString() {
        return "XYZTData(" + x + ", " + y + ", " + z + ", " + t + ")";
    }
}
