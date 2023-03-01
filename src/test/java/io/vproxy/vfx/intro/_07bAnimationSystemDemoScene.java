package io.vproxy.vfx.intro;

import io.vproxy.base.util.callback.Callback;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationInterrupted;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.manager.font.FontManager;
import io.vproxy.vfx.ui.alert.SimpleAlert;
import io.vproxy.vfx.ui.button.FusionButton;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.pane.FusionPane;
import io.vproxy.vfx.ui.scene.VSceneRole;
import io.vproxy.vfx.ui.wrapper.ThemeLabel;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.algebradata.XYData;
import javafx.geometry.Insets;
import javafx.scene.Cursor;
import javafx.scene.Group;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.HBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;
import javafx.scene.text.Font;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class _07bAnimationSystemDemoScene extends DemoVScene {
    public _07bAnimationSystemDemoScene() {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        var msgLabel = new ThemeLabel(
            "" +
            "The nodes are animation states, and the edges are the animating time from state to state.\n" +
            "Click the circles to select animating order, and hit 'Play' button to play."
        );
        FXUtils.observeWidthCenter(getContentPane(), msgLabel);
        msgLabel.setLayoutY(60);

        var agb = new AnimationGraphBuilder<XYData>();

        var circles = new ArrayList<CircleBtn>();
        var a = new CircleBtn("a", 60, 180, agb, circles);
        var b = new CircleBtn("b", 150, 60, agb, circles);
        var c = new CircleBtn("c", 330, 60, agb, circles);
        var d = new CircleBtn("d", 420, 180, agb, circles);
        var e = new CircleBtn("e", 330, 300, agb, circles);
        var f = new CircleBtn("f", 240, 180, agb, circles);
        var g = new CircleBtn("g", 150, 300, agb, circles);

        var content = new FusionPane();
        content.getNode().setPrefWidth(480);
        content.getNode().setPrefHeight(360);
        content.getNode().setLayoutY(150);
        FXUtils.observeWidthCenter(getContentPane(), content.getNode());
        content.getContentPane().getChildren().addAll(
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
        content.getContentPane().getChildren().addAll(a, b, c, d, e, f, g);

        var point = new Circle(10);
        point.setFill(Color.RED);
        point.setVisible(false);
        content.getContentPane().getChildren().add(point);

        agb.setApply((from, to, data) -> {
            point.setLayoutX(data.x);
            point.setLayoutY(data.y);
        });
        var animation = agb.build(a.node);

        var resetBtn = new FusionButton("reset") {{
            setPrefWidth(200);
            setPrefHeight(50);
        }};
        resetBtn.setOnAction(ev -> {
            for (var n : circles) {
                n.unsetIndex();
            }
        });
        var playBtn = new FusionButton("play") {{
            setPrefWidth(200);
            setPrefHeight(50);
        }};
        var softStopBtn = new FusionButton("soft stop") {{
            setDisable(true);
            setPrefWidth(200);
            setPrefHeight(50);
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
            var nodes = new ArrayList<AnimationNode<XYData>>();
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
                protected void onSucceeded(Void value) {
                    resetAll.run();
                }

                @Override
                protected void onFailed(Exception e) {
                    if (e instanceof AnimationInterrupted) {
                        return;
                    }
                    resetAll.run();
                    SimpleAlert.showAndWait(Alert.AlertType.ERROR, e.getMessage());
                }
            });
        });
        softStopBtn.setOnAction(ev -> {
            softStopBtn.setDisable(true);
            animation.play(animation.getCurrentNode(), Callback.ofFunction((v, ex) ->
                resetAll.run()
            ));
        });

        var buttonPane = new FusionPane(false);
        buttonPane.getContentPane().getChildren().add(new HBox(
            resetBtn,
            new HPadding(15),
            playBtn,
            new HPadding(15),
            softStopBtn
        ));
        FXUtils.observeWidthCenter(getContentPane(), buttonPane.getNode());
        buttonPane.getNode().setLayoutY(550);

        getContentPane().getChildren().addAll(msgLabel, content.getNode(), buttonPane.getNode());
    }

    private static Group line(CircleBtn a, CircleBtn b, int distance, AnimationGraphBuilder<XYData> agb) {
        var line = new Line();
        line.setStrokeWidth(2);
        line.setStroke(Color.WHITE);
        line.setStartX(a.getLayoutX());
        line.setStartY(a.getLayoutY());
        line.setEndX(b.getLayoutX());
        line.setEndY(b.getLayoutY());

        var label = new Label("" + distance) {{
            setFont(new Font(FontManager.FONT_NAME_JetBrainsMono, 20));
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

    @Override
    public String title() {
        return "Animation System Demo";
    }

    private static class CircleBtn extends Group {
        int index;
        final String nodeName;
        final AnimationNode<XYData> node;
        final List<CircleBtn> circles;
        final Label label = new Label() {{
            setFont(new Font(FontManager.FONT_NAME_JetBrainsMono, 24));
        }};

        public CircleBtn(String nodeName, double x, double y, AnimationGraphBuilder<XYData> agb, List<CircleBtn> circles) {
            this.nodeName = nodeName;
            var circle = new Circle(20);
            circle.setStrokeWidth(0);
            circle.setFill(Color.WHITE);
            unsetIndex();
            getChildren().addAll(circle, label);
            setLayoutX(x);
            setLayoutY(y);
            node = new AnimationNode<>(nodeName, new XYData(x, y));
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
