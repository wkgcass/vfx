import { Pane, Group } from '../javafx/Pane.js';
import { VBox } from '../javafx/VBox.js';
import { HBox } from '../javafx/HBox.js';
import { GridPane } from '../javafx/GridPane.js';
import { Label } from '../javafx/Label.js';
import { TextField } from '../javafx/TextField.js';
import { CheckBox } from '../javafx/CheckBox.js';
import { FusionW } from '../ui/wrapper/FusionW.js';
import { FontUsages } from '../manager/font/FontUsages.js';
import { MiscUtils } from '../util/MiscUtils.js';
import { HPadding } from '../ui/layout/HPadding.js';
import { VPadding } from '../ui/layout/VPadding.js';
import { Color } from '../javafx/color.js';
import { Circle, Line } from '../javafx/shapes.js';
import { AnimationGraphBuilder } from '../animation/AnimationGraphBuilder.js';
import { AnimationNode } from '../animation/AnimationNode.js';
import { AnimationInterrupted } from '../animation/AnimationInterrupted.js';
import { XYData } from '../util/algebradata/XYData.js';
import {
  Background,
  BackgroundFill,
  CornerRadii,
  Insets,
  Pos,
} from '../javafx/layout.js';
import { FXUtils } from '../util/FXUtils.js';
import { Parent } from '../javafx/Parent.js';
import { ThemeLabel } from '../ui/wrapper/ThemeLabel.js';
import { FontManager } from '../manager/font/FontManager.js';
import { ImageManager } from '../manager/image/ImageManager.js';
import { ImageView } from '../javafx/ImageView.js';
import { FusionButton } from '../ui/button/FusionButton.js';
import { FusionPane } from '../ui/pane/FusionPane.js';
import { VScene } from '../ui/scene/VScene.js';
import { VSceneRole } from '../ui/scene/VSceneRole.js';
import { VSceneShowMethod } from '../ui/scene/VSceneShowMethod.js';
import { VSceneHideMethod } from '../ui/scene/VSceneHideMethod.js';
import type { VSceneGroup } from '../ui/scene/VSceneGroup.js';
import { VScrollPane } from '../control/scroll/VScrollPane.js';
import { ScrollDirection } from '../control/scroll/ScrollDirection.js';
import { VTableView } from '../ui/table/VTableView.js';
import { VTableColumn } from '../ui/table/VTableColumn.js';
import { VSlider } from '../ui/slider/VSlider.js';
import { VRangeSlider } from '../ui/slider/VRangeSlider.js';
import { SliderDirection } from '../ui/slider/SliderDirection.js';
import { ToggleSwitch } from '../ui/toggle/ToggleSwitch.js';
import { BrokenLine } from '../ui/shapes/BrokenLine.js';
import { EndpointStyle } from '../ui/shapes/EndpointStyle.js';
import { LogConsole } from '../component/logconsole/LogConsole.js';
import { KeyChooser } from '../component/keychooser/KeyChooser.js';
import { VDialog } from '../control/dialog/VDialog.js';
import { LoadingStage } from '../ui/loading/LoadingStage.js';
import { LoadingItem } from '../ui/loading/LoadingItem.js';
import type { LoadingFailure } from '../ui/loading/LoadingFailure.js';
import { SimpleAlert } from '../ui/alert/SimpleAlert.js';
import { StackTraceAlert } from '../ui/alert/StackTraceAlert.js';
import { TransparentFusionButton } from '../ui/button/TransparentFusionButton.js';
import { TransparentFusionPane } from '../ui/pane/TransparentFusionPane.js';
import { TransparentContentFusionPane } from '../ui/pane/TransparentContentFusionPane.js';
import { Callback } from '../vproxy-base/Callback.js';
import { Logger } from '../vproxy-base/Logger.js';
import { Theme } from '../theme/Theme.js';
import { Windows } from '../window/WindowManager.js';
import { DemoVScene } from './DemoVScene.js';
import { centerNodeAtY } from './sceneHelpers.js';

function randomString(minLen: number, maxLen: number = minLen): string {
  const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function randomIPAddress(): string {
  return `${1 + Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${1 + Math.floor(Math.random() * 254)}`;
}

export class VSceneGroup02bDisplayScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const pane = new Pane();
    pane.setBackground(new Background(new BackgroundFill(
      new Color(0xc5 / 255, 0x95 / 255, 0x71 / 255, 1),
      CornerRadii.EMPTY,
      Insets.EMPTY,
    )));
    const label = new ThemeLabel(
      'This pane is inside a VSceneGroup.\n' +
      'The bottom \'previous\' and \'next\' buttons uses its functions to switch the \'MAIN\' scenes.',
    );
    FontManager.get().setFont(label, (s) => s.setSize(20));
    this.getContentPane().getChildren().add(pane);
    pane.getChildren().add(label);
    FXUtils.observeWidthHeight(this.getContentPane(), pane);
    FXUtils.observeWidthHeightCenter(pane, label as unknown as Parent);
  }
  title(): string { return 'VSceneGroup Display'; }
}

