import { Group } from '../../javafx/Pane.js';
import { Circle } from '../../javafx/shapes.js';
import { Label } from '../../javafx/Label.js';
import { Color } from '../../javafx/color.js';
import { Point } from '../../entity/Point.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { FXUtils } from '../../util/FXUtils.js';
import { DragHandler } from '../../control/drag/DragHandler.js';

export class MovablePoint extends Group {
  constructor(labelText: string) {
    super();
    const point = new Circle(5);
    point.setStrokeWidth(2);
    point.setStroke(Color.RED);
    point.setFill(Color.TRANSPARENT);
    const dot = new Circle(2);
    dot.setFill(Color.RED);
    dot.setStrokeWidth(0);
    const label = new Label(labelText);
    FontManager.get().setFont(FontUsages.movableShapeLabel, label);
    point.setCursor('move');
    label.setTextFill(Color.RED);
    const wh = FXUtils.calculateTextBounds(label);
    label.setLayoutX(-wh.width / 2);
    label.setLayoutY(10);

    const self = this;
    const handler = new (class extends DragHandler {
      protected set(x: number, y: number): void {
        self.setLayoutX(x);
        self.setLayoutY(y);
      }

      protected get(): [number, number] {
        return [self.getLayoutX(), self.getLayoutY()];
      }
    })();

    const pointAndDotGroup = new Group();
    pointAndDotGroup.getChildren().addAll(point, dot);
    pointAndDotGroup.setOnMousePressed(handler.handlePressed);
    pointAndDotGroup.setOnMouseDragged(handler.handleDragged);

    this.getChildren().addAll(label, pointAndDotGroup);
  }

  makePoint(): Point {
    const point = new Point();
    point.x = this.getLayoutX();
    point.y = this.getLayoutY();
    return point;
  }

  from(point: Point): void {
    this.setX(point.x);
    this.setY(point.y);
  }

  setX(x: number): void {
    this.setLayoutX(x);
  }

  setY(y: number): void {
    this.setLayoutY(y);
  }
}
