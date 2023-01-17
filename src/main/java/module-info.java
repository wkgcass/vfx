module io.vproxy.vfx {
    requires javafx.base;
    requires javafx.graphics;
    requires javafx.controls;
    requires javafx.swing;
    requires javafx.media;
    requires java.logging;
    requires java.desktop;
    requires com.github.kwhat.jnativehook;
    requires vjson;
    requires kotlin.stdlib;

    exports io.vproxy.vfx.component.keychooser;
    exports io.vproxy.vfx.control.drag;
    exports io.vproxy.vfx.control.globalscreen;
    exports io.vproxy.vfx.entity;
    exports io.vproxy.vfx.entity.input;
    exports io.vproxy.vfx.manager.audio;
    exports io.vproxy.vfx.manager.font;
    exports io.vproxy.vfx.manager.image;
    exports io.vproxy.vfx.manager.internal_i18n;
    exports io.vproxy.vfx.manager.task;
    exports io.vproxy.vfx.robot;
    exports io.vproxy.vfx.ui.alert;
    exports io.vproxy.vfx.ui.button;
    exports io.vproxy.vfx.ui.layout;
    exports io.vproxy.vfx.ui.loading;
    exports io.vproxy.vfx.ui.shapes;
    exports io.vproxy.vfx.ui.table;
    exports io.vproxy.vfx.util;
    exports io.vproxy.vfx.util.imagewrapper;
}
