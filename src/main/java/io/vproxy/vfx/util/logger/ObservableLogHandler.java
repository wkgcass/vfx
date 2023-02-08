package io.vproxy.vfx.util.logger;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.WeakListChangeListener;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.ErrorManager;
import java.util.logging.Handler;
import java.util.logging.LogRecord;

public class ObservableLogHandler extends Handler {
    private final ObservableList<String> logs = FXCollections.observableList(new LinkedList<>());

    private final int preserveLogCount;

    public ObservableLogHandler(int preserveLogCount) {
        this.preserveLogCount = preserveLogCount;
    }

    public void addLogListener(WeakListChangeListener<String> listener) {
        logs.addListener(listener);
    }

    public void removeLogListener(WeakListChangeListener<String> listener) {
        logs.removeListener(listener);
    }

    public void publish(String msg) {
        if (logs.size() > preserveLogCount) {
            logs.remove(0);
        }
        logs.add(msg);
    }

    @Override
    public void publish(LogRecord record) {
        if (!isLoggable(record)) {
            return;
        }
        String msg;
        try {
            msg = getFormatter().format(record);
        } catch (Exception ex) {
            reportError(null, ex, ErrorManager.FORMAT_FAILURE);
            return;
        }
        publish(msg);
    }

    public List<String> getLog() {
        return new ArrayList<>(logs);
    }

    @Override
    public void flush() {
        // do nothing
    }

    @Override
    public void close() throws SecurityException {
        // do nothing
    }
}