export class VSceneGroup02dMenuScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const img = ImageManager.get().load('intro/res/up-arrow.png:white');
    const imgView = new ImageView(img!);
    imgView.setPreserveRatio(true);
    imgView.setFitWidth(250);
    // Java applies Scale(x=-1) + Rotate(-5deg) via transforms. The TS
    // ImageView port doesn't expose getTransforms(); use CSS directly.
    // JavaFX's Rotate/Scale default their pivot to the node's local (0,0),
    // so the mirrored image ends up to the LEFT of layoutX. CSS transforms
    // default to transform-origin: 50% 50% (center), which would keep the
    // image inside its bounding box instead — must override to 0 0 to match.
    imgView.el.style.transformOrigin = '0 0';
    imgView.el.style.transform = 'scaleX(-1) rotate(-5deg)';
    imgView.setLayoutX(240);
    // Java has layoutY=0, but JavaFX's boundsInParent for a transformed
    // node is computed against the un-clipped scene graph — the rotated
    // image can overhang the layoutY line by a few pixels of anti-aliased
    // pixels without being visibly clipped. The TS port's scrollPane
    // viewport uses CSS `overflow: hidden`, which clips those overhanging
    // pixels hard against y=0 (the top of the content pane = bottom of
    // the 28px title bar). The pivot corner (top-right of the flipped
    // image) sits exactly on y=0 and gets its topmost scanline cut by
    // the viewport clip. Shifting layoutY down by ~25px gives the same
    // visual margin JavaFX's's sub-pixel tolerance produces naturally.
    imgView.setLayoutY(25);

    const titleLabel = new ThemeLabel(
      'The menu is a DRAWER_VERTICAL scene\nshows using FROM_LEFT, and hides using TO_LEFT',
    );
    FontManager.get().setFont(titleLabel, (s) => s.setSize(35));
    const descLabel = new ThemeLabel('Click the button to show the menu.');
    const pane = new VBox(titleLabel, new VPadding(30), descLabel);
    pane.el.style.alignItems = 'center';
    FXUtils.observeWidthCenter(this.getContentPane(), pane);
    pane.setLayoutY(280);
    this.getContentPane().getChildren().addAll(imgView, pane);
  }
  title(): string { return 'The Menu Button'; }
}

export class FusionPane05bDemoScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel('Demonstration about the FusionPane.');
    centerNodeAtY(this, msgLabel, 100);

    const manuallySetPane = new FusionPane();
    manuallySetPane.getNode().setPrefWidth(400);
    manuallySetPane.getNode().setPrefHeight(100);
    manuallySetPane.getContentPane().getChildren().add(new ThemeLabel('Manually set width and height'));

    const autoPane = new FusionPane(false);
    autoPane.getContentPane().getChildren().add(new ThemeLabel('Auto width height'));
    autoPane.getNode().setLayoutX(500);

    const group = new Pane();
    group.setPrefWidth(700);
    group.setLayoutY(400);
    FXUtils.observeWidthCenter(this.getContentPane(), group);
    group.getChildren().addAll(manuallySetPane.getNode(), autoPane.getNode());

    this.getContentPane().getChildren().addAll(msgLabel, group);
  }
  title(): string { return 'FusionPane Demo'; }
}

export class Loading08bDemoScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel('Click the button to create a LoadingStage.');
    centerNodeAtY(this, msgLabel, 100);

    const loadingStageButton = new FusionButton('Open LoadingStage');
    loadingStageButton.setPrefWidth(300);
    loadingStageButton.setPrefHeight(200);
    FXUtils.observeWidthCenter(this.getContentPane(), loadingStageButton as unknown as Parent);
    loadingStageButton.setLayoutY(300);
    loadingStageButton.setOnAction(async () => {
      const stage = await LoadingStage.open('LoadingStage Demo');
      await stage.setInterval(20);
      await stage.setItems(Loading08bDemoScene.buildLoadingItems());
      await stage.load(new (class extends Callback<void, LoadingFailure> {
        protected onSucceeded(_value: void | null): void {
          FXUtils.runDelay(200, () => {
            void SimpleAlert.showAndWait(SimpleAlert.AlertType.INFORMATION, 'loading complete');
          });
        }
        protected onFailed(failure: LoadingFailure): void {
          if (failure.failedItem === null || failure.failedItem === undefined) {
            void SimpleAlert.showAndWait(SimpleAlert.AlertType.ERROR, failure.message);
          } else {
            void SimpleAlert.showAndWait(
              SimpleAlert.AlertType.ERROR,
              'failed to load item: ' + failure.failedItem.name,
            );
          }
        }
        protected doFinally(): void {
          void stage.close();
        }
      })());
    });

    this.getContentPane().getChildren().addAll(msgLabel, loadingStageButton);
  }

  static buildLoadingItems(): LoadingItem[] {
    const items: LoadingItem[] = [];
    for (let i = 0; i < 100; i++) {
      items.push(new LoadingItem(1, randomString(10, 20), () => {}));
    }
    return items;
  }

  title(): string { return 'LoadingStage Demo'; }
}

export class ComponentsXxdBrokenLineScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel('BrokenLine & VLine Demonstration');
    centerNodeAtY(this, msgLabel, 100);

    const brokenLine = new BrokenLine(16,
      200, 275,
      340, 480,
      520, 360,
      730, 520,
      900, 420,
      1000, 240);
    brokenLine.setStroke(Theme.current().normalTextColor());
    brokenLine.setEndStyle(EndpointStyle.ARROW);

    this.getContentPane().getChildren().addAll(msgLabel, brokenLine.getNode());
  }
  title(): string { return 'BrokenLine Demo'; }
}

