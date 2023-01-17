package io.vproxy.vfx.control.drag;

import javafx.event.EventHandler;
import javafx.scene.input.MouseEvent;

import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * The drag handler<br>
 * Usage example:
 * <pre>
 * var handler = new DragHandler() {
 *     // ... override ...
 * };
 * node.setOnMousePressed(handler);
 * node.setOnMouseDragged(handler);
 * </pre>
 */
abstract public class DragHandler implements EventHandler<MouseEvent> {
    private double oldNodeX;
    private double oldNodeY;
    private double oldOffsetX;
    private double oldOffsetY;

    public DragHandler() {
    }

    abstract protected void set(double x, double y);

    abstract protected double[] get();

    protected double[] getOffset(MouseEvent e) {
        return new double[]{e.getScreenX(), e.getScreenY()};
    }

    @Override
    public void handle(MouseEvent e) {
        if (e.getEventType() == MouseEvent.MOUSE_PRESSED) {
            pressed(e);
        } else if (e.getEventType() == MouseEvent.MOUSE_DRAGGED) {
            dragged(e);
        }
    }

    /**
     * The function to run when pressed
     *
     * @param e mouse event
     */
    protected void pressed(MouseEvent e) {
        var xy = get();
        this.oldNodeX = xy[0];
        this.oldNodeY = xy[1];
        var offxy = getOffset(e);
        oldOffsetX = offxy[0];
        oldOffsetY = offxy[1];
    }

    /**
     * The function to run when dragged
     *
     * @param e mouse event
     */
    protected void dragged(MouseEvent e) {
        var offxy = getOffset(e);
        double deltaX = offxy[0] - this.oldOffsetX;
        double deltaY = offxy[1] - this.oldOffsetY;
        double x = calculateDeltaX(deltaX, deltaY) + this.oldNodeX;
        double y = calculateDeltaY(deltaX, deltaY) + this.oldNodeY;
        set(x, y);
    }

    /**
     * Calculate actual delta X to apply
     *
     * @param deltaX raw deltaX
     * @param deltaY raw deltaY
     * @return deltaX to apply
     */
    protected double calculateDeltaX(double deltaX, @SuppressWarnings("unused") double deltaY) {
        return deltaX;
    }

    /**
     * Calculate actual delta Y to apply
     *
     * @param deltaX raw deltaX
     * @param deltaY raw deltaY
     * @return deltaY to apply
     */
    protected double calculateDeltaY(@SuppressWarnings("unused") double deltaX, double deltaY) {
        return deltaY;
    }
}
