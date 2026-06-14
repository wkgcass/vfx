import { Label } from '../../javafx/Label.js';
import { Theme } from '../../theme/Theme.js';
import { FontManager } from '../../manager/font/FontManager.js';

const _NO_ARG = Symbol('ThemeLabel.NO_ARG');

export class ThemeLabel extends Label {
  constructor();
  constructor(text: string);
  constructor(text: string | typeof _NO_ARG = _NO_ARG) {
    super(text === _NO_ARG ? '' : text);
    this.setTextFill(Theme.current().normalTextColor());
    if (text !== _NO_ARG) {
      FontManager.get().setFont(this);
    }
  }
}
