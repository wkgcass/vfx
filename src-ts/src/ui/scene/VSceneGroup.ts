import { Pane, Group } from '../../javafx/Pane.js';
import { Parent } from '../../javafx/Parent.js';
import { Callback } from '../../vproxy-base/Callback.js';
import { Logger } from '../../vproxy-base/Logger.js';
import { FXUtils, type ChangeListenerNumber } from '../../util/FXUtils.js';
import { AnimationNode } from '../../animation/AnimationNode.js';
import { XYZTData } from '../../util/algebradata/XYZTData.js';
import { Theme } from '../../theme/Theme.js';
import { Background, BackgroundFill, CornerRadii, Insets } from '../../javafx/layout.js';
import { VScene, type ProgressInformer } from './VScene.js';
import { VSceneRole, roleAttrs } from './VSceneRole.js';
import { VSceneShowMethod } from './VSceneShowMethod.js';
import { VSceneHideMethod } from './VSceneHideMethod.js';
import { VSceneGroupInitParams } from './VSceneGroupInitParams.js';
import { VSceneAddParams } from './VSceneAddParams.js';
import { StackTraceAlert } from '../alert/StackTraceAlert.js';
import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';

export class VSceneGroup {
  private readonly initParams: VSceneGroupInitParams;
  private readonly root: Pane = new Pane();
  private readonly scenes: Set<VScene> = new Set();
  private readonly mainSceneGroup: Group = new Group();
  private currentMainScene: VScene;
  private nextMainScene: VScene | null = null;
  private readonly showingScenes: Set<VScene> = new Set();
  private readonly animatingShow: Set<VScene> = new Set();
  private readonly animatingHide: Set<VScene> = new Set();

  constructor(initialMainScene: VScene);
  constructor(initialMainScene: VScene, initParams: VSceneGroupInitParams);
  constructor(initialMainScene: VScene, initParams?: VSceneGroupInitParams) {
    if (initialMainScene.role !== VSceneRole.MAIN) {
      throw new IllegalArgumentException(`${initialMainScene} is not a MAIN scene`);
    }
    try {
      const res = initialMainScene.checkBeforeShowing();
      if (!res) {
        throw new IllegalArgumentException('unable to show because beforeShowing() method returned false');
      }
    } catch (e) {
      if (e instanceof IllegalArgumentException) throw e;
      throw new IllegalArgumentException(e as Error);
    }
    initialMainScene.beforeShowing();
    this.initParams = initParams ?? new VSceneGroupInitParams();
    if (this.initParams.useClip) {
      FXUtils.makeRoundedClipFor(this.root, 4);
    }
    this.root.getChildren().add(this.mainSceneGroup);

    this.scenes.add(initialMainScene);
    initialMainScene.bundle = initialMainScene.getNode();
    this.mainSceneGroup.getChildren().add(initialMainScene.bundle);
    this.currentMainScene = initialMainScene;
    initialMainScene.parentChildren = this.mainSceneGroup.getChildren();
    initialMainScene.progressInformer = this.progressInformerRef();

    initialMainScene.changeListeners.add(
      FXUtils.observeWidth(this.root, initialMainScene.getNode()),
    );
    initialMainScene.changeListeners.add(
      FXUtils.observeHeight(this.root, initialMainScene.getNode()),
    );

    initialMainScene.animationGraph.stopAndSetNode(initialMainScene.stateCenterShown);
    initialMainScene.onShown();
  }

