package io.vproxy.vfx.util.graph;

import java.util.Objects;

public class GraphEdge<N extends GraphNode<N>> {
    public final N from;
    public final N to;
    public final long distance;

    public GraphEdge(N from, N to, long distance) {
        this.from = from;
        this.to = to;
        this.distance = distance;
    }

    @Override
    public String toString() {
        return "{" + from + "---" + distance + "-->" + to + "}";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        GraphEdge<?> graphEdge = (GraphEdge<?>) o;

        if (distance != graphEdge.distance) return false;
        if (!Objects.equals(from, graphEdge.from)) return false;
        return Objects.equals(to, graphEdge.to);
    }

    @Override
    public int hashCode() {
        int result = from != null ? from.hashCode() : 0;
        result = 31 * result + (to != null ? to.hashCode() : 0);
        result = 31 * result + (int) (distance ^ (distance >>> 32));
        return result;
    }
}
