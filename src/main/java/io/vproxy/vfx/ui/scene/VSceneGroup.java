package io.vproxy.vfx.ui.scene;

import io.vproxy.vfx.animation.AnimationNode;
import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.FXUtils;
import io.vproxy.vfx.util.algebradata.XYZTData;
import javafx.geometry.Insets;
import javafx.scene.Group;
import javafx.scene.layout.*;

import java.util.*;

public class VSceneGroup {
    private final VSceneGroupInitParams initParams;
    private final Pane root = new Pane();
    private final Set<VScene> scenes = new HashSet<>();
    private final Group mainSceneGroup = new Group();
    private VScene currentMainScene;
    private VScene nextMainScene = null;
    private final Set<VScene> showingScenes = new HashSet<>();
    private final Set<VScene> animatingShow = new HashSet<>();
    private final Set<VScene> animatingHide = new HashSet<>();

    public VSceneGroup(VScene initialMainScene) {
        this(initialMainScene, new VSceneGroupInitParams());
    }

    public VSceneGroup(VScene initialMainScene, VSceneGroupInitParams initParams) {
        if (initialMainScene.role != VSceneRole.MAIN) {
            throw new IllegalArgumentException(initialMainScene + " is not a MAIN scene");
        }
        this.initParams = initParams;
        if (initParams.useClip) {
            FXUtils.makeClipFor(root, 4);
        }
        root.getChildren().add(mainSceneGroup);

        scenes.add(initialMainScene);
        initialMainScene.bundle = initialMainScene.getNode();
        mainSceneGroup.getChildren().add(initialMainScene.bundle);
        this.currentMainScene = initialMainScene;
        initialMainScene.parentChildren = mainSceneGroup.getChildren();
        initialMainScene.progressInformer = this::progressUpdate;

        initialMainScene.changeListeners.add(
            FXUtils.observeWidth(root, initialMainScene.getNode())
        );
        initialMainScene.changeListeners.add(
            FXUtils.observeHeight(root, initialMainScene.getNode())
        );

        initialMainScene.animationGraph.stopAndSetNode(initialMainScene.stateCenterShown);
    }

    public void addScene(VScene scene) {
        addScene(scene, null);
    }

    public void addScene(VScene scene, VSceneHideMethod defaultHideMethod) {
        addScene(scene, defaultHideMethod, new VSceneAddParams());
    }

    public void addScene(VScene scene, VSceneHideMethod defaultHideMethod, VSceneAddParams addParams) {
        if (!this.scenes.add(scene)) {
            throw new IllegalArgumentException("scene " + scene + " already added");
        }
        if (defaultHideMethod == null) {
            if (scene.role != VSceneRole.MAIN) {
                throw new IllegalArgumentException("non-main scene must use addScene(VScene, VSceneHideMethod) to add the scene to scene group");
            }
        }

        if (scene.role.manageWidth) {
            scene.changeListeners.add(
                FXUtils.observeWidth(root, scene.getNode())
            );
        }
        if (scene.role.manageHeight) {
            scene.changeListeners.add(
                FXUtils.observeHeight(root, scene.getNode())
            );
        }
        if (scene.role.centralWidth) {
            scene.changeListeners.add(
                FXUtils.observeWidthCenter(root, scene.getNode())
            );
        }
        if (scene.role.centralHeight) {
            scene.changeListeners.add(
                FXUtils.observeHeightCenter(root, scene.getNode())
            );
        }
        if (scene.role.showCover) {
            var cover = new Pane() {{
                setBackground(new Background(new BackgroundFill(
                    initParams.gradientCover
                        ? Theme.current().makeCoverGradientBackground()
                        : Theme.current().coverBackgroundColor(),
                    CornerRadii.EMPTY,
                    Insets.EMPTY
                )));
            }};
            if (scene.role.temporary && addParams.coverClickable) {
                cover.setOnMouseClicked(e -> hide(scene, defaultHideMethod));
            }
            scene.cover = cover;
            scene.bundle = new Group(cover, scene.getNode());
            scene.bundle.sceneProperty().addListener((ob, old, now) -> {
                if (now == null) return;
                cover.setPrefWidth(root.getWidth());
                cover.setPrefHeight(root.getHeight());
            });
        } else {
            scene.bundle = scene.getNode();
        }
        scene.defaultHideMethod = defaultHideMethod;
        if (scene.role == VSceneRole.MAIN) {
            scene.parentChildren = mainSceneGroup.getChildren();
        } else {
            scene.parentChildren = root.getChildren();
        }
        scene.progressInformer = this::progressUpdate;
    }

