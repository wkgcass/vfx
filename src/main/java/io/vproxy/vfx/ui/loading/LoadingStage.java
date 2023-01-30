package io.vproxy.vfx.ui.loading;

import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.stage.VStage;
import io.vproxy.vfx.ui.stage.VStageInitParams;
import io.vproxy.vfx.util.Callback;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;

import java.util.List;

public class LoadingStage extends VStage {
    private final LoadingPane loadingPane;

    public LoadingStage(String title) {
        super(new VStageInitParams()
            .setIconifyButton(false)
            .setMaximizeAndResetButton(false)
            .setResizable(false));

        loadingPane = new LoadingPane(title);

        setTitle(title);
        getStage().setWidth(670);
        getStage().setHeight(120);

        var pane = getInitialScene().getContentPane();
        pane.getChildren().add(new HBox(
            new HPadding(10),
            new VBox(
                new VPadding(15),
                loadingPane
            )
        ));
        loadingPane.setLength(640);
    }

    @Override
    public void close() {
        super.close();
        terminate();
    }

    public void setItems(List<LoadingItem> items) {
        loadingPane.getProgressBar().setItems(items);
    }

    public void setInterval(long interval) {
        loadingPane.getProgressBar().setInterval(interval);
    }

    public void load(Callback<Void, LoadingItem> cb) {
        show();
        loadingPane.getProgressBar().load(new Callback<>() {
            @Override
            protected void succeeded0(Void value) {
                cb.succeeded();
            }

            @Override
            protected void failed0(LoadingItem loadingItem) {
                cb.failed(loadingItem);
            }

            @Override
            protected void finally0() {
                close();
            }
        });
    }

    public void terminate() {
        loadingPane.getProgressBar().terminate();
    }
}
