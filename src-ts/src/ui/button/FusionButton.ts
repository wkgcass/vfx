import { Label } from '../../javafx/Label.js';
import { Pane } from '../../javafx/Pane.js';
import { Color } from '../../javafx/color.js';
import {
  Background,
  Border,
  BorderStroke,
  BorderStrokeDescriptor,
  BorderStrokeStyle,
  BorderWidths,
  CornerRadii,
} from '../../javafx/layout.js';
import { Theme } from '../../theme/Theme.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { FXUtils } from '../../util/FXUtils.js';
import { AbstractFusionButton } from './AbstractFusionButton.js';

export type FusionButtonHandler = (e: unknown) => void;

export class FusionButton extends AbstractFusionButton {
  private readonly text: Label;
  private actionHandler: FusionButtonHandler | null = null;

  private attachedFocusListeners: Array<{ type: string; fn: () => void }> = [];

  private readonly borderLightPane: Pane = new Pane();
  private disableAnimation: boolean = !Theme.current().enableFusionButtonAnimation();
  private internalDisableAnimation: boolean = false;
  private alreadyClicked: boolean = false;
  private onlyAnimateWhenNotClicked: boolean = false;
  private _disabled: boolean = false;

  private animationRafId: number | null = null;
  private animationBeginTs: number = 0;

  constructor();
  constructor(text: string | null);
  constructor(text: string | null = null) {
    super();

    this.text = new Label();
    this.text.setTextFill(Theme.current().fusionButtonTextColor());
    FontManager.get().setFont(FontUsages.fusionButtonText, this.text);

    this.text.textProperty.addListener(() => this.updateTextPosition());
    this.widthProperty.addListener((_old, now) => {
      this.updateTextPosition();
      this.borderLightPane.setPrefWidth(now);
    });
    this.heightProperty.addListener((_old, now) => {
      this.updateTextPosition();
      this.borderLightPane.setPrefHeight(now);
    });
    if (text !== null) {
      this.text.setText(text);
    }
    this.setCursor('pointer');
    this.getChildren().add(this.text);

    this.attachSceneTracking();

    this.setInternalDisableAnimation(true);

    this.borderLightPane.setBorder(new Border(new BorderStroke(new BorderStrokeDescriptor(
      Theme.current().fusionButtonAnimatingBorderLightColor(),
      BorderStrokeStyle.SOLID,
      this.getCornerRadii(),
      BorderWidths.uniform(1.5),
    ))));
    this.borderLightPane.setBackground(Background.EMPTY);
    this.borderLightPane.setOpacity(0);
    this.getChildren().add(this.borderLightPane);

    this.setPrefWidth(64);
    this.setPrefHeight(24);
  }

  private handleDisable(v: boolean): void {
    if (v) {
      this.setCursor('default');
      this.setMouseTransparent(true);
      this.text.setTextFill(Theme.current().fusionButtonDisabledTextColor());
    } else {
      this.setCursor('pointer');
      this.setMouseTransparent(false);
      this.text.setTextFill(Theme.current().fusionButtonTextColor());
      this.startAnimating();
    }
  }

  private updateTextPosition(): void {
    const bounds = FXUtils.calculateTextBounds(this.text);
    this.text.setLayoutX((this.getWidth() - bounds.width) / 2);
    // Vertically center the text block as a whole. The previous
    // implementation forced `height = lineHeight = buttonHeight`, which
    // only rendered the first line of a multi-line label inside the
    // button and pushed the remaining lines (e.g. the "FusionButton" half
    // of "This is a\nFusionButton") below the button's clip rect. Using
    // the actual bounds.height — which calculateTextBounds now computes
    // correctly for multi-line text — lets every line stay inside the
    // button and stay vertically centered. The lineHeight is reset to
    // a standard 1.2 so wrapped lines don't blow up to buttonHeight each.
    this.text.setLayoutY((this.getHeight() - bounds.height) / 2);
    this.text.el.style.height = '';
    this.text.el.style.lineHeight = `${bounds.height / Math.max(1, this.text.getText().split('\n').length)}px`;
  }

  setText(text: string): void {
    this.text.setText(text);
  }

  setOnAction(handler: FusionButtonHandler | null): void {
    this.actionHandler = handler;
  }

  getOnAction(): FusionButtonHandler | null {
    return this.actionHandler;
  }

  protected override onMouseClicked(): void {
    this.alreadyClicked = true;
    const actionHandler = this.actionHandler;
    if (actionHandler === null) {
      return;
    }
    actionHandler(null);
  }

  protected override getCornerRadii(): CornerRadii {
    return CornerRadii.uniform(4);
  }

  getTextNode(): Label {
    return this.text;
  }

