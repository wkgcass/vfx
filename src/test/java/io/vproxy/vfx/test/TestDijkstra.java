package io.vproxy.vfx.test;

import io.vproxy.vfx.util.graph.GraphBuilder;
import io.vproxy.vfx.util.graph.GraphEdge;
import io.vproxy.vfx.util.graph.GraphNode;
import io.vproxy.vfx.util.graph.GraphPath;
import org.junit.Test;

import java.util.List;

import static org.junit.Assert.assertEquals;

@SuppressWarnings({"unchecked", "rawtypes"})
public class TestDijkstra {
    @Test
    public void simpleTest() {
        var a = new GraphNode<>("a");
        var b = new GraphNode<>("b");
        var c = new GraphNode<>("c");
        var d = new GraphNode<>("d");
        var e = new GraphNode<>("e");
        var f = new GraphNode<>("f");
        var g = new GraphNode<>("g");
        var h = new GraphNode<>("h");

        var builder = new GraphBuilder();
        builder.addNode(a);
        builder.addNode(b);
        builder.addNode(c);
        builder.addNode(d);
        builder.addNode(e);
        builder.addNode(f);
        builder.addNode(g);
        builder.addNode(h);

        builder.addTwoWayEdges(a, b, 12);
        builder.addTwoWayEdges(a, f, 16);
        builder.addTwoWayEdges(a, g, 14);

        builder.addTwoWayEdges(b, c, 10);
        builder.addTwoWayEdges(b, f, 7);

        builder.addTwoWayEdges(c, d, 3);
        builder.addTwoWayEdges(c, e, 5);
        builder.addTwoWayEdges(c, f, 6);

        builder.addTwoWayEdges(d, e, 4);

        builder.addTwoWayEdges(e, f, 2);
        builder.addTwoWayEdges(e, g, 8);

        builder.addTwoWayEdges(f, g, 9);

        var graph = builder.build();
        var shortestPaths = graph.shortestPaths(d);
        assertEquals(
            new GraphPath<>(List.of(new GraphEdge(d, e, 4), new GraphEdge(e, f, 2), new GraphEdge(f, a, 16))),
            shortestPaths.get(a));
        assertEquals(
            new GraphPath<>(List.of(new GraphEdge(d, c, 3), new GraphEdge(c, b, 10))),
            shortestPaths.get(b));
        assertEquals(
            new GraphPath<>(List.of(new GraphEdge(d, c, 3))),
            shortestPaths.get(c));
        assertEquals(
            new GraphPath<>(List.of(new GraphEdge(d, e, 4))),
            shortestPaths.get(e));
        assertEquals(
            new GraphPath<>(List.of(new GraphEdge(d, e, 4), new GraphEdge(e, f, 2))),
            shortestPaths.get(f));
        assertEquals(
            new GraphPath<>(List.of(new GraphEdge(d, e, 4), new GraphEdge(e, g, 8))),
            shortestPaths.get(g));
    }
}