export class VStage01bInitParamsScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel('VStageInitParams can be passed to VStage, it has the following properties:');
    centerNodeAtY(this, msgLabel, 100);

    const makeBtn = (text: string, fn: () => void): FusionButton => {
      const b = new FusionButton(text);
      b.setPrefWidth(320);
      b.setPrefHeight(150);
      b.setOnAction(fn);
      return b;
    };

    const defaultButton = makeBtn('new VStageInitParams()', () => {
      void Windows.open({
        kind: 'demo',
        title: 'VFX',
        width: 400,
        height: 400,
        params: { demoKey: 'default' },
      });
    });
    const noIconifyButton = makeBtn('setIconifyButton(false)', () => {
      void Windows.open({
        kind: 'demo',
        title: 'VFX',
        width: 400,
        height: 400,
        params: { demoKey: 'noIconify' },
      });
    });
    const noMaximizeAndResetButton = makeBtn('setMaximizeAndResetButton(false)', () => {
      void Windows.open({
        kind: 'demo',
        title: 'VFX',
        width: 400,
        height: 400,
        params: { demoKey: 'noMax' },
      });
    });
    const noCloseButton = makeBtn('setCloseButton(false)', () => {
      void Windows.open({
        kind: 'demo',
        title: 'VFX',
        width: 400,
        height: 400,
        params: { demoKey: 'noClose' },
      });
    });
    const notResizableButton = makeBtn('setResizable(false)', () => {
      void Windows.open({
        kind: 'demo',
        title: 'VFX',
        width: 400,
        height: 400,
        params: { demoKey: 'noResize' },
      });
    });
    const initialSceneButton = makeBtn('setInitialScene(...)', () => {
      void Windows.open({
        kind: 'demo',
        title: 'VFX',
        width: 400,
        height: 400,
        params: { demoKey: 'initialScene' },
      });
    });

    const gridPane = new GridPane();
    gridPane.setHgap(50);
    gridPane.setVgap(50);
    gridPane.setLayoutY(300);
    FXUtils.observeWidthCenter(this.getContentPane(), gridPane);
    gridPane.add(defaultButton, 0, 0);
    gridPane.add(noIconifyButton, 1, 0);
    gridPane.add(noMaximizeAndResetButton, 2, 0);
    gridPane.add(noCloseButton, 0, 1);
    gridPane.add(notResizableButton, 1, 1);
    gridPane.add(initialSceneButton, 2, 1);

    this.getContentPane().getChildren().add(gridPane);
  }
  title(): string { return 'VStageInitParams'; }
}

export class VSceneGroup02cDemoScene extends DemoVScene {
  constructor(private readonly sceneGroupSup: () => VSceneGroup) {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidth();

    const msgLabel = new ThemeLabel(
      'VSceneGroup also provides the following switching methods:',
    );
    centerNodeAtY(this, msgLabel, 100);

    const drawerColor = new Color(0xaf / 255, 0xcb / 255, 0x9e / 255, 1);

    const makeSceneBtn = (
      text: string,
      role: VSceneRole,
      showMethod: VSceneShowMethod,
      hideMethod: VSceneHideMethod,
      width: number | null,
      height: number | null,
    ): FusionButton => {
      const btn = new FusionButton(text);
      btn.setPrefWidth(320);
      btn.setPrefHeight(150);
      btn.setOnAction(() => {
        const sg = this.sceneGroupSup();
        const scene = new VScene(role);
        scene.enableAutoContentWidthHeight();
        if (width !== null) scene.getNode().setPrefWidth(width);
        if (height !== null) scene.getNode().setPrefHeight(height);
        scene.getNode().setBackground(new Background(new BackgroundFill(
          drawerColor, CornerRadii.EMPTY, Insets.EMPTY,
        )));
        const closeBtn = new FusionButton('hide');
        closeBtn.setPrefWidth(100);
        closeBtn.setPrefHeight(50);
        closeBtn.setOnAction(() => {
          sg.hide(scene, hideMethod);
          FXUtils.runDelay(VScene.ANIMATION_DURATION_MILLIS, () => sg.removeScene(scene));
        });
        scene.getContentPane().getChildren().add(closeBtn);
        FXUtils.observeWidthHeightCenter(scene.getContentPane(), closeBtn as unknown as Parent);
        sg.addScene(scene, hideMethod);
        FXUtils.runDelay(50, () => sg.show(scene, showMethod));
      });
      return btn;
    };

    const fromTop = makeSceneBtn(
      'DRAWER_HORIZONTAL + FROM_TOP',
      VSceneRole.DRAWER_HORIZONTAL, VSceneShowMethod.FROM_TOP, VSceneHideMethod.TO_TOP,
      null, 300);
    const fromRight = makeSceneBtn(
      'DRAWER_VERTICAL + FROM_RIGHT',
      VSceneRole.DRAWER_VERTICAL, VSceneShowMethod.FROM_RIGHT, VSceneHideMethod.TO_RIGHT,
      300, null);
    const fromBottom = makeSceneBtn(
      'DRAWER_HORIZONTAL + FROM_BOTTOM',
      VSceneRole.DRAWER_HORIZONTAL, VSceneShowMethod.FROM_BOTTOM, VSceneHideMethod.TO_BOTTOM,
      null, 300);
    const fromLeft = makeSceneBtn(
      'DRAWER_VERTICAL + FROM_LEFT',
      VSceneRole.DRAWER_VERTICAL, VSceneShowMethod.FROM_LEFT, VSceneHideMethod.TO_LEFT,
      300, null);
    const popFade = makeSceneBtn(
      'POPUP + FADE_IN',
      VSceneRole.POPUP, VSceneShowMethod.FADE_IN, VSceneHideMethod.FADE_OUT,
      300, 300);

    const gridPane = new GridPane();
    gridPane.setHgap(50);
    gridPane.setVgap(50);
    gridPane.setLayoutY(200);
    FXUtils.observeWidthCenter(this.getContentPane(), gridPane);
    gridPane.add(fromTop, 1, 0);
    gridPane.add(fromRight, 2, 1);
    gridPane.add(fromBottom, 1, 2);
    gridPane.add(fromLeft, 0, 1);
    gridPane.add(popFade, 1, 1);

    this.getContentPane().getChildren().addAll(msgLabel, gridPane);
  }
  title(): string { return 'VSceneGroup Demo'; }
}

