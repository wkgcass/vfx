export class VSceneGroupInitParams {
  gradientCover = false;
  useClip = true;

  setGradientCover(v: boolean): this {
    this.gradientCover = v;
    return this;
  }
  setUseClip(v: boolean): this {
    this.useClip = v;
    return this;
  }
}
