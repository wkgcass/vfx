import { ImageManager } from '../manager/image/ImageManager.js';
import { Theme } from '../theme/Theme.js';
import { FusionButton } from '../ui/button/FusionButton.js';
import { FusionImageButton } from '../ui/button/FusionImageButton.js';
import { HPadding } from '../ui/layout/HPadding.js';
import { VPadding } from '../ui/layout/VPadding.js';
import { FusionPane } from '../ui/pane/FusionPane.js';
import { VScene } from '../ui/scene/VScene.js';
import { VSceneGroup } from '../ui/scene/VSceneGroup.js';
import { VSceneRole } from '../ui/scene/VSceneRole.js';
import { VSceneShowMethod } from '../ui/scene/VSceneShowMethod.js';
import { VSceneHideMethod } from '../ui/scene/VSceneHideMethod.js';
import { VStage } from '../ui/stage/VStage.js';
import { FXUtils } from '../util/FXUtils.js';
import { Parent } from '../javafx/Parent.js';
import { HBox } from '../javafx/HBox.js';
import { VBox } from '../javafx/VBox.js';
import {
  Background,
  BackgroundFill,
  CornerRadii,
  Insets,
} from '../javafx/layout.js';
import type { DemoVScene } from './DemoVScene.js';
import {
  Intro00Scene,
  VStage01aIntroScene,
  VStage01cStructureScene,
  VSceneGroup02aIntroScene,
  VSceneGroup02eStructureScene,
  VScene03aIntroScene,
  VScene03bStructureScene,
  VScrollPane04aIntroScene,
  VScrollPane04cStructureScene,
  FusionPane05aIntroScene,
  FusionPane05cStructureScene,
  VTableView06aIntroScene,
  VTableView06dStructureScene,
  VTableView06eSpecialUsageScene,
  Animation07aIntroScene,
  Animation07cDescScene,
  Loading08aIntroScene,
  Loading08cStructureScene,
  LogConsole09aIntroScene,
  ComponentsXxaIntroScene,
  EndingScene,
} from './scenesText.js';
import {
  VStage01bInitParamsScene,
  VSceneGroup02bDisplayScene,
  VSceneGroup02cDemoScene,
  VSceneGroup02dMenuScene,
  VScrollPane04bDemoScene,
  FusionPane05bDemoScene,
  VTableView06bDemoScene,
  VTableView06cDemo2Scene,
  Loading08bDemoScene,
  LogConsole09bDemoScene,
  ComponentsXxbDemoScene,
  ComponentsXxcDemo2Scene,
  ComponentsXxdBrokenLineScene,
  Animation07bDemoScene,
} from './scenesDemo.js';

export class IntroFXMain {
  private readonly mainScenes: DemoVScene[] = [];
  private sceneGroup!: VSceneGroup;
  private stage!: VStage;

