package io.vproxy.vfx.util;

import javafx.scene.paint.Color;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.Set;
import java.util.logging.Level;

import static java.time.format.DateTimeFormatter.ISO_LOCAL_DATE;
import static java.time.temporal.ChronoField.*;

public class MiscUtils {
    public static final DateTimeFormatter YYYYMMddHHiissDateTimeFormatter = new DateTimeFormatterBuilder()
        .parseCaseInsensitive()
        .append(ISO_LOCAL_DATE)
        .appendLiteral(' ')
        .append(new DateTimeFormatterBuilder()
            .appendValue(HOUR_OF_DAY, 2)
            .appendLiteral(':')
            .appendValue(MINUTE_OF_HOUR, 2)
            .optionalStart()
            .appendLiteral(':')
            .appendValue(SECOND_OF_MINUTE, 2)
            .toFormatter())
        .toFormatter();

    private MiscUtils() {
    }

    public static void threadSleep(long time) {
        try {
            Thread.sleep(time);
        } catch (InterruptedException ignore) {
        }
    }

    public static boolean almostEquals(Color a, Color b, double delta) {
        return Math.abs(a.getRed() - b.getRed()) < delta && Math.abs(a.getGreen() - b.getGreen()) < delta && Math.abs(a.getBlue() - b.getBlue()) < delta;
    }

    public static boolean almostIn(Color color, Set<Color> colors, double delta) {
        for (var c : colors) {
            if (almostEquals(color, c, delta)) return true;
        }
        return false;
    }

    public static int subtractGE0(int a, int b) {
        if (a < b) {
            return 0;
        } else {
            return a - b;
        }
    }

    public static long subtractGE0(long a, long b) {
        if (a < b) {
            return 0;
        } else {
            return a - b;
        }
    }

    public static String returnNullIfBlank(String s) {
        if (s == null) return null;
        if (s.isBlank()) return null;
        return s;
    }

    public static Level javaLoggingLevelValueOf(String logLevel) {
        switch (logLevel) {
            case "ALL":
                return Level.ALL;
            case "FINEST":
                return Level.FINEST;
            case "FINER":
                return Level.FINER;
            case "DEBUG":
            case "FINE":
                return Level.FINE;
            case "CONFIG":
                return Level.CONFIG;
            case "INFO":
                return Level.INFO;
            case "WARN":
            case "WARNING":
                return Level.WARNING;
            case "ERROR":
            case "FATAL":
            case "SEVERE":
                return Level.SEVERE;
            case "OFF":
                return Level.OFF;
        }
        System.out.println(YYYYMMddHHiissDateTimeFormatter.format(ZonedDateTime.now()) + " SEVERE invalid logLevel: " + logLevel + ", returning ALL instead");
        return Level.ALL;
    }
}
