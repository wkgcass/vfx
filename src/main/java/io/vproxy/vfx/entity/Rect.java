package io.vproxy.vfx.entity;

import vjson.JSON;
import vjson.deserializer.rule.DoubleRule;
import vjson.deserializer.rule.ObjectRule;
import vjson.deserializer.rule.Rule;
import vjson.util.ObjectBuilder;

public class Rect {
    public double x;
    public double y;
    public double w;
    public double h;

    public static final Rule<Rect> rule = new ObjectRule<>(Rect::new)
        .put("x", (o, it) -> o.x = it, DoubleRule.get())
        .put("y", (o, it) -> o.y = it, DoubleRule.get())
        .put("w", (o, it) -> o.w = it, DoubleRule.get())
        .put("h", (o, it) -> o.h = it, DoubleRule.get());

    public Rect() {
    }

    public Rect(double x, double y, double w, double h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    public JSON.Object toJson() {
        return new ObjectBuilder()
            .put("x", x)
            .put("y", y)
            .put("w", w)
            .put("h", h)
            .build();
    }
}
