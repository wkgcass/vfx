package io.vproxy.vfx.util.imagewrapper;

import javafx.embed.swing.SwingFXUtils;
import javafx.scene.image.WritableImage;

import java.awt.image.BufferedImage;

public class FX2BufferedImageCanvasBox implements CanvasBox {
    private final WritableImage img;
    private final BufferedImage bImg;
    private final BufferedImageCanvasBox box;
    private final double scale;

    public FX2BufferedImageCanvasBox(WritableImage img, double scale) {
        this.img = img;
        this.bImg = SwingFXUtils.fromFXImage(img, null);
        this.box = new BufferedImageCanvasBox(bImg, bImg.createGraphics());
        this.scale = scale;
    }

    @Override
    public void setPaint(int rgb) {
        box.setPaint(rgb);
    }

    @Override
    public void fillOval(int x, int y, int w, int h) {
        box.fillOval((int) (x / scale), (int) (y / scale), (int) (w / scale), (int) (h / scale));
    }

    @Override
    public void setFont(String name, boolean bold, int size) {
        box.setFont(name, bold, (int) (size / scale));
    }

    @Override
    public void drawString(String s, int x, int y) {
        box.drawString(s, (int) (x / scale), (int) (y / scale));
    }

    @Override
    public void flush() {
        box.flush();
        SwingFXUtils.toFXImage(bImg, img);
    }
}
