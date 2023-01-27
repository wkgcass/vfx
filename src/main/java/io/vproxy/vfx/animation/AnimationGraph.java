package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.Logger;
import io.vproxy.vfx.util.algebradata.AlgebraData;
import io.vproxy.vfx.util.graph.Graph;
import io.vproxy.vfx.util.graph.GraphPath;
import javafx.animation.AnimationTimer;

import java.util.*;
import java.util.function.Consumer;

public class AnimationGraph<T extends AlgebraData<T>> {
    private final Graph<AnimationNode<T>> graph;
    private final Consumer<T> apply;
    private AnimationNode<T> currentNode;

    private AnimationEdge<T> currentEdge = null;
    private Iterator<AnimationEdge<T>> iterator = null;
    private Animation timer = null;

    AnimationGraph(Graph<AnimationNode<T>> graph, Consumer<T> apply, AnimationNode<T> initialNode) {
        this.graph = graph;
        this.apply = apply;
        if (!graph.containsNode(initialNode)) {
            throw new IllegalArgumentException("`initialNode` is not contained in `nodes`");
        }
        this.currentNode = initialNode;
        apply(initialNode.value);
    }

    public boolean isPlaying() {
        return timer != null;
    }

    public boolean isReverting() {
        var timer = this.timer;
        if (timer != null) {
            return timer.isReverting;
        }
        return false;
    }

    public void stopAndSetNode(AnimationNode<T> node) {
        if (!graph.containsNode(node)) throw new IllegalArgumentException();
        currentNode = node;
        currentEdge = null;
        iterator = null;
        var timer = this.timer;
        this.timer = null;
        if (timer != null) timer.stop();
        apply(currentNode.value);
    }

    public void revertToLastNode(Callback<Void, Exception> cb) {
        var timer = this.timer;
        if (timer == null) {
            cb.succeeded();
            return;
        }
        timer.revertCurrentAnimation(cb);
    }

    public AnimationNode<T> getCurrentNode() {
        return currentNode;
    }

    public AnimationNode<T> getNextNode() {
        if (currentEdge == null) return null;
        return currentEdge.to;
    }

    private void apply(T data) {
        apply.accept(data);
    }

    public void play(AnimationNode<T> key, Callback<Void, Exception> cb) {
        if (isPlaying()) {
            if (currentNode.equals(key)) {
                revertToLastNode(cb);
            } else {
                timer.cb = Callback.handler((v, ex) ->
                    play(key, cb));
            }
            return;
        }
        if (currentNode.equals(key)) {
            cb.succeeded();
            return;
        }
        play(List.of(key), cb);
    }

    public void play(List<AnimationNode<T>> keys, Callback<Void, Exception> cb) {
        if (isPlaying()) {
            if (keys.isEmpty()) {
                cb.succeeded();
                return;
            }
            if (currentNode.equals(keys.get(0))) {
                revertToLastNode(Callback.handler((v, ex) -> play(keys.subList(1, keys.size()), cb)));
            } else {
                timer.stopAtNext(Callback.handler((v, ex) -> play(keys, cb)));
            }
            return;
        }
        if (keys.isEmpty()) {
            cb.succeeded();
            return;
        }
        if (new HashSet<>(keys).size() != keys.size()) {
            throw new IllegalArgumentException("duplicated nodes in " + keys);
        }
        for (var key : keys) {
            if (key.equals(currentNode)) {
                throw new IllegalArgumentException("node in " + keys + " conflict with current node: " + currentNode);
            }
        }
        var lastNode = currentNode;
        GraphPath<AnimationNode<T>> path = null;
        for (var key : keys) {
            GraphPath<AnimationNode<T>> newPath;
            try {
                newPath = prepareForPlaying(lastNode, key, path, keys);
            } catch (Exception e) {
                Logger.warn("unable to find path for playing animation " + keys);
                cb.failed(e);
                return;
            }
            lastNode = newPath.to;
            if (path == null) {
                path = newPath;
            } else {
                path = path.concat(newPath);
            }
        }
        assert path != null;
        //noinspection unchecked,rawtypes
        iterator = (Iterator) path.path.iterator();
        timer = new Animation(cb);
        timer.start();
    }

    private GraphPath<AnimationNode<T>> findShortestPaths(AnimationNode<T> from, AnimationNode<T> to, Set<AnimationNode<T>> skip) {
        var paths = graph.shortestPaths(from, skip);
        var ls = paths.get(to);
        if (ls == null) {
            throw new IllegalArgumentException("cannot find path from " + from + " to " + to + ", skip=" + skip);
        }
        return ls;
    }

    private GraphPath<AnimationNode<T>> prepareForPlaying(AnimationNode<T> from, AnimationNode<T> to, GraphPath<AnimationNode<T>> path, List<AnimationNode<T>> keys) {
        var skip = new HashSet<AnimationNode<T>>();
        if (path != null) {
            for (var e : path.path) {
                skip.add(e.from);
                skip.add(e.to);
            }
        }
        skip.addAll(keys);
        skip.remove(from);
        skip.remove(to);
        return findShortestPaths(from, to, skip);
    }

    private class Animation extends AnimationTimer {
        long beginTs = 0;
        long lastOverflow = 0;
        Callback<Void, Exception> cb;

        private boolean isReverting = false;
        private boolean terminateAtNext = false;
        private long revertBeginTime = 0;

        private Animation(Callback<Void, Exception> cb) {
            this.cb = cb;
        }

        @Override
        public void handle(long now) {
            if (beginTs == 0) {
                beginTs = now;
                return;
            }
            if (isReverting) {
                if (revertBeginTime == 0) {
                    revertBeginTime = now;
                    return;
                }
            }
            if (currentEdge == null) {
                if (terminateAtNext || !iterator.hasNext()) {
                    iterator = null;
                    timer = null;
                    stop();
                    cb.succeeded();
                    return;
                }
                currentEdge = iterator.next();
                beginTs = now - lastOverflow;
            }
            T data;
            if (!isReverting) {
                var delta = (now - beginTs) / 1_000_000;
                if (delta >= currentEdge.durationMillis) {
                    data = currentEdge.to.value;
                    lastOverflow = delta - currentEdge.durationMillis;
                    currentNode = currentEdge.to;
                    currentEdge = null;
                } else {
                    var p = delta / (double) currentEdge.durationMillis;
                    data =
                        currentEdge.from.value.plus(
                            currentEdge.to.value.minus(
                                currentEdge.from.value
                            ).multiply(p)
                        );
                }
            } else {
                var delta = (now - revertBeginTime) / 1_000_000;
                var elapsed = (revertBeginTime - beginTs) / 1_000_000;
                if (delta >= elapsed) {
                    data = currentEdge.from.value;
                    currentNode = currentEdge.from;
                    currentEdge = null;
                } else {
                    var p = (elapsed - delta) / (double) currentEdge.durationMillis;
                    data =
                        currentEdge.from.value.plus(
                            currentEdge.to.value.minus(
                                currentEdge.from.value
                            ).multiply(p)
                        );
                }
            }
            apply(data);
        }

        public void revertCurrentAnimation(Callback<Void, Exception> cb) {
            isReverting = true;
            terminateAtNext = true;
            this.cb = cb;
        }

        public void stopAtNext(Callback<Void, Exception> cb) {
            terminateAtNext = true;
            this.cb = cb;
        }
    }
}
