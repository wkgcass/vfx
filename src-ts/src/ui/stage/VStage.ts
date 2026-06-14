import { Pane } from '../../javafx/Pane.js';
import { Label } from '../../javafx/Label.js';
import { Stage } from '../../javafx/stage.js';
import { Scene } from '../../javafx/scene.js';
import { Color, Paint } from '../../javafx/color.js';
import { Circle } from '../../javafx/shapes.js';
import {
  Background,
  BackgroundFill,
  Border,
  BorderStroke,
  BorderStrokeDescriptor,
  BorderStrokeStyle,
  CornerRadii,
  BorderWidths,
  Insets,
} from '../../javafx/layout.js';
import { FXUtils } from '../../util/FXUtils.js';
import { Theme } from '../../theme/Theme.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { VScene } from '../scene/VScene.js';
import { VSceneGroup } from '../scene/VSceneGroup.js';
import { VSceneGroupInitParams } from '../scene/VSceneGroupInitParams.js';
import { VSceneRole } from '../scene/VSceneRole.js';
import { VStageInitParams } from './VStageInitParams.js';
import { CloseButton } from './CloseButton.js';
import { MaxResetButton } from './MaxResetButton.js';
import { IconifyButton } from './IconifyButton.js';
import { OS } from '../../vproxy-base/OS.js';

export class VStage {
  static readonly TITLE_BAR_HEIGHT = 28;
  // Floor for manual resize. The OS window is non-resizable so it won't clamp
  // size itself; the resize handle enforces these instead. Mirrors the
  // minWidth/minHeight declared for the main window in tauri.conf.json.
  static readonly MIN_WIDTH = 256;
  static readonly MIN_HEIGHT = 128;

  private readonly stage: Stage;
  private readonly rootContainer: Pane = new Pane();
  private readonly rootContent: VScene;
  private readonly rootSceneGroup: VSceneGroup;
  private readonly content: VScene;
  private readonly sceneGroup: VSceneGroup;
  private readonly title: Label;
  private readonly resizeButton: Circle;

  private maximized = false;
  private readonly maxrstBtn: MaxResetButton;

