package io.vproxy.vfx.ui.scene;

import io.vproxy.vfx.animation.AnimationGraph;
import io.vproxy.vfx.animation.AnimationGraphBuilder;
import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.control.scroll.VScrollPane;
import io.vproxy.vfx.control.scroll.NodeWithVScrollPane;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.algebradata.XYZTData;
import javafx.beans.value.ChangeListener;
import javafx.collections.ObservableList;
import javafx.scene.Node;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Region;

import java.util.HashSet;
import java.util.Set;

public class VScene implements NodeWithVScrollPane {
    public static final int ANIMATION_DURATION_MILLIS = 300;
    private static final int SHOW_DELAY_MILLIS = 50;

    private final Pane root = new Pane();
    private final VScrollPane scrollPane = new VScrollPane();
    private final Pane content = new Pane();
    public final VSceneRole role;
    private ImageView backgroundImage;

    final AnimationNode<XYZTData> stateTop = new AnimationNode<>("top", new XYZTData(0, -1, 1, 0));
    final AnimationNode<XYZTData> stateRight = new AnimationNode<>("right", new XYZTData(1, 0, 1, 0));
    final AnimationNode<XYZTData> stateBottom = new AnimationNode<>("bottom", new XYZTData(0, 1, 1, 0));
    final AnimationNode<XYZTData> stateLeft = new AnimationNode<>("left", new XYZTData(-1, 0, 1, 0));
    final AnimationNode<XYZTData> stateCenterShown = new AnimationNode<>("center", new XYZTData(0, 0, 1, 1));
    final AnimationNode<XYZTData> stateFaded = new AnimationNode<>("faded", new XYZTData(0, 0, Float.MIN_VALUE * 2, 0));
    final AnimationNode<XYZTData> stateRemoved = new AnimationNode<>("removed", new XYZTData(0, 0, 1, 0),
        this::transferredToRemovedState);

