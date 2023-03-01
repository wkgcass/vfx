package io.vproxy.vfx.ui.loading;

import io.vproxy.base.util.callback.Callback;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.stage.VStage;
import io.vproxy.vfx.ui.stage.VStageInitParams;
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

    public void load(Callback<Void, LoadingFailure> cb) {
        show();
        loadingPane.getProgressBar().load(new Callback<>() {
            @Override
            protected void onSucceeded(Void value) {
                cb.succeeded();
            }

            @Override
            protected void onFailed(LoadingFailure failure) {
                cb.failed(failure);
            }

            @Override
            protected void doFinally() {
                close();
            }
        });
    }

    public void terminate() {
        loadingPane.getProgressBar().terminate();
    }
}
