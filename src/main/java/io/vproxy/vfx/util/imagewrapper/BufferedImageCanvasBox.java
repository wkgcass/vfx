package io.vproxy.vfx.util.imagewrapper;

import java.awt.*;
import java.awt.image.BufferedImage;

public class BufferedImageCanvasBox implements CanvasBox {
    private final BufferedImage bImg;
    private final Graphics2D g;

    BufferedImageCanvasBox(BufferedImage bImg, Graphics2D g) {
        this.bImg = bImg;
        this.g = g;
    }

    @Override
    public void setPaint(int rgb) {
        g.setPaint(new Color(rgb));
    }

    @Override
    public void fillOval(int x, int y, int w, int h) {
        g.fillOval(x, y, w, h);
    }

    @Override
    public void setFont(String name, boolean bold, int size) {
        g.setFont(new Font(name, bold ? Font.BOLD : Font.PLAIN, size));
    }

    @Override
    public void drawString(String s, int x, int y) {
        g.drawString(s, x, y);
    }

    @Override
    public void flush() {
        bImg.flush();
    }
}
