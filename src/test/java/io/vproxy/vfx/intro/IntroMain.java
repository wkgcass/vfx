package io.vproxy.vfx.intro;

import io.vproxy.vfx.theme.Theme;
import javafx.application.Application;

public class IntroMain {
    public static void main(String[] args) {
        Theme.setTheme(new IntroTheme());
        Application.launch(IntroFXMain.class);
    }
}
