package io.vproxy.vfx.util.graph;

import java.util.HashSet;
import java.util.Set;

public class GraphBuilder<N extends GraphNode<N>> {

    private final Set<N> nodes = new HashSet<>();

    public GraphBuilder<N> addNode(N n) {
        if (!nodes.add(n))
            throw new IllegalArgumentException("`node`=" + n + " is already registered");
        return this;
    }

    public GraphBuilder<N> addTwoWayEdges(N a, N b, long distance) {
        addEdge(a, b, distance);
        addEdge(b, a, distance);
        return this;
    }

    public GraphBuilder<N> addEdge(N from, N to, long distance) {
        return addEdge(new GraphEdge<>(from, to, distance));
    }

    public GraphBuilder<N> addEdge(GraphEdge<N> edge) {
        if (edge.distance < 0) {
            throw new IllegalArgumentException("`distance`=" + edge.distance + " < 0");
        }
        if (!nodes.contains(edge.from)) {
            throw new IllegalArgumentException("`from`=" + edge.from + " is not a registered node");
        }
        if (!nodes.contains(edge.to)) {
            throw new IllegalArgumentException("`to`=" + edge.to + " is not a registered node");
        }
        if (edge.from.edges.containsKey(edge.to)) {
            throw new IllegalArgumentException("`from`=" + edge.from + " already has an edge to `to`");
        }
        edge.from.edges.put(edge.to, edge);
        return this;
    }

    public Graph<N> build() {
        return new Graph<>(nodes);
    }
}
