import { Node } from '../../javafx/Node.js';
import { Pane } from '../../javafx/Pane.js';
import { VBox } from '../../javafx/VBox.js';
import { HBox } from '../../javafx/HBox.js';
import {
  Background,
  Border,
  BorderStroke,
  BorderStrokeDescriptor,
  BorderStrokeStyle,
  BorderWidths,
  CornerRadii,
} from '../../javafx/layout.js';
import { Color } from '../../javafx/color.js';
import { AnimationGraph } from '../../animation/AnimationGraph.js';
import { AnimationGraphBuilder } from '../../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { ColorData } from '../../util/algebradata/ColorData.js';
import { DoubleData } from '../../util/algebradata/DoubleData.js';
import { Callback } from '../../vproxy-base/Callback.js';
import { FXUtils } from '../../util/FXUtils.js';
import { Theme } from '../../theme/Theme.js';
import { HPadding } from '../layout/HPadding.js';
import { VPadding } from '../layout/VPadding.js';
import { AbstractFusionPane } from './AbstractFusionPane.js';

export class FusionPane {
  public static readonly PADDING_V = 10;
  public static readonly PADDING_H = 10;

  // Public (TS has no package-private; in Java these are private but
  // accessed by the inner class FusionPaneImpl) so FusionPaneImpl can drive
  // the content-opacity animation from its onMouseEntered/onMouseExited hooks.
  readonly contentOpacityAnimation: AnimationGraph<DoubleData>;
  readonly contentOpacityNormalNode: AnimationNode<DoubleData>;
  readonly contentOpacityHoverNode: AnimationNode<DoubleData>;

  protected readonly root: AbstractFusionPane;
  private readonly content: Pane;

  constructor();
  constructor(nodes: Node[]);
  constructor(manuallyHandleOuterRegion: boolean);
  constructor(manuallyHandleOuterRegion: boolean, nodes: Node[]);
  constructor(arg0?: boolean | Node[], arg1?: Node[]) {
    this.root = this.buildRootNode();

    let manuallyHandleOuterRegion: boolean;
    let nodes: Node[];
    if (arg0 === undefined) {
      manuallyHandleOuterRegion = true;
      nodes = [];
    } else if (Array.isArray(arg0)) {
      manuallyHandleOuterRegion = true;
      nodes = arg0;
    } else {
      manuallyHandleOuterRegion = arg0;
      nodes = arg1 ?? [];
    }

    // JavaFX Pane auto-sizes to its children's bounding box; the TS Pane port
    // does not. For the `manuallyHandleOuterRegion=false` case the outer root
    // has no explicit dimensions, so we use an auto-sizing content pane that
    // computes its prefSize from children (Group-style) and propagate the
    // size up to the root via the inverse of the manual-case observer.
    this.content = manuallyHandleOuterRegion ? new Pane() : new AutoSizePane();

    this.root.getChildren().add(new VBox(
      new VPadding(FusionPane.PADDING_V),
      new HBox(
        new HPadding(FusionPane.PADDING_H),
        this.content,
        new HPadding(FusionPane.PADDING_H),
      ),
      new VPadding(FusionPane.PADDING_V),
    ));
    if (manuallyHandleOuterRegion) {
      FXUtils.observeWidthHeightWithPreferred(
        this.root,
        this.content,
        -FusionPane.PADDING_H * 2,
        -FusionPane.PADDING_V * 2,
      );
    } else {
      FXUtils.observeWidthHeightWithPreferred(
        this.content,
        this.root,
        FusionPane.PADDING_H * 2,
        FusionPane.PADDING_V * 2,
      );
    }
    FXUtils.makeRoundedClipFor(this.content, 4);
    this.getContentPane().getChildren().addAll(...nodes);

    this.contentOpacityNormalNode = new AnimationNode<DoubleData>(
      'normal', new DoubleData(this.root.normalContentOpacity()),
    );
    this.contentOpacityHoverNode = new AnimationNode<DoubleData>(
      'hover', new DoubleData(this.root.hoverContentOpacity()),
    );

    const content = this.content;
    this.contentOpacityAnimation = AnimationGraphBuilder
      .simpleTwoNodeGraph(this.contentOpacityNormalNode, this.contentOpacityHoverNode, 300)
      .setApply((_from, _to, data) => {
        content.setOpacity(data.value);
      })
      .build(this.contentOpacityNormalNode);
  }