  constructor();
  constructor(initParams: VStageInitParams);
  constructor(stage: Stage);
  constructor(stage: Stage, initParams: VStageInitParams);
  constructor(stageOrInit?: Stage | VStageInitParams, maybeInit?: VStageInitParams) {
    let stage: Stage;
    let initParams: VStageInitParams;
    if (stageOrInit instanceof Stage) {
      stage = stageOrInit;
      initParams = maybeInit ?? new VStageInitParams();
    } else if (stageOrInit instanceof VStageInitParams) {
      stage = new Stage();
      initParams = stageOrInit;
    } else {
      stage = new Stage();
      initParams = new VStageInitParams();
    }
    this.stage = stage;
    stage.initStyle('TRANSPARENT');

    this.rootContent = new VScene(VSceneRole.MAIN);
    this.rootContent.enableAutoContentWidthHeight();

    this.rootSceneGroup = new VSceneGroup(
      this.rootContent,
      new VSceneGroupInitParams().setUseClip(false),
    );

    if (initParams.initialScene === null) {
      this.content = new VScene(VSceneRole.MAIN);
    } else {
      this.content = initParams.initialScene;
    }
    this.sceneGroup = new VSceneGroup(
      this.content,
      new VSceneGroupInitParams().setGradientCover(true).setUseClip(false),
    );

    const scene = new Scene(this.rootContainer);
    scene.setFill(Color.TRANSPARENT);
    this.rootSceneGroup.getNode().setLayoutX(0.5);
    this.rootSceneGroup.getNode().setLayoutY(0.5);

    FXUtils.makeRoundedClipFor(this.rootSceneGroup.getNode() as Pane, 8);

    stage.widthProperty.addListener(() => {
      const w = stage.getWidth();
      this.rootContainer.setPrefWidth(w);
      (this.rootSceneGroup.getNode() as Pane).setPrefWidth(w - 1);
    });
    stage.heightProperty.addListener(() => {
      const h = stage.getHeight();
      this.rootContainer.setPrefHeight(h);
      (this.rootSceneGroup.getNode() as Pane).setPrefHeight(h - 1);
    });
    this.rootContainer.setBackground(Background.EMPTY);
    this.useDefaultBorder();
    this.setBackground(Theme.current().sceneBackgroundColor());

    const movingPane = new Pane();
    movingPane.setPrefHeight(VStage.TITLE_BAR_HEIGHT);
    movingPane.el.style.position = 'absolute';
    movingPane.el.style.top = '0';
    movingPane.el.style.left = '0';
    movingPane.el.setAttribute('data-tauri-drag-region', '');
    this.rootContent.getContentPane().getChildren().add(movingPane);

    const closeBtn = new CloseButton(this, initParams);
    if (initParams.closeButton) this.rootContent.getContentPane().getChildren().add(closeBtn);

    this.maxrstBtn = new MaxResetButton(this, initParams);
    if (initParams.maximizeAndResetButton) this.rootContent.getContentPane().getChildren().add(this.maxrstBtn);

    const iconifyBtn = new IconifyButton(this, initParams);
    if (initParams.iconifyButton) this.rootContent.getContentPane().getChildren().add(iconifyBtn);

    this.sceneGroup.getNode().setLayoutX(0.5);
    this.sceneGroup.getNode().setLayoutY(VStage.TITLE_BAR_HEIGHT);
    this.rootContent.getContentPane().getChildren().add(this.sceneGroup.getNode());

    this.title = new Label();
    FontManager.get().setFont(FontUsages.windowTitle, this.title);
    this.title.setTextFill(Theme.current().normalTextColor());
    this.title.setMouseTransparent(true);
    this.rootContent.getContentPane().getChildren().add(this.title);

    // Right-bottom resize handle — the ONLY way to resize. The OS window is
    // created non-resizable (resizable:false in tauri.conf.json /
    // WindowManager.open) so the native borders/corners can't be dragged.
    //
    // The catch: setSize() is a no-op on a non-resizable window (the OS rejects
    // all size changes for that window style). So we can't just keep it false
    // and call setSize. startResizeDragging() is likewise a no-op. The chosen
    // approach: flip the window to resizable:true for the duration of the drag
    // (so setSize works), then flip it back to false when the gesture ends,
    // restoring the "no edge resize" state.
    this.resizeButton = new Circle();
    this.resizeButton.setStrokeWidth(0);
    this.resizeButton.setFill(Color.TRANSPARENT);
    this.resizeButton.setRadius(8);
    this.resizeButton.setCursor('nwse-resize');
    this.resizeButton.el.style.position = 'absolute';
    this.resizeButton.el.style.touchAction = 'none';
    this.resizeButton.el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const win = stage.tauriWindow;
      const startW = stage.getWidth();
      const startH = stage.getHeight();
      const startX = e.clientX;
      const startY = e.clientY;
      this.resizeButton.el.setPointerCapture(e.pointerId);

      // Enable resizing just for this gesture. Fire-and-forget the await: the
      // first few pointermove events may land before the IPC resolves, in which
      // case their setSize calls are coalesced/dropped harmlessly by Stage; the
      // gesture spans many events so resize kicks in within a frame or two.
      // Requires the core:window:allow-set-resizable capability.
      const enable = win.setResizable(true).catch((err) => {
        console.error('[vfx:resize] setResizable(true) failed', err);
      });

      // Freeze the layout cascade for the duration of the drag: the OS window
      // resizes every frame, but width/heightProperty suppress dispatch so the
      // observe-width/height reflow chain (and all the scene/table/scroll
      // relayout it triggers) stays paused. Content appears frozen while the
      // bare window outline follows the cursor. `finish` un-pauses and the UI
      // reflows exactly once to the final size.
      stage.setResizing(true);

      const onMove = (ev: PointerEvent): void => {
        let w = startW + (ev.clientX - startX);
        let h = startH + (ev.clientY - startY);
        if (w < VStage.MIN_WIDTH) w = VStage.MIN_WIDTH;
        if (h < VStage.MIN_HEIGHT) h = VStage.MIN_HEIGHT;
        void stage.setWidth(w);
        void stage.setHeight(h);
      };
      const finish = (ev: PointerEvent): void => {
        this.resizeButton.el.releasePointerCapture(ev.pointerId);
        this.resizeButton.el.removeEventListener('pointermove', onMove);
        this.resizeButton.el.removeEventListener('pointerup', finish);
        this.resizeButton.el.removeEventListener('pointercancel', finish);
        // Un-freeze first: flush the final size to listeners so content snaps
        // to the new dimensions in one pass, THEN re-lock the borders.
        stage.setResizing(false);
        void enable.then(() => {
          win.setResizable(false).catch((err) => {
            console.error('[vfx:resize] setResizable(false) failed', err);
          });
        });
      };
      this.resizeButton.el.addEventListener('pointermove', onMove);
      this.resizeButton.el.addEventListener('pointerup', finish);
      this.resizeButton.el.addEventListener('pointercancel', finish);
    });

    this.title.textProperty.addListener(() => this.updateTitlePosition());
    stage.widthProperty.addListener(() => {
      const w = stage.getWidth();
      const padRight = 0;
      let controlButtonsOffset = w - padRight;
      if (initParams.closeButton) {
        controlButtonsOffset -= CloseButton.WIDTH;
        closeBtn.setLayoutX(controlButtonsOffset);
      }
      if (initParams.maximizeAndResetButton) {
        controlButtonsOffset -= MaxResetButton.WIDTH;
        this.maxrstBtn.setLayoutX(controlButtonsOffset);
      }
      if (initParams.iconifyButton) {
        controlButtonsOffset -= IconifyButton.WIDTH;
        iconifyBtn.setLayoutX(controlButtonsOffset);
      }
      movingPane.setPrefWidth(w);
      (this.rootSceneGroup.getNode() as Pane).setPrefWidth(w - 1);
      this.resizeButton.setCenterX(w - 8);
      this.updateTitlePosition();
    });
    stage.heightProperty.addListener(() => {
      const h = stage.getHeight();
      (this.rootSceneGroup.getNode() as Pane).setPrefHeight(h - 1);
      this.resizeButton.setCenterY(h - 8);
    });
    FXUtils.observeWidthHeight(
      this.rootContent.getContentPane(),
      this.sceneGroup.getNode() as Pane,
      0,
      -VStage.TITLE_BAR_HEIGHT,
    );

    this.rootContainer.getChildren().add(this.rootSceneGroup.getNode());
    if (initParams.resizable) {
      this.rootContainer.getChildren().add(this.resizeButton);
    }

    stage.onCloseRequestedHandlers.add(() => { void this.close(); });
  }

  useDefaultBorder(): void { this.useLightBorder(); }

  useLightBorder(): void {
    this.rootContainer.setBorder(new Border(new BorderStroke(new BorderStrokeDescriptor(
      Theme.current().windowBorderColorLight(),
      BorderStrokeStyle.SOLID,
      CornerRadii.uniform(8),
      BorderWidths.uniform(0.5),
    ))));
  }

  useDarkBorder(): void {
    this.rootContainer.setBorder(new Border(new BorderStroke(new BorderStrokeDescriptor(
      Theme.current().windowBorderColorDark(),
      BorderStrokeStyle.SOLID,
      CornerRadii.uniform(8),
      BorderWidths.uniform(0.5),
    ))));
  }

  private updateTitlePosition(): void {
    const text = this.title.getText();
    if (text === null || text.trim() === '') {
      this.title.setVisible(false);
      return;
    }
    this.title.setVisible(true);
    const bounds = FXUtils.calculateTextBounds(this.title);
    const tWidth = bounds.width;
    const tHeight = bounds.height;
    const sWidth = this.stage.getWidth();
    this.title.setLayoutX((sWidth - tWidth) / 2);
    this.title.setLayoutY((VStage.TITLE_BAR_HEIGHT - tHeight) / 2);
  }

  setBackground(paint: Paint): void {
    (this.rootSceneGroup.getNode() as Pane).setBackground(new Background(new BackgroundFill(
      paint,
      CornerRadii.EMPTY,
      Insets.EMPTY,
    )));
  }

  getStage(): Stage { return this.stage; }
  getRootSceneGroup(): VSceneGroup { return this.rootSceneGroup; }
  getRoot(): VScene { return this.rootContent; }
  getSceneGroup(): VSceneGroup { return this.sceneGroup; }
  getInitialScene(): VScene { return this.content; }

  setTitle(t: string): void {
    this.title.setText(t);
    void this.stage.setTitle(t);
  }

  setIconified(iconified: boolean): void {
    void this.stage.setIconified(iconified);
  }

  private stageOriginalX = 0;
  private stageOriginalY = 0;
  private stageOriginalW = 0;
  private stageOriginalH = 0;

  async setMaximized(maximized: boolean): Promise<void> {
    if (this.maximized === maximized) return;
    this.maximized = maximized;
    this.maxrstBtn.updateImage();

    if (OS.isMacSync()) {
      if (maximized) {
        this.stageOriginalX = this.stage.getX();
        this.stageOriginalY = this.stage.getY();
        this.stageOriginalW = this.stage.getWidth();
        this.stageOriginalH = this.stage.getHeight();
        // Tauri has no direct screen-bounds API exposed; fall through
        // to the generic maximize below.
      } else {
        await this.stage.setX(this.stageOriginalX);
        await this.stage.setY(this.stageOriginalY);
        await this.stage.setWidth(this.stageOriginalW);
        await this.stage.setHeight(this.stageOriginalH);
        return;
      }
    }
    await this.stage.setMaximized(maximized);
  }

  isMaximized(): boolean { return this.maximized; }

  close(): Promise<void> { return this.stage.close(); }

  show(): Promise<void> { return this.stage.show(); }
  showAndWait(): Promise<void> { return this.stage.showAndWait(); }

  async temporaryOnTop(): Promise<void> {
    const always = await this.stage.tauriWindow.isAlwaysOnTop();
    if (always) return;
    await this.stage.setAlwaysOnTop(true);
    FXUtils.runDelay(500, () => { void this.stage.setAlwaysOnTop(false); });
  }
}
