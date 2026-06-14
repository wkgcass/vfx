import { Group } from '../../javafx/Pane.js';
import { Circle, LineShape } from '../../javafx/shapes.js';
import type { Node } from '../../javafx/Node.js';
import type { Paint } from '../../javafx/color.js';
import { Arrow } from './Arrow.js';
import { EndpointStyle } from './EndpointStyle.js';

export class VLine extends Group {
  private readonly beginDot: Circle;
  private readonly line: LineShape;
  private readonly endDot: Circle;

  private readonly width: number;
  private readonly radius: number;

  private startX = 0;
  private startY = 0;
  private endX = 0;
  private endY = 0;
  private fill: Paint | null = null;

  private arrowImageStart: Arrow | null = null;
  private arrowImageEnd: Arrow | null = null;

  constructor(width: number) {
    super();
    this.width = width;
    this.radius = width / 2;

    this.beginDot = new Circle(this.radius);
    this.beginDot.setStrokeWidth(0);
    this.line = new LineShape();
    this.line.setStrokeWidth(width);
    this.endDot = new Circle(this.radius);
    this.endDot.setStrokeWidth(0);

    // Order matters: line first, then dots on top. The line is drawn all
    // the way through the corner (see updateLine) so its rectangular end
    // doesn't leave a gap against the dot's curved edge — the dots then
    // cover the line's end-caps, matching the JavaFX visual outcome of
    // "union of shapes" without JavaFX's actual union rendering.
    this.getChildren().addAll(this.line, this.beginDot, this.endDot);
  }

  setStartStyle(style: EndpointStyle): void {
    if (style === EndpointStyle.ARROW) {
      const arrowImage = this.loadOrMakeArrowImage();
      this.calcDirection(arrowImage, false);
      arrowImage.setLayoutX(this.getStartX());
      arrowImage.setLayoutY(this.getStartY());
      this.arrowImageStart = arrowImage;
      this.getChildren().add(arrowImage);
    } else {
      if (this.arrowImageStart !== null) {
        this.getChildren().remove(this.arrowImageStart);
        this.arrowImageStart = null;
      }
    }
  }

  setEndStyle(style: EndpointStyle): void {
    if (style === EndpointStyle.ARROW) {
      const arrowImage = this.loadOrMakeArrowImage();
      this.calcDirection(arrowImage, true);
      arrowImage.setLayoutX(this.getEndX());
      arrowImage.setLayoutY(this.getEndY());
      this.arrowImageEnd = arrowImage;
      this.getChildren().add(arrowImage);
    } else {
      if (this.arrowImageEnd !== null) {
        this.getChildren().remove(this.arrowImageEnd);
        this.arrowImageEnd = null;
      }
    }
  }

  private calcDirection(n: Node, toEnd: boolean): void {
    let dx: number;
    let dy: number;
    if (toEnd) {
      dx = this.getEndX() - this.getStartX();
      dy = this.getEndY() - this.getStartY();
    } else {
      dx = this.getStartX() - this.getEndX();
      dy = this.getStartY() - this.getEndY();
    }
    if (dx === 0 && dy === 0) {
      return;
    }
    const l = Math.sqrt(dx * dx + dy * dy);
    const r = Math.acos(dx / l);
    const angle = dy < 0 ? -r : r;
    const d = (angle * 180) / Math.PI;
    n.el.style.transform = `rotate(${d}deg)`;
  }

  private loadOrMakeArrowImage(): Arrow {
    const arrow = new Arrow();
    arrow.setFill(this.fill);
    const ratio = this.width / 32;
    arrow.setScale(ratio);
    return arrow;
  }

  setStroke(fill: Paint): void {
    this.fill = fill;

    this.beginDot.setFill(fill);
    this.line.setStroke(fill);
    this.endDot.setFill(fill);
    if (this.arrowImageStart !== null) {
      this.arrowImageStart.setFill(fill);
    }
    if (this.arrowImageEnd !== null) {
      this.arrowImageEnd.setFill(fill);
    }
  }

  getStartX(): number { return this.startX; }

  setStartX(startX: number): void {
    this.startX = startX;
    this.beginDot.setLayoutX(startX);
    this.updateLine();
  }

  getStartY(): number { return this.startY; }

  setStartY(startY: number): void {
    this.startY = startY;
    this.beginDot.setLayoutY(startY);
    this.updateLine();
  }

  getEndX(): number { return this.endX; }

  setEndX(endX: number): void {
    this.endX = endX;
    this.endDot.setLayoutX(endX);
    this.updateLine();
  }

  getEndY(): number { return this.endY; }

  setEndY(endY: number): void {
    this.endY = endY;
    this.endDot.setLayoutY(endY);
    this.updateLine();
  }

  private updateLine(): void {
    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    if (dx === 0 && dy === 0) {
      this.line.setVisible(false);
      return;
    }
    this.line.setVisible(true);
    // Unlike the Java original, we do NOT offset the line endpoints by
    // `radius`. JavaFX unions overlapping shapes so the line can stop at
    // the dot's edge without leaving a gap; the DOM port renders each
    // shape independently and a perpendicular line end-cap meeting a
    // circular dot edge leaves a triangular gap (up to ~width/2 wide).
    // Instead we extend the line all the way through the corner and let
    // the dots (added after the line in the children list) sit on top to
    // cover the end-caps. Visual result matches JavaFX.
    this.line.setStartX(this.startX);
    this.line.setStartY(this.startY);
    this.line.setEndX(this.endX);
    this.line.setEndY(this.endY);
    if (this.arrowImageStart !== null) {
      this.arrowImageStart.setLayoutX(this.startX);
      this.arrowImageStart.setLayoutY(this.startY);
    }
    if (this.arrowImageEnd !== null) {
      this.arrowImageEnd.setLayoutX(this.endX);
      this.arrowImageEnd.setLayoutY(this.endY);
    }
  }

  setStart(x: number, y: number): void {
    this.setStartX(x);
    this.setStartY(y);
  }

  setEnd(x: number, y: number): void {
    this.setEndX(x);
    this.setEndY(y);
  }
}
