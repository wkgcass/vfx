package io.vproxy.vfx.component.logconsole;

import io.vproxy.base.util.Logger;
import io.vproxy.base.util.log.LogDispatcher;
import io.vproxy.base.util.log.LogHandler;
import io.vproxy.base.util.log.LogRecord;
import io.vproxy.vfx.control.scroll.ScrollDirection;
import io.vproxy.vfx.control.scroll.VScrollPane;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.pane.ClickableFusionPane;
import io.vproxy.vfx.ui.pane.FusionPane;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import javafx.application.Platform;
import javafx.scene.input.Clipboard;
import javafx.scene.input.ClipboardContent;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;

public class LogConsole {
    private final int preserveLogCount;
    private final int clearLogCount;
    private final VScrollPane pane;
    private final VBox vbox;
    @SuppressWarnings("FieldCanBeLocal")
    private final LogHandler logHandler;
    private boolean alwaysScrollToEnd = true;

    public LogConsole() {
        this(200, 250);
    }

    public LogConsole(int preserveLogCount, int clearLogCount) {
        this(Logger.logDispatcher, preserveLogCount, clearLogCount);
    }

    public LogConsole(LogDispatcher logDispatcher, int preserveLogCount, int clearLogCount) {
        if (clearLogCount < preserveLogCount) {
            throw new IllegalArgumentException("clearLogCount = " + clearLogCount + " must not smaller than preserveLogCount = " + preserveLogCount);
        }
        this.preserveLogCount = preserveLogCount;
        this.clearLogCount = clearLogCount;

        this.pane = new VScrollPane();
        this.vbox = new VBox();
        vbox.setSpacing(5);
        FXUtils.observeWidth(pane.getNode(), vbox);
        pane.setContent(vbox);

        logHandler = this::handleLog;
        logDispatcher.addLogHandler(logHandler);

        vbox.heightProperty().addListener((ob, old, now) -> {
            if (alwaysScrollToEnd) {
                Platform.runLater(() -> pane.setVvalue(1));
            }
        });
    }

    public boolean isAlwaysScrollToEnd() {
        return alwaysScrollToEnd;
    }

    public void setAlwaysScrollToEnd(boolean alwaysScrollToEnd) {
        this.alwaysScrollToEnd = alwaysScrollToEnd;
        if (alwaysScrollToEnd) {
            pane.setVvalue(1);
        }
    }

    private void handleLog(LogRecord record) {
        add(record.toStringNoColor());
    }

    private void add(String log) {
        FXUtils.runOnFX(() -> add0(log));
    }

    private void add0(String log0) {
        var log = log0.trim();
        var label = new ThemeLabel(log) {{
            setFont(new Font(FontManager.FONT_NAME_JetBrainsMono, 16));
        }};

        var hscroll = new VScrollPane(ScrollDirection.NONE);
        hscroll.setContent(label);
        FXUtils.observeHeight(label, hscroll.getNode(), 2);

        var logPane = new ClickableFusionPane(false);
        logPane.setOnAction(e -> {
            var content = new ClipboardContent();
            content.putString(log);
            Clipboard.getSystemClipboard().setContent(content);
        });
        logPane.getContentPane().getChildren().add(hscroll.getNode());
        FXUtils.observeWidth(logPane.getNode(), hscroll.getNode(), -FusionPane.PADDING_H * 2);

        vbox.getChildren().add(logPane.getNode());
        if (vbox.getChildren().size() > clearLogCount) {
            vbox.getChildren().remove(0, vbox.getChildren().size() - preserveLogCount);
        }
    }

    public Region getNode() {
        return pane.getNode();
    }
}
