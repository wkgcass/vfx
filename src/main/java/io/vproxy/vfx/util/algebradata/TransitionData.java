package io.vproxy.vfx.util.algebradata;

public class TransitionData implements AlgebraData<TransitionData> {
    public final double x;
    public final double y;

    public TransitionData(double x, double y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public TransitionData plus(TransitionData other) {
        return new TransitionData(x + other.x, y + other.y);
    }

    @Override
    public TransitionData minus(TransitionData other) {
        return new TransitionData(x - other.x, y - other.y);
    }

    @Override
    public TransitionData multiply(double v) {
        return new TransitionData(x * v, y * v);
    }

    @Override
    public TransitionData dividedBy(double v) {
        return new TransitionData(x / v, y / v);
    }
}
