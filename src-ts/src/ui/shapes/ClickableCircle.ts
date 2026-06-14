import { Circle } from '../../javafx/shapes.js';
import { Color } from '../../javafx/color.js';
import { AnimationGraph } from '../../animation/AnimationGraph.js';
import { AnimationGraphBuilder } from '../../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { ColorData } from '../../util/algebradata/ColorData.js';
import { ClickEventHandler } from '../../control/click/ClickEventHandler.js';

export type ClickableHandler = (event: unknown) => void;

export class ClickableCircle extends Circle {
  private handler: ClickableHandler | null = null;

  constructor(normalColor: Color, hoverColor: Color, downColor: Color) {
    super();
    const normal = new AnimationNode<ColorData>('normal', new ColorData(normalColor));
    const hover = new AnimationNode<ColorData>('hover', new ColorData(hoverColor));
    const down = new AnimationNode<ColorData>('down', new ColorData(downColor));
    const animation: AnimationGraph<ColorData> = new AnimationGraphBuilder<ColorData>()
      .addNode(normal)
      .addNode(hover)
      .addNode(down)
      .addTwoWayEdge(normal, hover, 300)
      .setApply((_from, _to, d) => this.setFill(d.color))
      .build(normal);

    this.setStrokeWidth(0.5);

    this.setCursor('pointer');

    const self = this;
    const clickHandler = new (class extends ClickEventHandler {
      protected onMouseEntered(): void {
        animation.play(hover);
      }

      protected onMouseExited(): void {
        animation.play(normal);
      }

      protected onMousePressed(): void {
        animation.stopAndSetNode(down);
      }

      protected onMouseReleased(): void {
        animation.stopAndSetNode(hover);
      }

      protected onMouseClicked(): void {
        self.clicked();
      }
    })();
    this.setOnMouseEntered(clickHandler.handleEntered);
    this.setOnMouseExited(clickHandler.handleExited);
    this.setOnMousePressed(clickHandler.handlePressed);
    this.setOnMouseReleased(clickHandler.handleReleased);
  }

  setOnAction(handler: ClickableHandler | null): void {
    this.handler = handler;
  }

  private clicked(): void {
    const handler = this.handler;
    if (handler !== null) {
      handler(null);
    }
  }
}
