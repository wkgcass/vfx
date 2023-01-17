package io.vproxy.vfx.test;

import javafx.application.Application;

public class TestMain {
    public static void main(String[] args) throws Exception {
        var cls = Class.forName(args[0]);
        //noinspection unchecked
        Application.launch((Class<? extends Application>) cls);
    }
}
