import { Group, Pane } from '../../javafx/Pane.js';
import { VProgressBar } from '../loading/VProgressBar.js';
import { ClickableCircle } from '../shapes/ClickableCircle.js';
import { ThemeLabel } from '../wrapper/ThemeLabel.js';
import { Theme } from '../../theme/Theme.js';
import { FXUtils } from '../../util/FXUtils.js';
import { DragHandler } from '../../control/drag/DragHandler.js';
import { AnimationGraph } from '../../animation/AnimationGraph.js';
import { AnimationGraphBuilder } from '../../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { DoubleData } from '../../util/algebradata/DoubleData.js';
import { DoubleProperty } from '../../javafx/Property.js';
import type { VMouseEvent } from '../../javafx/Node.js';
import { SliderDirection } from './SliderDirection.js';

const roughFloatFormat = (v: number): string => v.toFixed(2);

export class VSlider extends Pane {
  public static readonly BUTTON_RADIUS = 15;

  private readonly sliderDirection: SliderDirection;
  private readonly positionGroup: Group = new Group();
  private readonly rotatePane: Pane = new Pane();
  private readonly bar: VProgressBar = new VProgressBar();
  private readonly button: ClickableCircle = new ClickableCircle(
    Theme.current().sliderButtonNormalColor(),
    Theme.current().sliderButtonHoverColor(),
    Theme.current().sliderButtonDownColor(),
  );

  private onAction: ((e: unknown) => void) | null = null;

  private readonly buttonLabel: ThemeLabel = new ThemeLabel();
  private valueTransform: (v: number) => string = roughFloatFormat;

  private readonly labelInvisible: AnimationNode<DoubleData> = new AnimationNode<DoubleData>(
    'invisible',
    new DoubleData(0),
  );
  private readonly labelVisible: AnimationNode<DoubleData> = new AnimationNode<DoubleData>(
    'visible',
    new DoubleData(1),
  );
  private readonly labelAnimation: AnimationGraph<DoubleData> = AnimationGraphBuilder
    .simpleTwoNodeGraph(this.labelInvisible, this.labelVisible, 300)
    .setApply((_from, _to, d) => this.buttonLabel.setOpacity(d.value))
    .build(this.labelInvisible);

  constructor();
  constructor(sliderDirection: SliderDirection);
  constructor(sliderDirection: SliderDirection = SliderDirection.LEFT_TO_RIGHT) {
    super();
    this.sliderDirection = sliderDirection;

    this.rotatePane.el.style.transform = `rotate(${sliderDirection.rotation}deg)`;
    this.rotatePane.el.style.transformOrigin = 'center center';

    this.positionGroup.getChildren().add(this.rotatePane);
    this.getChildren().addAll(this.positionGroup, this.buttonLabel);

    if (sliderDirection.isHorizontal) {
      this.setMinHeight(VSlider.BUTTON_RADIUS * 2);
      this.setPrefHeight(VSlider.BUTTON_RADIUS * 2);
      this.setMaxHeight(VSlider.BUTTON_RADIUS * 2);
    } else {
      this.setMinWidth(VSlider.BUTTON_RADIUS * 2);
      this.setPrefWidth(VSlider.BUTTON_RADIUS * 2);
      this.setMaxWidth(VSlider.BUTTON_RADIUS * 2);
    }
    this.rotatePane.setMinHeight(VSlider.BUTTON_RADIUS * 2);
    this.rotatePane.setPrefHeight(VSlider.BUTTON_RADIUS * 2);
    this.rotatePane.setMaxHeight(VSlider.BUTTON_RADIUS * 2);

    this.button.setStroke(Theme.current().sliderButtonBorderColor());

    this.button.setRadius(VSlider.BUTTON_RADIUS);
    this.button.setLayoutX(VSlider.BUTTON_RADIUS);

    FXUtils.setOnMouseEntered(this.button, () => this.labelAnimation.play(this.labelVisible));
    FXUtils.setOnMouseExited(this.button, () => this.labelAnimation.play(this.labelInvisible));
    this.button.layoutXProperty.addListener(() => this.updateLabel());

    const bar = this.bar;
    const button = this.button;
    bar.progressPropertyProperty().addListener((_old, now) => {
      const p = now;
      button.setLayoutX(bar.getLength() * p + VSlider.BUTTON_RADIUS);
    });
    bar.setLayoutX(VSlider.BUTTON_RADIUS);

    const self = this;
    const sliderDirectionCapture = this.sliderDirection;
    const dragHandler = new (class extends DragHandler {
      protected set(x: number, _y: number): void {
        const barLen = bar.getLength();
        if (barLen === 0) return;
        self.setPercentage((x - VSlider.BUTTON_RADIUS) / barLen);
      }
      protected get(): [number, number] {
        return [button.getLayoutX(), 0];
      }
      protected calculateDeltaX(deltaX: number, deltaY: number): number {
        switch (sliderDirectionCapture) {
          case SliderDirection.LEFT_TO_RIGHT:
            return deltaX;
          case SliderDirection.RIGHT_TO_LEFT:
            return -deltaX;
          case SliderDirection.TOP_TO_BOTTOM:
            return deltaY;
          case SliderDirection.BOTTOM_TO_TOP:
            return -deltaY;
        }
        throw new Error('should not reach here');
      }
      // Mirrors the Java original's `e.consume()` on the drag event. In
      // JavaFX, consuming the event prevents it from being redispatched to
      // ancestors in the event-dispatch chain. The DOM analog is
      // stopPropagation: the VScrollPane attaches its own press/drag
      // listener on the viewport element, and pointermove events bubble
      // up through the slider button → ... → viewport. Without stopping
      // propagation here, dragging the slider's button simultaneously
      // triggers the scroll pane's drag-scroll, making the whole demo
      // scroll while you're trying to drag a slider.
      protected consume(e: VMouseEvent): void {
        e.domEvent.stopPropagation();
      }
    })();

    const tmp = { v: 0 };
    FXUtils.setOnMousePressed(this.button, (domEvent) => {
      tmp.v = button.getLayoutX();
      const ev: VMouseEvent = {
        source: button,
        domEvent,
        x: domEvent.offsetX,
        y: domEvent.offsetY,
        screenX: domEvent.screenX,
        screenY: domEvent.screenY,
        button: domEvent.button,
      };
      dragHandler.handlePressed(ev);
    });
    this.button.setOnAction((e: unknown) => {
      if (tmp.v !== button.getLayoutX()) {
        return;
      }
      if (self.onAction !== null) {
        self.onAction(e);
      }
    });
    this.button.setOnMouseDragged(dragHandler.handleDragged);

    this.rotatePane.getChildren().addAll(this.bar, this.button);
  }