  async start(): Promise<void> {
    // Recolor the intro images (black → white) so the menu / arrow icons
    // are visible on the dark theme background.
    ImageManager.get().loadBlackAndChangeColor('intro/res/menu.png', { white: 0xffffffff });
    ImageManager.get().loadBlackAndChangeColor('intro/res/up-arrow.png', { white: 0xffffffff });

    this.stage = new VStage();
    const origClose = this.stage.close.bind(this.stage);
    this.stage.close = async (): Promise<void> => {
      await origClose();
    };
    this.stage.getInitialScene().enableAutoContentWidthHeight();

    this.stage.setTitle('VFX Intro');

    this.mainScenes.push(new Intro00Scene());
    this.mainScenes.push(new VStage01aIntroScene());
    this.mainScenes.push(new VStage01bInitParamsScene());
    this.mainScenes.push(new VStage01cStructureScene());
    this.mainScenes.push(new VSceneGroup02aIntroScene());
    this.mainScenes.push(new VSceneGroup02bDisplayScene());
    this.mainScenes.push(new VSceneGroup02cDemoScene(() => this.sceneGroup));
    this.mainScenes.push(new VSceneGroup02dMenuScene());
    this.mainScenes.push(new VSceneGroup02eStructureScene());
    this.mainScenes.push(new VScene03aIntroScene());
    this.mainScenes.push(new VScene03bStructureScene());
    this.mainScenes.push(new VScrollPane04aIntroScene());
    this.mainScenes.push(new VScrollPane04bDemoScene());
    this.mainScenes.push(new VScrollPane04cStructureScene());
    this.mainScenes.push(new FusionPane05aIntroScene());
    this.mainScenes.push(new FusionPane05bDemoScene());
    this.mainScenes.push(new FusionPane05cStructureScene());
    this.mainScenes.push(new VTableView06aIntroScene());
    this.mainScenes.push(new VTableView06bDemoScene());
    this.mainScenes.push(new VTableView06cDemo2Scene());
    this.mainScenes.push(new VTableView06dStructureScene());
    this.mainScenes.push(new VTableView06eSpecialUsageScene());
    this.mainScenes.push(new Animation07aIntroScene());
    this.mainScenes.push(new Animation07bDemoScene());
    this.mainScenes.push(new Animation07cDescScene());
    this.mainScenes.push(new Loading08aIntroScene());
    this.mainScenes.push(new Loading08bDemoScene());
    this.mainScenes.push(new Loading08cStructureScene());
    this.mainScenes.push(new LogConsole09aIntroScene());
    this.mainScenes.push(new LogConsole09bDemoScene());
    this.mainScenes.push(new ComponentsXxaIntroScene());
    this.mainScenes.push(new ComponentsXxbDemoScene());
    this.mainScenes.push(new ComponentsXxcDemo2Scene());
    this.mainScenes.push(new ComponentsXxdBrokenLineScene());
    this.mainScenes.push(new EndingScene());

    const initialScene = this.mainScenes[0]!;
    this.sceneGroup = new VSceneGroup(initialScene);
    for (const s of this.mainScenes) {
      if (s === initialScene) continue;
      this.sceneGroup.addScene(s);
    }

    const navigatePane = new FusionPane();
    navigatePane.getNode().setPrefHeight(60);

    FXUtils.observeHeight(this.stage.getInitialScene().getContentPane(), this.sceneGroup.getNode(), -10 - 60 - 5 - 10);
    FXUtils.observeWidth(this.stage.getInitialScene().getContentPane(), this.sceneGroup.getNode(), -20);
    FXUtils.observeWidth(this.stage.getInitialScene().getContentPane(), navigatePane.getNode(), -20);

    const prevButton = new FusionButton('<< Previous');
    prevButton.setPrefWidth(150);
    prevButton.setPrefHeight(navigatePane.getNode().getPrefHeight() - FusionPane.PADDING_V * 2);
    prevButton.setOnlyAnimateWhenNotClicked(true);
    {
      const current = this.sceneGroup.getCurrentMainScene();
      const index = this.mainScenes.indexOf(current as DemoVScene);
      if (index === 0) prevButton.setDisabled(true);
    }

    const nextButton = new FusionButton('Next >>');
    nextButton.setPrefWidth(150);
    nextButton.setPrefHeight(navigatePane.getNode().getPrefHeight() - FusionPane.PADDING_V * 2);
    nextButton.setOnlyAnimateWhenNotClicked(true);
    {
      const current = this.sceneGroup.getCurrentMainScene();
      const index = this.mainScenes.indexOf(current as DemoVScene);
      if (index === this.mainScenes.length - 1) nextButton.setDisabled(true);
    }

    prevButton.setOnAction(() => {
      const current = this.sceneGroup.getCurrentMainScene();
      const index = this.mainScenes.indexOf(current as DemoVScene);
      if (index === 0) return;
      this.sceneGroup.show(this.mainScenes[index - 1]!, VSceneShowMethod.FROM_LEFT);
      if (index - 1 === 0) prevButton.setDisabled(true);
      nextButton.setDisabled(false);
    });
    nextButton.setOnAction(() => {
      const current = this.sceneGroup.getCurrentMainScene();
      const index = this.mainScenes.indexOf(current as DemoVScene);
      if (index === this.mainScenes.length - 1) return;
      this.sceneGroup.show(this.mainScenes[index + 1]!, VSceneShowMethod.FROM_RIGHT);
      if (index + 1 === this.mainScenes.length - 1) nextButton.setDisabled(true);
      prevButton.setDisabled(false);
    });

    navigatePane.getContentPane().getChildren().add(prevButton);
    navigatePane.getContentPane().getChildren().add(nextButton);
    navigatePane.getContentPane().widthProperty.addListener((_o, now) => {
      if (now === null) return;
      nextButton.setLayoutX(now - nextButton.getPrefWidth());
    });

    const box = new HBox(
      new HPadding(10),
      new VBox(
        new VPadding(10),
        this.sceneGroup.getNode(),
        new VPadding(5),
        navigatePane.getNode(),
      ),
    );
    this.stage.getInitialScene().getContentPane().getChildren().add(box);

    const menuScene = new VScene(VSceneRole.DRAWER_VERTICAL);
    menuScene.getNode().setPrefWidth(450);
    menuScene.enableAutoContentWidth();
    menuScene.getNode().setBackground(new Background(new BackgroundFill(
      Theme.current().subSceneBackgroundColor(),
      CornerRadii.EMPTY,
      Insets.EMPTY,
    )));
    this.stage.getRootSceneGroup().addScene(menuScene, VSceneHideMethod.TO_LEFT);

    const menuVBox = new VBox(new VPadding(20));
    menuVBox.el.style.paddingLeft = '24px';
    menuScene.getContentPane().getChildren().add(menuVBox);

    for (let i = 0; i < this.mainScenes.length; i++) {
      const fi = i;
      const s = this.mainScenes[i]!;
      const title = s.title();
      const button = new FusionButton(title);
      button.setDisableAnimation(true);
      button.setOnAction(() => {
        const currentIndex = this.mainScenes.indexOf(this.sceneGroup.getCurrentMainScene() as DemoVScene);
        if (currentIndex !== fi) {
          this.sceneGroup.show(
            s,
            currentIndex < fi ? VSceneShowMethod.FROM_RIGHT : VSceneShowMethod.FROM_LEFT,
          );
        }
        this.stage.getRootSceneGroup().hide(menuScene, VSceneHideMethod.TO_LEFT);
        prevButton.setDisabled(fi === 0);
        nextButton.setDisabled(fi === this.mainScenes.length - 1);
      });
      button.setPrefWidth(400);
      button.setPrefHeight(40);
      if (i !== 0) menuVBox.getChildren().add(new VPadding(20));
      menuVBox.getChildren().add(button);
    }
    menuVBox.getChildren().add(new VPadding(20));

    const menuBtn = new FusionImageButton(ImageManager.get().load('intro/res/menu.png:white'));
    menuBtn.setPrefWidth(40);
    menuBtn.setPrefHeight(VStage.TITLE_BAR_HEIGHT + 1);
    menuBtn.getImageView().setFitHeight(15);
    menuBtn.setLayoutX(-2);
    menuBtn.setLayoutY(-1);
    menuBtn.setOnAction(() => {
      this.stage.getRootSceneGroup().show(menuScene, VSceneShowMethod.FROM_LEFT);
    });
    this.stage.getRoot().getContentPane().getChildren().add(menuBtn);

    await this.stage.getStage().setWidth(1280);
    await this.stage.getStage().setHeight(800);
    await this.stage.getStage().centerOnScreen();
    await this.stage.show();
  }
}
