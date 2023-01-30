package io.vproxy.vfx.ui.shapes;

import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.paint.Paint;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;
import javafx.scene.transform.Rotate;

public class VLine extends Group {
    private final Circle beginDot;
    private final Line line;
    private final Circle endDot;

    private final double width;
    private final double radius;

    private double startX;
    private double startY;
    private double endX;
    private double endY;
    private Paint fill;

    private Arrow arrowImageStart = null;
    private Arrow arrowImageEnd = null;

    public VLine(double width) {
        this.width = width;
        this.radius = width / 2;

        beginDot = new Circle(radius);
        beginDot.setStrokeWidth(0);
        line = new Line();
        line.setStrokeWidth(width);
        endDot = new Circle(radius);
        endDot.setStrokeWidth(0);

        getChildren().addAll(beginDot, line, endDot);
    }

    public void setStartStyle(EndpointStyle style) {
        if (style == EndpointStyle.ARROW) {
            var arrowImage = loadOrMakeArrowImage();
            calcDirection(arrowImage, false);
            arrowImage.setLayoutX(getStartX());
            arrowImage.setLayoutY(getStartY());
            arrowImageStart = arrowImage;
            getChildren().add(arrowImage);
        } else {
            if (arrowImageStart != null) {
                getChildren().remove(arrowImageStart);
                arrowImageStart = null;
            }
        }
    }

    public void setEndStyle(EndpointStyle style) {
        if (style == EndpointStyle.ARROW) {
            var arrowImage = loadOrMakeArrowImage();
            calcDirection(arrowImage, true);
            arrowImage.setLayoutX(getEndX());
            arrowImage.setLayoutY(getEndY());
            arrowImageEnd = arrowImage;
            getChildren().add(arrowImage);
        } else {
            if (arrowImageEnd != null) {
                getChildren().remove(arrowImageEnd);
                arrowImageEnd = null;
            }
        }
    }

    private void calcDirection(Node n, boolean toEnd) {
        double dx;
        double dy;
        if (toEnd) {
            dx = getEndX() - getStartX();
            dy = getEndY() - getStartY();
        } else {
            dx = getStartX() - getEndX();
            dy = getStartY() - getEndY();
        }
        if (dx == 0 && dy == 0) {
            return;
        }
        var l = Math.sqrt(dx * dx + dy * dy);
        var r = Math.acos(dx / l);
        if (dy < 0) {
            r = -r;
        }
        var d = r * 180 / Math.PI;
        var rotation = new Rotate(d);
        n.getTransforms().add(rotation);
    }

    private Arrow loadOrMakeArrowImage() {
        var arrow = new Arrow();
        arrow.setFill(fill);
        var ratio = width / 32;
        arrow.setScale(ratio);
        return arrow;
    }

    public void setStroke(Paint fill) {
        this.fill = fill;

        beginDot.setFill(fill);
        line.setStroke(fill);
        endDot.setFill(fill);
        if (arrowImageStart != null) {
            arrowImageStart.setFill(fill);
        }
        if (arrowImageEnd != null) {
            arrowImageEnd.setFill(fill);
        }
    }

    public double getStartX() {
        return startX;
    }

    public void setStartX(double startX) {
        this.startX = startX;
        beginDot.setLayoutX(startX);
        updateLine();
    }

    public double getStartY() {
        return startY;
    }

    public void setStartY(double startY) {
        this.startY = startY;
        beginDot.setLayoutY(startY);
        updateLine();
    }

    public double getEndX() {
        return endX;
    }

    public void setEndX(double endX) {
        this.endX = endX;
        endDot.setLayoutX(endX);
        updateLine();
    }

    public double getEndY() {
        return endY;
    }

    public void setEndY(double endY) {
        this.endY = endY;
        endDot.setLayoutY(endY);
        updateLine();
    }

    private void updateLine() {
        var dx = endX - startX;
        var dy = endY - startY;
        if (dx == 0 && dy == 0) {
            line.setVisible(false);
            return;
        }
        line.setVisible(true);
        var l = Math.sqrt(dx * dx + dy * dy);
        dx = dx * radius / l;
        dy = dy * radius / l;
        line.setStartX(startX + dx);
        line.setStartY(startY + dy);
        line.setEndX(endX - dx);
        line.setEndY(endY - dy);
        if (arrowImageStart != null) {
            arrowImageStart.setLayoutX(startX);
            arrowImageStart.setLayoutY(startY);
        }
        if (arrowImageEnd != null) {
            arrowImageEnd.setLayoutX(endX);
            arrowImageEnd.setLayoutY(endY);
        }
    }

    public void setStart(double x, double y) {
        setStartX(x);
        setStartY(y);
    }

    public void setEnd(double x, double y) {
        setEndX(x);
        setEndY(y);
    }
}
