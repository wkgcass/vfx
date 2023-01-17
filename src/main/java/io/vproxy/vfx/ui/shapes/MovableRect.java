package io.vproxy.vfx.ui.shapes;

import io.vproxy.vfx.control.drag.DragHandler;
import io.vproxy.vfx.entity.Rect;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import javafx.scene.Cursor;
import javafx.scene.Group;
import javafx.scene.control.Label;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

public class MovableRect extends Group {
    private final Rectangle rect;

    public MovableRect(String labelText) {
        rect = new Rectangle();
        rect.setFill(Color.TRANSPARENT);
        rect.setStroke(Color.RED);
        rect.setStrokeWidth(5);
        rect.setCursor(Cursor.MOVE);

        var pointRightBottom = new Rectangle();
        pointRightBottom.setWidth(10);
        pointRightBottom.setHeight(10);
        pointRightBottom.setFill(Color.RED);
        pointRightBottom.setStrokeWidth(0);
        pointRightBottom.setStroke(Color.TRANSPARENT);
        pointRightBottom.setCursor(Cursor.SE_RESIZE);

        rect.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            pointRightBottom.setLayoutX(now.doubleValue() - 10);
        });
        rect.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            pointRightBottom.setLayoutY(now.doubleValue() - 10);
        });

        var label = new Label(labelText) {{
            FontManager.get().setFont(FontUsages.movableShapeLabel, this);
        }};
        label.setTextFill(Color.RED);
        label.setLayoutX(0);
        rect.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            label.setLayoutY(now.doubleValue() + 5);
        });

        var dragHandler = new DragHandler() {
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

        rect.setOnMousePressed(dragHandler);
        rect.setOnMouseDragged(dragHandler);

        var resizeHandler = new DragHandler() {
            @Override
            protected void set(double x, double y) {
                if (x > 5) rect.setWidth(x);
                if (y > 5) rect.setHeight(y);
            }

            @Override
            protected double[] get() {
                return new double[]{rect.getWidth(), rect.getHeight()};
            }
        };

        pointRightBottom.setOnMousePressed(resizeHandler);
        pointRightBottom.setOnMouseDragged(resizeHandler);

        getChildren().addAll(label, rect, pointRightBottom);
    }

    public void from(Rect rect) {
        setLayoutX(rect.x);
        setLayoutY(rect.y);
        setWidth(rect.w);
        setHeight(rect.h);
    }

    public Rect makeRect() {
        var rect = new Rect();
        rect.x = getLayoutX();
        rect.y = getLayoutY();
        rect.w = getWidth();
        rect.h = getHeight();
        return rect;
    }

    public double getWidth() {
        return rect.getWidth();
    }

    public double getHeight() {
        return rect.getHeight();
    }

    public void setWidth(double width) {
        rect.setWidth(width);
    }

    public void setHeight(double height) {
        rect.setHeight(height);
    }
}
