// A horizontal spacer used in HBox. In JavaFX, setMaxWidth(0) + padding
// makes the pane reserve (padding) px in the HBox layout because JavaFX's
// computePrefWidth includes padding. In CSS flex layout, max-width:0 would
// collapse the element to 0 and the padding would be invisible — so the
// TS port sets the element's width directly to `padding`.

import { Pane } from '../../javafx/Pane.js';

export class HPadding extends Pane {
  constructor(padding: number) {
    super();
    this.setVisible(false);
    this.setPrefWidth(padding);
    this.setMaxWidth(padding);
  }
}
