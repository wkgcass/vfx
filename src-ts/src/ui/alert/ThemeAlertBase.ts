import { HBox } from '../../javafx/HBox.js';
import { VBox } from '../../javafx/VBox.js';
import { Pos } from '../../javafx/layout.js';
import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';
import { FusionButton } from '../button/FusionButton.js';
import { HPadding } from '../layout/HPadding.js';
import { VPadding } from '../layout/VPadding.js';
import { VStage } from '../stage/VStage.js';
import { VStageInitParams } from '../stage/VStageInitParams.js';

export class ThemeAlertBase extends VStage {
  public static readonly PADDING_H = 20;

  protected readonly alertMessagePane: VBox = new VBox();
  protected readonly okButton: FusionButton;

  constructor() {
    super(
      new VStageInitParams()
        .setIconifyButton(false)
        .setMaximizeAndResetButton(false)
        .setResizable(false),
    );

    this.okButton = new FusionButton(InternalI18n.get().alertOkButton());
    this.okButton.setPrefWidth(120);
    this.okButton.setPrefHeight(45);

    void this.getStage().centerOnScreen();

    const root = this.getInitialScene().getContentPane();

    const buttonRow = new HBox(this.okButton);
    buttonRow.setAlignment(Pos.CENTER_RIGHT);

    // Capture the outer content HBox so the height listener below can
    // observe the *content's* natural height. The Java original listens
    // to `root.heightProperty()` because JavaFX Panes auto-size to their
    // children's preferred bounds — the contentPane literally grows with
    // its content. The TS port's Pane has absolute-positioned children
    // and CSS offsetHeight stays 0 regardless of content, so listening to
    // root.heightProperty never fires after the initial layout and the
    // window stays at the Windows.open default (200px), leaving a large
    // empty area below the OK button. Listening to the HBox instead
    // tracks the real content height (label wrap → alertMessagePane →
    // VBox → HBox) and resizes the stage to fit.
    const contentBox = new HBox(
      new HPadding(ThemeAlertBase.PADDING_H),
      new VBox(
        this.alertMessagePane,
        new VPadding(15),
        buttonRow,
        new VPadding(10),
      ),
      new HPadding(ThemeAlertBase.PADDING_H),
    );
    root.getChildren().add(contentBox);

    void this.getStage().setWidth(720);

    contentBox.heightProperty.addListener((_old, now) => {
      if (now === null) return;
      let h: number = now;
      h = VStage.TITLE_BAR_HEIGHT + h + 2;
      if (h > 800) h = 800;
      void this.getStage().setHeight(h);
    });

    this.okButton.setOnAction(() => { void this.close(); });
  }

  /**
   * Java override of `public void show()`. The TS VStage.show() returns
   * Promise<void>; we keep this method sync-shaped and fire-and-forget
   * `super.show()` and `temporaryOnTop()` to preserve Java ordering and
   * the sync return type for callers that just want to pop the dialog.
   */
  show(): Promise<void> {
    void super.show();
    void this.temporaryOnTop();
    return Promise.resolve();
  }

  /**
   * Java override of `public void showAndWait()`. Same fire-and-forget
   * rationale as {@link show}. Callers that need to await must use the
   * static helpers on the subclasses (which `await new X().showAndWait()`
   * on the *inherited* VStage method directly — see SimpleAlert.showAndWait).
   */
  showAndWait(): Promise<void> {
    void super.showAndWait();
    void this.temporaryOnTop();
    return Promise.resolve();
  }
}
