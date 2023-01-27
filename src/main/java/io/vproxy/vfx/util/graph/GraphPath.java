package io.vproxy.vfx.util.graph;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class GraphPath<N extends GraphNode<N>> {
    public final List<GraphEdge<N>> path;
    public final long length;
    public final N from;
    public final N to;

    public GraphPath(List<GraphEdge<N>> path) {
        this.path = Collections.unmodifiableList(path);
        long length = 0;
        for (var p : path) {
            length += p.distance;
        }
        this.length = length;
        this.from = path.get(0).from;
        this.to = path.get(path.size() - 1).to;
    }

    public GraphPath<N> concat(GraphPath<N> path) {
        if (!this.path.get(this.path.size() - 1).to.equals(path.path.get(0).from)) {
            throw new IllegalArgumentException("cannot concat " + this + " and " + path);
        }
        var ls = new ArrayList<GraphEdge<N>>();
        ls.addAll(this.path);
        ls.addAll(path.path);
        return new GraphPath<>(ls);
    }

    @Override
    public String toString() {
        return "GraphPath{" + path + ",len=" + length + "}";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        GraphPath<?> graphPath = (GraphPath<?>) o;

        return Objects.equals(path, graphPath.path);
    }

    @Override
    public int hashCode() {
        return path != null ? path.hashCode() : 0;
    }
}
