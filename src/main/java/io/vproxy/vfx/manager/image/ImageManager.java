package io.vproxy.vfx.manager.image;

import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.Logger;
import javafx.scene.image.Image;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

public class ImageManager {
    private static final ImageManager instance = new ImageManager();

    public static ImageManager get() {
        return instance;
    }

    private ImageManager() {
        loadBlackAndChangeColor("io/vproxy/vfx/res/image/close.png", Map.of("red", 0xffed6a5e, "white", 0xffffffff));
        loadBlackAndChangeColor("io/vproxy/vfx/res/image/maximize.png", Map.of("white", 0xffffffff, "green", 0xff61c454));
        loadBlackAndChangeColor("io/vproxy/vfx/res/image/reset-window-size.png", Map.of("white", 0xffffffff, "green", 0xff61c454));
        loadBlackAndChangeColor("io/vproxy/vfx/res/image/iconify.png", Map.of("white", 0xffffffff, "yellow", 0xfff4bd4f));
        loadBlackAndChangeColor("io/vproxy/vfx/res/image/arrow.png", Map.of("white", 0xffffffff));
    }

    private final Map<String, Image> map = new ConcurrentHashMap<>();

    public Image load(String path) {
        try {
            return load(path, false);
        } catch (Exception ignore) {
            return null;
        }
    }

    @SuppressWarnings("RedundantThrows")
    public Image load(String path, boolean throwException) throws Exception {
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        var image = map.get(path);
        if (image != null) {
            Logger.debug("using cached image: " + path);
            return image;
        }
        try {
            image = new Image(path, false);
        } catch (Exception e) {
            Logger.error("failed loading image " + path, e);
            if (throwException) {
                throw e;
            }
            return null;
        }
        map.put(path, image);
        Logger.debug("new image loaded: " + path);
        return image;
    }

    public void loadBlackAndChangeColor(String path, Map<String, Integer> argbs) {
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        var img = load(path);
        if (img == null) {
            return;
        }
        for (var entry : argbs.entrySet()) {
            var name = entry.getKey();
            int setArgb = entry.getValue();
            var wImg = FXUtils.changeColorOfBlackImage(img, setArgb);
            var newPath = path + ":" + name;
            Logger.debug("new image loaded: " + newPath);
            map.put(newPath, wImg);
        }
    }

    public Image loadSubImageOrMake(String baseName, String subName, Function<Image, Image> makeFunc) {
        if (!baseName.startsWith("/")) {
            baseName = "/" + baseName;
        }
        var img = map.get(baseName + ":" + subName);
        if (img != null) {
            Logger.debug("using cached image: " + baseName + ":" + subName);
            return img;
        }
        img = map.get(baseName);
        if (img == null) {
            Logger.warn("unable to find base image " + baseName + ", cannot make sub image for it");
            return null;
        }
        img = makeFunc.apply(img);
        if (img == null) {
            Logger.warn("failed making image for " + baseName + ":" + subName + ", the make function returns null");
            return null;
        }
        map.put(baseName + ":" + subName, img);
        Logger.debug("new image loaded: " + baseName + ":" + subName);
        return img;
    }
}
