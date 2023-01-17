package io.vproxy.vfx.ui.table;

public interface CellAware<S> {
    void setCell(VTableColumn<S, ?> col, VTableCellPane<S> pane);
}
