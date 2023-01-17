package io.vproxy.vfx.util.imagewrapper;

public interface CanvasBox {
    void setPaint(int rgb);

    void fillOval(int x, int y, int w, int h);

    void setFont(String name, boolean bold, int size);

    void drawString(String s, int x, int y);

    void flush();
}