  addScene(scene: VScene): void;
  addScene(scene: VScene, defaultHideMethod: VSceneHideMethod | null): void;
  addScene(scene: VScene, defaultHideMethod: VSceneHideMethod | null, addParams: VSceneAddParams): void;
  addScene(scene: VScene, defaultHideMethod: VSceneHideMethod | null = null, addParams: VSceneAddParams = new VSceneAddParams()): void {
    if (this.scenes.has(scene)) {
      throw new IllegalArgumentException(`scene ${scene} already added`);
    }
    this.scenes.add(scene);
    if (defaultHideMethod === null) {
      if (scene.role !== VSceneRole.MAIN) {
        throw new IllegalArgumentException('non-main scene must use addScene(VScene, VSceneHideMethod) to add the scene to scene group');
      }
    }

    const attrs = roleAttrs(scene.role);
    if (attrs.manageWidth) {
      scene.changeListeners.add(FXUtils.observeWidth(this.root, scene.getNode()));
    }
    if (attrs.manageHeight) {
      scene.changeListeners.add(FXUtils.observeHeight(this.root, scene.getNode()));
    }
    if (attrs.centralWidth) {
      scene.changeListeners.add(FXUtils.observeWidthCenter(this.root, scene.getNode()));
    }
    if (attrs.centralHeight) {
      scene.changeListeners.add(FXUtils.observeHeightCenter(this.root, scene.getNode()));
    }
    if (attrs.showCover) {
      const cover = new Pane();
      cover.setBackground(new Background(new BackgroundFill(
        this.initParams.gradientCover
          ? Theme.current().makeCoverGradientBackground()
          : Theme.current().coverBackgroundColor(),
        CornerRadii.EMPTY,
        Insets.EMPTY,
      )));
      if (attrs.temporary && addParams.coverClickable && defaultHideMethod !== null) {
        cover.el.addEventListener('click', () => this.hide(scene, defaultHideMethod));
      }
      scene.cover = cover;
      const bundle = new Group();
      bundle.getChildren().add(cover);
      bundle.getChildren().add(scene.getNode());
      scene.bundle = bundle;
      // Sync cover size to root; listeners cleaned up by removeScene.
      const syncCoverW: ChangeListenerNumber = (_o, now) => {
        if (now === null) return;
        cover.setPrefWidth(now);
      };
      const syncCoverH: ChangeListenerNumber = (_o, now) => {
        if (now === null) return;
        cover.setPrefHeight(now);
      };
      syncCoverW(null, this.root.getWidth());
      syncCoverH(null, this.root.getHeight());
      this.root.widthProperty.addListener(syncCoverW);
      this.root.heightProperty.addListener(syncCoverH);
      scene.changeListeners.add(syncCoverW);
      scene.changeListeners.add(syncCoverH);
    } else {
      scene.bundle = scene.getNode();
    }
    scene.defaultHideMethod = defaultHideMethod;
    if (scene.role === VSceneRole.MAIN) {
      scene.parentChildren = this.mainSceneGroup.getChildren();
    } else {
      scene.parentChildren = this.root.getChildren();
    }
    scene.progressInformer = this.progressInformerRef();
  }

  removeScene(scene: VScene): void {
    if (this.currentMainScene === scene) {
      throw new IllegalArgumentException(`currentMainScene cannot be removed: ${this.currentMainScene}`);
    }
    if (!this.scenes.has(scene)) {
      throw new NoSuchElementError(`${scene}`);
    }

    scene.animationGraph.stopAndSetNode(scene.stateRemoved);

    for (const lsn of scene.changeListeners) {
      this.root.widthProperty.removeListener(lsn);
      this.root.heightProperty.removeListener(lsn);
      scene.getNode().widthProperty.removeListener(lsn);
      scene.getNode().heightProperty.removeListener(lsn);
    }
    scene.changeListeners.clear();
    if (scene.bundle !== null) {
      this.root.getChildren().remove(scene.bundle);
      this.mainSceneGroup.getChildren().remove(scene.bundle);
    }
    scene.bundle = null;
    scene.cover = null;
    scene.defaultHideMethod = null;
    scene.parentChildren = null;
    scene.progressInformer = null;

    this.showingScenes.delete(scene);
    this.animatingHide.delete(scene);
    this.animatingShow.delete(scene);
    this.scenes.delete(scene);
    scene.getNode().setLayoutX(0);
    scene.getNode().setLayoutY(0);
  }

