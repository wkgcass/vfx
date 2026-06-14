import { Pane } from '../../javafx/Pane.js';
import { Label } from '../../javafx/Label.js';
import { VBox } from '../../javafx/VBox.js';
import { FontManager } from '../../manager/font/FontManager.js';
import { FontUsages } from '../../manager/font/FontUsages.js';
import { Theme } from '../../theme/Theme.js';
import { VPadding } from '../layout/VPadding.js';
import { VProgressBar } from './VProgressBar.js';

export class LoadingPane extends Pane {
  private readonly label: Label;
  private readonly progressBar: VProgressBar = new VProgressBar();

  constructor(defaultText: string) {
    super();
    this.label = new Label();
    FontManager.get().setFont(FontUsages.loading, this.label);
    this.label.setTextFill(Theme.current().normalTextColor());
    this.label.setText(defaultText);

    this.getChildren().add(new VBox(
      this.label,
      new VPadding(15),
      this.progressBar,
    ));

    this.progressBar.setCurrentLoadingItemCallback((item) => {
      this.label.setText(item.name);
    });
  }

  setLength(length: number): void {
    this.progressBar.setLength(length);
  }

  setCurrentItemName(name: string): void {
    this.label.setText(name);
  }

  getProgressBar(): VProgressBar {
    return this.progressBar;
  }
}
