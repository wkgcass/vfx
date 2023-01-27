package io.vproxy.vfx.ui.stage;

import io.vproxy.vfx.control.drag.DragHandler;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.manager.font.FontUsages;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.scene.VScene;
import io.vproxy.vfx.ui.scene.VSceneGroup;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.OSUtils;
import javafx.geometry.Insets;
import javafx.scene.Cursor;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.paint.Paint;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;
import javafx.stage.StageStyle;

public class VStage {
    public static final int TITLE_BAR_HEIGHT = 28;

    private final Stage stage;
    private final Pane root = new Pane();
    private final Pane rootContainer = new Pane();
    private final VScene content = new VScene(VSceneRole.MAIN);
    private final VSceneGroup sceneGroup = new VSceneGroup(content);
    private final Label title = new Label() {{
        FontManager.get().setFont(FontUsages.windowTitle, this, Theme.current().windowTitleFontSize());
        setTextFill(Theme.current().normalTextColor());
        setMouseTransparent(true);
    }};
    private final Circle resizeButton = new Circle() {{
        setStrokeWidth(0);
        setFill(Color.TRANSPARENT);
        setRadius(8);
        setCursor(Cursor.NW_RESIZE);
    }};

    private boolean maximized = false;
    private final MaxResetButton maxrstBtn;

    public VStage() {
        this(new VStageInitParams());
    }

    public VStage(VStageInitParams initParams) {
        this(new Stage(), initParams);
    }

    public VStage(Stage stage) {
        this(stage, new VStageInitParams());
    }

