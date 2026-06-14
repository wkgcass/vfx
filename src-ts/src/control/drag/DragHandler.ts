import type { VMouseEvent } from '../../javafx/Node.js';

export abstract class DragHandler {
  private oldNodeX = 0;
  private oldNodeY = 0;
  private oldOffsetX = 0;
  private oldOffsetY = 0;

  protected abstract set(x: number, y: number): void;
  protected abstract get(): [number, number];

  protected getOffset(e: VMouseEvent): [number, number] {
    return [e.screenX, e.screenY];
  }

  protected consume(_e: VMouseEvent): void {
    // default: do not consume
  }

  protected pressed(e: VMouseEvent): void {
    const xy = this.get();
    this.oldNodeX = xy[0];
    this.oldNodeY = xy[1];
    const offxy = this.getOffset(e);
    this.oldOffsetX = offxy[0];
    this.oldOffsetY = offxy[1];
  }

  protected dragged(e: VMouseEvent): void {
    const offxy = this.getOffset(e);
    const deltaX = offxy[0] - this.oldOffsetX;
    const deltaY = offxy[1] - this.oldOffsetY;
    const x = this.calculateDeltaX(deltaX, deltaY) + this.oldNodeX;
    const y = this.calculateDeltaY(deltaX, deltaY) + this.oldNodeY;
    this.set(x, y);
  }

  protected calculateDeltaX(deltaX: number, _deltaY: number): number {
    return deltaX;
  }

  protected calculateDeltaY(_deltaX: number, deltaY: number): number {
    return deltaY;
  }

  handlePressed = (e: VMouseEvent): void => {
    this.pressed(e);
  };

  handleDragged = (e: VMouseEvent): void => {
    this.dragged(e);
    this.consume(e);
  };
}
