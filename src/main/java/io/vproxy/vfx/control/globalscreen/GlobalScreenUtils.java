package io.vproxy.vfx.control.globalscreen;

import com.github.kwhat.jnativehook.GlobalScreen;
import io.vproxy.base.util.LogType;
import io.vproxy.base.util.Logger;
import io.vproxy.base.util.OS;
import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import io.vproxy.vfx.ui.alert.StackTraceAlert;
import javafx.application.Platform;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Stream;

public class GlobalScreenUtils {
    private GlobalScreenUtils() {
    }

    public static void releaseJNativeHookNativeToLibraryPath(InputStream inputStream) {
        releaseJNativeHookNativeToLibraryPath(inputStream, Stream::findAny);
    }

    public static void releaseJNativeHookNativeToLibraryPath(InputStream inputStream,
                                                             Function<Stream<File>, Optional<File>> selectFunc) {
        String suffix;
        if (OS.isWindows()) {
            suffix = ".dll";
        } else if (OS.isMac()) {
            suffix = ".dylib";
        } else {
            suffix = ".so";
        }

        var javaLibraryPath = System.getProperty("java.library.path", "");
        var soname = "vfx-extracted-JNativeHook";
        Logger.alert("java.library.path: " + javaLibraryPath);
        Logger.alert("dynamic library name: " + soname);

        var stream = Arrays.stream(javaLibraryPath.split(File.pathSeparator))
            .filter(s -> !s.isBlank())
            .map(File::new).filter(File::isDirectory);
        var libpathFile = selectFunc.apply(stream);
        if (libpathFile.isEmpty()) {
            Logger.warn(LogType.INVALID_INPUT_DATA, "no available directory in java.library.path");
            return;
        }
        try {
            var prefix = suffix.endsWith(".dll") ? "" : "lib"; // add "lib" prefix for linux and macos
            var f = Path.of(libpathFile.get().getAbsolutePath(), prefix + soname + suffix).toFile();
            if (f.exists()) {
                Logger.alert("JNativeHook tmp dynamic library already exists: " + f.getAbsolutePath());
                //noinspection ResultOfMethodCallIgnored
                f.setExecutable(true);
                setJNativeHookLib(soname);
                return;
            } else {
                var ok = f.createNewFile();
                if (!ok) {
                    Logger.error(LogType.FILE_ERROR, "failed creating tmp file: " + f.getAbsolutePath());
                    return;
                }
                //noinspection ResultOfMethodCallIgnored
                f.setExecutable(true);
                // f.deleteOnExit(); // no, do not do this, just leave it there
            }

            setJNativeHookLib(soname);

            try (inputStream) {
                try (var fos = new FileOutputStream(f)) {
                    var buf = new byte[128 * 1024];
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

    private static void setJNativeHookLib(String soname) {
        String key = "jnativehook.lib.name";
        Logger.alert("setting system property: " + key + " => " + soname);
        System.setProperty(key, soname);
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
            } catch (Throwable e) {
                Logger.error(LogType.SYS_ERROR, "failed to register GlobalScreen", e);
                if (Platform.isFxApplicationThread()) {
                    StackTraceAlert.show(InternalI18n.get().globalScreenRegisterFailed(), e);
                }
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
        } catch (Throwable e) {
            Logger.error(LogType.SYS_ERROR, "failed to unregister GlobalScreen", e);
        }
    }
}