export class VScrollPane04bDemoScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel('Demonstration about the VScrollPane.');
    centerNodeAtY(this, msgLabel, 100);

    const sp1 = new VScrollPane();
    sp1.getNode().setPrefWidth(250);
    sp1.getNode().setPrefHeight(400);
    sp1.setContent(new ThemeLabel('Hello World'));

    const sp2 = new VScrollPane();
    sp2.getNode().setPrefWidth(250);
    sp2.getNode().setPrefHeight(400);
    const muchContent = new ThemeLabel(
      'Once upon a time a little girl tried to make a living by selling matches in the ' +
      'street. It was New Year\'s Eve and the snowed streets were deserted. From brightly ' +
      'lit windows came the tinkle of laughter and the sound of singing. People were ' +
      'getting ready to bring in the new year. But the poor little match seller sat ' +
      'sadly beside the fountain. Her ragged dress and worn shawl did not keep out the ' +
      'cold and she tried to keep her bare feet from touching the frozen ground. She ' +
      'hadn\'t sold one box of matches all day and she was frightened to go home, for ' +
      'her father would certainly be angry. It wouldn\'t be much warmer anyway, in the ' +
      'draughty attic that was her home. The little girl\'s fingers were stiff with cold. ' +
      'If only she could light a match! But what would her father say at such a waste. ' +
      'Falteringly she took out a match and lit it.\n\n',
    );
    muchContent.setWrapText(true);
    FXUtils.observeWidth(sp2.getNode(), muchContent as unknown as Parent, -1);
    sp2.setContent(muchContent);

    const horizontalLabel = new ThemeLabel('Use \'new VScrollPane(ScrollDirection.HORIZONTAL)\' to instantiate the VScrollPane.');
    const sp3 = new VScrollPane(ScrollDirection.HORIZONTAL);
    sp3.getNode().setPrefWidth(250);
    sp3.getNode().setPrefHeight(400);
    sp3.setContent(horizontalLabel);

    const gridPane = new GridPane();
    gridPane.setHgap(50);
    gridPane.setVgap(50);
    gridPane.setLayoutY(250);
    FXUtils.observeWidthCenter(this.getContentPane(), gridPane);
    gridPane.add(sp1.getNode(), 0, 0);
    gridPane.add(sp2.getNode(), 1, 0);
    gridPane.add(sp3.getNode(), 2, 0);

    this.getContentPane().getChildren().addAll(msgLabel, gridPane);
  }
  title(): string { return 'VScrollPane Demo'; }
}

interface TableData {
  id: string;
  name: string;
  address: string;
  type: string;
  bandwidth: number;
  createtime: number;
  very: string;
  _long: number;
  tableview: number;
  with: string;
  custom: string;
  ui: number;
  elements: string;
}

function makeTableData(): TableData {
  return {
    id: crypto.randomUUID(),
    name: randomString(10, 15),
    address: randomIPAddress(),
    type: Math.random() > 0.5 ? 'classic' : 'new',
    bandwidth: Math.floor(Math.random() * 10) * 100 + 100,
    createtime: Date.now(),
    very: randomString(10),
    _long: Math.floor(Math.random() * 10) * 100,
    tableview: Math.floor(Math.random() * 10),
    with: randomString(10, 15),
    custom: randomString(8),
    ui: Math.floor(Math.random() * 20),
    elements: randomString(15),
  };
}

export class VTableView06bDemoScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel(
      'Click the column name to sort the rows (some of them are sortable).\n' +
      'Tips: try to sort by multiple columns, and try to hover on "name" cells :)',
    );
    centerNodeAtY(this, msgLabel, 40);

    const table = new VTableView<TableData>();
    table.getNode().setPrefWidth(1000);
    table.getNode().setPrefHeight(580);

    const idCol = new VTableColumn<TableData, string>('id', (d) => d.id);
    // name column: editable TextField-in-FusionW cell. Value type is the
    // whole row (matches Java's `data -> data`) so the nodeBuilder receives
    // the row and can mutate `data.name` on focus loss.
    const nameCol = new VTableColumn<TableData, TableData>('name', (d) => d);
    nameCol.setComparator((a, b) => a.name.localeCompare(b.name));
    nameCol.setNodeBuilder((data) => {
      const textField = new TextField();
      const fusionW = new FusionW(textField, (n) => n.textProperty);
      FontManager.get().setFont(FontUsages.tableCellText, fusionW.getLabel());
      textField.setText(data.name);
      textField.focusedProperty.addListener((old, now) => {
        if (old === null || now === null) return;
        if (old && !now) {
          data.name = textField.getText();
        }
      });
      return fusionW;
    });
    const addressCol = new VTableColumn<TableData, string>('address', (d) => d.address);
    addressCol.setAlignment(Pos.CENTER);
    addressCol.setComparator((a, b) => a.localeCompare(b));
    const typeCol = new VTableColumn<TableData, string>('type', (d) => d.type);
    typeCol.setAlignment(Pos.CENTER);
    typeCol.setComparator((a, b) => a.localeCompare(b));
    const bandwidthCol = new VTableColumn<TableData, number>('bandwidth', (d) => d.bandwidth);
    bandwidthCol.setAlignment(Pos.CENTER);
    bandwidthCol.setComparator((a, b) => a - b);
    const createTimeCol = new VTableColumn<TableData, Date>('createtime', (d) => new Date(d.createtime));
    createTimeCol.setMinWidth(200);
    createTimeCol.setAlignment(Pos.CENTER_RIGHT);
    createTimeCol.setTextBuilder((d) => MiscUtils.formatDateTime(d));

    idCol.setMinWidth(300);
    table.getColumns().addAll(
      idCol as VTableColumn<TableData, unknown>,
      nameCol as VTableColumn<TableData, unknown>,
      addressCol as VTableColumn<TableData, unknown>,
      typeCol as VTableColumn<TableData, unknown>,
      bandwidthCol as VTableColumn<TableData, unknown>,
      createTimeCol as VTableColumn<TableData, unknown>,
    );

    for (let i = 0; i < 10; i++) {
      table.getItems().add(makeTableData());
    }

    const controlPane = new FusionPane(false);
    const addBtn = new FusionButton('Add');
    addBtn.setPrefWidth(120);
    addBtn.setPrefHeight(40);
    addBtn.setOnAction(() => table.getItems().add(makeTableData()));
    const delBtn = new FusionButton('Del');
    delBtn.setPrefWidth(120);
    delBtn.setPrefHeight(40);
    delBtn.setOnAction(() => {
      const selected = table.getSelectedItem();
      if (selected === null) return;
      table.getItems().remove(selected);
    });
    controlPane.getContentPane().getChildren().add(new VBox(addBtn, new VPadding(10), delBtn));

    const hbox = new HBox(table.getNode(), new HPadding(10), controlPane.getNode());
    hbox.setLayoutY(100);
    FXUtils.observeWidthCenter(this.getContentPane(), hbox as unknown as Parent);

    this.getContentPane().getChildren().addAll(msgLabel, hbox);
  }
  title(): string { return 'VTableView Demo'; }
}

