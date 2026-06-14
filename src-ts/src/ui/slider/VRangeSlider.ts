import { Group, Pane } from '../../javafx/Pane.js';
import { VLine } from '../shapes/VLine.js';
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

export class VRangeSlider extends Pane {
  private static readonly lineRadius = 1;
  private static readonly lineWidth = VRangeSlider.lineRadius * 2;
  public static readonly BUTTON_RADIUS = 15;

  private readonly sliderDirection: SliderDirection;
  private readonly positionGroup: Group = new Group();
  private readonly rotatePane: Pane = new Pane();

  private length = 0;
  private rangeMin = 0;
  private rangeMax = 0;

  private readonly backgroundLine: VLine = new VLine(VRangeSlider.lineWidth);
  private readonly rangeLine: VLine = new VLine(VRangeSlider.lineWidth);

  private readonly buttonMin: ClickableCircle = new ClickableCircle(
    Theme.current().rangeSliderButtonNormalColor(),
    Theme.current().rangeSliderButtonHoverColor(),
    Theme.current().rangeSliderButtonDownColor(),
  );
  private readonly buttonMax: ClickableCircle = new ClickableCircle(
    Theme.current().rangeSliderButtonNormalColor(),
    Theme.current().rangeSliderButtonHoverColor(),
    Theme.current().rangeSliderButtonDownColor(),
  );

  private minOnAction: ((e: unknown) => void) | null = null;
  private maxOnAction: ((e: unknown) => void) | null = null;

  private readonly minButtonLabel: ThemeLabel = new ThemeLabel();
  private readonly maxButtonLabel: ThemeLabel = new ThemeLabel();
  private minValueTransform: (v: number) => string = roughFloatFormat;
  private maxValueTransform: (v: number) => string = roughFloatFormat;

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
    .setApply((_from, _to, d) => {
      this.minButtonLabel.setOpacity(d.value);
      this.maxButtonLabel.setOpacity(d.value);
    })
    .build(this.labelInvisible);

  private readonly _minPercentageProperty: DoubleProperty = new DoubleProperty(0);
  private readonly _maxPercentageProperty: DoubleProperty = new DoubleProperty(0);

