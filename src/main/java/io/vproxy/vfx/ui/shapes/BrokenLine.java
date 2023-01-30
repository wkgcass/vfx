package io.vproxy.vfx.ui.shapes;

import io.vproxy.vfx.entity.Point;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.paint.Color;

import java.util.ArrayList;
import java.util.List;

public class BrokenLine {
    private final List<VLine> lines = new ArrayList<>();
    private final Group group = new Group();

    public BrokenLine(double width, double... points) {
        this(width, makePoints(points));
    }

    private static List<Point> makePoints(double[] points) {
        if (points.length % 2 != 0) {
            throw new IllegalArgumentException("points length must be an even number");
        }
        var ret = new ArrayList<Point>();
        Double x = null;
        for (var p : points) {
            if (x == null) {
                x = p;
            } else {
                ret.add(new Point(x, p));
                x = null;
            }
        }
        return ret;
    }

    public BrokenLine(double width, List<Point> points) {
        if (points.size() < 2) {
            throw new IllegalArgumentException("too few points to make a line");
        }
        for (int i = 1; i < points.size(); i++) {
            var current = points.get(i);
            var previous = points.get(i - 1);

            var line = new VLine(width);
            lines.add(line);
            group.getChildren().add(line);

            line.setStart(previous.x, previous.y);
            line.setEnd(current.x, current.y);
        }
    }

    public void setStartStyle(EndpointStyle style) {
        lines.get(0).setStartStyle(style);
    }

    public void setEndStyle(EndpointStyle style) {
        lines.get(lines.size() - 1).setEndStyle(style);
    }

    public void setStroke(Color color) {
        for (var l : lines) {
            l.setStroke(color);
        }
    }

    public Node getNode() {
        return group;
    }
}