    final AnimationGraph<XYZTData> animationGraph = new AnimationGraphBuilder<XYZTData>()
        .addNode(stateTop)
        .addNode(stateRight)
        .addNode(stateBottom)
        .addNode(stateLeft)
        .addNode(stateCenterShown)
        .addNode(stateFaded)
        .addNode(stateRemoved)
        .addEdge(stateRemoved, stateTop, SHOW_DELAY_MILLIS)
        .addEdge(stateRemoved, stateRight, SHOW_DELAY_MILLIS)
        .addEdge(stateRemoved, stateBottom, SHOW_DELAY_MILLIS)
        .addEdge(stateRemoved, stateLeft, SHOW_DELAY_MILLIS)
        .addEdge(stateRemoved, stateFaded, SHOW_DELAY_MILLIS)
        .addEdge(stateTop, stateRemoved, 1)
        .addEdge(stateRight, stateRemoved, 1)
        .addEdge(stateBottom, stateRemoved, 1)
        .addEdge(stateLeft, stateRemoved, 1)
        .addEdge(stateFaded, stateRemoved, 1)
        .addEdge(stateTop, stateCenterShown, ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
        .addEdge(stateRight, stateCenterShown, ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
        .addEdge(stateBottom, stateCenterShown, ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
        .addEdge(stateLeft, stateCenterShown, ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
        .addEdge(stateFaded, stateCenterShown, ANIMATION_DURATION_MILLIS - SHOW_DELAY_MILLIS)
        .addEdge(stateCenterShown, stateTop, ANIMATION_DURATION_MILLIS - 1)
        .addEdge(stateCenterShown, stateRight, ANIMATION_DURATION_MILLIS - 1)
        .addEdge(stateCenterShown, stateBottom, ANIMATION_DURATION_MILLIS - 1)
        .addEdge(stateCenterShown, stateLeft, ANIMATION_DURATION_MILLIS - 1)
        .addEdge(stateCenterShown, stateFaded, ANIMATION_DURATION_MILLIS - 1)
        .setStateTransferBeginCallback(this::animationStateTransferBegin)
        .setApply(this::applyAnimation)
        .build(stateRemoved);

    VSceneGroup.ProgressInformer progressInformer;
    ObservableList<Node> parentChildren;
    double xN;
    double yN;
    double x0;
    double y0;
    double x1;
    double y1;
    final Set<ChangeListener<? super Number>> changeListeners = new HashSet<>();
    Node bundle;
    Pane cover;
    VSceneHideMethod defaultHideMethod;

    public VScene(VSceneRole role) {
        this.role = role;
        scrollPane.setContent(content);
        FXUtils.observeWidthHeight(root, scrollPane.getNode());
        root.getChildren().add(scrollPane.getNode());

        root.widthProperty().addListener(ob -> updateBackgroundImagePos());
        root.heightProperty().addListener(ob -> updateBackgroundImagePos());
    }

    public Region getNode() {
        return root;
    }

    @Override
    public VScrollPane getScrollPane() {
        return scrollPane;
    }

    @Override
    public Region getSelfNode() {
        return getNode();
    }

    public Pane getContentPane() {
        return content;
    }

    public void enableAutoContentWidthHeight() {
        enableAutoContentWidth();
        enableAutoContentHeight();
    }

    public void enableAutoContentWidth() {
        FXUtils.observeWidth(root, content, -1);
    }

    public void enableAutoContentHeight() {
        FXUtils.observeHeight(root, content, -1);
    }

    private void transferredToRemovedState(AnimationNode<XYZTData> from, AnimationNode<XYZTData> to) {
        if (parentChildren != null && bundle != null) {
            parentChildren.remove(bundle);
        }
    }

    private void applyAnimation(AnimationNode<XYZTData> from, AnimationNode<XYZTData> to, XYZTData data) {
        if (from == stateRemoved || to == stateRemoved) {
            return; // do not animate in this state
        }

        double x = data.x;
        double y = data.y;
        double opacity = data.z;
        if (x < 0) {
            x = (xN - x0) * (-x) + x0;
        } else if (x > 0) {
            x = (x1 - x0) * x + x0;
        } else {
            x = x0;
        }
        if (y < 0) {
            y = (yN - y0) * (-y) + y0;
        } else if (y > 0) {
            y = (y1 - y0) * y + y0;
        } else {
            y = y0;
        }
        getNode().setLayoutX(x);
        getNode().setLayoutY(y);
        getNode().setOpacity(opacity);
        if (progressInformer != null) // it is null when constructing
            progressInformer.informUpdate(this, data.t);
    }

    private void animationStateTransferBegin(AnimationNode<XYZTData> from, AnimationNode<XYZTData> to) {
        if (from == stateRemoved) {
            if (bundle != null) {
                bundle.setOpacity(Float.MIN_VALUE * 2);
                bundle.setMouseTransparent(true);
                if (parentChildren != null) {
                    if (!parentChildren.contains(bundle)) {
                        parentChildren.add(bundle);
                    }
                }
            }
        } else if (from == stateTop || from == stateBottom || from == stateLeft || from == stateRight || from == stateFaded) {
            if (to == stateCenterShown) {
                if (bundle != null) {
                    bundle.setOpacity(1);
                    bundle.setMouseTransparent(false);
                }
            }
        }
    }

    public void setBackgroundImage(Image img) {
        if (img == null) {
            if (backgroundImage == null) {
                return;
            }
            root.getChildren().remove(backgroundImage);
            backgroundImage = null;
            return;
        }
        if (backgroundImage == null) {
            backgroundImage = new ImageView(img);
            backgroundImage.setPreserveRatio(true);
            root.getChildren().add(0, backgroundImage);
        } else {
            backgroundImage.setImage(img);
        }
        updateBackgroundImagePos();
    }

    private void updateBackgroundImagePos() {
        if (backgroundImage == null)
            return;
        if (backgroundImage.getImage() == null)
            return;
        var iw = backgroundImage.getImage().getWidth();
        var ih = backgroundImage.getImage().getHeight();
        var nw = root.getWidth();
        var nh = root.getHeight();
        if (nw <= 0 || nh <= 0 || iw <= 0 || ih <= 0)
            return;
        if (iw / ih > nw / nh) {
            backgroundImage.setFitHeight(nh);
            backgroundImage.setFitWidth(nh * iw / ih);
        } else {
            backgroundImage.setFitWidth(nw);
            backgroundImage.setFitHeight(nw * ih / iw);
        }
        var bw = backgroundImage.getFitWidth();
        var bh = backgroundImage.getFitHeight();
        backgroundImage.setLayoutX((nw - bw) / 2);
        backgroundImage.setLayoutY((nh - bh) / 2);
    }

    @SuppressWarnings("RedundantThrows")
    protected void beforeShowing() throws Exception {
    }

    protected void onHidden() {
    }
}
