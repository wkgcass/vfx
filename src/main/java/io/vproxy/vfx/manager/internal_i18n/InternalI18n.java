package io.vproxy.vfx.manager.internal_i18n;

public abstract class InternalI18n {
    private static InternalI18n instance = new InternalI18n() {
    };

    public InternalI18n() {
    }

    public static void setInstance(InternalI18n instance) {
        InternalI18n.instance = instance;
    }

    public static InternalI18n get() {
        return instance;
    }

    public String alertInfoTitle() {
        return "Info";
    }

    public String alertWarningTitle() {
        return "Warning";
    }

    public String alertErrorTitle() {
        return "Error";
    }

    public String cannotFindAnyDisplay() {
        return "cannot find any display";
    }

    public String stacktraceAlertTitle() {
        return "Exception";
    }

    public String stacktraceAlertHeaderText() {
        return "Exception Thrown";
    }

    public String stacktraceAlertLabel() {
        return "The exception stacktrace was:";
    }

    public String keyChooserLeftMouseButton() {
        return "Left mouse button";
    }

    public String keyChooserRightMouseButton() {
        return "Right mouse button";
    }

    public String keyChooserDesc() {
        return "Please press the key you want to use, or click the buttons to choose left or right mouse button.";
    }

    public String keyChooserDescWithoutMouse() {
        return "Please press the key you want to use.";
    }

    public String emptyTableLabel() {
        return "No Data";
    }
}
