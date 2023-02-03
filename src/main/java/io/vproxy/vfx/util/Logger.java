package io.vproxy.vfx.util;

import io.vproxy.vfx.util.logger.ObservableLogHandler;

import java.io.OutputStream;
import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.SimpleFormatter;

abstract public class Logger {
    private static Logger logger;

    private static final java.util.logging.Logger defaultLogger = java.util.logging.Logger.getLogger("vfx");
    public static final ObservableLogHandler observableLogHandler;

    static {
        // %1:date, %2:source, %3:logger, %4:level, %5:message, %6:thrown
        System.setProperty("java.util.logging.SimpleFormatter.format",
            "%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS %4$s %5$s%6$s%n");
        var logLevel = System.getProperty("io.vproxy.vfx.logLevel");
        Level level;
        Level consoleLevel;
        if (logLevel == null || logLevel.isBlank()) {
            level = Level.INFO;
            consoleLevel = Level.ALL;
        } else {
            level = MiscUtils.javaLoggingLevelValueOf(logLevel);
            consoleLevel = level;
        }
        var consoleLogLevel = System.getProperty("io.vproxy.vfx.consoleLogLevel");
        if (consoleLogLevel != null && !consoleLogLevel.isBlank()) {
            consoleLevel = MiscUtils.javaLoggingLevelValueOf(consoleLogLevel);
        }
        var preserveLogCountStr = System.getProperty("io.vproxy.vfx.preserveLogCount", "100");
        int preserveLogCount;
        try {
            preserveLogCount = Integer.parseInt(preserveLogCountStr);
        } catch (NumberFormatException e) {
            System.out.println("invalid io.vproxy.vfx.preserveLogCount value: " + preserveLogCountStr + ", using 100 instead");
            preserveLogCount = 100;
        }

        defaultLogger.setLevel(Level.ALL);
        var consoleHandler = new ConsoleHandler() {
            @Override
            protected synchronized void setOutputStream(OutputStream out) throws SecurityException {
                super.setOutputStream(System.out);
            }
        };
        consoleHandler.setFormatter(new SimpleFormatter());
        consoleHandler.setLevel(consoleLevel);

        observableLogHandler = new ObservableLogHandler(preserveLogCount);
        observableLogHandler.setFormatter(new SimpleFormatter());
        observableLogHandler.setLevel(level);

        defaultLogger.addHandler(consoleHandler);
        defaultLogger.addHandler(observableLogHandler);
        defaultLogger.setUseParentHandlers(false);
    }

    private Logger() {
    }

    public static void setLogger(Logger logger) {
        Logger.logger = logger;
    }

    public abstract void _debug(String msg);

    public abstract void _info(String msg);

    public abstract void _warn(String msg);

    public abstract void _error(String msg, Throwable t);

    public abstract void _error(String msg);

    public static void debug(String msg) {
        if (logger == null) {
            defaultLogger.log(Level.FINE, msg);
        } else {
            logger._debug(msg);
        }
    }

    public static void info(String msg) {
        if (logger == null) {
            defaultLogger.log(Level.INFO, msg);
        } else {
            logger._info(msg);
        }
    }

    public static void warn(String msg) {
        if (logger == null) {
            defaultLogger.log(Level.WARNING, msg);
        } else {
            logger._warn(msg);
        }
    }

    public static void error(String msg, Throwable t) {
        if (logger == null) {
            defaultLogger.log(Level.SEVERE, msg, t);
        } else {
            logger._error(msg, t);
        }
    }

    public static void error(String msg) {
        if (logger == null) {
            defaultLogger.log(Level.SEVERE, msg);
        } else {
            logger._error(msg);
        }
    }
}
