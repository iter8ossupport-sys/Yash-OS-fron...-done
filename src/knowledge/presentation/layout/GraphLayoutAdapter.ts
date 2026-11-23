/**
 * Graph Layout Adapter: Dagre-based Hierarchical Layout Engine
 *
 * Strict Architectural Rule: Pure computation; isolates graph positioning behind GraphLayoutEngine interface.
 */

import dagre from "@dagrejs/dagre";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../../domain/entities";
import type {
  GraphLayoutEngine,
  GraphLayoutOptions,
  LayoutedEdge,
  LayoutedGraph,
  LayoutedNode,
} from "../types";

export function getNodeDimensions(depth: number): {
  width: number;
  height: number;
} {
  switch (depth) {
    case 0:
      return { width: 250, height: 95 };
    case 1:
      return { width: 235, height: 85 };
    case 2:
      return { width: 220, height: 80 };
    default:
      return { width: 210, height: 75 };
  }
}

export class DagreLayoutAdapter implements GraphLayoutEngine {
  calculateLayout(
    nodes: readonly GlobalKnowledgeNode[],
    edges: readonly GlobalKnowledgeEdge[],
    options?: GraphLayoutOptions,
  ): LayoutedGraph {
    if (nodes.length === 0) {
      return { nodes: [], edges: [], width: 0, height: 0 };
    }

    const direction = options?.direction ?? "TB";
    const rankSeparation = options?.rankSeparation ?? 70;
    const nodeSeparation = options?.nodeSeparation ?? 50;
    const expandedNodeIds = options?.expandedNodeIds ?? new Set<string>();

    // 1. Build hierarchy map to determine child counts and containment
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>();

    for (const edge of edges) {
      if (edge.relationship === "contains") {
        if (!childrenMap.has(edge.source)) {
          childrenMap.set(edge.source, []);
        }
        childrenMap.get(edge.source)!.push(edge.target);
        parentMap.set(edge.target, edge.source);
      }
    }

    // 2. Determine visible nodes based on progressive expansion
    // Anchors: Depth 0 and Depth 1 nodes are visible by default
    const visibleNodeMap = new Map<string, GlobalKnowledgeNode>();

    for (const node of nodes) {
      if (node.depth <= 1) {
        visibleNodeMap.set(node.id, node);
      } else {
        // A node at depth > 1 is visible only if its immediate taxonomic ancestor is expanded
        const currentParentId = parentMap.get(node.id);
        let isAncestorExpanded = false;

        if (currentParentId && expandedNodeIds.has(currentParentId)) {
          // Check entire ancestor chain up to root
          let allAncestorsExpanded = true;
          let checkParentId: string | undefined = currentParentId;

          while (checkParentId) {
            const parentNode = nodes.find((n) => n.id === checkParentId);
            if (parentNode && parentNode.depth > 1) {
              const higherParent = parentMap.get(checkParentId);
              if (higherParent && !expandedNodeIds.has(higherParent)) {
                allAncestorsExpanded = false;
                break;
              }
              checkParentId = higherParent;
            } else {
              break;
            }
          }

          if (allAncestorsExpanded) {
            isAncestorExpanded = true;
          }
        }

        if (isAncestorExpanded) {
          visibleNodeMap.set(node.id, node);
        }
      }
    }

    // 3. Filter edges: both endpoints must be visible
    const visibleEdges: GlobalKnowledgeEdge[] = [];
    for (const edge of edges) {
      if (visibleNodeMap.has(edge.source) && visibleNodeMap.has(edge.target)) {
        visibleEdges.push(edge);
      }
    }

    // 4. Initialize Dagre Graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: direction,
      nodesep: nodeSeparation,
      ranksep: rankSeparation,
      marginx: 50,
      marginy: 50,
    });
    g.setDefaultEdgeLabel(() => ({}));

    // 5. Add visible nodes to Dagre
    for (const node of visibleNodeMap.values()) {
      const dims = getNodeDimensions(node.depth);
      g.setNode(node.id, {
        width: dims.width,
        height: dims.height,
      });
    }

    // 6. Add visible edges to Dagre
    for (const edge of visibleEdges) {
      g.setEdge(edge.source, edge.target);
    }

    // 7. Execute Dagre Layout Calculation
    dagre.layout(g);

    // 8. Transform to LayoutedNode and LayoutedEdge outputs
    let maxX = 0;
    let maxY = 0;

    const layoutedNodes: LayoutedNode[] = [];

    for (const node of visibleNodeMap.values()) {
      const dagreNode = g.node(node.id);
      const dims = getNodeDimensions(node.depth);
      const children = childrenMap.get(node.id) || [];
      const hasChildren = children.length > 0;
      const isExpanded = expandedNodeIds.has(node.id);

      // Top-left coordinates for canvas
      const x = dagreNode ? dagreNode.x - dims.width / 2 : 0;
      const y = dagreNode ? dagreNode.y - dims.height / 2 : 0;

      if (x + dims.width > maxX) maxX = x + dims.width;
      if (y + dims.height > maxY) maxY = y + dims.height;

      layoutedNodes.push({
        ...node,
        x,
        y,
        width: dims.width,
        height: dims.height,
        isExpanded,
        hasChildren,
        childCount: children.length,
      });
    }

    const layoutedEdges: LayoutedEdge[] = visibleEdges.map((edge) => ({
      ...edge,
      animated:
        edge.relationship === "informs" || edge.relationship === "derived_from",
    }));

    return {
      nodes: layoutedNodes,
      edges: layoutedEdges,
      width: maxX + 100,
      height: maxY + 100,
    };
  }
}
