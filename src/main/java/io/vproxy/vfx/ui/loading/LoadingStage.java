package io.vproxy.vfx.ui.loading;

import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.manager.task.TaskManager;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.MiscUtils;
import io.vproxy.vfx.util.FXUtils;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class LoadingStage extends Stage {
    private final Label label = new Label() {{
        FontManager.get().setFont(FontUsages.loading, this);
    }};
    private final ProgressBar progressBar = new ProgressBar();
    private List<LoadingItem> items = new ArrayList<>();
    private long interval = 0;
    private Callback<Void, LoadingItem> cb = null;
    private boolean isDone = false;

    public LoadingStage(String title) {
        setTitle(title);
        setWidth(670);
        setHeight(120);
        setResizable(false);

        var pane = new StackPane();
        var scene = new Scene(pane);
        setScene(scene);

        var vbox = new VBox();
        vbox.getChildren().addAll(new VPadding(15), label, new VPadding(15), progressBar);
        vbox.setPadding(new Insets(0, 0, 0, 10));
        pane.getChildren().add(vbox);

        label.setText(title);
        progressBar.setProgress(0);
        progressBar.setPrefWidth(630);

        setOnCloseRequest(e -> {
            if (isDone) {
                return;
            }
            if (cb != null) {
                cb.failed(null);
            }
        });
    }

    public void setItems(List<LoadingItem> items) {
        this.items = items;
    }

    public void setInterval(long interval) {
        this.interval = interval;
    }

    public void load(Callback<Void, LoadingItem> cb) {
        this.cb = cb;
        show();

        long total = 0;
        for (var item : items) {
            total += item.weight;
        }
        loadItem(total, 0, items.iterator(), () -> Platform.runLater(() -> {
            isDone = true;
            Platform.runLater(() -> {
                close();
                Platform.runLater(() -> cb.succeeded(null));
            });
        }));
    }

    private void loadItem(long total, long current, Iterator<LoadingItem> ite, Runnable cb) {
        if (!ite.hasNext()) {
            cb.run();
            return;
        }
        var item = ite.next();
        var name = item.name;
        FXUtils.runOnFX(() -> label.setText(name));
        TaskManager.get().execute(() -> {
            var ok = item.loadFunc.getAsBoolean();
            if (ok) {
                if (interval > 0) {
                    MiscUtils.threadSleep(interval);
                }
            }
            Platform.runLater(() -> {
                if (!ok) {
                    close();
                    Platform.runLater(() -> this.cb.failed(item));
                    return;
                }
                long newCurr = current + item.weight;
                progressBar.setProgress(newCurr / (double) total);
                loadItem(total, newCurr, ite, cb);
            });
        });
    }
}