    public void removeScene(VScene scene) {
        if (currentMainScene == scene) {
            throw new IllegalArgumentException("currentMainScene cannot be removed: " + currentMainScene);
        }
        if (!scenes.contains(scene)) {
            throw new NoSuchElementException("" + scene);
        }

        scene.animationGraph.stopAndSetNode(scene.stateRemoved);

        for (var lsn : scene.changeListeners) {
            root.widthProperty().removeListener(lsn);
            root.heightProperty().removeListener(lsn);
            scene.getNode().widthProperty().removeListener(lsn);
            scene.getNode().heightProperty().removeListener(lsn);
        }
        scene.changeListeners.clear();
        root.getChildren().remove(scene.bundle);
        mainSceneGroup.getChildren().remove(scene.bundle);
        scene.bundle = null;
        scene.cover = null;
        scene.defaultHideMethod = null;
        scene.parentChildren = null;
        scene.progressInformer = null;

        showingScenes.remove(scene);
        animatingHide.remove(scene);
        animatingShow.remove(scene);
        scenes.remove(scene);
        scene.getNode().setLayoutX(0);
        scene.getNode().setLayoutY(0);
    }

    public void show(VScene scene, VSceneShowMethod method) {
        if (scene == currentMainScene || showingScenes.contains(scene)) {
            return;
        }
        if (!scenes.contains(scene)) {
            throw new IllegalArgumentException(scene + " is not managed by this scene group");
        }
        if (animatingHide.contains(scene)) {
            animatingHide.remove(scene);
            animatingShow.add(scene);
            scene.animationGraph.play(scene.stateCenterShown, Callback.ignoreExceptionHandler(v -> postShowing(scene)));
            return;
        }
        if (animatingShow.contains(scene)) {
            return;
        }
        if (scene.role == VSceneRole.MAIN) {
            nextMainScene = scene;
        }
        Callback<Void, Exception> cb = Callback.ignoreExceptionHandler(v -> showStep2(scene, method));
        switch (method) {
            case FROM_TOP:
                scene.animationGraph.play(scene.stateTop, cb);
                if (scene.role == VSceneRole.MAIN) {
                    hideSkipCheck(currentMainScene, VSceneHideMethod.TO_BOTTOM);
                }
                break;
            case FROM_BOTTOM:
                scene.animationGraph.play(scene.stateBottom, cb);
                if (scene.role == VSceneRole.MAIN) {
                    hideSkipCheck(currentMainScene, VSceneHideMethod.TO_TOP);
                }
                break;
            case FROM_LEFT:
                scene.animationGraph.play(scene.stateLeft, cb);
                if (scene.role == VSceneRole.MAIN) {
                    hideSkipCheck(currentMainScene, VSceneHideMethod.TO_RIGHT);
                }
                break;
            case FROM_RIGHT:
                scene.animationGraph.play(scene.stateRight, cb);
                if (scene.role == VSceneRole.MAIN) {
                    hideSkipCheck(currentMainScene, VSceneHideMethod.TO_LEFT);
                }
                break;
            case FADE_IN:
                scene.animationGraph.play(scene.stateFaded, cb);
                if (scene.role == VSceneRole.MAIN) {
                    hideSkipCheck(currentMainScene, VSceneHideMethod.FADE_OUT);
                }
                break;
        }
    }

    private void showStep2(VScene scene, VSceneShowMethod method) {
        switch (method) {
            case FROM_TOP:
                scene.x0 = 0;
                scene.y0 = 0;
                scene.yN = -scene.getNode().getHeight();
                doAnimate(scene, null, true);
                break;
            case FROM_BOTTOM:
                scene.x0 = 0;
                scene.y0 = root.getHeight() - scene.getNode().getHeight();
                scene.y1 = root.getHeight();
                doAnimate(scene, null, true);
                break;
            case FROM_LEFT:
                scene.x0 = 0;
                scene.y0 = 0;
                scene.xN = -scene.getNode().getWidth();
                doAnimate(scene, null, true);
                break;
            case FROM_RIGHT:
                scene.x0 = root.getWidth() - scene.getNode().getWidth();
                scene.y0 = 0;
                scene.x1 = root.getWidth();
                doAnimate(scene, null, true);
                break;
            case FADE_IN:
                scene.x0 = scene.getNode().getLayoutX();
                scene.y0 = scene.getNode().getLayoutY();
                doAnimate(scene, null, true);
                break;
        }
    }

