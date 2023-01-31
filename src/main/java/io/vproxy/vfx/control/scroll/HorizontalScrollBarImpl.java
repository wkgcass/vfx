package io.vproxy.vfx.control.scroll;

import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.shapes.VLine;

public class HorizontalScrollBarImpl extends VLine {
    public HorizontalScrollBarImpl() {
        super(VScrollPane.SCROLL_WIDTH);
        setStroke(Theme.current().scrollBarColor());
        setStart(VScrollPane.SCROLL_WIDTH / 2d, 0);
    }

    public void setLength(double length) {
        setEnd(length - VScrollPane.SCROLL_WIDTH / 2d, 0);
    }

    public double getLength() {
        return getEndX() + VScrollPane.SCROLL_WIDTH / 2d;
    }
}
