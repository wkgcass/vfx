import type { VMouseEvent } from '../../javafx/Node.js';

export abstract class ClickEventHandler {
  protected mouseEntered = false;
  protected mousePressed = false;

  isMouseEntered(): boolean { return this.mouseEntered; }
  isMousePressed(): boolean { return this.mousePressed; }

  protected onMouseEntered(): void {}
  protected onMouseExited(): void {}
  protected onMousePressed(): void {}
  protected onMouseReleased(): void {}
  protected onMouseClicked(): void {}

  handleEntered = (): void => {
    this.mouseEntered = true;
    if (this.mousePressed) return;
    this.onMouseEntered();
  };

  handleExited = (): void => {
    this.mouseEntered = false;
    if (this.mousePressed) return;
    this.onMouseExited();
  };

  handlePressed = (e: VMouseEvent): void => {
    if (e.button !== 0) return; // primary button only
    this.mousePressed = true;
    this.onMousePressed();
  };

  handleReleased = (e: VMouseEvent): void => {
    if (e.button !== 0) return;
    this.mousePressed = false;
    this.onMouseReleased();
    if (this.mouseEntered) {
      this.onMouseClicked();
    } else {
      this.onMouseExited();
    }
  };
}