export class VTableView06cDemo2Scene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel(
      '1. Very long VTableView (held inside a horizontal VScrollPane).\n' +
      '2. Custom column height and graphic.\n' +
      'Tips: try to drag the table.',
    );
    centerNodeAtY(this, msgLabel, 40);

    const table = new VTableView<TableData>();
    table.getNode().setPrefWidth(1500);
    table.getNode().setPrefHeight(500);

    const veryCol = new VTableColumn<TableData, string>('very', (d) => d.very);
    const longCol = new VTableColumn<TableData, number>('long', (d) => d._long);
    const tableviewHeader = new ThemeLabel('table\nview');
    tableviewHeader.setPrefHeight(100);
    const tableviewCol = new VTableColumn<TableData, number>('tableview', tableviewHeader, (d) => d.tableview);
    const withCol = new VTableColumn<TableData, string>('with', (d) => d.with);
    const customCol = new VTableColumn<TableData, string>('custom', (d) => d.custom);
    const uiCol = new VTableColumn<TableData, number>('ui', (d) => d.ui);
    const elementsCol = new VTableColumn<TableData, string>('elements', (d) => d.elements);

    tableviewCol.setComparator((a, b) => a - b);

    table.getColumns().addAll(
      veryCol as VTableColumn<TableData, unknown>,
      longCol as VTableColumn<TableData, unknown>,
      tableviewCol as VTableColumn<TableData, unknown>,
      withCol as VTableColumn<TableData, unknown>,
      customCol as VTableColumn<TableData, unknown>,
      uiCol as VTableColumn<TableData, unknown>,
      elementsCol as VTableColumn<TableData, unknown>,
    );

    for (let i = 0; i < 50; i++) {
      table.getItems().add(makeTableData());
    }

    const hScrollPane = VScrollPane.makeHorizontalScrollPaneToManage(table);
    hScrollPane.getNode().setPrefWidth(1000);
    hScrollPane.getNode().setLayoutY(150);
    FXUtils.observeWidthCenter(this.getContentPane(), hScrollPane.getNode());

    this.getContentPane().getChildren().addAll(msgLabel, hScrollPane.getNode());
  }
  title(): string { return 'Non-Standard VTableView'; }
}

export class LogConsole09bDemoScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel(
      'The LogConsole component. Click the log line to copy.\n' +
      'Launch VFX with -Dio.vproxy.vfx.logLevel and -Dio.vproxy.vfx.consoleLogLevel to modify the log levels.',
    );
    centerNodeAtY(this, msgLabel, 50);

    const console = new LogConsole();
    FXUtils.observeWidth(this.getContentPane(), console.getNode());
    FXUtils.observeHeight(this.getContentPane(), console.getNode(), -250);
    console.getNode().setLayoutY(150);

    const makeLogBtn = new FusionButton('Make Some Log');
    makeLogBtn.setPrefWidth(165);
    makeLogBtn.setPrefHeight(40);
    makeLogBtn.setOnAction(() => {
      Logger.alert(LogConsole09bDemoScene.LOG_TEMPLATES[Math.floor(Math.random() * LogConsole09bDemoScene.LOG_TEMPLATES.length)]);
    });

    const scrollCheckBox = new CheckBox('Always scroll to end');
    scrollCheckBox.setTextFill(Theme.current().normalTextColor());
    FontManager.get().setFont(scrollCheckBox);
    scrollCheckBox.setSelected(console.isAlwaysScrollToEnd());
    scrollCheckBox.setOnAction(() => console.setAlwaysScrollToEnd(scrollCheckBox.isSelected()));
    const scrollPane = new FusionPane();
    scrollPane.getNode().setPrefWidth(260);
    scrollPane.getNode().setPrefHeight(40);
    // Center the CheckBox inside the 260x40 FusionPane. CheckBox is inline-flex
    // so wrapping it in a positioning HBox with CENTER alignment keeps it
    // visually centered instead of stuck in the top-left corner.
    const scrollBox = new HBox(scrollCheckBox);
    scrollBox.setAlignment(Pos.CENTER);
    scrollBox.setPrefWidth(260 - FusionPane.PADDING_H * 2);
    scrollBox.setPrefHeight(40 - FusionPane.PADDING_V * 2);
    scrollPane.getContentPane().getChildren().add(scrollBox);

    const bottomButtons = new HBox(scrollPane.getNode(), new HPadding(20), makeLogBtn);
    bottomButtons.setLayoutX(10);
    this.getContentPane().heightProperty.addListener((_old, now) => {
      if (now === null) return;
      bottomButtons.setLayoutY(now - 50);
    });

    this.getContentPane().getChildren().addAll(msgLabel, console.getNode(), bottomButtons);
  }

  private static readonly LOG_TEMPLATES = [
    'Hello World',
    'Hello VFX',
    'Long Log: a b c d e f g h i j k l m n o p q r s t u v w x y z, Long Long long log 0 1 2 3 4 5 6 7 8 9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z',
    'Multi Line Log\nThis is a multi-line log',
  ];

  title(): string { return 'LogConsole'; }
}

