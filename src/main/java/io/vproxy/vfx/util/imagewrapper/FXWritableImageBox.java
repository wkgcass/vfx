package io.vproxy.vfx.util.imagewrapper;

import javafx.scene.image.Image;
import javafx.scene.image.PixelReader;
import javafx.scene.image.WritableImage;

public class FXWritableImageBox implements ImageBox {
    private final WritableImage img;
    private final PixelReader reader;
    private final double scale;

    public FXWritableImageBox(WritableImage img) {
        this(img, 1);
    }

    public FXWritableImageBox(WritableImage img, double scale) {
        this.img = img;
        this.reader = img.getPixelReader();
        this.scale = scale;
    }

    @Override
    public int getWidth() {
        return (int) (img.getWidth() * scale);
    }

    @Override
    public int getHeight() {
        return (int) (img.getHeight() * scale);
    }

    @Override
    public int getRGB(int x, int y) {
        return reader.getArgb((int) Math.round(x / scale), (int) Math.round(y / scale));
    }

    @Override
    public CanvasBox createGraphics() {
        return new FX2BufferedImageCanvasBox(img, scale);
    }

    @Override
    public Image toFXImage() {
        return img;
    }
}
