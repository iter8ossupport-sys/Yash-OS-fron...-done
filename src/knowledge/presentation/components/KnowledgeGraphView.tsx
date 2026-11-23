/**
 * KnowledgeGraphView: Interactive Global Knowledge Graph Canvas
 *
 * Strict Architectural Rule: Visual orchestration; uses Yash OS theme tokens;
 * supports both light and dark themes; wraps rendering engine behind presentation contracts.
 */

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  ChevronRight,
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  Network,
  RotateCcw,
  Search,
  Sparkles,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";

import type { OSState } from "@/lib/os/types/core";
import type { P3StorageSchema } from "@/priority3/infrastructure/persistence/types";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../../domain/entities";
import type { GraphLayoutDirection, LayoutedGraph } from "../types";
import { DagreLayoutAdapter } from "../layout/GraphLayoutAdapter";
import { KnowledgeNodeComponent } from "./KnowledgeNode";
import { KnowledgeEdgeComponent } from "./KnowledgeEdge";
import { KnowledgeContextInspector } from "./KnowledgeContextInspector";

const nodeTypes = {
  knowledgeNode: KnowledgeNodeComponent,
};

const edgeTypes = {
  knowledgeEdge: KnowledgeEdgeComponent,
};

export interface KnowledgeGraphViewProps {
  readonly nodes: readonly GlobalKnowledgeNode[];
  readonly edges: readonly GlobalKnowledgeEdge[];
  readonly osState: OSState;
  readonly p3Storage?: P3StorageSchema | undefined;
  readonly onNavigateToSource?:
    | ((system: string, entityType: string, entityId: string) => void)
    | undefined;
  readonly initialSelectedNodeId?: string | undefined;
}

