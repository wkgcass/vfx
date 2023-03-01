package io.vproxy.vfx.control.globalscreen;

import com.github.kwhat.jnativehook.GlobalScreen;
import com.github.kwhat.jnativehook.NativeHookException;
import io.vproxy.base.util.LogType;
import io.vproxy.base.util.Logger;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Arrays;
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
            File f = File.createTempFile("tmp", suffix);
            String tmpDirPath = f.getParentFile().getAbsolutePath();
            //noinspection ResultOfMethodCallIgnored
            f.delete();
            var prefix = suffix.endsWith(".dll") ? "" : "lib"; // add "lib" prefix for linux and macos
            var soname = "vfx-extracted-JNativeHook";
            f = Path.of(tmpDirPath, prefix + soname + suffix).toFile();
            if (f.exists()) {
                Logger.alert("JNativeHook tmp dynamic library already exists: " + f.getAbsolutePath());
                //noinspection ResultOfMethodCallIgnored
                f.setExecutable(true);
                checkAndSetJNativeHookLib(tmpDirPath, soname);
                return;
            } else {
                var ok = f.createNewFile();
                if (!ok) {
                    Logger.error(LogType.FILE_ERROR, "failed creating tmp file: " + f.getAbsolutePath());
                    return;
                }
                // f.deleteOnExit(); // no, do not do this, just leave it there
            }

            checkAndSetJNativeHookLib(tmpDirPath, soname);

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
                Logger.error(LogType.FILE_ERROR, "extracting jnative hook native library failed", e);
            }
        } catch (IOException e) {
            Logger.error(LogType.FILE_ERROR, "creating tmp file for jnative hook libs failed", e);
        }
    }

    private static void checkAndSetJNativeHookLib(String tmpDirPath, String soname) {
        var libpaths = System.getProperty("java.library.path", "");
        var splitLibPaths = libpaths.split(File.pathSeparator);
        Logger.alert("java.library.path: " + Arrays.toString(splitLibPaths));
        Logger.alert("temp directory path: " + tmpDirPath);
        Logger.alert("dynamic library name: " + soname);
        var existsInLibPaths = false;
        for (var p : splitLibPaths) {
            if (tmpDirPath.equals(new File(p).getAbsolutePath())) {
                existsInLibPaths = true;
                break;
            }
        }
        if (existsInLibPaths) {
            String key = "jnativehook.lib.name";
            Logger.alert("setting system property: " + key + " => " + soname);
            System.setProperty(key, soname);
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
            assert Logger.lowLevelDebug("register GlobalScreen");
            try {
                GlobalScreen.registerNativeHook();
            } catch (NativeHookException e) {
                Logger.error(LogType.SYS_ERROR, "failed to run GlobalScreen.registerNativeHook", e);
            }
        }
    }

    public static synchronized void disable(Object key) {
        var n = enableKeys.get(key);
        if (n == null) {
            Logger.error(LogType.IMPROPER_USE, "GlobalScreenUtils.disable is called with " + key + ", but it's not enabled with this key before");
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
        assert Logger.lowLevelDebug("unregister GlobalScreen");
        try {
            GlobalScreen.unregisterNativeHook();
            GlobalScreen.setEventDispatcher(null);
        } catch (NativeHookException e) {
            Logger.error(LogType.SYS_ERROR, "failed to run GlobalScreen.unregisterNativeHook", e);
        }
    }
}