export class ComponentsXxbDemoScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidth();

    const buttonBtn = new FusionButton('This is a\nFusionButton');
    buttonBtn.setPrefWidth(200);
    buttonBtn.setPrefHeight(100);

    const alertBtn = new FusionButton('SimpleAlert');
    alertBtn.setPrefWidth(200);
    alertBtn.setPrefHeight(100);
    alertBtn.setOnAction(() => {
      void SimpleAlert.showAndWait(SimpleAlert.AlertType.INFORMATION, 'call SimpleAlert.showAndWait(...)');
    });

    const stacktraceBtn = new FusionButton('StackTraceAlert');
    stacktraceBtn.setPrefWidth(200);
    stacktraceBtn.setPrefHeight(100);
    stacktraceBtn.setOnAction(() => {
      void StackTraceAlert.showAndWait('Click the stacktrace to copy', new Error('demo'));
    });

    const dialogBtn = new FusionButton('VDialog');
    dialogBtn.setPrefWidth(200);
    dialogBtn.setPrefHeight(100);
    dialogBtn.setOnAction(async () => {
      const result = await VDialog.open<number>({
        message: 'Choose a number',
        buttons: [
          { name: '1', value: 1 },
          { name: '2', value: 2 },
          { name: '3', value: 3 },
        ],
      });
      void SimpleAlert.showAndWait(SimpleAlert.AlertType.INFORMATION, 'dialog result is ' + result);
    });

    const keyChooserBtn = new FusionButton('KeyChooser');
    keyChooserBtn.setPrefWidth(200);
    keyChooserBtn.setPrefHeight(100);
    keyChooserBtn.setOnAction(async () => {
      const keyOpt = await KeyChooser.askKey();
      void SimpleAlert.showAndWait(SimpleAlert.AlertType.INFORMATION, 'the chosen key is ' + keyOpt);
    });

    const toggleSwitch = new ToggleSwitch();

    const noAnimBtn = new FusionButton('FusionButton\nsetDisableAnimation(true)');
    noAnimBtn.setPrefWidth(400);
    noAnimBtn.setPrefHeight(100);
    noAnimBtn.setDisableAnimation(true);

    const onlyAnimBtn = new FusionButton('FusionButton\nsetOnlyAnimateWhenNotClicked(true)');
    onlyAnimBtn.setPrefWidth(400);
    onlyAnimBtn.setPrefHeight(100);
    onlyAnimBtn.setOnlyAnimateWhenNotClicked(true);

    const slider = new VSlider();
    slider.setLength(500);
    slider.setOnAction(() => {
      void SimpleAlert.showAndWait(SimpleAlert.AlertType.INFORMATION, 'button clicked without moving');
    });

    const rightToLeftSlider = new VSlider(SliderDirection.RIGHT_TO_LEFT);
    rightToLeftSlider.setLength(500);

    const rangeSlider = new VRangeSlider();
    rangeSlider.setLength(500);
    rangeSlider.setMinPercentage(1 / 6);
    rangeSlider.setMaxPercentage(2 / 3);
    rangeSlider.setMinOnAction(() => {
      void SimpleAlert.showAndWait(SimpleAlert.AlertType.INFORMATION, '`min` button clicked without moving');
    });
    rangeSlider.setMaxOnAction(() => {
      void SimpleAlert.showAndWait(SimpleAlert.AlertType.INFORMATION, '`max` button clicked without moving');
    });

    const rightToLeftRangeSlider = new VRangeSlider(SliderDirection.RIGHT_TO_LEFT);
    rightToLeftRangeSlider.setLength(500);
    rightToLeftRangeSlider.setMinPercentage(1 / 6);
    rightToLeftRangeSlider.setMaxPercentage(2 / 3);

    const topToBottomSlider = new VSlider(SliderDirection.TOP_TO_BOTTOM);
    topToBottomSlider.setLength(500);

    const bottomToTopSlider = new VSlider(SliderDirection.BOTTOM_TO_TOP);
    bottomToTopSlider.setLength(500);

    const topToBottomRangeSlider = new VRangeSlider(SliderDirection.TOP_TO_BOTTOM);
    topToBottomRangeSlider.setLength(500);
    topToBottomRangeSlider.setMinPercentage(1 / 6);
    topToBottomRangeSlider.setMaxPercentage(2 / 3);

    const bottomToTopRangeSlider = new VRangeSlider(SliderDirection.BOTTOM_TO_TOP);
    bottomToTopRangeSlider.setLength(500);
    bottomToTopRangeSlider.setMinPercentage(1 / 6);
    bottomToTopRangeSlider.setMaxPercentage(2 / 3);

    const verticalSliders = new HBox(
      topToBottomSlider,
      bottomToTopSlider,
      topToBottomRangeSlider,
      bottomToTopRangeSlider,
    );
    verticalSliders.setSpacing(50);

    const gridPane = new GridPane();
    gridPane.setHgap(50);
    gridPane.setVgap(50);
    gridPane.setAlignment(Pos.CENTER);
    gridPane.setLayoutY(60);
    FXUtils.observeWidthCenter(this.getContentPane(), gridPane);
    gridPane.add(buttonBtn, 0, 0);
    gridPane.add(alertBtn, 1, 0);
    gridPane.add(stacktraceBtn, 2, 0);
    gridPane.add(dialogBtn, 0, 1);
    gridPane.add(keyChooserBtn, 1, 1);
    gridPane.add(toggleSwitch.getNode(), 2, 1);
    gridPane.add(noAnimBtn, 0, 2, 2, 1);
    gridPane.add(onlyAnimBtn, 0, 3, 2, 1);
    gridPane.add(slider, 0, 4, 3, 1);
    gridPane.add(rightToLeftSlider, 0, 5, 3, 1);
    gridPane.add(rangeSlider, 0, 6, 3, 1);
    gridPane.add(rightToLeftRangeSlider, 0, 7, 3, 1);
    // Java puts this HBox at (col 0, row 8) as a 1×1 cell. CSS Grid's
    // auto-sized columns take the max-content width per column, so a 270px-
    // wide HBox (4×30px sliders + 3×50px gaps) in col 0 alone forces col 0
    // to ~270px while cols 1 and 2 stay at ~200px — that's why the gap
    // between the top row's first and second buttons looks much wider than
    // between the second and third. JavaFX's GridPane column sizing spreads
    // span-2/span-3 constraints across columns and arrives at near-uniform
    // widths; CSS Grid does not. Spanning the HBox across all 3 columns
    // removes the col-0-only widening, gives the sliders room to lay out
    // naturally (justify-self default = start, so they still pack at the
    // left, matching the Java visual), and lets all three columns settle
    // to the same 200px width.
    gridPane.add(verticalSliders, 0, 8, 3, 1);
    gridPane.add(new Label(), 0, 9);

    // The ToggleSwitch is 90×30 inside a ~200×100 cell. CSS Grid's default
    // item alignment is start/start, so the switch sits in the top-left
    // corner of its cell — visually misaligned next to the 200×100 buttons
    // in the rest of the row. Center it explicitly. JavaFX GridPane also
    // defaults to top-left placement, but the cell there is sized to the
    // toggle's prefSize (the surrounding buttons determine the row height,
    // not the toggle), so the asymmetry is much less obvious. In our port
    // the toggle shares the same oversized cell as the buttons, hence the
    // explicit centering.
    toggleSwitch.getNode().el.style.justifySelf = 'center';
    toggleSwitch.getNode().el.style.alignSelf = 'center';

    this.getContentPane().getChildren().add(gridPane);
  }
  title(): string { return 'Components Demo'; }
}

