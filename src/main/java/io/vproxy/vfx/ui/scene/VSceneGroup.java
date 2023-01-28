package io.vproxy.vfx.ui.scene;

import io.vproxy.vfx.theme.Theme;
import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.FXUtils;
import javafx.geometry.Insets;
import javafx.scene.Group;
import javafx.scene.layout.*;

import java.util.HashSet;
import java.util.NoSuchElementException;
import java.util.Set;

public class VSceneGroup {
    private final Pane root = new Pane();
    private final Set<VScene> scenes = new HashSet<>();
    private final Group mainSceneGroup = new Group();
    private VScene currentMainScene;
    private final Set<VScene> showingScenes = new HashSet<>();
    private final Set<VScene> animatingShow = new HashSet<>();
    private final Set<VScene> animatingHide = new HashSet<>();

    public VSceneGroup(VScene initialMainScene) {
        if (initialMainScene.role != VSceneRole.MAIN) {
            throw new IllegalArgumentException(initialMainScene + " is not a MAIN scene");
        }
        root.getChildren().add(mainSceneGroup);

        scenes.add(initialMainScene);
        initialMainScene.bundle = initialMainScene.getNode();
        mainSceneGroup.getChildren().add(initialMainScene.bundle);
        this.currentMainScene = initialMainScene;

        initialMainScene.changeListeners.add(
            FXUtils.observeWidth(root, initialMainScene.getNode())
        );
        initialMainScene.changeListeners.add(
            FXUtils.observeHeight(root, initialMainScene.getNode())
        );
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
                    Theme.current().coverBackgroundColor(),
                    CornerRadii.EMPTY,
                    Insets.EMPTY
                )));
            }};
            if (scene.role.temporary && addParams.coverClickable) {
                cover.setOnMouseClicked(e -> hide(scene, defaultHideMethod));
            }
            scene.cover = cover;
            scene.bundle = new Group(cover, scene.getNode());
            scene.bundle.visibleProperty().addListener((ob, old, now) -> {
                if (now == null) return;
                if (!now) return;
                cover.setPrefWidth(root.getWidth());
                cover.setPrefHeight(root.getHeight());
            });
        } else {
            scene.bundle = scene.getNode();
        }
        scene.defaultHideMethod = defaultHideMethod;

        setAfterHiding(scene);
        if (scene.role == VSceneRole.MAIN) {
            mainSceneGroup.getChildren().add(scene.bundle);
        } else {
            root.getChildren().add(scene.bundle);
        }
    }

    public void removeScene(VScene scene) {
        if (currentMainScene == scene) {
            throw new IllegalArgumentException("currentMainScene cannot be removed: " + currentMainScene);
        }
        if (!scenes.contains(scene)) {
            throw new NoSuchElementException("" + scene);
        }

        for (var lsn : scene.changeListeners) {
            root.widthProperty().removeListener(lsn);
            root.heightProperty().removeListener(lsn);
        }
        scene.changeListeners.clear();
        root.getChildren().remove(scene.bundle);
        mainSceneGroup.getChildren().remove(scene.bundle);
        scene.bundle = null;
        scene.cover = null;
        scene.defaultHideMethod = null;

        scene.animationFunction = null;
        scene.progress.stopAndSetNode(scene.state0);

        showingScenes.remove(scene);
        animatingHide.remove(scene);
        animatingShow.remove(scene);
        scenes.remove(scene);
        scene.getNode().setLayoutX(0);
        scene.getNode().setLayoutY(0);
    }

    private void setBeforeShowing(VScene scene) {
        scene.bundle.setVisible(true);
        scene.bundle.setMouseTransparent(false);

        // move to top
        if (scene.role == VSceneRole.MAIN) {
            mainSceneGroup.getChildren().remove(scene.bundle);
            mainSceneGroup.getChildren().add(scene.bundle);
        } else {
            root.getChildren().remove(scene.bundle);
            root.getChildren().add(scene.bundle);
        }
    }

    private void setAfterHiding(VScene scene) {
        scene.bundle.setVisible(false);
        scene.bundle.setMouseTransparent(true);
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
            scene.progress.revertToLastNode(Callback.handler((v, ex) -> postShowing(scene)));
            return;
        }
        if (animatingShow.contains(scene)) {
            return;
        }
        setBeforeShowing(scene);
        switch (method) {
            case FROM_TOP:
                animate(scene, 0, -scene.getNode().getHeight(), 0, 0, true);
                break;
            case FROM_BOTTOM:
                animate(scene, 0, root.getHeight(), 0, root.getHeight() - scene.getNode().getHeight(), true);
                break;
            case FROM_LEFT:
                animate(scene, -scene.getNode().getWidth(), 0, 0, 0, true);
                break;
            case FROM_RIGHT:
                animate(scene, root.getWidth(), 0, root.getWidth() - scene.getNode().getWidth(), 0, true);
                break;
            case FADE_IN:
                animateFade(scene, 0, 1, true);
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
        if (animatingShow.contains(scene)) {
            animatingShow.remove(scene);
            animatingHide.add(scene);
            scene.progress.revertToLastNode(Callback.handler((v, ex) -> postHiding(scene)));
            return;
        }
        if (animatingHide.contains(scene)) {
            return;
        }
        switch (method) {
            case TO_TOP:
                animate(scene,
                    scene.getNode().getLayoutX(), scene.getNode().getLayoutY(),
                    scene.getNode().getLayoutX(), -scene.getNode().getHeight(), false);
                break;
            case TO_BOTTOM:
                animate(scene,
                    scene.getNode().getLayoutX(), scene.getNode().getLayoutY(),
                    scene.getNode().getLayoutX(), root.getHeight(), false);
                break;
            case TO_LEFT:
                animate(scene,
                    scene.getNode().getLayoutX(), scene.getNode().getLayoutY(),
                    -scene.getNode().getWidth(), scene.getNode().getLayoutY(), false);
                break;
            case TO_RIGHT:
                animate(scene,
                    scene.getNode().getLayoutX(), scene.getNode().getLayoutY(),
                    root.getWidth(), scene.getNode().getLayoutY(), false);
                break;
            case FADE_OUT:
                animateFade(scene, 1, 0, false);
                break;
        }
    }

    private void animate(VScene scene, double startX, double startY, double endX, double endY, boolean isShowing) {
        scene.animationFunction = (p) -> {
            var x = (endX - startX) * p + startX;
            var y = (endY - startY) * p + startY;
            scene.getNode().setLayoutX(x);
            scene.getNode().setLayoutY(y);
            if (scene.cover != null) {
                if (isShowing) {
                    scene.cover.setOpacity(p);
                } else {
                    scene.cover.setOpacity(1 - p);
                }
            }
        };
        doAnimate(scene, isShowing);
    }

    private void animateFade(VScene scene, int start, int end, boolean isShowing) {
        scene.animationFunction = (p) -> {
            var v = (end - start) * p + start;
            scene.getNode().setOpacity(v);
            animateCover(scene, p, isShowing);
        };
        doAnimate(scene, isShowing);
    }

    private void animateCover(VScene scene, double p, boolean isShowing) {
        if (scene.cover != null) {
            if (isShowing) {
                scene.cover.setOpacity(p);
            } else {
                scene.cover.setOpacity(1 - p);
            }
        }
    }

    private void doAnimate(VScene scene, boolean isShowing) {
        var animatingSet = isShowing ? animatingShow : animatingHide;
        animatingSet.add(scene);
        scene.progress.stopAndSetNode(scene.state0);
        scene.progress.play(scene.state1, new Callback<>() {
            @Override
            protected void succeeded0(Void value) {
                animatingSet.remove(scene);
                if (isShowing) {
                    postShowing(scene);
                } else {
                    postHiding(scene);
                }
            }
        });
    }

    private void postShowing(VScene scene) {
        scene.animationFunction = null;
        if (scene.role == VSceneRole.MAIN) {
            setAfterHiding(currentMainScene);
            currentMainScene = scene;
        } else {
            showingScenes.add(scene);
        }
    }

    private void postHiding(VScene scene) {
        scene.animationFunction = null;
        showingScenes.remove(scene);
        setAfterHiding(scene);
    }

    public VScene getCurrentMainScene() {
        return currentMainScene;
    }

    public boolean isShowing(VScene scene) {
        return scene == currentMainScene || showingScenes.contains(scene) || animatingShow.contains(scene);
    }

    public Region getNode() {
        return root;
    }
}
