package io.vproxy.vfx.ui.table;

import java.util.ListIterator;

public class VTableRowIteratorDelegate<E> implements ListIterator<E> {
    private final ListIterator<VTableRow<E>> ite;
    private final VTableSharedData<E> shared;

    public VTableRowIteratorDelegate(ListIterator<VTableRow<E>> ite, VTableSharedData<E> shared) {
        this.ite = ite;
        this.shared = shared;
    }

    @Override
    public boolean hasNext() {
        return ite.hasNext();
    }

    @Override
    public E next() {
        return ite.next().item;
    }

    @Override
    public boolean hasPrevious() {
        return ite.hasPrevious();
    }

    @Override
    public E previous() {
        return ite.previous().item;
    }

    @Override
    public int nextIndex() {
        return ite.nextIndex();
    }

    @Override
    public int previousIndex() {
        return ite.previousIndex();
    }

    @Override
    public void remove() {
        ite.remove();
    }

    @Override
    public void set(E e) {
        ite.set(new VTableRow<>(e, shared));
    }

    @Override
    public void add(E e) {
        ite.add(new VTableRow<>(e, shared));
    }
}
