import type { VScene } from '../scene/VScene.js';

export class VStageInitParams {
  closeButton = true;
  maximizeAndResetButton = true;
  iconifyButton = true;
  resizable = true;
  initialScene: VScene | null = null;

  setCloseButton(v: boolean): this {
    this.closeButton = v;
    return this;
  }
  setMaximizeAndResetButton(v: boolean): this {
    this.maximizeAndResetButton = v;
    return this;
  }
  setIconifyButton(v: boolean): this {
    this.iconifyButton = v;
    return this;
  }
  setResizable(v: boolean): this {
    this.resizable = v;
    return this;
  }
  setInitialScene(s: VScene): this {
    this.initialScene = s;
    return this;
  }
}
