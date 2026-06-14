import { StackPane } from '../../javafx/Pane.js';
import { Node } from '../../javafx/Node.js';
import { Label } from '../../javafx/Label.js';
import { Property } from '../../javafx/Property.js';
import { Theme } from '../../theme/Theme.js';
import { FXUtils } from '../../util/FXUtils.js';
import { Insets, CornerRadii, backgroundFill } from '../../javafx/layout.js';
import { AnimationGraphBuilder } from '../../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { AnimationGraph } from '../../animation/AnimationGraph.js';
import { DoubleData } from '../../util/algebradata/DoubleData.js';

export type StringPropertyGetter<T extends Node> = (n: T) => Property<string>;

export class FusionW<T extends Node = Node> extends StackPane {
  readonly node: T;
  readonly property: Property<string>;
  private readonly label: Label;
  private readonly showLabel: AnimationNode<DoubleData>;
  private readonly showNode: AnimationNode<DoubleData>;
  private readonly animation: AnimationGraph<DoubleData>;

  constructor(node: T, fluentPropertyGetter: StringPropertyGetter<T>) {
    super();
    this.node = node;
    this.property = fluentPropertyGetter(node);
    FXUtils.disableFocusColor(this.node);

    this.label = new Label();
    this.label.setTextFill(Theme.current().normalTextColor());

    this.getChildren().add(this.label);
    this.getChildren().add(this.node);

    // JavaFX StackPane stacks children z-wise (Label sits ON TOP of the
    // wrapped node; opacity crossfades them on hover). The TS StackPane port
    // uses CSS `display: flex` with default row direction, which would lay
    // the Label and node side by side — making the wrapper ~2× as wide as
    // the node and breaking the hover-edit UX (the table-demo name column
    // visibly overflows into adjacent columns).
    //
    // Force the two children to absolutely-positioned full-size layers so
    // they overlap correctly, and make FusionW itself behave as a flex child
    // that fills its parent (e.g. a VTableCellPane) rather than sizing to
    // the node's intrinsic dimensions. The Java original called
    // `setPrefWidth(node.getLayoutBounds().getWidth())` which was fine in
    // JavaFX (the table cell would still clamp it), but in the DOM port
    // that prefWidth sticks and overflows.
    const stackFill = (el: HTMLElement): void => {
      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
    };
    stackFill(this.label.el);
    stackFill(this.node.el);
    // Label is a <div> with inline-block; switch to flex so its text is
    // vertically centered within the stacked layer (matches JavaFX Label
    // behavior inside a StackPane with default CENTER alignment).
    this.label.el.style.display = 'flex';
    this.label.el.style.alignItems = 'center';

    // FusionW: fill the parent flex container, never grow beyond it.
    // `align-self: stretch` is critical: the parent cell (VTableCellPane)
    // uses `align-items: center`, which would otherwise size FusionW to its
    // (zero) content height on the cross-axis — and since the label/node are
    // absolute they don't contribute to that height, so FusionW would
    // collapse to 0×cellW and the label text would be invisible.
    this.el.style.flex = '1 1 0';
    this.el.style.alignSelf = 'stretch';
    this.el.style.minWidth = '0';
    this.el.style.minHeight = '0';
    this.el.style.overflow = 'hidden';

    this.showLabel = new AnimationNode<DoubleData>('label', new DoubleData(0));
    this.showNode = new AnimationNode<DoubleData>('node', new DoubleData(1));
    this.animation = AnimationGraphBuilder.simpleTwoNodeGraph<DoubleData>(
      this.showLabel, this.showNode, 300,
    )
      .setApply((_f: AnimationNode<DoubleData> | null, _t: AnimationNode<DoubleData>, d: DoubleData) => {
        this.node.setOpacity(d.value);
        this.label.setOpacity(1 - d.value);
      })
      .build(this.showLabel);

    this.property.addListener((_o, now) => {
      this.label.setText(now ?? '');
    });
    this.label.setText(this.property.get() ?? '');

    this.setOnMouseEntered(() => this.animation.play(this.showNode));
    this.setOnMouseExited(() => this.animation.play(this.showLabel));
  }

  getLabel(): Label { return this.label; }

  enableLabelBackground(): void {
    this.label.setBackground(backgroundFill(
      Theme.current().fusionWrapperBackgroundColor(),
      new CornerRadii(4, 4, 4, 4, true),
      Insets.EMPTY,
    ));
  }
}