  protected buildRootNode(): AbstractFusionPane {
    return new FusionPaneImpl(this);
  }

  getNode(): Pane {
    return this.root;
  }

  getContentPane(): Pane {
    return this.content;
  }
}

// Auto-sizes prefWidth/prefHeight to the bounding box of its children.
// Used by `FusionPane(manuallyHandleOuterRegion=false)` so an auto-sized
// outer pane can derive its dimensions from content even though the TS port
// positions Pane children absolutely (which would leave the parent at 0×0).
// Each child's widthProperty/heightProperty is watched so that when the
// child's actual rendered size is reported by its ResizeObserver the parent
// re-runs layoutChildren and adopts the new bounds.
class AutoSizePane extends Pane {
  private readonly childSizeListeners = new Map<Node, [() => void, () => void]>();

  protected override _onChildrenChanged(added: Node[], removed: Node[]): void {
    super._onChildrenChanged(added, removed);
    for (const a of added) {
      const wl = (): void => this.requestLayout();
      const hl = (): void => this.requestLayout();
      a.widthProperty.addListener(wl);
      a.heightProperty.addListener(hl);
      this.childSizeListeners.set(a, [wl, hl]);
    }
    for (const r of removed) {
      const pair = this.childSizeListeners.get(r);
      if (pair !== undefined) {
        r.widthProperty.removeListener(pair[0]);
        r.heightProperty.removeListener(pair[1]);
        this.childSizeListeners.delete(r);
      }
    }
    this.requestLayout();
  }

  layoutChildren(): void {
    let maxX = 0;
    let maxY = 0;
    for (const c of this.children) {
      maxX = Math.max(maxX, c.getLayoutX() + c.getWidthOrPref());
      maxY = Math.max(maxY, c.getLayoutY() + c.getHeightOrPref());
    }
    if (maxX > 0 && maxY > 0) {
      this.setPrefWidth(maxX);
      this.setPrefHeight(maxY);
    }
  }
}

// Top-level class (TS has no inner classes). Passes the outer FusionPane
// explicitly so the hover hooks can drive the outer's border + content
// animations. Exported so TransparentFusionPane subclasses can extend it.
export class FusionPaneImpl extends AbstractFusionPane {
  protected readonly outer: FusionPane;

  private readonly borderNode: AnimationNode<ColorData>;
  private readonly noBorderNode: AnimationNode<ColorData>;
  private readonly borderAnimation: AnimationGraph<ColorData>;

  constructor(outer: FusionPane) {
    super();
    this.outer = outer;

    this.borderNode = new AnimationNode<ColorData>('solid', new ColorData(this.hoverBorderColor()));
    this.noBorderNode = new AnimationNode<ColorData>('transparent', new ColorData(this.normalBorderColor()));

    this.borderAnimation = AnimationGraphBuilder
      .simpleTwoNodeGraph(this.noBorderNode, this.borderNode, 300)
      .setApply((_from, _to, data) => {
        this.setBorder(new Border(new BorderStroke(new BorderStrokeDescriptor(
          data.color,
          BorderStrokeStyle.SOLID,
          this.cornerRadii,
          BorderWidths.uniform(0.5),
        ))));
      })
      .build(this.noBorderNode);
  }

  protected override onMouseEntered(): void {
    super.onMouseEntered();
    this.borderAnimation.play(this.borderNode);
    this.outer.contentOpacityAnimation.play(this.outer.contentOpacityHoverNode);
  }

  protected override onMouseExited(): void {
    super.onMouseExited();
    this.borderAnimation.play(this.noBorderNode, Callback.ofIgnoreExceptionFunction<void>(() => {
      this.setBorder(Border.EMPTY);
    }));
    this.outer.contentOpacityAnimation.play(this.outer.contentOpacityNormalNode);
  }

  protected override onMouseClicked(): void {}

  protected override getCornerRadii(): CornerRadii {
    return CornerRadii.uniform(8);
  }

  protected normalBorderColor(): Color {
    const c = Theme.current().fusionPaneBorderColor();
    return new Color(c.red, c.green, c.blue, 0);
  }

  protected hoverBorderColor(): Color {
    return Theme.current().fusionPaneBorderColor();
  }
}
