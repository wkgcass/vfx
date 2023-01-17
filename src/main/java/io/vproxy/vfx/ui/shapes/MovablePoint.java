package io.vproxy.vfx.ui.shapes;

import io.vproxy.vfx.control.drag.DragHandler;
import io.vproxy.vfx.entity.Point;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.util.FXUtils;
import javafx.scene.Cursor;
import javafx.scene.Group;
import javafx.scene.control.Label;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;

public class MovablePoint extends Group {
    public MovablePoint(String labelText) {
        var point = new Circle(5);
        point.setFill(Color.RED);
        point.setStrokeWidth(0);
        point.setStroke(Color.TRANSPARENT);
        var label = new Label(labelText) {{
            FontManager.get().setFont(FontUsages.movableShapeLabel, this);
        }};
        point.setCursor(Cursor.MOVE);
        label.setTextFill(Color.RED);
        var wh = FXUtils.calculateTextBounds(label);
        label.setLayoutX(-wh.getWidth() / 2);
        label.setLayoutY(10);

        var handler = new DragHandler() {
            @Override
            protected void set(double x, double y) {
                setLayoutX(x);
                setLayoutY(y);
            }

            @Override
            protected double[] get() {
                return new double[]{getLayoutX(), getLayoutY()};
            }
        };

        point.setOnMousePressed(handler);
        point.setOnMouseDragged(handler);

        getChildren().addAll(label, point);
    }

    public Point makePoint() {
        var point = new Point();
        point.x = getLayoutX();
        point.y = getLayoutY();
        return point;
    }

    public void from(Point point) {
        setX(point.x);
        setY(point.y);
    }

    public void setX(double x) {
        setLayoutX(x);
    }

    public void setY(double y) {
        setLayoutY(y);
    }
}
