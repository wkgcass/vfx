import { Pane } from '../../javafx/Pane.js';
import { Circle } from '../../javafx/shapes.js';
import { VLine } from '../shapes/VLine.js';
import { Theme } from '../../theme/Theme.js';
import { ClickEventHandler } from '../../control/click/ClickEventHandler.js';
import { AnimationGraph } from '../../animation/AnimationGraph.js';
import { AnimationGraphBuilder } from '../../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { ColorData } from '../../util/algebradata/ColorData.js';
import { DoubleData } from '../../util/algebradata/DoubleData.js';
import { Property } from '../../javafx/Property.js';

export class ToggleSwitch {
  public readonly buttonRadius: number;
  public readonly trayLength: number;
  private readonly root: Pane = new Pane();
  private readonly button: Circle;
  private selected = false;

  private readonly unselectedColorNode: AnimationNode<ColorData>;
  private readonly unselectedHoverColorNode: AnimationNode<ColorData>;
  private readonly selectedColorNode: AnimationNode<ColorData>;
  private readonly colorAnimation: AnimationGraph<ColorData>;

  private readonly unselectedPosNode: AnimationNode<DoubleData>;
  private readonly selectedPosNode: AnimationNode<DoubleData>;
  private readonly posAnimation: AnimationGraph<DoubleData>;

  private readonly trayUnselectedNode: AnimationNode<ColorData>;
  private readonly traySelectedNode: AnimationNode<ColorData>;
  private readonly trayAnimation: AnimationGraph<ColorData>;

  // TS forbids field and getter sharing the same name, so the backing field uses an underscore prefix.
  private readonly _selectedProperty: Property<boolean> = new Property<boolean>(false);

  constructor();
  constructor(radius: number, length: number);
  constructor(radius: number = 15, length: number = 60) {
    if (length < radius * 2) {
      throw new Error(`length = ${length} < radius = ${radius}`);
    }
    this.buttonRadius = radius;
    this.trayLength = length;
    this.root.setPrefWidth(radius + length + radius);
    this.root.setPrefHeight(radius * 2);
    this.root.setMinWidth(radius + length + radius);
    this.root.setMinHeight(radius * 2);
    this.root.setMaxWidth(radius + length + radius);
    this.root.setMaxHeight(radius * 2);

    this.button = new Circle(radius);
    this.button.setStrokeWidth(0.5);
    this.button.setStroke(Theme.current().toggleSwitchBorderColor());
    this.button.setCursor('pointer');
    this.button.setLayoutY(radius);
    const tray = new VLine(2);
    tray.setEndX(length);
    tray.setLayoutX(radius);
    tray.setLayoutY(radius);
    tray.setCursor('pointer');
    this.root.getChildren().addAll(tray, this.button);

    this.unselectedColorNode = new AnimationNode<ColorData>(
      'unselected',
      new ColorData(Theme.current().toggleSwitchUnselectedButtonColor()),
    );
    this.unselectedHoverColorNode = new AnimationNode<ColorData>(
      'hover',
      new ColorData(Theme.current().toggleSwitchUnselectedButtonHoverColor()),
    );
    this.selectedColorNode = new AnimationNode<ColorData>(
      'selected',
      new ColorData(Theme.current().toggleSwitchSelectedButtonColor()),
    );
    this.colorAnimation = new AnimationGraphBuilder<ColorData>()
      .addNode(this.unselectedColorNode)
      .addNode(this.unselectedHoverColorNode)
      .addNode(this.selectedColorNode)
      .addTwoWayEdge(this.unselectedColorNode, this.unselectedHoverColorNode, 150)
      .addTwoWayEdge(this.unselectedColorNode, this.selectedColorNode, 150)
      .addEdge(this.unselectedHoverColorNode, this.selectedColorNode, 150)
      .setApply((_from, _to, d) => this.button.setFill(d.color))
      .build(this.unselectedColorNode);

    this.unselectedPosNode = new AnimationNode<DoubleData>('unselected', new DoubleData(radius));
    this.selectedPosNode = new AnimationNode<DoubleData>('selected', new DoubleData(radius + length));
    this.posAnimation = AnimationGraphBuilder
      .simpleTwoNodeGraph(this.unselectedPosNode, this.selectedPosNode, 150)
      .setApply((_from, _to, d) => this.button.setLayoutX(d.value))
      .build(this.unselectedPosNode);

    this.trayUnselectedNode = new AnimationNode<ColorData>(
      'unselected',
      new ColorData(Theme.current().toggleSwitchUnselectedTrayColor()),
    );
    this.traySelectedNode = new AnimationNode<ColorData>(
      'selected',
      new ColorData(Theme.current().toggleSwitchSelectedTrayColor()),
    );
    this.trayAnimation = AnimationGraphBuilder
      .simpleTwoNodeGraph(this.trayUnselectedNode, this.traySelectedNode, 150)
      .setApply((_from, _to, d) => tray.setStroke(d.color))
      .build(this.trayUnselectedNode);

    const self = this;
    const clickHandler = new (class extends ClickEventHandler {
      protected onMouseEntered(): void {
        if (self.isSelected()) {
          return;
        }
        self.colorAnimation.play(self.unselectedHoverColorNode);
      }

      protected onMouseExited(): void {
        self.colorAnimation.play(self.isSelected() ? self.selectedColorNode : self.unselectedColorNode);
      }

      protected onMousePressed(): void {
        self.colorAnimation.play(self.selectedColorNode);
      }

      protected onMouseClicked(): void {
        self.setSelected(!self.isSelected());
      }
    })();
    this.button.setOnMouseEntered(clickHandler.handleEntered);
    this.button.setOnMouseExited(clickHandler.handleExited);
    this.button.setOnMousePressed(clickHandler.handlePressed);
    this.button.setOnMouseReleased(clickHandler.handleReleased);

    this._selectedProperty.addListener((_old, now) => {
      this.setSelected(now);
    });
  }

  selectedProperty(): Property<boolean> {
    return this._selectedProperty;
  }

  isSelected(): boolean {
    return this.selected;
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    this._selectedProperty.set(selected);
    this.animate();
  }

  private animate(): void {
    if (this.selected) {
      this.colorAnimation.play(this.selectedColorNode);
      this.posAnimation.play(this.selectedPosNode);
      this.trayAnimation.play(this.traySelectedNode);
    } else {
      this.colorAnimation.play(this.unselectedColorNode);
      this.posAnimation.play(this.unselectedPosNode);
      this.trayAnimation.play(this.trayUnselectedNode);
    }
  }

  getNode(): Pane {
    return this.root;
  }
}
