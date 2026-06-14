export class GraphNode<N extends GraphNode<N>> {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
  toString(): string { return this.name; }
}

export class GraphEdge<N extends GraphNode<N>> {
  readonly from: N;
  readonly to: N;
  readonly weight: number;
  constructor(from: N, to: N, weight: number) {
    this.from = from;
    this.to = to;
    this.weight = weight;
  }
}

export class GraphPath<N extends GraphNode<N>> {
  readonly path: GraphEdge<N>[];
  readonly length: number;
  readonly to: N;

  constructor(path: GraphEdge<N>[]) {
    this.path = path;
    // Java's GraphPath.length is the sum of edge weights (total duration),
    // not the number of edges. This matters for cancelAndPlay() path comparison.
    this.length = path.reduce((s, e) => s + e.weight, 0);
    this.to = path.length > 0 ? path[path.length - 1]!.to : (undefined as unknown as N);
  }

  concat(other: GraphPath<N>): GraphPath<N> {
    // Java validates that the last edge's `to` matches the first edge's `from`.
    // Dijkstra paths produced by AnimationGraph are always connectable, but we
    // keep the check for parity with the Java original (defensive).
    if (this.path.length > 0 && other.path.length > 0) {
      const lastTo = this.path[this.path.length - 1]!.to;
      const firstFrom = other.path[0]!.from;
      // GraphNode uses reference equality in both Java and TS (Java does NOT
      // override equals); the `!==` check matches Java's `!...equals(...)`.
      if (lastTo !== firstFrom) {
        throw new Error(`cannot concat ${this} and ${other}`);
      }
    }
    return new GraphPath<N>([...this.path, ...other.path]);
  }
}

export class Graph<N extends GraphNode<N>> {
  private readonly adj = new Map<N, Array<GraphEdge<N>>>();
  private readonly nodes = new Set<N>();

  containsNode(n: N): boolean {
    return this.nodes.has(n);
  }

  shortestPaths(from: N, skip: Set<N>): Map<N, GraphPath<N>> {
    // Dijkstra (edges have non-negative weights = durations).
    // Java's Dijkstra.dijkstra() excludes the source node from the result map
    // (entries with empty edge lists are filtered out). We mirror that here:
    // `from` is used as the Dijkstra seed but never appears in the returned map.
    const result = new Map<N, GraphPath<N>>();
    const dist = new Map<N, number>();
    const prevEdge = new Map<N, GraphEdge<N>>();
    const visited = new Set<N>();
    dist.set(from, 0);

    while (true) {
      let cur: N | null = null;
      let curDist = Infinity;
      for (const [n, d] of dist) {
        if (!visited.has(n) && d < curDist) {
          cur = n;
          curDist = d;
        }
      }
      if (cur === null) break;
      visited.add(cur);

      const edges = this.adj.get(cur) ?? [];
      for (const e of edges) {
        if (skip.has(e.to)) continue;
        const nd = curDist + e.weight;
        const prev = dist.get(e.to) ?? Infinity;
        if (nd < prev) {
          dist.set(e.to, nd);
          prevEdge.set(e.to, e);
        }
      }
    }

    for (const [n] of dist) {
      if (n === from) continue;
      const edges: GraphEdge<N>[] = [];
      let cur: N = n;
      while (cur !== from) {
        const e = prevEdge.get(cur);
        if (!e) {
          edges.length = 0;
          break;
        }
        edges.unshift(e);
        cur = e.from;
      }
      if (edges.length > 0) {
        result.set(n, new GraphPath<N>(edges));
      }
    }
    return result;
  }

  _addNode(n: N): void {
    this.nodes.add(n);
    if (!this.adj.has(n)) this.adj.set(n, []);
  }
  _addEdge(e: GraphEdge<N>): void {
    this._addNode(e.from);
    this._addNode(e.to);
    this.adj.get(e.from)!.push(e);
  }
}

export class GraphBuilder<N extends GraphNode<N>> {
  private readonly graph = new Graph<N>();

  addNode(n: N): this {
    this.graph._addNode(n);
    return this;
  }

  addEdge(e: GraphEdge<N>): this {
    this.graph._addEdge(e);
    return this;
  }

  build(): Graph<N> {
    return this.graph;
  }
}
