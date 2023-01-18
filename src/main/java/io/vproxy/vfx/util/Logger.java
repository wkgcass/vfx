package io.vproxy.vfx.util;

import java.io.OutputStream;
import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.SimpleFormatter;

abstract public class Logger {
    private static Logger logger;

    private static final java.util.logging.Logger defaultLogger = java.util.logging.Logger.getLogger("vfx");

    static {
        // %1:date, %2:source, %3:logger, %4:level, %5:message, %6:thrown
        System.setProperty("java.util.logging.SimpleFormatter.format",
            "%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS %4$s %5$s%6$s%n");
        defaultLogger.setLevel(Level.ALL);
        var handler = new ConsoleHandler() {
            @Override
            protected synchronized void setOutputStream(OutputStream out) throws SecurityException {
                super.setOutputStream(System.out);
            }
        };
        handler.setFormatter(new SimpleFormatter());
        var logLevel = System.getProperty("io.vproxy.vfx.logLevel", "ALL");
        Level level = MiscUtils.javaLoggingLevelValueOf(logLevel);
        handler.setLevel(level);
        defaultLogger.addHandler(handler);
        defaultLogger.setUseParentHandlers(false);
    }

    public Logger() {
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