  constructor();
  constructor(sliderDirection: SliderDirection);
  constructor(sliderDirection: SliderDirection = SliderDirection.LEFT_TO_RIGHT) {
    super();
    this.sliderDirection = sliderDirection;

    this.rotatePane.el.style.transform = `rotate(${sliderDirection.rotation}deg)`;
    this.rotatePane.el.style.transformOrigin = 'center center';

    this.positionGroup.getChildren().add(this.rotatePane);
    this.getChildren().addAll(this.positionGroup, this.minButtonLabel, this.maxButtonLabel);

    if (sliderDirection.isHorizontal) {
      this.setMinHeight(VRangeSlider.BUTTON_RADIUS * 2);
      this.setPrefHeight(VRangeSlider.BUTTON_RADIUS * 2);
      this.setMaxHeight(VRangeSlider.BUTTON_RADIUS * 2);
    } else {
      this.setMinWidth(VRangeSlider.BUTTON_RADIUS * 2);
      this.setPrefWidth(VRangeSlider.BUTTON_RADIUS * 2);
      this.setMaxWidth(VRangeSlider.BUTTON_RADIUS * 2);
    }
    this.rotatePane.setMinHeight(VRangeSlider.BUTTON_RADIUS * 2);
    this.rotatePane.setPrefHeight(VRangeSlider.BUTTON_RADIUS * 2);
    this.rotatePane.setMaxHeight(VRangeSlider.BUTTON_RADIUS * 2);

    this.rotatePane.getChildren().addAll(this.backgroundLine, this.rangeLine);
    this.backgroundLine.setStartX(VRangeSlider.BUTTON_RADIUS + VRangeSlider.lineRadius);
    this.backgroundLine.setStroke(Theme.current().progressBarBackgroundColor());

    this.rangeLine.setStroke(Theme.current().progressBarProgressColor());

    this.buttonMin.setStroke(Theme.current().rangeSliderButtonBorderColor());
    this.buttonMax.setStroke(Theme.current().rangeSliderButtonBorderColor());

    this.buttonMin.setRadius(VRangeSlider.BUTTON_RADIUS);
    this.buttonMax.setRadius(VRangeSlider.BUTTON_RADIUS);
    this.rotatePane.getChildren().addAll(this.buttonMin, this.buttonMax);

    FXUtils.setOnMouseEntered(this.buttonMin, () => this.labelAnimation.play(this.labelVisible));
    FXUtils.setOnMouseExited(this.buttonMin, () => this.labelAnimation.play(this.labelInvisible));
    FXUtils.setOnMouseEntered(this.buttonMax, () => this.labelAnimation.play(this.labelVisible));
    FXUtils.setOnMouseExited(this.buttonMax, () => this.labelAnimation.play(this.labelInvisible));
    this.buttonMin.layoutXProperty.addListener(() => this.updateLabels());
    this.buttonMax.layoutXProperty.addListener(() => this.updateLabels());
    this.updateLabels();

    const self = this;
    const sliderDirectionCapture = this.sliderDirection;
    const lengthCapture = (): number => this.length;

    const dragMin = new (class extends DragHandler {
      protected set(x: number, _y: number): void {
        const len = lengthCapture();
        self.setMinPercentage((x - VRangeSlider.BUTTON_RADIUS) / (len - VRangeSlider.BUTTON_RADIUS * 2));
      }
      protected get(): [number, number] {
        return [self.buttonMin.getLayoutX(), 0];
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
      protected consume(e: VMouseEvent): void {
        e.domEvent.stopPropagation();
      }
    })();
    {
      const tmp = { v: 0 };
      FXUtils.setOnMousePressed(this.buttonMin, (domEvent) => {
        tmp.v = this.buttonMin.getLayoutX();
        const ev: VMouseEvent = {
          source: this.buttonMin,
          domEvent,
          x: domEvent.offsetX,
          y: domEvent.offsetY,
          screenX: domEvent.screenX,
          screenY: domEvent.screenY,
          button: domEvent.button,
        };
        dragMin.handlePressed(ev);
      });
      this.buttonMin.setOnAction((e: unknown) => {
        if (tmp.v !== this.buttonMin.getLayoutX()) {
          return;
        }
        if (self.minOnAction !== null) {
          self.minOnAction(e);
        }
      });
      this.buttonMin.setOnMouseDragged(dragMin.handleDragged);
    }

    const dragMax = new (class extends DragHandler {
      protected set(x: number, _y: number): void {
        const len = lengthCapture();
        self.setMaxPercentage((x - VRangeSlider.BUTTON_RADIUS) / (len - VRangeSlider.BUTTON_RADIUS * 2));
      }
      protected get(): [number, number] {
        return [self.buttonMax.getLayoutX(), 0];
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
      protected consume(e: VMouseEvent): void {
        e.domEvent.stopPropagation();
      }
    })();
    {
      const tmp = { v: 0 };
      FXUtils.setOnMousePressed(this.buttonMax, (domEvent) => {
        tmp.v = this.buttonMax.getLayoutX();
        const ev: VMouseEvent = {
          source: this.buttonMax,
          domEvent,
          x: domEvent.offsetX,
          y: domEvent.offsetY,
          screenX: domEvent.screenX,
          screenY: domEvent.screenY,
          button: domEvent.button,
        };
        dragMax.handlePressed(ev);
      });
      this.buttonMax.setOnAction((e: unknown) => {
        if (tmp.v !== this.buttonMax.getLayoutX()) {
          return;
        }
        if (self.maxOnAction !== null) {
          self.maxOnAction(e);
        }
      });
      this.buttonMax.setOnMouseDragged(dragMax.handleDragged);
    }

    this._minPercentageProperty.addListener((_old, now) => {
      this.setMinPercentage(now);
    });
    this._maxPercentageProperty.addListener((_old, now) => {
      this.setMaxPercentage(now);
    });
  }

  minPercentageProperty(): DoubleProperty {
    return this._minPercentageProperty;
  }

  getMinPercentage(): number {
    return this.rangeMin;
  }

  setMinPercentage(minPercentage: number): void {
    if (minPercentage < 0) {
      minPercentage = 0;
    }
    if (minPercentage > 1) {
      minPercentage = 1;
    }
    this.rangeMin = minPercentage;
    if (minPercentage > this.rangeMax) {
      this.rangeMax = minPercentage;
      this._maxPercentageProperty.set(minPercentage);
    }
    this._minPercentageProperty.set(minPercentage);
    this.updateRange();
  }

  maxPercentageProperty(): DoubleProperty {
    return this._maxPercentageProperty;
  }

  getMaxPercentage(): number {
    return this.rangeMax;
  }

  setMaxPercentage(maxPercentage: number): void {
    if (maxPercentage > 1) {
      maxPercentage = 1;
    }
    if (maxPercentage < 0) {
      maxPercentage = 0;
    }
    this.rangeMax = maxPercentage;
    if (maxPercentage < this.rangeMin) {
      this.rangeMin = maxPercentage;
      this._minPercentageProperty.set(maxPercentage);
    }
    this._maxPercentageProperty.set(maxPercentage);
    this.updateRange();
    this.updateLabels();
  }

  getLength(): number {
    return this.length;
  }

  setLength(length: number): void {
    this.length = length;
    this.backgroundLine.setEndX(length - VRangeSlider.BUTTON_RADIUS - VRangeSlider.lineRadius);
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
      this.positionGroup.setLayoutX(-length / 2 + VRangeSlider.BUTTON_RADIUS);
      this.positionGroup.setLayoutY(length / 2);
    } else {
      this.positionGroup.setLayoutY(VRangeSlider.BUTTON_RADIUS);
    }
    this.updateRange();
    this.updateLabels();
  }

  setMinOnAction(minOnAction: ((e: unknown) => void) | null): void {
    this.minOnAction = minOnAction;
  }

  setMaxOnAction(maxOnAction: ((e: unknown) => void) | null): void {
    this.maxOnAction = maxOnAction;
  }

  private updateRange(): void {
    const barLen = this.length - VRangeSlider.BUTTON_RADIUS * 2;

    this.buttonMin.setLayoutX(VRangeSlider.BUTTON_RADIUS + barLen * this.rangeMin);
    this.buttonMax.setLayoutX(VRangeSlider.BUTTON_RADIUS + barLen * this.rangeMax);

    this.rangeLine.setStartX(VRangeSlider.lineRadius + this.buttonMin.getLayoutX());
    this.rangeLine.setEndX(VRangeSlider.lineRadius + this.buttonMax.getLayoutX());
  }

  setMinValueTransform(minValueTransform: ((v: number) => string) | null): void {
    if (minValueTransform === null) {
      minValueTransform = roughFloatFormat;
    }
    this.minValueTransform = minValueTransform;
    this.updateLabels();
  }

  setMaxValueTransform(maxValueTransform: ((v: number) => string) | null): void {
    if (maxValueTransform === null) {
      maxValueTransform = roughFloatFormat;
    }
    this.maxValueTransform = maxValueTransform;
    this.updateLabels();
  }

  private updateLabels(): void {
    const minStr = this.minValueTransform(this.getMinPercentage());
    const maxStr = this.maxValueTransform(this.getMaxPercentage());
    this.minButtonLabel.setText(minStr);
    this.maxButtonLabel.setText(maxStr);
    if (this.sliderDirection.isHorizontal) {
      if (this.sliderDirection === SliderDirection.LEFT_TO_RIGHT) {
        this.minButtonLabel.setLayoutX(this.buttonMin.getLayoutX() + VRangeSlider.BUTTON_RADIUS + 5);
        this.maxButtonLabel.setLayoutX(this.buttonMax.getLayoutX() + VRangeSlider.BUTTON_RADIUS + 5);
      } else {
        this.minButtonLabel.setLayoutX(this.getLength() - this.buttonMin.getLayoutX() + VRangeSlider.BUTTON_RADIUS + 5);
        this.maxButtonLabel.setLayoutX(this.getLength() - this.buttonMax.getLayoutX() + VRangeSlider.BUTTON_RADIUS + 5);
      }
      this.minButtonLabel.setLayoutY(VRangeSlider.BUTTON_RADIUS + 5);
      this.maxButtonLabel.setLayoutY(VRangeSlider.BUTTON_RADIUS + 5);
    } else {
      this.minButtonLabel.setLayoutX(VRangeSlider.BUTTON_RADIUS + 5);
      this.maxButtonLabel.setLayoutX(VRangeSlider.BUTTON_RADIUS + 5);
      if (this.sliderDirection === SliderDirection.TOP_TO_BOTTOM) {
        this.minButtonLabel.setLayoutY(this.buttonMin.getLayoutX() + VRangeSlider.BUTTON_RADIUS + 5);
        this.maxButtonLabel.setLayoutY(this.buttonMax.getLayoutX() + VRangeSlider.BUTTON_RADIUS + 5);
      } else {
        this.minButtonLabel.setLayoutY(this.getLength() - this.buttonMin.getLayoutX() + VRangeSlider.BUTTON_RADIUS + 5);
        this.maxButtonLabel.setLayoutY(this.getLength() - this.buttonMax.getLayoutX() + VRangeSlider.BUTTON_RADIUS + 5);
      }
    }
  }
}
