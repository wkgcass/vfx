import { Pane } from '../../javafx/Pane.js';
import { Node } from '../../javafx/Node.js';
import type { ChangeListenerNumber } from '../../util/FXUtils.js';
import { FXUtils } from '../../util/FXUtils.js';
import { VScrollPane } from '../../control/scroll/VScrollPane.js';
import { AnimationGraphBuilder } from '../../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { AnimationGraph } from '../../animation/AnimationGraph.js';
import { XYZTData } from '../../util/algebradata/XYZTData.js';
import { VSceneRole } from './VSceneRole.js';
import { VSceneHideMethod } from './VSceneHideMethod.js';
import type { FXImage } from '../../javafx/ImageView.js';
import { ImageView } from '../../javafx/ImageView.js';
import type { NodeWithVScrollPane } from '../../control/scroll/NodeWithVScrollPane.js';

const SHOW_DELAY_MILLIS = 50;
const FADE_MIN = 1e-44; // Float.MIN_VALUE * 2 in Java; arbitrarily small positive.

export interface ProgressInformer {
  informUpdate(scene: VScene, p: number): void;
}

export class VScene implements NodeWithVScrollPane {
  static readonly ANIMATION_DURATION_MILLIS = 300;

  private readonly root: Pane;
  private readonly scrollPane: VScrollPane;
  private readonly content: Pane;
  readonly role: VSceneRole;
  private backgroundImage: ImageView | null = null;

  // Animation states — package-private for VSceneGroup access.
  readonly stateTop = new AnimationNode<XYZTData>('top', new XYZTData(0, -1, 1, 0));
  readonly stateRight = new AnimationNode<XYZTData>('right', new XYZTData(1, 0, 1, 0));
  readonly stateBottom = new AnimationNode<XYZTData>('bottom', new XYZTData(0, 1, 1, 0));
  readonly stateLeft = new AnimationNode<XYZTData>('left', new XYZTData(-1, 0, 1, 0));
  readonly stateCenterShown = new AnimationNode<XYZTData>('center', new XYZTData(0, 0, 1, 1));
  readonly stateFaded = new AnimationNode<XYZTData>('faded', new XYZTData(0, 0, FADE_MIN, 0));
  readonly stateRemoved = new AnimationNode<XYZTData>('removed', new XYZTData(0, 0, 1, 0),
    (_f, _t) => this.transferredToRemovedState());

  readonly animationGraph: AnimationGraph<XYZTData>;

  // Package-private state shared with VSceneGroup.
  progressInformer: ProgressInformer | null = null;
  parentChildren: import('../../javafx/Parent.js').ObservableList<Node> | null = null;
  xN = 0;
  yN = 0;
  x0 = 0;
  y0 = 0;
  x1 = 0;
  y1 = 0;
  changeListeners = new Set<ChangeListenerNumber>();
  bundle: Node | null = null;
  cover: Pane | null = null;
  defaultHideMethod: VSceneHideMethod | null = null;