function InnerKnowledgeGraphCanvas({
  nodes: rawNodes,
  edges: rawEdges,
  osState,
  p3Storage,
  onNavigateToSource,
  initialSelectedNodeId,
}: KnowledgeGraphViewProps) {
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();
  const isDark = osState ? osState.theme !== "light" : true;

  // State Management
  const [direction, setDirection] = useState<GraphLayoutDirection>("TB");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialSelectedNodeId ?? null,
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Progressive Expansion State: Depth 0 and 1 are expanded by default
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const node of rawNodes) {
      if (node.depth <= 1) {
        initial.add(node.id);
      }
    }
    return initial;
  });

  const layoutAdapter = useMemo(() => new DagreLayoutAdapter(), []);

  // Compute Layout with current expansion & direction
  const layoutedGraph: LayoutedGraph = useMemo(() => {
    return layoutAdapter.calculateLayout(rawNodes, rawEdges, {
      direction,
      expandedNodeIds,
      rankSeparation: 80,
      nodeSeparation: 60,
    });
  }, [layoutAdapter, rawNodes, rawEdges, direction, expandedNodeIds]);

  // Compute connected set for selection & dimming
  const activeFocusId = selectedNodeId || hoveredNodeId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return null;
    const connected = new Set<string>([activeFocusId]);
    for (const edge of rawEdges) {
      if (edge.source === activeFocusId) connected.add(edge.target);
      if (edge.target === activeFocusId) connected.add(edge.source);
    }
    return connected;
  }, [activeFocusId, rawEdges]);

  // Toggle child expansion
  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Expand all / Collapse to Root
  const handleExpandAll = useCallback(() => {
    const all = new Set<string>();
    for (const n of rawNodes) {
      all.add(n.id);
    }
    setExpandedNodeIds(all);
  }, [rawNodes]);

  const handleCollapseToRoot = useCallback(() => {
    const roots = new Set<string>();
    for (const n of rawNodes) {
      if (n.depth <= 1) {
        roots.add(n.id);
      }
    }
    setExpandedNodeIds(roots);
  }, [rawNodes]);

  // Map to React Flow Node entities
  const rfNodes: Node[] = useMemo(() => {
    return layoutedGraph.nodes.map((layoutedNode) => {
      const isSelected = selectedNodeId === layoutedNode.id;
      const isDimmed =
        connectedNodeIds !== null && !connectedNodeIds.has(layoutedNode.id);

      return {
        id: layoutedNode.id,
        type: "knowledgeNode",
        position: { x: layoutedNode.x, y: layoutedNode.y },
        selected: isSelected,
        data: {
          node: layoutedNode,
          isDimmed,
          onToggleExpand: handleToggleExpand,
        },
      };
    });
  }, [
    layoutedGraph.nodes,
    selectedNodeId,
    connectedNodeIds,
    handleToggleExpand,
  ]);

  // Map to React Flow Edge entities
  const rfEdges: Edge[] = useMemo(() => {
    return layoutedGraph.edges.map((layoutedEdge) => {
      const isHighlighted =
        activeFocusId !== null &&
        (layoutedEdge.source === activeFocusId ||
          layoutedEdge.target === activeFocusId);
      const isDimmed =
        activeFocusId !== null &&
        layoutedEdge.source !== activeFocusId &&
        layoutedEdge.target !== activeFocusId;

      return {
        id: layoutedEdge.id,
        source: layoutedEdge.source,
        target: layoutedEdge.target,
        type: "knowledgeEdge",
        animated: Boolean(layoutedEdge.animated),
        data: {
          relationship: layoutedEdge.relationship,
          label: layoutedEdge.label,
          explanation: layoutedEdge.explanation,
          isHighlighted,
          isDimmed,
        },
      };
    });
  }, [layoutedGraph.edges, activeFocusId]);

  // Node Selection Handlers
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      setIsInspectorOpen(true);
    },
    [],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setHoveredNodeId(node.id);
    },
    [],
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  // Center on Selected Node
  const centerOnNode = useCallback(
    (nodeId: string) => {
      const target = layoutedGraph.nodes.find((n) => n.id === nodeId);
      if (target) {
        setCenter(target.x + target.width / 2, target.y + target.height / 2, {
          zoom: 1.1,
          duration: 400,
        });
      }
    },
    [layoutedGraph.nodes, setCenter],
  );

  // Search matching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return rawNodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
  }, [rawNodes, searchQuery]);

  const handleSearchSelect = useCallback(
    (nodeId: string) => {
      // Ensure ancestry chain is expanded so the node is visible in layout
      setExpandedNodeIds((prev) => {
        const next = new Set(prev);
        // Find ancestry via contains edges
        let currentId: string | undefined = nodeId;
        while (currentId) {
          next.add(currentId);
          const parentEdge = rawEdges.find(
            (e) => e.target === currentId && e.relationship === "contains",
          );
          currentId = parentEdge?.source;
        }
        return next;
      });

      setSelectedNodeId(nodeId);
      setIsInspectorOpen(true);
      setSearchQuery("");

      setTimeout(() => {
        centerOnNode(nodeId);
      }, 100);
    },
    [rawEdges, centerOnNode],
  );

  // Breadcrumb Ancestry Calculation
  const breadcrumbs = useMemo(() => {
    if (!selectedNodeId) return [];
    const chain: GlobalKnowledgeNode[] = [];
    let currentId: string | undefined = selectedNodeId;

    while (currentId) {
      const node = rawNodes.find((n) => n.id === currentId);
      if (node) {
        chain.unshift(node);
      }
      const parentEdge = rawEdges.find(
        (e) => e.target === currentId && e.relationship === "contains",
      );
      currentId = parentEdge?.source;
    }
    return chain;
  }, [selectedNodeId, rawNodes, rawEdges]);

  // Keyboard Navigation: Arrow navigation across connected edges, Escape to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        setSelectedNodeId(null);
        setSearchQuery("");
      } else if (e.key === "Enter" || e.key === " ") {
        if (selectedNodeId) {
          e.preventDefault();
          handleToggleExpand(selectedNodeId);
        }
      } else if (
        selectedNodeId &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const connectedEdges = rawEdges.filter(
          (edge) =>
            edge.source === selectedNodeId || edge.target === selectedNodeId,
        );

        const firstEdge = connectedEdges[0];
        if (firstEdge) {
          const nextTarget =
            firstEdge.source === selectedNodeId
              ? firstEdge.target
              : firstEdge.source;
          setSelectedNodeId(nextTarget);
          centerOnNode(nextTarget);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, rawEdges, handleToggleExpand, centerOnNode]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return rawNodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [selectedNodeId, rawNodes]);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-background font-sans select-none">
      {/* Main Canvas Area */}
      <div className="relative flex-1 flex flex-col h-full">
        {/* Top Control Bar */}
        <header
          aria-label="Knowledge Graph Controls"
          className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-card/85 px-4 py-2.5 backdrop-blur-md"
        >
          {/* Breadcrumbs or Title */}
          <div className="flex items-center gap-1.5 overflow-hidden text-xs">
            <span className="font-semibold text-foreground tracking-tight flex items-center gap-1.5 shrink-0">
              <Network className="h-4 w-4 text-primary" /> Global Knowledge
            </span>

            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto pl-2 border-l border-border/60">
                {breadcrumbs.map((bNode, idx) => (
                  <React.Fragment key={bNode.id}>
                    {idx > 0 && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNodeId(bNode.id);
                        centerOnNode(bNode.id);
                      }}
                      className={`truncate max-w-[140px] text-xs font-medium transition-colors ${
                        idx === breadcrumbs.length - 1
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {bNode.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Search & Viewport Tools */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search knowledge nodes... (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-background/80 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Search Dropdown */}
              {searchQuery.trim().length > 0 && searchResults.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-lg border border-border bg-card/95 p-2.5 text-xs text-muted-foreground shadow-lg backdrop-blur-md z-30">
                  No matching knowledge nodes found.
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-lg border border-border bg-card/95 p-1 shadow-lg backdrop-blur-md z-30">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Matches ({searchResults.length})
                  </div>
                  {searchResults.slice(0, 8).map((match) => (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => handleSearchSelect(match.id)}
                      className="w-full text-left rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-muted transition-colors flex flex-col"
                    >
                      <span className="font-medium text-foreground">
                        {match.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {match.formatBadge || match.entityType} ·{" "}
                        {match.sourceRef.system}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layout Direction Toggle */}
            <button
              type="button"
              onClick={() =>
                setDirection((prev) => (prev === "TB" ? "LR" : "TB"))
              }
              title={`Switch to ${direction === "TB" ? "Left-to-Right" : "Top-to-Bottom"} layout`}
              className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{direction}</span>
            </button>

            {/* Expand / Collapse Controls */}
            <button
              type="button"
              onClick={handleExpandAll}
              title="Expand All Nodes"
              className="rounded-lg border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={handleCollapseToRoot}
              title="Collapse to Root Hubs"
              className="rounded-lg border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Collapse
            </button>

            {/* Reset View */}
            <button
              type="button"
              onClick={() => fitView({ duration: 500 })}
              title="Fit Entire Graph"
              className="rounded-lg border border-border bg-muted/30 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Graph React Flow Canvas */}
        <div className="relative flex-1 w-full h-full bg-background">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={handleNodeClick}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            onPaneClick={handlePaneClick}
            fitView
            minZoom={0.2}
            maxZoom={2.5}
            style={{ width: "100%", height: "100%", background: "transparent" }}
            defaultEdgeOptions={{
              type: "knowledgeEdge",
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.2}
              color={
                isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.12)"
              }
              bgColor="transparent"
            />

            <Controls
              showInteractive={false}
              className="!bg-card/90 !border-border !shadow-sm !rounded-lg overflow-hidden [&>button]:!border-border [&>button]:!bg-transparent [&>button]:!text-foreground hover:[&>button]:!bg-muted"
            />

            <MiniMap
              nodeColor={() => "hsl(var(--primary))"}
              maskColor={
                isDark ? "rgba(11, 15, 23, 0.7)" : "rgba(240, 244, 250, 0.7)"
              }
              bgColor={
                isDark ? "rgba(24, 28, 40, 0.9)" : "rgba(255, 255, 255, 0.9)"
              }
              className="!border-border !rounded-lg overflow-hidden !shadow-md hidden md:block"
              style={{ width: 140, height: 95 }}
            />
          </ReactFlow>
        </div>
      </div>

      {/* Dynamic Context Inspector */}
      {isInspectorOpen && selectedNode && (
        <KnowledgeContextInspector
          selectedNode={selectedNode}
          allNodes={rawNodes}
          allEdges={rawEdges}
          osState={osState}
          p3Storage={p3Storage}
          onClose={() => setSelectedNodeId(null)}
          onSelectNode={(nodeId: string) => {
            setSelectedNodeId(nodeId);
            centerOnNode(nodeId);
          }}
          onNavigateToSource={onNavigateToSource}
        />
      )}
    </div>
  );
}

export const KnowledgeGraphView = memo(function KnowledgeGraphView(
  props: KnowledgeGraphViewProps,
) {
  return (
    <ReactFlowProvider>
      <InnerKnowledgeGraphCanvas {...props} />
    </ReactFlowProvider>
  );
});