    public VStage(Stage stage, VStageInitParams initParams) {
        this.stage = stage;
        stage.initStyle(StageStyle.TRANSPARENT);

        var scene = new Scene(rootContainer);
        scene.setFill(Color.TRANSPARENT);
        stage.setScene(scene);
        root.setLayoutX(0.5);
        root.setLayoutY(0.5);

        FXUtils.makeCutFor(root, 8);

        stage.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            rootContainer.setPrefWidth(w);
            root.setPrefWidth(w - 1);
        });
        stage.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            rootContainer.setPrefHeight(h);
            root.setPrefHeight(h - 1);
        });
        rootContainer.setBackground(Background.EMPTY);
        rootContainer.setBorder(new Border(new BorderStroke(
            Theme.current().windowBorderColor(),
            BorderStrokeStyle.SOLID,
            new CornerRadii(8),
            new BorderWidths(0.5))));
        setBackground(Theme.current().sceneBackgroundColor());

        var movingPane = new Pane();
        movingPane.setPrefHeight(TITLE_BAR_HEIGHT);
        var moveWindowHandler = new DragHandler() {
            @Override
            protected void set(double x, double y) {
                if (maximized) {
                    return;
                }
                stage.setX(x);
                stage.setY(y);
            }

            @Override
            protected double[] get() {
                return new double[]{stage.getX(), stage.getY()};
            }
        };
        movingPane.setOnMousePressed(moveWindowHandler);
        movingPane.setOnMouseDragged(moveWindowHandler);
        root.getChildren().add(movingPane);

        var closeBtn = new CloseButton(this, initParams);
        closeBtn.setLayoutY(0.5);
        if (initParams.closeButton) root.getChildren().add(closeBtn);

        maxrstBtn = new MaxResetButton(this, initParams);
        maxrstBtn.setLayoutY(0.5);
        if (initParams.maximizeAndResetButton) root.getChildren().add(maxrstBtn);

        var iconifyBtn = new IconifyButton(this, initParams);
        iconifyBtn.setLayoutY(0.5);
        if (initParams.iconifyButton) root.getChildren().add(iconifyBtn);

        sceneGroup.getNode().setLayoutX(0.5);
        sceneGroup.getNode().setLayoutY(TITLE_BAR_HEIGHT);
        root.getChildren().add(sceneGroup.getNode());

        root.getChildren().add(title);

        var resizeHandler = new DragHandler() {
            @Override
            protected void set(double x, double y) {
                if (x < 256) {
                    x = 256;
                }
                if (y < 128) {
                    y = 128;
                }
                stage.setWidth(x);
                stage.setHeight(y);
            }

            @Override
            protected double[] get() {
                return new double[]{
                    stage.getWidth(),
                    stage.getHeight(),
                };
            }
        };
        resizeButton.setOnMousePressed(resizeHandler);
        resizeButton.setOnMouseDragged(resizeHandler);

        title.textProperty().addListener((ob, old, now) -> updateTitlePosition());
        stage.widthProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var w = now.doubleValue();
            final double padRight = 0.5;
            var controlButtonsOffset = w - padRight;
            if (initParams.closeButton) {
                controlButtonsOffset -= CloseButton.WIDTH;
                closeBtn.setLayoutX(controlButtonsOffset);
            }
            if (initParams.maximizeAndResetButton) {
                controlButtonsOffset -= MaxResetButton.WIDTH;
                maxrstBtn.setLayoutX(controlButtonsOffset);
            }
            if (initParams.iconifyButton) {
                controlButtonsOffset -= IconifyButton.WIDTH;
                iconifyBtn.setLayoutX(controlButtonsOffset);
            }
            movingPane.setPrefWidth(w);
            sceneGroup.getNode().setPrefWidth(w - 1);
            resizeButton.setLayoutX(w - 8);
            updateTitlePosition();
        });
        stage.heightProperty().addListener((ob, old, now) -> {
            if (now == null) return;
            var h = now.doubleValue();
            sceneGroup.getNode().setPrefHeight(h - TITLE_BAR_HEIGHT - 0.5);
            resizeButton.setLayoutY(h - 8);
        });

        rootContainer.getChildren().addAll(root, resizeButton);
    }

    private void updateTitlePosition() {
        if (title.getText() == null || title.getText().isBlank()) {
            title.setVisible(false);
            return;
        }
        title.setVisible(true);
        var bounds = FXUtils.calculateTextBounds(title);
        var tWidth = bounds.getWidth();
        var tHeight = bounds.getHeight();
        var sWidth = stage.getWidth();
        title.setLayoutX((sWidth - tWidth) / 2);
        title.setLayoutY((TITLE_BAR_HEIGHT - tHeight) / 2);
    }

    public void setBackground(Paint paint) {
        root.setBackground(new Background(new BackgroundFill(
            paint,
            new CornerRadii(8),
            Insets.EMPTY)));
    }

    public Stage getStage() {
        return stage;
    }

    public Pane getRoot() {
        return root;
    }

    public VSceneGroup getSceneGroup() {
        return sceneGroup;
    }

    public VScene getInitialScene() {
        return content;
    }

    public void setTitle(String title) {
        this.title.setText(title);
    }

    public void setIconified(boolean iconified) {
        stage.setIconified(iconified);
    }

    private double stageOriginalX;
    private double stageOriginalY;
    private double stageOriginalW;
    private double stageOriginalH;

    public void setMaximized(boolean maximized) {
        if (this.maximized == maximized) {
            return;
        }
        this.maximized = maximized;
        maxrstBtn.updateImage();

        if (OSUtils.isMac()) {
            if (maximized) {
                stageOriginalX = stage.getX();
                stageOriginalY = stage.getY();
                stageOriginalW = stage.getWidth();
                stageOriginalH = stage.getHeight();
                var screen = FXUtils.getScreenOf(stage);
                if (screen == null) {
                    return;
                }
                var bounds = screen.getBounds();
                stage.setX(bounds.getMinX());
                stage.setY(bounds.getMinY() + 24);
                stage.setWidth(bounds.getWidth());
                stage.setHeight(bounds.getHeight() - 24);
            } else {
                stage.setX(stageOriginalX);
                stage.setY(stageOriginalY);
                stage.setWidth(stageOriginalW);
                stage.setHeight(stageOriginalH);
            }
        } else {
            stage.setMaximized(maximized);
        }
    }

    public boolean isMaximized() {
        return maximized;
    }

    public void close() {
        stage.close();
    }
}