export class ComponentsXxcDemo2Scene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel('Some components are suitable for image backgrounds.');
    FontManager.get().setFont(msgLabel, (s) => s.setSize(30));
    centerNodeAtY(this, msgLabel, 100);

    this.setBackgroundImage(ImageManager.get().load('intro/res/bg1.png'));

    const transparentButton = new TransparentFusionButton('TransparentFusionButton');
    transparentButton.setPrefWidth(300);
    transparentButton.setPrefHeight(100);
    transparentButton.getTextNode().setTextFill(Color.BLACK);

    const transparentFusionPane = new TransparentFusionPane(false);
    const tfpLabel = new ThemeLabel('TransparentFusionPane');
    tfpLabel.setTextFill(Color.BLACK);
    transparentFusionPane.getContentPane().getChildren().add(tfpLabel);

    const transparentContentFusionPane = new TransparentContentFusionPane(false);
    const tcfpLabel = new ThemeLabel('TransparentContentFusionPane');
    tcfpLabel.setTextFill(Color.BLACK);
    transparentContentFusionPane.getContentPane().getChildren().add(tcfpLabel);

    const gridPane = new GridPane();
    gridPane.setHgap(20);
    gridPane.setVgap(20);
    gridPane.setLayoutY(250);
    FXUtils.observeWidthCenter(this.getContentPane(), gridPane);
    gridPane.add(transparentButton, 0, 0, 2, 1);
    gridPane.add(transparentFusionPane.getNode(), 0, 1);
    gridPane.add(transparentContentFusionPane.getNode(), 0, 2);

    this.getContentPane().getChildren().addAll(msgLabel, gridPane);
  }
  title(): string { return 'Components Demo with Image Bg'; }
}

class CircleBtn extends Group {
  index = 0;
  readonly nodeName: string;
  readonly node: AnimationNode<XYData>;
  private readonly circles: CircleBtn[];
  private readonly label: Label;

  constructor(nodeName: string, x: number, y: number, agb: AnimationGraphBuilder<XYData>, circles: CircleBtn[]) {
    super();
    this.nodeName = nodeName;
    const circle = new Circle(20);
    circle.setStrokeWidth(0);
    circle.setFill(Color.WHITE);
    this.label = new Label();
    this.label.setFont(`24px ${FontManager.FONT_NAME_JetBrainsMono}`);
    this.getChildren().addAll(circle, this.label);
    this.setLayoutX(x);
    this.setLayoutY(y);
    this.node = new AnimationNode<XYData>(nodeName, new XYData(x, y));
    agb.addNode(this.node);
    this.circles = circles;
    circles.push(this);
    this.unsetIndex();
    this.setCursor('pointer');
    this.el.addEventListener('click', () => this.onClick());
  }

  private onClick(): void {
    if (this.index === 0) {
      let max = 0;
      for (const c of this.circles) {
        if (c.index > max) max = c.index;
      }
      this.setIndex(max + 1);
    } else {
      for (const c of this.circles) {
        if (c.index !== 0 && c.index > this.index) {
          c.setIndex(c.index - 1);
        }
      }
      this.unsetIndex();
    }
  }

  setIndex(index: number): void {
    this.index = index;
    this.label.setText(String(index));
    const bounds = FXUtils.calculateTextBounds(this.label);
    this.label.setLayoutX(-bounds.width / 2);
    this.label.setLayoutY(-bounds.height / 2);
  }

  unsetIndex(): void {
    this.index = 0;
    this.label.setText(this.nodeName);
    const bounds = FXUtils.calculateTextBounds(this.label);
    this.label.setLayoutX(-bounds.width / 2);
    this.label.setLayoutY(-bounds.height / 2);
  }
}

