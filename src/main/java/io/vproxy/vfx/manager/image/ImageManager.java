package io.vproxy.vfx.manager.image;

import io.vproxy.vfx.util.Logger;
import javafx.scene.image.Image;
import javafx.scene.image.WritableImage;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
        var w = (int) img.getWidth();
        var h = (int) img.getHeight();
        var reader = img.getPixelReader();

        for (var entry : argbs.entrySet()) {
            var name = entry.getKey();
            int setArgb = entry.getValue();
            var wImg = new WritableImage(w, h);
            var writer = wImg.getPixelWriter();
            for (int x = 0; x < w; ++x) {
                for (int y = 0; y < h; ++y) {
                    var argb = reader.getArgb(x, y);
                    if (argb != 0) {
                        var color = reader.getColor(x, y);
                        var r = (setArgb >> 16) & 0xff;
                        var g = (setArgb >> 8) & 0xff;
                        var b = (setArgb) & 0xff;
                        writer.setArgb(x, y, ((int) color.getOpacity() * 255) << 24
                                             | ((int) (r * (1 - color.getRed())) << 16)
                                             | ((int) (g * (1 - color.getGreen())) << 8)
                                             | (int) (b * (1 - color.getBlue()))
                        );
                    } else {
                        writer.setArgb(x, y, argb);
                    }
                }
            }
            var newPath = path + ":" + name;
            map.put(newPath, wImg);
        }
    }
}
