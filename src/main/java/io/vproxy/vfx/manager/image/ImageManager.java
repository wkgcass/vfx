package io.vproxy.vfx.manager.image;

import io.vproxy.vfx.util.Logger;
import javafx.scene.image.Image;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ImageManager {
    private static final ImageManager instance = new ImageManager();

    public static ImageManager get() {
        return instance;
    }

    private ImageManager() {
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
}
