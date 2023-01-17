package io.vproxy.vfx.ui.alert;

import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;

import java.io.PrintWriter;
import java.io.StringWriter;

public class StackTraceAlert extends Alert {
    private StackTraceAlert(String desc, Throwable throwable) {
        super(AlertType.ERROR);
        setTitle(InternalI18n.get().stacktraceAlertTitle());
        setHeaderText(InternalI18n.get().stacktraceAlertHeaderText());
        setContentText(desc);

        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        throwable.printStackTrace(pw);
        String exceptionText = sw.toString();

        Label label = new Label(InternalI18n.get().stacktraceAlertLabel());

        TextArea textArea = new TextArea(exceptionText);
        textArea.setEditable(false);
        textArea.setWrapText(true);

        textArea.setMaxWidth(Double.MAX_VALUE);
        textArea.setMaxHeight(Double.MAX_VALUE);
        GridPane.setVgrow(textArea, Priority.ALWAYS);
        GridPane.setHgrow(textArea, Priority.ALWAYS);

        GridPane expContent = new GridPane();
        expContent.setMaxWidth(Double.MAX_VALUE);
        expContent.add(label, 0, 0);
        expContent.add(textArea, 0, 1);

        getDialogPane().setExpandableContent(expContent);
    }

    public static void show(Throwable throwable) {
        show("", throwable);
    }

    public static void show(String desc, Throwable throwable) {
        new StackTraceAlert(desc, throwable).show();
    }

    public static void showAndWait(Throwable throwable) {
        showAndWait("", throwable);
    }

    public static void showAndWait(String desc, Throwable throwable) {
        new StackTraceAlert(desc, throwable).showAndWait();
    }
}