  getLength(): number {
    return this.bar.getLength() + VSlider.BUTTON_RADIUS * 2;
  }

  setLength(length: number): void {
    this.bar.setLength(length - VSlider.BUTTON_RADIUS * 2);
    if (this.sliderDirection.isHorizontal) {
      this.setMinWidth(length);
      this.setPrefWidth(length);
      this.setMaxWidth(length);
    } else {
      this.setMinHeight(length);
      this.setPrefHeight(length);
      this.setMaxHeight(length);
    }
    this.rotatePane.setMinWidth(length);
    this.rotatePane.setPrefWidth(length);
    this.rotatePane.setMaxWidth(length);
    this.rotatePane.el.style.transformOrigin = `${length / 2}px center`;

    if (this.sliderDirection.isVertical) {
      this.positionGroup.setLayoutX(-length / 2 + VSlider.BUTTON_RADIUS);
      this.positionGroup.setLayoutY(length / 2);
    } else {
      this.positionGroup.setLayoutY(VSlider.BUTTON_RADIUS);
    }
    this.updateLabel();
  }

  setValueTransform(valueTransform: ((v: number) => string) | null): void {
    if (valueTransform === null) {
      valueTransform = roughFloatFormat;
    }
    this.valueTransform = valueTransform;
    this.updateLabel();
  }

  private updateLabel(): void {
    const str = this.valueTransform(this.getPercentage());
    this.buttonLabel.setText(str);
    if (this.sliderDirection.isHorizontal) {
      if (this.sliderDirection === SliderDirection.LEFT_TO_RIGHT) {
        this.buttonLabel.setLayoutX(this.button.getLayoutX() + VSlider.BUTTON_RADIUS + 5);
      } else {
        this.buttonLabel.setLayoutX(this.getLength() - this.button.getLayoutX() + VSlider.BUTTON_RADIUS + 5);
      }
      this.buttonLabel.setLayoutY(VSlider.BUTTON_RADIUS + 5);
    } else {
      this.buttonLabel.setLayoutX(VSlider.BUTTON_RADIUS + 5);
      if (this.sliderDirection === SliderDirection.TOP_TO_BOTTOM) {
        this.buttonLabel.setLayoutY(this.button.getLayoutX() + VSlider.BUTTON_RADIUS + 5);
      } else {
        this.buttonLabel.setLayoutY(this.getLength() - this.button.getLayoutX() + VSlider.BUTTON_RADIUS + 5);
      }
    }
  }

  percentageProperty(): DoubleProperty {
    return this.bar.progressPropertyProperty();
  }

  getPercentage(): number {
    return this.bar.getProgress();
  }

  setPercentage(p: number): void {
    this.bar.setProgress(p);
  }

  setOnAction(onAction: ((e: unknown) => void) | null): void {
    this.onAction = onAction;
  }
}
