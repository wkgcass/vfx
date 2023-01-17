package io.vproxy.vfx.entity;

import vjson.JSON;
import vjson.deserializer.rule.DoubleRule;
import vjson.deserializer.rule.ObjectRule;
import vjson.deserializer.rule.Rule;
import vjson.util.ObjectBuilder;

public class Point {
    public double x;
    public double y;

    public static final Rule<Point> rule = new ObjectRule<>(Point::new)
        .put("x", (o, it) -> o.x = it, DoubleRule.get())
        .put("y", (o, it) -> o.y = it, DoubleRule.get());

    public Point() {
    }

    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public static Point midOf(Point a, Point b) {
        return new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
    }

    public JSON.Object toJson() {
        return new ObjectBuilder()
            .put("x", x)
            .put("y", y)
            .build();
    }
}