    public void hide(VScene scene, VSceneHideMethod method) {
        if (!scenes.contains(scene)) {
            throw new IllegalArgumentException(scene + " is not managed by this scene group");
        }
        if (currentMainScene != scene && !showingScenes.contains(scene)) {
            return;
        }
        if (scene.role == VSceneRole.MAIN) {
            throw new IllegalArgumentException(scenes + " cannot be hidden manually");
        }
        hideSkipCheck(scene, method);
    }

    private void hideSkipCheck(VScene scene, VSceneHideMethod method) {
        if (animatingShow.contains(scene)) {
            animatingShow.remove(scene);
            animatingHide.add(scene);
            scene.animationGraph.play(scene.stateRemoved, Callback.ignoreExceptionHandler(v -> postHiding(scene)));
            return;
        }
        if (animatingHide.contains(scene)) {
            return;
        }
        scene.x0 = scene.getNode().getLayoutX();
        scene.y0 = scene.getNode().getLayoutY();
        switch (method) {
            case TO_TOP:
                scene.yN = -scene.getNode().getHeight();
                doAnimate(scene, scene.stateTop, false);
                break;
            case TO_BOTTOM:
                scene.y1 = root.getHeight();
                doAnimate(scene, scene.stateBottom, false);
                break;
            case TO_LEFT:
                scene.xN = -scene.getNode().getWidth();
                doAnimate(scene, scene.stateLeft, false);
                break;
            case TO_RIGHT:
                scene.x1 = root.getWidth();
                doAnimate(scene, scene.stateRight, false);
                break;
            case FADE_OUT:
                doAnimate(scene, scene.stateFaded, false);
                break;
        }
    }

    private void progressUpdate(VScene scene, double p) {
        animateCover(scene, p);
    }

    private void animateCover(VScene scene, double p) {
        if (scene.cover != null) {
            scene.cover.setOpacity(p);
        }
    }

    private void doAnimate(VScene scene, AnimationNode<XYZTData> keyNode, boolean isShowing) {
        var animatingSet = isShowing ? animatingShow : animatingHide;
        animatingSet.add(scene);
        Callback<Void, Exception> cb = Callback.ignoreExceptionHandler(v -> {
            animatingSet.remove(scene);
            if (isShowing) {
                postShowing(scene);
            } else {
                postHiding(scene);
            }
        });
        if (isShowing) {
            scene.animationGraph.play(scene.stateCenterShown, cb);
        } else {
            scene.animationGraph.play(List.of(keyNode, scene.stateRemoved), cb);
        }
    }

    private void postShowing(VScene scene) {
        if (scene.role == VSceneRole.MAIN) {
            currentMainScene = scene;
            nextMainScene = null;
        } else {
            showingScenes.add(scene);
        }
        scene.getContentPane().requestFocus();
    }

    private void postHiding(VScene scene) {
        showingScenes.remove(scene);
        if (scene.role != VSceneRole.MAIN) {
            currentMainScene.getContentPane().requestFocus();
        }
    }

    public VScene getCurrentMainScene() {
        return currentMainScene;
    }

    public VScene getNextMainScene() {
        return nextMainScene;
    }

    public VScene getNextOrCurrentMainScene() {
        var nx = getNextMainScene();
        if (nx == null) return getCurrentMainScene();
        return nx;
    }

    public boolean isShowing(VScene scene) {
        return scene == currentMainScene || showingScenes.contains(scene) || animatingShow.contains(scene);
    }

    public Set<VScene> getScenes() {
        return Collections.unmodifiableSet(scenes);
    }

    public Region getNode() {
        return root;
    }

    interface ProgressInformer {
        void informUpdate(VScene scene, double p);
    }
}
