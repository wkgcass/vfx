// In JavaFX, setMaxHeight(0) + padding reserves space because computePrefHeight includes padding.
// CSS flex collapses max-height:0, so we set height directly to `padding`.

import { Pane } from '../../javafx/Pane.js';

export class VPadding extends Pane {
  constructor(padding: number) {
    super();
    this.setVisible(false);
    this.setPrefHeight(padding);
    this.setMaxHeight(padding);
  }
}
