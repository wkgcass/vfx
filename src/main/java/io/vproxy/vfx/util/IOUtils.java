package io.vproxy.vfx.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class IOUtils {
    private IOUtils() {
    }

    public static void writeFile(Path file, String content) throws IOException {
        Logger.info("write to file: " + file);
        File f = file.toFile();
        if (f.exists()) {
            if (!f.isFile()) {
                throw new IOException(file + " is not a regular file");
            }
            File bak = new File(file + ".bak");
            boolean needBak = true;
            if (bak.exists()) {
                if (bak.isFile()) {
                    try {
                        //noinspection ResultOfMethodCallIgnored
                        bak.delete();
                    } catch (Throwable ignore) {
                    }
                } else {
                    needBak = false; // cannot make backup because the .bak is not a regular file
                }
            }
            if (needBak) {
                try {
                    //noinspection ResultOfMethodCallIgnored
                    f.renameTo(bak);
                } catch (Throwable ignore) {
                }
            }
        } else {
            var parent = f.getParentFile();
            if (!parent.exists()) {
                if (!parent.mkdirs()) {
                    throw new IOException("mkdirs " + parent + " failed");
                }
            }
        }
        Files.writeString(file, content);
    }

    public static boolean deleteDirectory(File base) {
        if (base.isFile()) {
            return base.delete();
        }
        if (!base.isDirectory()) { // ignore special files
            return true;
        }
        var allContents = base.listFiles();
        if (allContents != null) {
            for (var file : allContents) {
                var ok = deleteDirectory(file);
                if (!ok) {
                    return false;
                }
            }
        }
        return base.delete();
    }

    public static void copyDirectory(Path src, Path dest) throws IOException {
        try (var stream = Files.walk(src)) {
            for (var ite = stream.iterator(); ite.hasNext(); ) {
                var source = ite.next();
                copy(source, dest.resolve(src.relativize(source)));
            }
        }
    }

    private static void copy(Path source, Path dest) throws IOException {
        if (source.toFile().isDirectory() && dest.toFile().isDirectory()) {
            return; // exists
        }
        Files.copy(source, dest, REPLACE_EXISTING);
    }
}
