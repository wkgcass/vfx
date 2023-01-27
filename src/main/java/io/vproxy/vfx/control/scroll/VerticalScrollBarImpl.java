package io.vproxy.vfx.control.scroll;

import io.vproxy.vfx.theme.Theme;
import javafx.scene.Group;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;

import java.util.Arrays;

public class VerticalScrollBarImpl extends Group {
    private final Rectangle mid = new Rectangle();
    private final Circle bot = new Circle();

    public VerticalScrollBarImpl() {
        var top = new Circle();
        top.setRadius(VScrollPane.SCROLL_V_WIDTH / 2d);
        top.setLayoutX(VScrollPane.SCROLL_V_WIDTH / 2d);
        top.setLayoutY(VScrollPane.SCROLL_V_WIDTH / 2d);
        mid.setWidth(VScrollPane.SCROLL_V_WIDTH);
        mid.setLayoutY(VScrollPane.SCROLL_V_WIDTH / 2d);
        bot.setRadius(VScrollPane.SCROLL_V_WIDTH / 2d);
        bot.setLayoutX(VScrollPane.SCROLL_V_WIDTH / 2d);

        for (var shape : Arrays.asList(top, mid, bot)) {
            shape.setStrokeWidth(0);
            shape.setFill(Theme.current().scrollBarColor());
        }

        getChildren().addAll(top, mid, bot);
    }

    public void setLength(double length) {
        mid.setHeight(length - VScrollPane.SCROLL_V_WIDTH);
        bot.setLayoutY(length - VScrollPane.SCROLL_V_WIDTH / 2d);
    }

    public double getLength() {
        return mid.getHeight() + VScrollPane.SCROLL_V_WIDTH;
    }
}
