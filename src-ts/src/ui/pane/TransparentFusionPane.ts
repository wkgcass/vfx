import { Color } from '../../javafx/color.js';
import { Theme } from '../../theme/Theme.js';
import { FusionPane } from './FusionPane.js';
import { FusionPaneImpl } from './FusionPane.js';

export class TransparentFusionPane extends FusionPane {
  constructor();
  constructor(manuallyHandleOuterRegion: boolean);
  constructor(manuallyHandleOuterRegion?: boolean) {
    super(manuallyHandleOuterRegion ?? true);
  }

  protected override buildRootNode() {
    return new TransparentFusionPaneImpl(this);
  }
}

export class TransparentFusionPaneImpl extends FusionPaneImpl {
  protected override normalColor(): Color {
    return Theme.current().transparentFusionPaneNormalBackgroundColor();
  }

  protected override hoverColor(): Color {
    return Theme.current().transparentFusionPaneHoverBackgroundColor();
  }
}
