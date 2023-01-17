package io.vproxy.vfx.control.globalscreen;

import com.github.kwhat.jnativehook.GlobalScreen;
import com.github.kwhat.jnativehook.NativeHookException;
import io.vproxy.vfx.util.Logger;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class GlobalScreenUtils {
    private GlobalScreenUtils() {
    }

    public static void releaseJNativeHookNativeToTmpDir(String suffix, InputStream inputStream) {
        if (!suffix.startsWith(".")) {
            suffix = "." + suffix;
        }
        try {
            File f = File.createTempFile("JNativeHook", suffix);
            f.deleteOnExit();
            String soName = f.getName();
            soName = soName.substring(0, soName.length() - suffix.length());

            var libpaths = System.getProperty("java.library.path", "");
            var splitLibPaths = libpaths.split(File.pathSeparator);
            var existsInLibPaths = false;
            var tmpDir = f.getParentFile().getAbsolutePath();
            for (var p : splitLibPaths) {
                if (tmpDir.equals(new File(p).getAbsolutePath())) {
                    existsInLibPaths = true;
                    break;
                }
            }
            if (existsInLibPaths) {
                System.setProperty("jnativehook.lib.name", soName);
            }

            Logger.info("so name: " + soName);
            Logger.info("java.library.path: " + libpaths);

            try (inputStream) {
                try (var fos = new FileOutputStream(f)) {
                    var buf = new byte[1048576];
                    while (true) {
                        int n = inputStream.read(buf);
                        if (n == -1) {
                            break;
                        }
                        fos.write(buf, 0, n);
                    }
                }
            } catch (IOException e) {
                Logger.error("extracting jnative hook native library failed", e);
            }
        } catch (IOException e) {
            Logger.error("creating tmp file for jnative hook libs failed", e);
        }
    }

    private static final Map<Object, Integer> enableKeys = new HashMap<>();

    public static synchronized void enable(Object key) {
        var n = enableKeys.get(key);
        if (n == null) {
            n = 0;
        }
        n += 1;
        enableKeys.put(key, n);

        if (enableKeys.size() == 1 && n == 1) {
            Logger.debug("register GlobalScreen");
            try {
                GlobalScreen.registerNativeHook();
            } catch (NativeHookException e) {
                Logger.error("failed to run GlobalScreen.registerNativeHook", e);
            }
        }
    }

    public static synchronized void disable(Object key) {
        var n = enableKeys.get(key);
        if (n == null) {
            Logger.error("GlobalScreenUtils.disable is called with " + key + ", but it's not enabled with this key before");
            return;
        }
        n -= 1;
        if (n == 0) {
            enableKeys.remove(key);
            if (enableKeys.isEmpty()) {
                unregister();
            }
        } else {
            enableKeys.put(key, n);
        }
    }

    public static void unregister() {
        Logger.debug("unregister GlobalScreen");
        try {
            GlobalScreen.unregisterNativeHook();
            GlobalScreen.setEventDispatcher(null);
        } catch (NativeHookException e) {
            Logger.error("failed to run GlobalScreen.unregisterNativeHook", e);
        }
    }
}
