package io.vproxy.vfx.animation;

import io.vproxy.vfx.util.Callback;
import io.vproxy.vfx.util.Logger;
import io.vproxy.vfx.util.algebradata.AlgebraData;
import io.vproxy.vfx.util.graph.Graph;
import io.vproxy.vfx.util.graph.GraphPath;
import javafx.animation.AnimationTimer;

import java.util.*;

public class AnimationGraph<T extends AlgebraData<T>> {
    private final Graph<AnimationNode<T>> graph;
    private final AnimationApplyFunction<T> apply;
    private final AnimationStateTransferBeginCallback<T> stateTransferBeginCallback;
    private AnimationNode<T> currentNode;

    private AnimationEdge<T> currentEdge = null;
    private Iterator<AnimationEdge<T>> iterator = null;
    private Animation timer = null;

    AnimationGraph(Graph<AnimationNode<T>> graph,
                   AnimationApplyFunction<T> apply, AnimationStateTransferBeginCallback<T> stateTransferBeginCallback,
                   AnimationNode<T> initialNode) {
        this.graph = graph;
        this.apply = apply;
        this.stateTransferBeginCallback = stateTransferBeginCallback;
        if (!graph.containsNode(initialNode)) {
            throw new IllegalArgumentException("`initialNode` is not contained in `nodes`");
        }
        this.currentNode = initialNode;
        apply(null, initialNode);
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
        apply(null, currentNode);
    }

    private void revertToLastNode(Callback<Void, Exception> cb) {
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

    private void apply(AnimationNode<T> from, AnimationNode<T> to, T data) {
        apply.apply(from, to, data);
    }

    private void apply(AnimationNode<T> from, AnimationNode<T> to) {
        apply.apply(from, to, to.value);
        to.stateTransferFinish.animationStateTransferFinish(from, to);
    }

    public void play(AnimationNode<T> key) {
        play(key, Callback.ignoreExceptionHandler(v -> {
        }));
    }

    public void play(AnimationNode<T> key, Callback<Void, Exception> cb) {
        play(List.of(key), cb);
    }

    public void play(List<AnimationNode<T>> keys, Callback<Void, Exception> cb) {
        if (keys.isEmpty()) {
            cb.succeeded();
            return;
        }
        if (isPlaying()) {
            cancelAndPlay(keys, cb);
            return;
        }
        if (keys.get(0).equals(currentNode)) {
            var linked = new LinkedList<>(keys);
            keys = linked;
            while (!linked.isEmpty() && linked.peekFirst().equals(currentNode)) {
                linked.remove(currentNode);
            }
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
                Logger.warn("unable to find path for playing animation " + keys + ": from " + lastNode + " to " + key);
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

    @SuppressWarnings("DuplicatedCode")
    private void cancelAndPlay(List<AnimationNode<T>> keys, Callback<Void, Exception> cb) {
        if (currentEdge == null) {
            stopAndSetNode(currentNode);
            play(keys, cb);
            return;
        }

        var firstNode = keys.get(0);
        var currentNode = this.currentNode;
        if (currentNode == firstNode) {
            playAfterRevert(currentNode, keys, cb);
            return;
        }
        var nextNode = currentEdge.to;
        if (nextNode == firstNode) {
            playAtNext(nextNode, keys, cb);
            return;
        }
        GraphPath<AnimationNode<T>> currentNodePath;
        try {
            currentNodePath = findShortestPaths(currentNode, firstNode, Collections.emptySet());
        } catch (Exception e) {
            Logger.warn("unable to find path for playing animation from " + currentNode + " to " + firstNode);
            cb.failed(e);
            return;
        }
        GraphPath<AnimationNode<T>> nextNodePath;
        try {
            nextNodePath = findShortestPaths(nextNode, firstNode, Collections.emptySet());
        } catch (Exception e) {
            Logger.warn("unable to find path for playing animation from " + nextNode + " to " + firstNode);
            cb.failed(e);
            return;
        }
        if (currentNodePath.length > nextNodePath.length) {
            playAtNext(nextNode, keys, cb);
        } else {
            playAfterRevert(currentNode, keys, cb);
        }
    }

    private void playAtNext(AnimationNode<T> n, List<AnimationNode<T>> keys, Callback<Void, Exception> cb) {
        if (isReverting()) {
            timer.cancelRevertAndStopAtNext(cb);
            return;
        }
        timer.stopAtNext(new Callback<>() {
            @Override
            protected void succeeded0(Void value) {
                stopAndSetNode(n);
                play(keys, cb);
            }

            @Override
            protected void failed0(Exception e) {
                cb.failed(e);
            }
        });
    }

    private void playAfterRevert(AnimationNode<T> n, List<AnimationNode<T>> keys, Callback<Void, Exception> cb) {
        if (isReverting()) {
            timer.setCB(cb);
            return;
        }
        revertToLastNode(new Callback<>() {
            @Override
            protected void succeeded0(Void value) {
                stopAndSetNode(n);
                play(keys, cb);
            }

            @Override
            protected void failed0(Exception e) {
                cb.failed(e);
            }
        });
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
                if (checkEnd()) {
                    return;
                }
                currentEdge = iterator.next();
                stateTransferBeginCallback.animationStateTransferBegin(currentEdge.from, currentEdge.to);
                beginTs = now - lastOverflow;
            }
            T data;
            var currentEdge0 = currentEdge;
            if (!isReverting) {
                var delta = (now - beginTs) / 1_000_000;
                if (delta >= currentEdge.durationMillis) {
                    data = currentEdge.to.value;
                    lastOverflow = delta - currentEdge.durationMillis;
                    currentNode = currentEdge.to;
                    currentEdge = null;
                    currentNode.stateTransferFinish.animationStateTransferFinish(currentEdge0.from, currentEdge0.to);
                    checkEnd();
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
                    currentNode.stateTransferFinish.animationStateTransferFinish(currentEdge0.to, currentEdge0.from);
                    checkEnd();
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
            apply(currentEdge0.from, currentEdge0.to, data);
        }

        private boolean checkEnd() {
            if (terminateAtNext || !iterator.hasNext()) {
                currentEdge = null;
                iterator = null;
                timer = null;
                stop();
                cb.succeeded();
                return true;
            }
            return false;
        }

        public void revertCurrentAnimation(Callback<Void, Exception> cb) {
            isReverting = true;
            terminateAtNext = true;
            currentNode.stateTransferFinish.animationStateTransferFinish(currentEdge.to, currentEdge.from);
            setCB(cb);
        }

        public void stopAtNext(Callback<Void, Exception> cb) {
            terminateAtNext = true;
            setCB(cb);
        }

        public void setCB(Callback<Void, Exception> cb) {
            this.cb.failed(new AnimationInterrupted());
            this.cb = cb;
        }

        public void cancelRevertAndStopAtNext(Callback<Void, Exception> cb) {
            isReverting = false;
            terminateAtNext = true;
            var currentEdge = AnimationGraph.this.currentEdge;
            stateTransferBeginCallback.animationStateTransferBegin(currentEdge.from, currentEdge.to);
            setCB(cb);
        }
    }
}
