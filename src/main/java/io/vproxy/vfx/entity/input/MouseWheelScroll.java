package io.vproxy.vfx.entity.input;

import vjson.JSON;
import vjson.deserializer.rule.IntRule;
import vjson.deserializer.rule.ObjectRule;
import vjson.deserializer.rule.Rule;
import vjson.deserializer.rule.StringRule;
import vjson.util.ObjectBuilder;

public class MouseWheelScroll {
    public final Direction direction;
    public final int value;

    public static final Rule<MouseWheelScroll> rule = ObjectRule.builder(MouseWheelScrollBuilder::new, MouseWheelScrollBuilder::build, builder -> builder
        .put("direction", (o, it) -> o.direction = Direction.valueOf(it), StringRule.get())
        .put("value", (o, it) -> o.value = it, IntRule.get())
    );

    private static class MouseWheelScrollBuilder {
        Direction direction;
        int value;

        MouseWheelScroll build() {
            return new MouseWheelScroll(direction, value);
        }
    }

    public MouseWheelScroll(Direction direction) {
        this.direction = direction;
        this.value = 0;
    }

    public MouseWheelScroll(Direction direction, int value) {
        this.direction = direction;
        this.value = value;
    }

    public JSON.Object toJson() {
        return new ObjectBuilder()
            .put("direction", direction.name())
            .put("value", value)
            .build();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        MouseWheelScroll that = (MouseWheelScroll) o;

        if (value != that.value) return false;
        return direction == that.direction;
    }

    @Override
    public int hashCode() {
        int result = direction.hashCode();
        result = 31 * result + value;
        return result;
    }

    @Override
    public String toString() {
        if (value == 0) {
            return "scroll-" + direction.name().toLowerCase();
        } else {
            return "scroll-" + direction.name().toLowerCase() + ":" + value;
        }
    }

    public enum Direction {
        UP,
        DOWN,
    }
}
