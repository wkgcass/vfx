package io.vproxy.vfx.util;

import javafx.scene.paint.Color;

import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.Set;

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

    public static boolean almostEquals(Color a, Color b) {
        return Math.abs(a.getRed() - b.getRed()) < 0.02 && Math.abs(a.getGreen() - b.getGreen()) < 0.02 && Math.abs(a.getBlue() - b.getBlue()) < 0.02;
    }

    public static boolean almostIn(Color color, Set<Color> colors) {
        for (var c : colors) {
            if (almostEquals(color, c)) return true;
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
}
