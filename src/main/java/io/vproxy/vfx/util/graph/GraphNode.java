package io.vproxy.vfx.util.graph;

import java.util.HashMap;
import java.util.Map;

public class GraphNode<N extends GraphNode<N>> {
    public final String name;
    public final Map<GraphNode<N>, GraphEdge<N>> edges = new HashMap<>();

    public GraphNode(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "{" + name + "}";
    }
}
