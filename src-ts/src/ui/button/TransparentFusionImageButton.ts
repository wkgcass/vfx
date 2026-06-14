import { Color } from '../../javafx/color.js';
import { FXImage } from '../../javafx/ImageView.js';
import { Theme } from '../../theme/Theme.js';
import { FusionImageButton } from './FusionImageButton.js';

export class TransparentFusionImageButton extends FusionImageButton {
  constructor();
  constructor(image: FXImage | null);
  constructor(image: FXImage | null = null) {
    super(image);
  }

  protected override normalColor(): Color {
    return Theme.current().transparentFusionButtonNormalBackgroundColor();
  }

  protected override hoverColor(): Color {
    return Theme.current().transparentFusionButtonHoverBackgroundColor();
  }

  protected override downColor(): Color {
    return Theme.current().transparentFusionButtonDownBackgroundColor();
  }
}