  /** Returns true if it's animating after calling this method. */
  startAnimating(): boolean {
    if (this.animationRafId !== null) {
      return true;
    }
    if (this.isDisableAnimation0()) {
      return false;
    }
    this.animationBeginTs = 0;
    this.animationRafId = requestAnimationFrame(this.animationTick);
    return true;
  }

  private animationTick = (): void => {
    const now = performance.now(); // milliseconds
    if (this.animationBeginTs === 0) {
      this.animationBeginTs = now;
    }
    let delta = now - this.animationBeginTs;
    const noAnimate = 2_000;
    const showTime = 3_500;
    const glowTime = 4_000;
    const hideTime = 5_500;
    const fullPeriod = 10_000;
    if (delta > fullPeriod) {
      while (delta > fullPeriod) {
        delta -= fullPeriod;
      }
      this.animationBeginTs = now - delta;
    }
    if (delta < noAnimate) {
      this.borderLightPane.setOpacity(0);
    }
    if (delta < showTime) {
      const p = (delta - noAnimate) / (showTime - noAnimate);
      this.borderLightPane.setOpacity(p);
    } else if (delta < glowTime) {
      this.borderLightPane.setOpacity(1);
    } else if (delta < hideTime) {
      const p = (delta - glowTime) / (hideTime - glowTime);
      this.borderLightPane.setOpacity(1 - p);
    } else {
      this.borderLightPane.setOpacity(0);
      if (this.isDisableAnimation0()) {
        this.animationRafId = null;
        return;
      }
    }
    this.animationRafId = requestAnimationFrame(this.animationTick);
  };

  stopAnimating(): void {
    if (this.animationRafId !== null) {
      cancelAnimationFrame(this.animationRafId);
      this.animationRafId = null;
    }
    this.borderLightPane.setOpacity(0);
  }

  isDisableAnimation(): boolean {
    return this.disableAnimation;
  }

  isDisableAnimation0(): boolean {
    return this.disableAnimation || this.internalDisableAnimation || this._disabled || (this.alreadyClicked && this.onlyAnimateWhenNotClicked);
  }

  setDisableAnimation(disableAnimation: boolean): void {
    this.disableAnimation = disableAnimation;
    if (disableAnimation) {
      this.stopAnimating();
    } else {
      this.startAnimating();
    }
  }

  isOnlyAnimateWhenNotClicked(): boolean {
    return this.onlyAnimateWhenNotClicked;
  }

  setOnlyAnimateWhenNotClicked(onlyAnimateWhenNotClicked: boolean): void {
    this.onlyAnimateWhenNotClicked = onlyAnimateWhenNotClicked;
  }

  private setInternalDisableAnimation(internalDisableAnimation: boolean): void {
    this.internalDisableAnimation = internalDisableAnimation;
    if (internalDisableAnimation) {
      this.stopAnimating();
    } else {
      this.startAnimating();
    }
  }

  isDisabled(): boolean { return this._disabled; }

  setDisabled(v: boolean): void {
    this._disabled = v;
    this.handleDisable(v);
  }

  /**
   * Track when this node is attached/detached from the document, and reflect
   * the document's window focus state into `setInternalDisableAnimation`.
   *
   * In JavaFX the node observes `sceneProperty()` (becomes non-null when the
   * node is added to a Scene), then attaches a listener to the Scene's
   * Window.focusedProperty(). The DOM analog is `document.hasFocus()` +
   * the global `window` `focus`/`blur` events.
   */
  private attachSceneTracking(): void {
    // The original behavior is: if the window is not focused, pause the
    // animation; if focused, resume. We attach lazily because the el may
    // not be in the DOM yet at construction time.
    const checkFocus = () => {
      const isInDoc = this.el.isConnected;
      const focused = isInDoc && document.hasFocus();
      this.setInternalDisableAnimation(!focused);
    };

    // The Java code attaches the window listener once a Scene is set on
    // the node; here we poll for el.isConnected and attach on first connect.
    // Cap at 300 frames (~5s) to avoid spinning forever on a never-attached
    // button.
    let attempts = 0;
    const attach = () => {
      if (this.el.isConnected) {
        const focusFn = () => this.setInternalDisableAnimation(false);
        const blurFn = () => this.setInternalDisableAnimation(true);
        window.addEventListener('focus', focusFn);
        window.addEventListener('blur', blurFn);
        this.attachedFocusListeners.push({ type: 'focus', fn: focusFn });
        this.attachedFocusListeners.push({ type: 'blur', fn: blurFn });
        checkFocus();
      } else if (attempts++ < 300) {
        requestAnimationFrame(attach);
      }
    };
    requestAnimationFrame(attach);
  }
}
