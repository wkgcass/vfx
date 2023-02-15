package io.vproxy.vfx.util;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Supplier;

public class Singleton {
    private Singleton() {
    }

    private static final Map<Class<?>, Object> instance = new HashMap<>();

    /*
     * This method should be called from the main method of your final production.
     */
    public static <T> void register(Class<T> cls, T instance) {
        if (!cls.isInstance(instance))
            throw new IllegalArgumentException(); // just in case
        synchronized (Singleton.class) {
            var o = Singleton.instance.get(cls);
            if (o != null) {
                throw new IllegalStateException(cls + " is already registered");
            }
            Logger.info("singleton " + cls + " is registered with " + instance);
            Singleton.instance.put(cls, instance);
        }
    }

    public static <T> T registerIfAbsent(Class<T> cls, Supplier<T> getter) {
        if (instance.containsKey(cls)) {
            //noinspection unchecked
            return (T) instance.get(cls);
        }
        synchronized (Singleton.class) {
            //noinspection unchecked
            return (T) instance.computeIfAbsent(cls, c -> getter.get());
        }
    }

    public static <T> T get(Class<T> cls) {
        if (!instance.containsKey(cls))
            throw new NoSuchElementException();
        //noinspection unchecked
        return (T) instance.get(cls);
    }
}
