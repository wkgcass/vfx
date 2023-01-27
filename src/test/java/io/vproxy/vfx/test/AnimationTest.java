package io.vproxy.vfx.test;

import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.alert.SimpleAlert;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.pane.FusionPane;
import io.vproxy.vfx.ui.stage.VStage;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.algebradata.TransitionData;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Cursor;
import javafx.scene.Group;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;
import javafx.scene.text.Font;
import javafx.stage.Stage;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class AnimationTest extends Application {
    @Override
    public void start(Stage primaryStage) {
        var stage = new VStage(primaryStage);
        stage.getStage().setWidth(500);
        stage.getStage().setHeight(380);

        var padTop = 20;
        var padLeft = 65;

        var agb = new AnimationGraphBuilder<TransitionData>();

        var circles = new ArrayList<CircleBtn>();
        var a = new CircleBtn("a", padLeft + 38, padTop + 116, agb, circles);
        var b = new CircleBtn("b", padLeft + 111, padTop + 37, agb, circles);
        var c = new CircleBtn("c", padLeft + 264, padTop + 37, agb, circles);
        var d = new CircleBtn("d", padLeft + 336, padTop + 116, agb, circles);
        var e = new CircleBtn("e", padLeft + 264, padTop + 189, agb, circles);
        var f = new CircleBtn("f", padLeft + 189, padTop + 116, agb, circles);
        var g = new CircleBtn("g", padLeft + 111, padTop + 189, agb, circles);

        var content = new Pane();
        content.getChildren().addAll(
            line(a, b, 12, agb),
            line(a, g, 14, agb),
            line(a, f, 16, agb),
            line(b, c, 10, agb),
            line(b, f, 7, agb),
            line(c, d, 3, agb),
            line(c, e, 5, agb),
            line(c, f, 6, agb),
            line(d, e, 4, agb),
            line(e, f, 2, agb),
            line(e, g, 8, agb),
            line(f, g, 9, agb)
        );
        content.getChildren().addAll(a, b, c, d, e, f, g);

        var point = new Circle(10);
        point.setFill(Color.RED);
        point.setVisible(false);
        content.getChildren().add(point);

        agb.setApply(data -> {
            point.setLayoutX(data.x);
            point.setLayoutY(data.y);
        });
        var animation = agb.build(a.node);

        var resetBtn = new FusionButton("reset");
        resetBtn.setOnAction(ev -> {
            for (var n : circles) {
                n.unsetIndex();
            }
        });
        var playBtn = new FusionButton("play");
        var softStopBtn = new FusionButton("soft stop") {{
            setDisable(true);
        }};

        Runnable resetAll = () -> {
            playBtn.setDisable(false);
            resetBtn.setDisable(false);
            softStopBtn.setDisable(true);
            point.setVisible(false);
            for (var n : circles) {
                n.unsetIndex();
            }
        };

        playBtn.setOnAction(ev -> {
            var nodes = new ArrayList<AnimationNode<TransitionData>>();
            circles.stream().filter(n -> n.index != 0).sorted(Comparator.comparingInt(x -> x.index)).forEach(n -> nodes.add(n.node));
            if (nodes.isEmpty()) {
                return;
            }
            var first = nodes.remove(0);
            if (nodes.isEmpty()) {
                return;
            }
            playBtn.setDisable(true);
            resetBtn.setDisable(true);
            softStopBtn.setDisable(false);
            point.setVisible(true);
            animation.stopAndSetNode(first);
            animation.play(nodes, new Callback<>() {
                @Override
                protected void succeeded0(Void value) {
                    resetAll.run();
                }

                @Override
                protected void failed0(Exception e) {
                    resetAll.run();
                    SimpleAlert.showAndWait(Alert.AlertType.ERROR, e.getMessage());
                }
            });
        });
        softStopBtn.setOnAction(ev -> {
            softStopBtn.setDisable(true);
            animation.revertToLastNode(new Callback<>() {
                @Override
                protected void succeeded0(Void value) {
                    resetAll.run();
                }
            });
        });

        var pane = new FusionPane();
        pane.getContentPane().getChildren().add(new HBox(
            resetBtn,
            new HPadding(5),
            playBtn,
            new HPadding(5),
            softStopBtn
        ));
        pane.getNode().setLayoutX(100);
        pane.getNode().setLayoutY(300);

        content.getChildren().add(pane.getNode());

        stage.getInitialScene().getContentPane().getChildren().add(content);

        stage.getStage().centerOnScreen();
        stage.getStage().show();
    }

    private static Group line(CircleBtn a, CircleBtn b, int distance, AnimationGraphBuilder<TransitionData> agb) {
        var line = new Line();
        line.setStrokeWidth(2);
        line.setStroke(Color.WHITE);
        line.setStartX(a.getLayoutX());
        line.setStartY(a.getLayoutY());
        line.setEndX(b.getLayoutX());
        line.setEndY(b.getLayoutY());

        var label = new Label("" + distance) {{
            setFont(new Font(FontManager.FONT_NAME_JetBrainsMono, 15));
            setBackground(new Background(new BackgroundFill(Color.WHITE, CornerRadii.EMPTY, Insets.EMPTY)));
        }};
        var bounds = FXUtils.calculateTextBounds(label);
        var midX = (line.getStartX() + line.getEndX()) / 2;
        var midY = (line.getStartY() + line.getEndY()) / 2;

        label.setLayoutX(midX - bounds.getWidth() / 2);
        label.setLayoutY(midY - bounds.getHeight() / 2);

        agb.addEdge(a.node, b.node, distance * 100L);
        agb.addEdge(b.node, a.node, distance * 100L);

        return new Group(line, label);
    }

    private static class CircleBtn extends Group {
        int index;
        final String nodeName;
        final AnimationNode<TransitionData> node;
        final List<CircleBtn> circles;
        final Label label = new Label() {{
            setFont(new Font(FontManager.FONT_NAME_JetBrainsMono, 24));
        }};

        public CircleBtn(String nodeName, double x, double y, AnimationGraphBuilder<TransitionData> agb, List<CircleBtn> circles) {
            this.nodeName = nodeName;
            var circle = new Circle(20);
            circle.setStrokeWidth(0);
            circle.setFill(Color.WHITE);
            unsetIndex();
            getChildren().addAll(circle, label);
            setLayoutX(x);
            setLayoutY(y);
            node = new AnimationNode<>(nodeName, new TransitionData(x, y));
            agb.addNode(node);
            this.circles = circles;
            circles.add(this);

            setOnMouseClicked(e -> {
                if (index == 0) {
                    int max = 0;
                    for (var c : circles) {
                        if (c.index > max) {
                            max = c.index;
                        }
                    }
                    setIndex(max + 1);
                } else {
                    for (var c : circles) {
                        if (c.index != 0 && c.index > index) {
                            c.setIndex(c.index - 1);
                        }
                    }
                    unsetIndex();
                }
            });
            setCursor(Cursor.HAND);
        }

        private void setIndex(int index) {
            this.index = index;
            label.setText("" + index);
            var bounds = FXUtils.calculateTextBounds(label);
            label.setLayoutX((-bounds.getWidth()) / 2);
            label.setLayoutY((-bounds.getHeight()) / 2);
        }

        public void unsetIndex() {
            index = 0;
            label.setText(nodeName);
            var bounds = FXUtils.calculateTextBounds(label);
            label.setLayoutX((-bounds.getWidth()) / 2);
            label.setLayoutY((-bounds.getHeight()) / 2);
        }
    }
}
