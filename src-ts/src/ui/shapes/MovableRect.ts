import { Group } from '../../javafx/Pane.js';
import { RectangleShape } from '../../javafx/shapes.js';
import { Label } from '../../javafx/Label.js';
import { Color } from '../../javafx/color.js';
import { Rect } from '../../entity/Rect.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { DragHandler } from '../../control/drag/DragHandler.js';

export class MovableRect extends Group {
  private readonly rect: RectangleShape;

  constructor(labelText: string) {
    super();
    this.rect = new RectangleShape();
    this.rect.setFill(Color.TRANSPARENT);
    this.rect.setStroke(Color.RED);
    this.rect.setStrokeWidth(5);
    this.rect.setCursor('move');

    const pointRightBottom = new RectangleShape();
    pointRightBottom.setWidth(10);
    pointRightBottom.setHeight(10);
    pointRightBottom.setFill(Color.RED);
    pointRightBottom.setStrokeWidth(0);
    pointRightBottom.setStroke(Color.TRANSPARENT);
    pointRightBottom.setCursor('se-resize');

    this.rect.widthProperty.addListener((_old, now) => {
      pointRightBottom.setLayoutX(now - 10);
    });
    this.rect.heightProperty.addListener((_old, now) => {
      pointRightBottom.setLayoutY(now - 10);
    });

    const label = new Label(labelText);
    FontManager.get().setFont(FontUsages.movableShapeLabel, label);
    label.setTextFill(Color.RED);
    label.setLayoutX(0);
    this.rect.heightProperty.addListener((_old, now) => {
      label.setLayoutY(now + 5);
    });

    const self = this;
    const dragHandler = new (class extends DragHandler {
      protected set(x: number, y: number): void {
        self.setLayoutX(x);
        self.setLayoutY(y);
      }

      protected get(): [number, number] {
        return [self.getLayoutX(), self.getLayoutY()];
      }
    })();

    this.rect.setOnMousePressed(dragHandler.handlePressed);
    this.rect.setOnMouseDragged(dragHandler.handleDragged);

    const resizeHandler = new (class extends DragHandler {
      protected set(x: number, y: number): void {
        if (x > 5) self.rect.setWidth(x);
        if (y > 5) self.rect.setHeight(y);
      }

      protected get(): [number, number] {
        return [self.rect.getWidth(), self.rect.getHeight()];
      }
    })();

    pointRightBottom.setOnMousePressed(resizeHandler.handlePressed);
    pointRightBottom.setOnMouseDragged(resizeHandler.handleDragged);

    this.getChildren().addAll(label, this.rect, pointRightBottom);
  }

  from(rect: Rect): void {
    this.setLayoutX(rect.x);
    this.setLayoutY(rect.y);
    this.setWidth(rect.w);
    this.setHeight(rect.h);
  }

  makeRect(): Rect {
    const rect = new Rect();
    rect.x = this.getLayoutX();
    rect.y = this.getLayoutY();
    rect.w = this.getWidth();
    rect.h = this.getHeight();
    return rect;
  }

  getWidth(): number {
    return this.rect.getWidth();
  }

  getHeight(): number {
    return this.rect.getHeight();
  }

  setWidth(width: number): void {
    this.rect.setWidth(width);
  }

  setHeight(height: number): void {
    this.rect.setHeight(height);
  }
}