  constructor(role: VSceneRole) {
    this.role = role;
    this.root = new Pane();
    this.scrollPane = new VScrollPane();
    this.content = new Pane();
    this.scrollPane.setContent(this.content);
    FXUtils.observeWidthHeight(this.root, this.scrollPane.getNode());
    this.root.getChildren().add(this.scrollPane.getNode());

    this.root.widthProperty.addListener(() => this.updateBackgroundImagePos());
    this.root.heightProperty.addListener(() => this.updateBackgroundImagePos());

    this.animationGraph = new AnimationGraphBuilder<XYZTData>()
      .addNode(this.stateTop)
      .addNode(this.stateRight)
      .addNode(this.stateBottom)
      .addNode(this.stateLeft)
      .addNode(this.stateCenterShown)
      .addNode(this.stateFaded)
      .addNode(this.stateRemoved)
      .addEdge(this.stateRemoved, this.stateTop, SHOW_DELAY_MILLIS)
      .addEdge(this.stateRemoved, this.stateRight, SHOW_DELAY_MILLIS)
      .addEdge(this.stateRemoved, this.stateBottom, SHOW_DELAY_MILLIS)
      .addEdge(this.stateRemoved, this.stateLeft, SHOW_DELAY_MILLIS)
      .addEdge(this.stateRemoved, this.stateFaded, SHOW_DELAY_MILLIS)
      .addEdge(this.stateTop, this.stateRemoved, 1)
      .addEdge(this.stateRight, this.stateRemoved, 1)
      .addEdge(this.stateBottom, this.stateRemoved, 1)
      .addEdge(this.stateLeft, this.stateRemoved, 1)
      .addEdge(this.stateFaded, this.stateRemoved, 1)
      .addEdge(this.stateTop, this.stateCenterShown, VScene.ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
      .addEdge(this.stateRight, this.stateCenterShown, VScene.ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
      .addEdge(this.stateBottom, this.stateCenterShown, VScene.ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
      .addEdge(this.stateLeft, this.stateCenterShown, VScene.ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
      .addEdge(this.stateFaded, this.stateCenterShown, VScene.ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
      .addEdge(this.stateCenterShown, this.stateTop, VScene.ANIMATION_DURATION_MILLIS - 1)
      .addEdge(this.stateCenterShown, this.stateRight, VScene.ANIMATION_DURATION_MILLIS - 1)
      .addEdge(this.stateCenterShown, this.stateBottom, VScene.ANIMATION_DURATION_MILLIS - 1)
      .addEdge(this.stateCenterShown, this.stateLeft, VScene.ANIMATION_DURATION_MILLIS - 1)
      .addEdge(this.stateCenterShown, this.stateFaded, VScene.ANIMATION_DURATION_MILLIS - 1)
      .setStateTransferBeginCallback((from, to) => this.animationStateTransferBegin(from, to))
      .setApply((from, to, data) => this.applyAnimation(from, to, data))
      .build(this.stateRemoved);
  }

  getNode(): Pane { return this.root; }
  getScrollPane(): VScrollPane { return this.scrollPane; }
  getSelfNode(): Pane { return this.getNode(); }
  getContentPane(): Pane { return this.content; }

  enableAutoContentWidthHeight(): void {
    this.enableAutoContentWidth();
    this.enableAutoContentHeight();
  }
  enableAutoContentWidth(): void {
    FXUtils.observeWidth(this.root, this.content, -1);
  }
  enableAutoContentHeight(): void {
    FXUtils.observeHeight(this.root, this.content, -1);
  }

  private transferredToRemovedState(): void {
    if (this.parentChildren !== null && this.bundle !== null) {
      this.parentChildren.remove(this.bundle);
    }
  }

  private applyAnimation(
    from: AnimationNode<XYZTData> | null,
    to: AnimationNode<XYZTData>,
    data: XYZTData,
  ): void {
    if (from === this.stateRemoved || to === this.stateRemoved) {
      return;
    }
    let x = data.x;
    let y = data.y;
    const opacity = data.z;
    if (x < 0) {
      x = (this.xN - this.x0) * (-x) + this.x0;
    } else if (x > 0) {
      x = (this.x1 - this.x0) * x + this.x0;
    } else {
      x = this.x0;
    }
    if (y < 0) {
      y = (this.yN - this.y0) * (-y) + this.y0;
    } else if (y > 0) {
      y = (this.y1 - this.y0) * y + this.y0;
    } else {
      y = this.y0;
    }
    this.getNode().setLayoutX(x);
    this.getNode().setLayoutY(y);
    this.getNode().setOpacity(opacity);
    if (this.progressInformer !== null) {
      this.progressInformer.informUpdate(this, data.t);
    }
  }

  private animationStateTransferBegin(
    from: AnimationNode<XYZTData>,
    to: AnimationNode<XYZTData>,
  ): void {
    if (from === this.stateRemoved) {
      if (this.bundle !== null) {
        this.bundle.setOpacity(FADE_MIN);
        this.bundle.setMouseTransparent(true);
        if (this.parentChildren !== null && !this.parentChildren.contains(this.bundle)) {
          this.parentChildren.add(this.bundle);
        }
      }
    } else if (
      from === this.stateTop ||
      from === this.stateBottom ||
      from === this.stateLeft ||
      from === this.stateRight ||
      from === this.stateFaded
    ) {
      if (to === this.stateCenterShown && this.bundle !== null) {
        this.bundle.setOpacity(1);
        this.bundle.setMouseTransparent(false);
      }
    }
  }

  setBackgroundImage(img: FXImage | null): void {
    if (img === null) {
      if (this.backgroundImage === null) return;
      this.root.getChildren().remove(this.backgroundImage);
      this.backgroundImage = null;
      return;
    }
    if (this.backgroundImage === null) {
      this.backgroundImage = new ImageView(img);
      this.backgroundImage.setPreserveRatio(true);
      // Insert at the back so content draws on top.
      this.root.getChildren().insert(0, this.backgroundImage);
    } else {
      this.backgroundImage.setImage(img);
    }
    this.updateBackgroundImagePos();
  }

  private updateBackgroundImagePos(): void {
    if (this.backgroundImage === null) return;
    const img = this.backgroundImage.getImage();
    if (img === null) return;
    const iw = img.width;
    const ih = img.height;
    const nw = this.root.getWidth();
    const nh = this.root.getHeight();
    if (nw <= 0 || nh <= 0 || iw <= 0 || ih <= 0) return;
    if (iw / ih > nw / nh) {
      this.backgroundImage.setFitHeight(nh);
      this.backgroundImage.setFitWidth((nh * iw) / ih);
    } else {
      this.backgroundImage.setFitWidth(nw);
      this.backgroundImage.setFitHeight((nw * ih) / iw);
    }
    const bw = this.backgroundImage.getFitWidth();
    const bh = this.backgroundImage.getFitHeight();
    this.backgroundImage.setLayoutX((nw - bw) / 2);
    this.backgroundImage.setLayoutY((nh - bh) / 2);
  }

  // In Java these are `protected` and called by VSceneGroup in the same
  // package. TypeScript has no package-private visibility, so we expose them
  // publicly — subclasses still override them freely.
  checkBeforeShowing(): boolean { return true; }
  beforeShowing(): void {}
  onShown(): void {}
  checkBeforeHiding(): boolean { return true; }
  beforeHiding(): void {}
  onHidden(): void {}
}

