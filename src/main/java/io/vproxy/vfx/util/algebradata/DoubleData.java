package io.vproxy.vfx.util.algebradata;

public class DoubleData implements AlgebraData<DoubleData> {
    public final double value;

    public DoubleData(double value) {
        this.value = value;
    }

    @Override
    public DoubleData plus(DoubleData other) {
        return new DoubleData(value + other.value);
    }

    @Override
    public DoubleData minus(DoubleData other) {
        return new DoubleData(value - other.value);
    }

    @Override
    public DoubleData multiply(double v) {
        return new DoubleData(value * v);
    }

    @Override
    public DoubleData dividedBy(double v) {
        return new DoubleData(value / v);
    }

    @Override
    public String toString() {
        return "DoubleData(" + value + ")";
    }
}
