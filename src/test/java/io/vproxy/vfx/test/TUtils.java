package io.vproxy.vfx.test;

import io.vproxy.vfx.ui.loading.LoadingItem;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class TUtils {
    private TUtils() {
    }

    public static String randomString(int lenMin, int lenMax) {
        var n = ThreadLocalRandom.current().nextInt(lenMax - lenMin);
        return randomString(n + lenMin);
    }

    public static String randomString(int len) {
        int leftLimit = 97; // letter 'a'
        int rightLimit = 122; // letter 'z'
        var random = ThreadLocalRandom.current();
        StringBuilder buffer = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            int randomLimitedInt = leftLimit + (int)
                (random.nextFloat() * (rightLimit - leftLimit + 1));
            buffer.append((char) randomLimitedInt);
        }
        return buffer.toString();
    }

    public static String randomIPAddress() {
        int a = ThreadLocalRandom.current().nextInt(256);
        int b = ThreadLocalRandom.current().nextInt(256);
        int c = ThreadLocalRandom.current().nextInt(256);
        int d = ThreadLocalRandom.current().nextInt(256);
        return a + "." + b + "." + c + "." + d;
    }

    public static List<LoadingItem> buildLoadingItems() {
        var ls = new ArrayList<LoadingItem>();
        for (var i = 0; i < 100; ++i) {
            ls.add(new LoadingItem(1, TUtils.randomString(10, 20), () -> {
            }));
        }
        return ls;
    }
}