function animationLine(a: CircleBtn, b: CircleBtn, distance: number, agb: AnimationGraphBuilder<XYData>): Group {
  const line = new Line();
  line.setStrokeWidth(2);
  line.setStroke(Color.WHITE);
  line.setStartX(a.getLayoutX());
  line.setStartY(a.getLayoutY());
  line.setEndX(b.getLayoutX());
  line.setEndY(b.getLayoutY());

  const label = new Label(String(distance));
  label.setFont(`20px ${FontManager.FONT_NAME_JetBrainsMono}`);
  label.setBackground(new Background(new BackgroundFill(Color.WHITE, CornerRadii.EMPTY, Insets.EMPTY)));
  const bounds = FXUtils.calculateTextBounds(label);
  const midX = (a.getLayoutX() + b.getLayoutX()) / 2;
  const midY = (a.getLayoutY() + b.getLayoutY()) / 2;
  label.setLayoutX(midX - bounds.width / 2);
  label.setLayoutY(midY - bounds.height / 2);

  agb.addEdge(a.node, b.node, distance * 100);
  agb.addEdge(b.node, a.node, distance * 100);

  const grp = new Group();
  grp.getChildren().addAll(line, label);
  return grp;
}

export class Animation07bDemoScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();

    const msgLabel = new ThemeLabel(
      'The nodes are animation states, and the edges are the animating time from state to state.\n' +
      'Click the circles to select animating order, and hit \'Play\' button to play.',
    );
    FXUtils.observeWidthCenter(this.getContentPane(), msgLabel as unknown as Parent);
    msgLabel.setLayoutY(60);

    const agb = new AnimationGraphBuilder<XYData>();
    const circles: CircleBtn[] = [];
    const a = new CircleBtn('a', 60, 180, agb, circles);
    const b = new CircleBtn('b', 150, 60, agb, circles);
    const c = new CircleBtn('c', 330, 60, agb, circles);
    const d = new CircleBtn('d', 420, 180, agb, circles);
    const e = new CircleBtn('e', 330, 300, agb, circles);
    const f = new CircleBtn('f', 240, 180, agb, circles);
    const g = new CircleBtn('g', 150, 300, agb, circles);

    const content = new FusionPane();
    content.getNode().setPrefWidth(480);
    content.getNode().setPrefHeight(360);
    content.getNode().setLayoutY(150);
    FXUtils.observeWidthCenter(this.getContentPane(), content.getNode());

    content.getContentPane().getChildren().addAll(
      animationLine(a, b, 12, agb),
      animationLine(a, g, 14, agb),
      animationLine(a, f, 16, agb),
      animationLine(b, c, 10, agb),
      animationLine(b, f, 7, agb),
      animationLine(c, d, 3, agb),
      animationLine(c, e, 5, agb),
      animationLine(c, f, 6, agb),
      animationLine(d, e, 4, agb),
      animationLine(e, f, 2, agb),
      animationLine(e, g, 8, agb),
      animationLine(f, g, 9, agb),
    );
    content.getContentPane().getChildren().addAll(a, b, c, d, e, f, g);

    const point = new Circle(10);
    point.setFill(Color.RED);
    point.setVisible(false);
    content.getContentPane().getChildren().add(point);

    agb.setApply((_from, _to, data) => {
      point.setLayoutX(data.x);
      point.setLayoutY(data.y);
    });
    const animation = agb.build(a.node);

    const resetBtn = new FusionButton('reset');
    resetBtn.setPrefWidth(200);
    resetBtn.setPrefHeight(50);
    resetBtn.setOnAction(() => {
      for (const n of circles) n.unsetIndex();
    });

    const playBtn = new FusionButton('play');
    playBtn.setPrefWidth(200);
    playBtn.setPrefHeight(50);

    const softStopBtn = new FusionButton('soft stop');
    softStopBtn.setDisabled(true);
    softStopBtn.setPrefWidth(200);
    softStopBtn.setPrefHeight(50);

    const resetAll = (): void => {
      playBtn.setDisabled(false);
      resetBtn.setDisabled(false);
      softStopBtn.setDisabled(true);
      point.setVisible(false);
      for (const n of circles) n.unsetIndex();
    };

    playBtn.setOnAction(() => {
      const nodes: AnimationNode<XYData>[] = [];
      circles
        .filter((n) => n.index !== 0)
        .sort((x, y) => x.index - y.index)
        .forEach((n) => nodes.push(n.node));
      if (nodes.length === 0) return;
      const first = nodes.shift()!;
      if (nodes.length === 0) return;
      playBtn.setDisabled(true);
      resetBtn.setDisabled(true);
      softStopBtn.setDisabled(false);
      point.setVisible(true);
      animation.stopAndSetNode(first);
      animation.play(nodes, new (class extends Callback<void, Error> {
        protected onSucceeded(_value: void | null): void {
          resetAll();
        }
        protected onFailed(err: Error): void {
          if (err instanceof AnimationInterrupted) return;
          resetAll();
          void SimpleAlert.showAndWait(SimpleAlert.AlertType.ERROR, err.message);
        }
      })());
    });
    softStopBtn.setOnAction(() => {
      softStopBtn.setDisabled(true);
      animation.play(animation.getCurrentNode(), Callback.ofFunction(() => resetAll()));
    });

    const buttonPane = new FusionPane(false);
    buttonPane.getContentPane().getChildren().add(new HBox(
      resetBtn,
      new HPadding(15),
      playBtn,
      new HPadding(15),
      softStopBtn,
    ));
    FXUtils.observeWidthCenter(this.getContentPane(), buttonPane.getNode());
    buttonPane.getNode().setLayoutY(550);

    this.getContentPane().getChildren().addAll(msgLabel, content.getNode(), buttonPane.getNode());
  }
  title(): string { return 'Animation System Demo'; }
}
