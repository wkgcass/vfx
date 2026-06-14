import { TransparentFusionPane } from './TransparentFusionPane.js';
import { TransparentFusionPaneImpl } from './TransparentFusionPane.js';

export class TransparentContentFusionPane extends TransparentFusionPane {
  constructor();
  constructor(manuallyHandleOuterRegion: boolean);
  constructor(manuallyHandleOuterRegion?: boolean) {
    super(manuallyHandleOuterRegion ?? true);
  }

  protected override buildRootNode() {
    return new TransparentContentFusionPaneImpl(this);
  }
}

export class TransparentContentFusionPaneImpl extends TransparentFusionPaneImpl {
  override normalContentOpacity(): number {
    return 0.5;
  }
}