  show(scene: VScene, method: VSceneShowMethod): void {
    if (scene === this.currentMainScene || this.showingScenes.has(scene)) {
      return;
    }
    if (!this.scenes.has(scene)) {
      throw new IllegalArgumentException(`${scene} is not managed by this scene group`);
    }
    if (this.animatingHide.has(scene)) {
      this.animatingHide.delete(scene);
      this.animatingShow.add(scene);
      if (this.precheckShow(scene)) {
        scene.animationGraph.play(scene.stateCenterShown, Callback.ofIgnoreExceptionFunction<void, Error>(() => this.postShowing(scene)));
      }
      return;
    }
    if (this.animatingShow.has(scene)) {
      return;
    }
    if (!this.precheckShow(scene)) {
      return;
    }
    if (scene.role === VSceneRole.MAIN) {
      if (!this.precheckHide(this.currentMainScene)) {
        return;
      }
      this.currentMainScene.beforeHiding();
      this.nextMainScene = scene;
    }
    scene.beforeShowing();
    const cb: Callback<void, Error> = Callback.ofIgnoreExceptionFunction<void, Error>(() => this.showStep2(scene, method));
    switch (method) {
      case VSceneShowMethod.FROM_TOP:
        scene.animationGraph.play(scene.stateTop, cb);
        if (scene.role === VSceneRole.MAIN) {
          this.hideSkipCheck(this.currentMainScene, VSceneHideMethod.TO_BOTTOM);
        }
        break;
      case VSceneShowMethod.FROM_BOTTOM:
        scene.animationGraph.play(scene.stateBottom, cb);
        if (scene.role === VSceneRole.MAIN) {
          this.hideSkipCheck(this.currentMainScene, VSceneHideMethod.TO_TOP);
        }
        break;
      case VSceneShowMethod.FROM_LEFT:
        scene.animationGraph.play(scene.stateLeft, cb);
        if (scene.role === VSceneRole.MAIN) {
          this.hideSkipCheck(this.currentMainScene, VSceneHideMethod.TO_RIGHT);
        }
        break;
      case VSceneShowMethod.FROM_RIGHT:
        scene.animationGraph.play(scene.stateRight, cb);
        if (scene.role === VSceneRole.MAIN) {
          this.hideSkipCheck(this.currentMainScene, VSceneHideMethod.TO_LEFT);
        }
        break;
      case VSceneShowMethod.FADE_IN:
        scene.animationGraph.play(scene.stateFaded, cb);
        if (scene.role === VSceneRole.MAIN) {
          this.hideSkipCheck(this.currentMainScene, VSceneHideMethod.FADE_OUT);
        }
        break;
    }
  }

  private precheckShow(scene: VScene): boolean {
    try {
      return scene.checkBeforeShowing();
    } catch (e) {
      Logger.error('USER_HANDLE_FAIL', `failed running pre-check for showing scene ${scene}`, e as Error);
      void StackTraceAlert.showAndWait(InternalI18n.get().sceneGroupPreCheckShowSceneFailed(), e);
      return false;
    }
  }

  private precheckHide(scene: VScene): boolean {
    try {
      return scene.checkBeforeHiding();
    } catch (e) {
      Logger.error('USER_HANDLE_FAIL', `failed running pre-check for hiding scene ${scene}`, e as Error);
      void StackTraceAlert.showAndWait(InternalI18n.get().sceneGroupPreCheckHideSceneFailed(), e);
      return false;
    }
  }

  private showStep2(scene: VScene, method: VSceneShowMethod): void {
    switch (method) {
      case VSceneShowMethod.FROM_TOP:
        scene.x0 = 0;
        scene.y0 = 0;
        scene.yN = -scene.getNode().getHeight();
        this.doAnimate(scene, null, true);
        break;
      case VSceneShowMethod.FROM_BOTTOM:
        scene.x0 = 0;
        scene.y0 = this.root.getHeight() - scene.getNode().getHeight();
        scene.y1 = this.root.getHeight();
        this.doAnimate(scene, null, true);
        break;
      case VSceneShowMethod.FROM_LEFT:
        scene.x0 = 0;
        scene.y0 = 0;
        scene.xN = -scene.getNode().getWidth();
        this.doAnimate(scene, null, true);
        break;
      case VSceneShowMethod.FROM_RIGHT:
        scene.x0 = this.root.getWidth() - scene.getNode().getWidth();
        scene.y0 = 0;
        scene.x1 = this.root.getWidth();
        this.doAnimate(scene, null, true);
        break;
      case VSceneShowMethod.FADE_IN:
        scene.x0 = scene.getNode().getLayoutX();
        scene.y0 = scene.getNode().getLayoutY();
        this.doAnimate(scene, null, true);
        break;
    }
  }

