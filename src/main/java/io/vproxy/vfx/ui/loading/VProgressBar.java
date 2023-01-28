package io.vproxy.vfx.ui.loading;

import io.vproxy.vfx.manager.task.TaskManager;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.MiscUtils;
import javafx.application.Platform;
import javafx.scene.Group;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.function.Consumer;

public class VProgressBar extends Group {
    private static final double radius = 1;
    private static final double width = radius * 2;

    private double length;
    private double progress;
    private final Circle backgroundRightDot = new Circle(radius);
    private final Line backgroundLine = new Line();
    private final Circle progressRightDot = new Circle(radius);
    private final Line progressLine = new Line();

    public VProgressBar() {
        var progressLeftDot = new Circle(radius);
        var backgroundLeftDot = new Circle(radius);
        getChildren().addAll(
            backgroundLine, backgroundLeftDot, backgroundRightDot,
            progressLine, progressLeftDot, progressRightDot);
        backgroundLine.setStrokeWidth(width);
        backgroundLine.setStartX(radius);
        backgroundLeftDot.setLayoutX(radius);
        backgroundRightDot.setLayoutX(radius);
        backgroundLine.setStroke(Theme.current().progressBarBackgroundColor());
        backgroundLeftDot.setFill(Theme.current().progressBarBackgroundColor());
        backgroundRightDot.setFill(Theme.current().progressBarBackgroundColor());

        progressLine.setStrokeWidth(width);
        progressLine.setStartX(radius);
        progressLeftDot.setLayoutX(radius);
        progressRightDot.setLayoutX(radius);
        progressLine.setStroke(Theme.current().progressBarProgressColor());
        progressLeftDot.setStroke(Theme.current().progressBarProgressColor());
        progressRightDot.setStroke(Theme.current().progressBarProgressColor());
    }

    public double getLength() {
        return length;
    }

    public void setLength(double length) {
        this.length = length;
        backgroundLine.setEndX(length - radius);
        backgroundRightDot.setLayoutX(length - radius);
        updateProgressLine();
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        if (progress < 0) {
            progress = 0;
        } else if (progress > 1) {
            progress = 1;
        }
        this.progress = progress;
        updateProgressLine();
    }

    private void updateProgressLine() {
        var l = length * progress;
        progressLine.setEndX(l - radius);
        progressRightDot.setLayoutX(l - radius);
    }

    private List<LoadingItem> items = new ArrayList<>();
    private long interval = 0;
    private Callback<Void, LoadingItem> cb = null;
    private volatile boolean isDone = false;
    private Consumer<LoadingItem> currentLoadingItemCallback = null;

    public void setCurrentLoadingItemCallback(Consumer<LoadingItem> currentLoadingItemCallback) {
        this.currentLoadingItemCallback = currentLoadingItemCallback;
    }

    public void setItems(List<LoadingItem> items) {
        this.items = items;
    }

    public void setInterval(long interval) {
        this.interval = interval;
    }

    public void load(Callback<Void, LoadingItem> cb) {
        this.cb = cb;

        long total = 0;
        for (var item : items) {
            total += item.weight;
        }
        loadItem(total, 0, items.iterator(), () -> Platform.runLater(() -> {
            isDone = true;
            Platform.runLater(() -> Platform.runLater(cb::succeeded));
        }));
    }

    private void loadItem(long total, long current, Iterator<LoadingItem> ite, Runnable cb) {
        if (!ite.hasNext()) {
            cb.run();
            return;
        }
        if (isDone) {
            return;
        }
        var item = ite.next();
        FXUtils.runOnFX(() -> {
            var currentCB = currentLoadingItemCallback;
            if (currentCB != null) {
                currentCB.accept(item);
            }
        });
        TaskManager.get().execute(() -> {
            var ok = item.loadFunc.getAsBoolean();
            if (ok) {
                if (interval > 0) {
                    MiscUtils.threadSleep(interval);
                }
            }
            Platform.runLater(() -> {
                if (!ok) {
                    isDone = true;
                    Platform.runLater(() -> this.cb.failed(item));
                    return;
                }
                long newCurr = current + item.weight;
                setProgress(newCurr / (double) total);
                loadItem(total, newCurr, ite, cb);
            });
        });
    }

    public boolean terminate() {
        if (isDone) {
            return false;
        }
        isDone = true;
        FXUtils.runOnFX(() -> cb.failed(null));
        return true;
    }
}
