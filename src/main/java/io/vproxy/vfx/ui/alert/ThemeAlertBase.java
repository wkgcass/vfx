package io.vproxy.vfx.ui.alert;

import io.vproxy.vfx.manager.internal_i18n.InternalI18n;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.ui.stage.VStage;
import io.vproxy.vfx.ui.stage.VStageInitParams;
import javafx.geometry.Pos;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;

public class ThemeAlertBase extends VStage {
    public static final int PADDING_H = 20;

    protected final VBox alertMessagePane = new VBox();
    protected final FusionButton okButton = new FusionButton(InternalI18n.get().alertOkButton()) {{
        setPrefWidth(120);
        setPrefHeight(45);
    }};

    public ThemeAlertBase() {
        super(new VStageInitParams()
            .setIconifyButton(false)
            .setMaximizeAndResetButton(false)
            .setResizable(false));

        getStage().centerOnScreen();

        var root = getInitialScene().getContentPane();
        root.getChildren().add(new HBox(
            new HPadding(PADDING_H),
            new VBox(
                alertMessagePane,
                new VPadding(15),
                new HBox(okButton) {{
                    setAlignment(Pos.CENTER_RIGHT);
                }},
                new VPadding(10)
            ),
            new HPadding(PADDING_H)
        ));
        getStage().setWidth(720);
        root.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            h = VStage.TITLE_BAR_HEIGHT + h + 2;
            if (h > 800) {
                h = 800;
            }
            getStage().setHeight(h);
        });

        okButton.setOnAction(e -> close());
    }

    @Override
    public void show() {
        super.show();
        temporaryOnTop();
    }

    @Override
    public void showAndWait() {
        super.showAndWait();
        temporaryOnTop();
    }
}
