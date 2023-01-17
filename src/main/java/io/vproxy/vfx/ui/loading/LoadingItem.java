package io.vproxy.vfx.ui.loading;

import java.util.function.BooleanSupplier;

public class LoadingItem {
    public final int weight;
    public final String name;
    public final BooleanSupplier loadFunc;

    public LoadingItem(int weight, String name, Runnable loadFunc) {
        this(weight, name, () -> {
            loadFunc.run();
            return true;
        });
    }

    public LoadingItem(int weight, String name, BooleanSupplier loadFunc) {
        this.weight = weight;
        this.name = name;
        this.loadFunc = loadFunc;
    }
}
