package io.vproxy.vfx.ui.pane;

import io.vproxy.base.util.callback.Callback;
import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.ui.layout.HPadding;
import io.vproxy.vfx.ui.layout.VPadding;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.algebradata.ColorData;
import io.vproxy.vfx.util.algebradata.DoubleData;
import javafx.scene.Node;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;

public class FusionPane {
    public static final int PADDING_V = 10;
    public static final int PADDING_H = 10;

    private final AnimationGraph<DoubleData> contentOpacityAnimation;
    private final AnimationNode<DoubleData> contentOpacityNormalNode;
    private final AnimationNode<DoubleData> contentOpacityHoverNode;

    private final AbstractFusionPane root = buildRootNode();

    private final Pane content = new Pane();

    public FusionPane() {
        this(true);
    }

    public FusionPane(Node... nodes) {
        this(true, nodes);
    }

    public FusionPane(boolean manuallyHandleOuterRegion) {
        this(manuallyHandleOuterRegion, new Node[0]);
    }

    public FusionPane(boolean manuallyHandleOuterRegion, Node... nodes) {
        root.getChildren().add(new VBox(
            new VPadding(PADDING_V),
            new HBox(
                new HPadding(PADDING_H),
                content,
                new HPadding(PADDING_H)
            ),
            new VPadding(PADDING_V)
        ));
        if (manuallyHandleOuterRegion) {
            FXUtils.observeWidthHeightWithPreferred(root, content, -PADDING_H * 2, -PADDING_V * 2);
        }
        FXUtils.makeClipFor(content, 4);
        getContentPane().getChildren().addAll(nodes);

        contentOpacityNormalNode = new AnimationNode<>("normal", new DoubleData(
            root.normalContentOpacity()
        ));
        contentOpacityHoverNode = new AnimationNode<>("hover", new DoubleData(
            root.hoverContentOpacity()
        ));

        contentOpacityAnimation = AnimationGraphBuilder
            .simpleTwoNodeGraph(contentOpacityNormalNode, contentOpacityHoverNode, 300)
            .setApply((from, to, data) -> content.setOpacity(data.value))
            .build(contentOpacityNormalNode);
    }

    protected AbstractFusionPane buildRootNode() {
        return new FusionPaneImpl();
    }

    public Region getNode() {
        return root;
    }

    public Pane getContentPane() {
        return content;
    }

    protected class FusionPaneImpl extends AbstractFusionPane {
        private final AnimationNode<ColorData> border = new AnimationNode<>("solid",
            new ColorData(hoverBorderColor()));
        private final AnimationNode<ColorData> noBorder = new AnimationNode<>("transparent",
            new ColorData(normalBorderColor()));

        private final AnimationGraph<ColorData> borderAnimation = AnimationGraphBuilder
            .simpleTwoNodeGraph(noBorder, border, 300)
            .setApply((from, to, data) ->
                setBorder(new Border(new BorderStroke(
                    data.getColor(), BorderStrokeStyle.SOLID,
                    cornerRadii, new BorderWidths(0.5)
                ))))
            .build(noBorder);

        @Override
        protected void onMouseEntered() {
            super.onMouseEntered();
            borderAnimation.play(border);
            contentOpacityAnimation.play(contentOpacityHoverNode);
        }

        @Override
        protected void onMouseExited() {
            super.onMouseExited();
            borderAnimation.play(noBorder, Callback.ofIgnoreExceptionFunction(v -> setBorder(Border.EMPTY)));
            contentOpacityAnimation.play(contentOpacityNormalNode);
        }

        @Override
        protected void onMouseClicked() {
        }

        @Override
        protected CornerRadii getCornerRadii() {
            return new CornerRadii(8);
        }

        protected Color normalBorderColor() {
            var c = Theme.current().fusionPaneBorderColor();
            return new Color(
                c.getRed(),
                c.getGreen(),
                c.getBlue(),
                0);
        }

        protected Color hoverBorderColor() {
            return Theme.current().fusionPaneBorderColor();
        }
    }
}
