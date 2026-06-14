import { Label } from '../../javafx/Label.js';
import { Group, Pane } from '../../javafx/Pane.js';
import { HBox } from '../../javafx/HBox.js';
import { VBox } from '../../javafx/VBox.js';
import { Node } from '../../javafx/Node.js';
import { Pos } from '../../javafx/layout.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { Theme } from '../../theme/Theme.js';
import { FusionButton } from '../../ui/button/FusionButton.js';
import { FusionPane } from '../../ui/pane/FusionPane.js';
import { HPadding } from '../../ui/layout/HPadding.js';
import { VPadding } from '../../ui/layout/VPadding.js';
import { VStage } from '../../ui/stage/VStage.js';
import { VStageInitParams } from '../../ui/stage/VStageInitParams.js';
import { FXUtils } from '../../util/FXUtils.js';
import { VDialogButton } from './VDialogButton.js';
import { Windows } from '../../window/WindowManager.js';

export class VDialog<T> {
  protected static readonly BUTTON_HEIGHT = 45;
  protected static readonly BUTTON_PANE_HEIGHT = VDialog.BUTTON_HEIGHT + FusionPane.PADDING_V * 2;

  protected readonly stage: VStage;
  private readonly messageLabel: Label = new Label();
  private readonly content: Group;
  private readonly buttonPane: FusionPane = new FusionPane();
  private readonly buttonHBox: HBox = new HBox();

  protected returnValue: T | null = null;

  /**
   * Optional callback invoked when a button is clicked (just before close).
   * Set by the child-window factory so the dialog's result is forwarded to
   * the parent window via the WindowManager event bus. Null in legacy
   * single-window usage.
   */
  onResult: ((value: T | null) => void) | null = null;

  constructor() {
    const initParams = new VStageInitParams();
    this.stage = new VStage(initParams);
    this.content = new Group();
    this.content.getChildren().add(this.messageLabel);

    this.stage.getStage().setWidth(900);
    void this.stage.getStage().centerOnScreen();

    this.messageLabel.setWrapText(true);
    FontManager.get().setFont(FontUsages.dialogText, this.messageLabel);
    this.messageLabel.setTextFill(Theme.current().normalTextColor());

    this.buttonPane.getContentPane().getChildren().add(this.buttonHBox);
    this.buttonPane.getNode().setPrefHeight(VDialog.BUTTON_PANE_HEIGHT);

    this.buttonHBox.setAlignment(Pos.CENTER_RIGHT);
    this.buttonHBox.setSpacing(5);
    FXUtils.observeWidth(this.buttonPane.getContentPane(), this.buttonHBox);

    const initialScene = this.stage.getInitialScene();
    FXUtils.observeWidth(
      initialScene.getScrollPane().getNode() as unknown as Pane,
      initialScene.getContentPane(),
      -1,
    );

    const root = initialScene.getContentPane();
    root.widthProperty.addListener((_old, now) => {
      const w = now;
      this.messageLabel.setPrefWidth(w - 20);
      this.buttonPane.getNode().setPrefWidth(w - 20);
    });
    root.heightProperty.addListener((_old, now) => {
      let h = now;
      h = VStage.TITLE_BAR_HEIGHT + h + 10;
      void this.stage.getStage().setHeight(h);
    });
    FXUtils.forceUpdate(this.stage.getStage());
    root.getChildren().add(new HBox(
      new HPadding(10),
      new VBox(
        new VPadding(10),
        this.content,
        new VPadding(10),
        this.buttonPane.getNode(),
      ),
    ));
  }

  setText(text: string): void {
    this.messageLabel.setText(text);
  }

  getMessageNode(): Label {
    return this.messageLabel;
  }

  setButtons(buttons: VDialogButton<T>[]): void {
    this.buttonHBox.getChildren().clear();
    const ls: Node[] = [];
    for (const btn of buttons) {
      const name = btn.name;
      const button = new FusionButton(name);
      const textBounds = FXUtils.calculateTextBounds(button.getTextNode());
      button.setPrefWidth(Math.max(textBounds.width + 40, 120));
      button.setPrefHeight(VDialog.BUTTON_HEIGHT);
      ls.push(button);
      button.setOnAction(() => {
        if (btn.provider !== null) {
          this.returnValue = btn.provider();
        }
        this.onButtonClicked(btn);
        void this.stage.close();
      });
      btn.button = button;
    }
    this.buttonHBox.getChildren().addAll(...ls);
  }

  getCleanContent(): Group {
    this.content.getChildren().remove(this.messageLabel);
    return this.content;
  }

  protected onButtonClicked(_btn: VDialogButton<T>): void {
    if (this.onResult) this.onResult(this.returnValue);
  }

  async showAndWait(): Promise<T | null> {
    await this.stage.showAndWait();
    await this.getStage().temporaryOnTop();
    return this.returnValue;
  }

  getStage(): VStage {
    return this.stage;
  }

  /**
   * Open this dialog in a new OS window and resolve with the button's
   * return value (or null if the window was closed without a click).
   *
   * `buttons[].value` must be JSON-serializable so it can cross the
   * webview boundary via Tauri events.
   */
  static async open<T>(spec: {
    message: string;
    buttons: { name: string; value: T }[];
    width?: number;
    height?: number;
  }): Promise<T | null> {
    const handle = await Windows.open({
      kind: 'vdialog',
      title: 'VFX',
      width: spec.width ?? 900,
      height: spec.height ?? 200,
      params: {
        message: spec.message,
        buttons: spec.buttons,
      },
    });
    return handle.result<T>();
  }
}
