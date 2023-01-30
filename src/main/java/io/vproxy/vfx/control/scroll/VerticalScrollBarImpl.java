package io.vproxy.vfx.control.scroll;

import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.shapes.VLine;

public class VerticalScrollBarImpl extends VLine {
    public VerticalScrollBarImpl() {
        super(VScrollPane.SCROLL_V_WIDTH);
        setStroke(Theme.current().scrollBarColor());
        setStart(0, 0);
    }

    public void setLength(double length) {
        setEnd(0, length);
    }

    public double getLength() {
        return getEndY();
    }
}
