import { Pane } from '../../javafx/Pane.js';
import {
  Background,
  BackgroundFill,
  CornerRadii,
  Insets,
} from '../../javafx/layout.js';
import { Color } from '../../javafx/color.js';
import { AnimationGraph } from '../../animation/AnimationGraph.js';
import { AnimationGraphBuilder } from '../../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { ColorData } from '../../util/algebradata/ColorData.js';
import { ClickEventHandler } from '../../control/click/ClickEventHandler.js';
import { Theme } from '../../theme/Theme.js';

export abstract class AbstractFusionPane extends Pane {
  protected cornerRadii: CornerRadii = CornerRadii.EMPTY;
  protected readonly clickHandler: ClickEventHandler;

  private readonly normalNode: AnimationNode<ColorData>;
  private readonly hoverNode: AnimationNode<ColorData>;
  private readonly downNode: AnimationNode<ColorData>;
  private readonly animation: AnimationGraph<ColorData>;

  protected constructor() {
    super();
    this.cornerRadii = this.getCornerRadii();
    this.setBackground(new Background(new BackgroundFill(
      this.normalColor(),
      this.cornerRadii,
      Insets.EMPTY,
    )));

    this.normalNode = new AnimationNode<ColorData>('normal', new ColorData(this.normalColor()));
    this.hoverNode = new AnimationNode<ColorData>('hover', new ColorData(this.hoverColor()));
    this.downNode = new AnimationNode<ColorData>('down', new ColorData(this.downColor()));

    this.animation = AnimationGraphBuilder
      .simpleTwoNodeGraph(this.normalNode, this.hoverNode, 300)
      .addNode(this.downNode)
      .setApply((_from, _to, data) => {
        this.setBackground(new Background(new BackgroundFill(
          data.color,
          this.cornerRadii,
          Insets.EMPTY,
        )));
      })
      .build(this.normalNode);

    const outer = this;
    this.clickHandler = new (class extends ClickEventHandler {
      protected onMouseEntered(): void { outer.onMouseEntered(); }
      protected onMouseExited(): void { outer.onMouseExited(); }
      protected onMousePressed(): void { outer.onMousePressed(); }
      protected onMouseReleased(): void { outer.onMouseReleased(); }
      protected onMouseClicked(): void { outer.onMouseClicked(); }
    })();
    this.setOnMouseEntered(this.clickHandler.handleEntered);
    this.setOnMouseExited(this.clickHandler.handleExited);
    this.setOnMousePressed(this.clickHandler.handlePressed);
    this.setOnMouseReleased(this.clickHandler.handleReleased);
  }

  protected onMouseEntered(): void {
    this.animation.play(this.hoverNode);
  }

  protected onMouseExited(): void {
    this.animation.play(this.normalNode);
  }

  protected onMousePressed(): void {
    this.animation.stopAndSetNode(this.downNode);
  }

  protected onMouseReleased(): void {
    this.animation.stopAndSetNode(this.hoverNode);
  }

  protected onMouseClicked(): void {
  }

  protected abstract getCornerRadii(): CornerRadii;

  protected normalColor(): Color {
    return Theme.current().fusionPaneNormalBackgroundColor();
  }

  protected hoverColor(): Color {
    return Theme.current().fusionPaneHoverBackgroundColor();
  }

  protected downColor(): Color {
    return this.hoverColor();
  }

  // Public (not protected) so the FusionPane wrapper class — which is not a
  // subclass of AbstractFusionPane — can read these to build its
  // content-opacity animation graph. Mirrors the Java package-friend access
  // (in Java these are `protected` but FusionPane is in the same package).
  normalContentOpacity(): number {
    return 1;
  }

  hoverContentOpacity(): number {
    return 1;
  }
}
