package io.vproxy.vfx.ui.loading;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.layout.VPadding;
import javafx.scene.control.Label;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;

public class LoadingPane extends Pane {
    private final Label label = new Label() {{
        FontManager.get().setFont(FontUsages.loading, this);
        setTextFill(Theme.current().normalTextColor());
    }};
    private final VProgressBar progressBar = new VProgressBar();

    public LoadingPane(String defaultText) {
        label.setText(defaultText);
        getChildren().add(new VBox(
            label,
            new VPadding(15),
            progressBar
        ));
        progressBar.setCurrentLoadingItemCallback(item -> label.setText(item.name));
    }

    public void setLength(double length) {
        progressBar.setLength(length);
    }

    public VProgressBar getProgressBar() {
        return progressBar;
    }
}
