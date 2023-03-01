package io.vproxy.vfx.test;

import io.vproxy.commons.util.IOUtils;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

public class TestIOUtils {
    private static Path prepareDir() throws IOException {
        var tmp = Files.createTempDirectory("TestIOUtils_prepared");
        tmp.toFile().deleteOnExit();
        Files.writeString(Path.of(tmp.toString(), "a"), "a");
        Files.writeString(Path.of(tmp.toString(), "b"), "b");
        var tmpC = Path.of(tmp.toAbsolutePath().toString(), "c").toFile();
        var ok = tmpC.mkdir();
        assertTrue(ok);
        Files.writeString(Path.of(tmpC.toString(), "c1"), "1");
        Files.writeString(Path.of(tmpC.toString(), "c2"), "2");

        assertDirContent(tmp);
        return tmp;
    }

    private static void assertDirContent(Path p) throws IOException {
        //noinspection ConstantConditions
        var directFiles = Arrays.stream(p.toFile().listFiles()).map(File::getName).collect(Collectors.toSet());
        assertEquals(Set.of("a", "b", "c"), directFiles);

        var files = new HashSet<String>();
        //noinspection resource
        Files.walk(p).forEach(pp -> {
            var f = pp.toFile();
            if (f.isFile()) {
                files.add(f.getName());
            }
        });

        assertEquals(Set.of("a", "b", "c1", "c2"), files);
    }

    @Test
    public void deleteDir() throws Exception {
        var tmp = prepareDir();
        var ok = IOUtils.deleteDirectory(tmp.toFile());
        assertTrue(ok);
        assertFalse(tmp.toFile().isFile());
    }

    @Test
    public void copyDir() throws Exception {
        var tmp = prepareDir();
        var dst = Path.of(tmp.toAbsolutePath().getParent().toString(), "TestIOUtils_copyDir");
        if (dst.toFile().exists()) {
            var ok = IOUtils.deleteDirectory(dst.toFile());
            assertTrue(ok);
        }
        IOUtils.copyDirectory(tmp, dst);

        assertDirContent(dst);

        var ok = dst.toFile().delete();
        assertFalse(ok);
        ok = IOUtils.deleteDirectory(dst.toFile());
        assertTrue(ok);
    }
}