  hide(scene: VScene, method: VSceneHideMethod): void {
    if (!this.scenes.has(scene)) {
      throw new IllegalArgumentException(`${scene} is not managed by this scene group`);
    }
    if (this.currentMainScene !== scene && !this.showingScenes.has(scene)) {
      return;
    }
    if (scene.role === VSceneRole.MAIN) {
      throw new IllegalArgumentException(`${this.scenes} cannot be hidden manually`);
    }
    if (!this.precheckHide(scene)) {
      return;
    }
    scene.beforeHiding();
    this.hideSkipCheck(scene, method);
  }

  private hideSkipCheck(scene: VScene, method: VSceneHideMethod): void {
    if (this.animatingShow.has(scene)) {
      this.animatingShow.delete(scene);
      this.animatingHide.add(scene);
      scene.animationGraph.play(scene.stateRemoved, Callback.ofIgnoreExceptionFunction<void, Error>(() => this.postHiding(scene)));
      return;
    }
    if (this.animatingHide.has(scene)) {
      return;
    }
    scene.x0 = scene.getNode().getLayoutX();
    scene.y0 = scene.getNode().getLayoutY();
    switch (method) {
      case VSceneHideMethod.TO_TOP:
        scene.yN = -scene.getNode().getHeight();
        this.doAnimate(scene, scene.stateTop, false);
        break;
      case VSceneHideMethod.TO_BOTTOM:
        scene.y1 = this.root.getHeight();
        this.doAnimate(scene, scene.stateBottom, false);
        break;
      case VSceneHideMethod.TO_LEFT:
        scene.xN = -scene.getNode().getWidth();
        this.doAnimate(scene, scene.stateLeft, false);
        break;
      case VSceneHideMethod.TO_RIGHT:
        scene.x1 = this.root.getWidth();
        this.doAnimate(scene, scene.stateRight, false);
        break;
      case VSceneHideMethod.FADE_OUT:
        this.doAnimate(scene, scene.stateFaded, false);
        break;
    }
  }

  private progressInformerRef(): ProgressInformer {
    return { informUpdate: (s, p) => this.progressUpdate(s, p) };
  }

  private progressUpdate(scene: VScene, p: number): void {
    this.animateCover(scene, p);
  }

  private animateCover(scene: VScene, p: number): void {
    if (scene.cover !== null) {
      scene.cover.setOpacity(p);
    }
  }

  private doAnimate(scene: VScene, keyNode: AnimationNode<XYZTData> | null, isShowing: boolean): void {
    const animatingSet = isShowing ? this.animatingShow : this.animatingHide;
    animatingSet.add(scene);
    const cb = Callback.ofIgnoreExceptionFunction<void, Error>(() => {
      animatingSet.delete(scene);
      if (isShowing) {
        this.postShowing(scene);
      } else {
        this.postHiding(scene);
      }
    });
    if (isShowing) {
      scene.animationGraph.play(scene.stateCenterShown, cb);
    } else {
      scene.animationGraph.play([keyNode as AnimationNode<XYZTData>, scene.stateRemoved], cb);
    }
  }

  private postShowing(scene: VScene): void {
    if (scene.role === VSceneRole.MAIN) {
      this.currentMainScene = scene;
      this.nextMainScene = null;
    } else {
      this.showingScenes.add(scene);
    }
    scene.getContentPane().el.focus({ preventScroll: true });
    scene.onShown();
  }

  private postHiding(scene: VScene): void {
    this.showingScenes.delete(scene);
    if (scene.role !== VSceneRole.MAIN) {
      this.currentMainScene.getContentPane().el.focus({ preventScroll: true });
    }
    scene.onHidden();
  }

  getCurrentMainScene(): VScene { return this.currentMainScene; }
  getNextMainScene(): VScene | null { return this.nextMainScene; }
  getNextOrCurrentMainScene(): VScene {
    const nx = this.getNextMainScene();
    if (nx === null) return this.getCurrentMainScene();
    return nx;
  }
  isShowing(scene: VScene): boolean {
    return scene === this.currentMainScene || this.showingScenes.has(scene) || this.animatingShow.has(scene);
  }
  getScenes(): ReadonlySet<VScene> { return this.scenes; }
  getNode(): Parent { return this.root; }
}

class IllegalArgumentException extends Error {
  constructor(message?: string | Error) {
    super(typeof message === 'string' ? message : (message as Error)?.message);
    if (typeof message !== 'string' && message) {
      (this as { cause?: unknown }).cause = message;
    }
  }
}
class NoSuchElementError extends Error { }
