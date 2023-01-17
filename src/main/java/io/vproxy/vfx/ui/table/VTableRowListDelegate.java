package io.vproxy.vfx.ui.table;

import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("NullableProblems")
public class VTableRowListDelegate<E> implements List<E> {
    private final List<VTableRow<E>> ls;
    private final VTableSharedData<E> shared;

    public VTableRowListDelegate(List<VTableRow<E>> ls, VTableSharedData<E> shared) {
        this.ls = ls;
        this.shared = shared;
    }

    @Override
    public int size() {
        return ls.size();
    }

    @Override
    public boolean isEmpty() {
        return ls.isEmpty();
    }

    @Override
    public boolean contains(Object o) {
        return ls.stream().anyMatch(e -> Objects.equals(e.item, o));
    }

    @Override
    public Iterator<E> iterator() {
        return new VTableRowIteratorDelegate<>(ls.listIterator(), shared);
    }

    @Override
    public Object[] toArray() {
        return ls.stream().map(s -> s.item).toArray();
    }

    @Override
    public <T> T[] toArray(T[] a) {
        //noinspection SuspiciousToArrayCall
        return ls.stream().map(s -> s.item).collect(Collectors.toList()).toArray(a);
    }

    @Override
    public boolean add(E e) {
        ls.add(new VTableRow<>(e, shared));
        return true;
    }

    @Override
    public boolean remove(Object o) {
        int index = indexOf(o);
        if (index == -1) {
            return false;
        } else {
            ls.remove(index);
            return true;
        }
    }

    @Override
    public boolean containsAll(Collection<?> c) {
        return ls.stream().map(e -> e.item).collect(Collectors.toSet()).containsAll(c);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        var all = new ArrayList<VTableRow<E>>(c.size());
        for (var e : c) {
            all.add(new VTableRow<>(e, shared));
        }
        return ls.addAll(all);
    }

    @Override
    public boolean addAll(int index, Collection<? extends E> c) {
        var all = new ArrayList<VTableRow<E>>(c.size());
        for (var e : c) {
            all.add(new VTableRow<>(e, shared));
        }
        return ls.addAll(index, all);
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        return ls.removeIf(e -> c.contains(e.item));
    }

    @Override
    public boolean retainAll(Collection<?> c) {
        return ls.removeIf(e -> !c.contains(e.item));
    }

    @Override
    public void clear() {
        ls.clear();
    }

    @Override
    public E get(int index) {
        return ls.get(index).item;
    }

    @Override
    public E set(int index, E element) {
        return ls.set(index, new VTableRow<>(element, shared)).item;
    }

    @Override
    public void add(int index, E element) {
        ls.add(index, new VTableRow<>(element, shared));
    }

    @Override
    public E remove(int index) {
        return ls.remove(index).item;
    }

    @Override
    public int indexOf(Object o) {
        int index = -1;
        for (int i = 0; i < ls.size(); i++) {
            var e = ls.get(i);
            if (Objects.equals(e.item, o)) {
                index = i;
                break;
            }
        }
        return index;
    }

    @Override
    public int lastIndexOf(Object o) {
        int index = -1;
        for (int i = ls.size() - 1; i >= 0; --i) {
            var e = ls.get(i);
            if (Objects.equals(e.item, o)) {
                index = i;
                break;
            }
        }
        return index;
    }

    @Override
    public ListIterator<E> listIterator() {
        return new VTableRowIteratorDelegate<>(ls.listIterator(), shared);
    }

    @Override
    public ListIterator<E> listIterator(int index) {
        return new VTableRowIteratorDelegate<>(ls.listIterator(index), shared);
    }

    @Override
    public List<E> subList(int fromIndex, int toIndex) {
        return ls.subList(fromIndex, toIndex).stream().map(e -> e.item).collect(Collectors.toList());
    }
}
