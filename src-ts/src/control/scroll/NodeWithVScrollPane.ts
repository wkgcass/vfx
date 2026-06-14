import type { VScrollPane } from './VScrollPane.js';
import type { Pane } from '../../javafx/Pane.js';

export interface NodeWithVScrollPane {
  getScrollPane(): VScrollPane;
  getSelfNode(): Pane;
}
