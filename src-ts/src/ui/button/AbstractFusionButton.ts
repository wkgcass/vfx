import { Color } from '../../javafx/color.js';
import { Theme } from '../../theme/Theme.js';
import { AbstractFusionPane } from '../pane/AbstractFusionPane.js';

export abstract class AbstractFusionButton extends AbstractFusionPane {
  protected abstract override onMouseClicked(): void;

  protected override normalColor(): Color {
    return Theme.current().fusionButtonNormalBackgroundColor();
  }

  protected override hoverColor(): Color {
    return Theme.current().fusionButtonHoverBackgroundColor();
  }

  protected override downColor(): Color {
    return Theme.current().fusionButtonDownBackgroundColor();
  }
}
