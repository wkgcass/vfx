import { Color } from '../../javafx/color.js';
import { Theme } from '../../theme/Theme.js';
import { FusionButton } from './FusionButton.js';

export class TransparentFusionButton extends FusionButton {
  constructor();
  constructor(text: string);
  constructor(text: string | null = null) {
    super(text);
    this.setOnlyAnimateWhenNotClicked(true);
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
