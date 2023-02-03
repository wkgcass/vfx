package io.vproxy.vfx.control.click;

import javafx.event.EventHandler;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;

/**
 * <code>
 * var handler = new ClickEventHandler() { ... }
 * setOnMouseEntered(handler);
 * setOnMouseExited(handler);
 * setOnMousePressed(handler);
 * setOnMouseReleased(handler);
 * </code>
 */
public abstract class ClickEventHandler implements EventHandler<MouseEvent> {
    @Override
    public void handle(MouseEvent e) {
        if (e.getEventType() == MouseEvent.MOUSE_ENTERED) {
            eventOnMouseEntered();
        } else if (e.getEventType() == MouseEvent.MOUSE_EXITED) {
            eventOnMouseExited();
        } else if (e.getEventType() == MouseEvent.MOUSE_PRESSED) {
            eventOnMousePressed(e);
        } else if (e.getEventType() == MouseEvent.MOUSE_RELEASED) {
            eventOnMouseReleased(e);
        }
    }

    protected boolean mouseEntered = false;
    protected boolean mousePressed = false;

    public boolean isMouseEntered() {
        return mouseEntered;
    }

    public boolean isMousePressed() {
        return mousePressed;
    }

    private void eventOnMouseEntered() {
        mouseEntered = true;
        if (mousePressed) {
            return;
        }
        onMouseEntered();
    }

    private void eventOnMouseExited() {
        mouseEntered = false;
        if (mousePressed) {
            return;
        }
        onMouseExited();
    }

    private void eventOnMousePressed(MouseEvent e) {
        if (e.getButton() != MouseButton.PRIMARY) {
            return;
        }
        mousePressed = true;
        onMousePressed();
    }

    private void eventOnMouseReleased(MouseEvent e) {
        if (e.getButton() != MouseButton.PRIMARY) {
            return;
        }
        mousePressed = false;
        onMouseReleased();
        if (mouseEntered) {
            onMouseClicked();
        } else {
            onMouseExited();
        }
    }

    protected void onMouseEntered() {
    }

    protected void onMouseExited() {
    }

    protected void onMousePressed() {
    }

    protected void onMouseReleased() {
    }

    protected void onMouseClicked() {
    }
}
