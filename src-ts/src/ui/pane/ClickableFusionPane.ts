import { Theme } from '../../theme/Theme.js';
import { Color } from '../../javafx/color.js';
import type { VMouseEvent } from '../../javafx/Node.js';
import { FusionPane } from './FusionPane.js';
import { FusionPaneImpl } from './FusionPane.js';

export type ClickableFusionPaneHandler = (e: VMouseEvent | null) => void;

export class ClickableFusionPane extends FusionPane {
  private handler: ClickableFusionPaneHandler | null = null;

  constructor();
  constructor(manuallyHandleOuterRegion: boolean);
  constructor(manuallyHandleOuterRegion?: boolean) {
    super(manuallyHandleOuterRegion ?? true);
    this.getNode().setCursor('pointer');
  }

  protected override buildRootNode() {
    const outer = this;
    return new (class extends FusionPaneImpl {
      protected override downColor(): Color {
        return Theme.current().fusionButtonDownBackgroundColor();
      }

      protected override onMouseClicked(): void {
        const h = outer.handler;
        if (h !== null) {
          h(null);
        }
      }
    })(outer);
  }

  setOnAction(handler: ClickableFusionPaneHandler | null): void {
    this.handler = handler;
  }
}
