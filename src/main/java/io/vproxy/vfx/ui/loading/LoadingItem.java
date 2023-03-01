package io.vproxy.vfx.ui.loading;

import io.vproxy.base.util.functional.BooleanSupplierEx;

public class LoadingItem {
    public final int weight;
    public final String name;
    public final BooleanSupplierEx<? extends Throwable> loadFunc;

    public LoadingItem(int weight, String name, Runnable loadFunc) {
        this(weight, name, () -> {
            loadFunc.run();
            return true;
        });
    }

    public LoadingItem(int weight, String name, BooleanSupplierEx<? extends Throwable> loadFunc) {
        this.weight = weight;
        this.name = name;
        this.loadFunc = loadFunc;
    }
}
