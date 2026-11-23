import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookMarked, Network, Plus } from "lucide-react";
import { toast } from "sonner";

import { useOS } from "@/lib/os/store";
import { today, uid } from "@/lib/os/seed";
import type { KnowledgeItem } from "@/lib/os/types";
import { getKnowledgeFormat, matchesKnowledgeQuery } from "@/lib/os/knowledge";
import { Button, Empty, PageHeader } from "@/components/os/ui";
import {
  KnowledgeCard,
  KnowledgeEditorModal,
  KnowledgeFilters,
} from "@/components/os/knowledge";
import {
  projectGlobalKnowledgeGraph,
  KnowledgeGraphView,
  type GraphClusterType,
} from "@/knowledge";
import { P3StorageEngine } from "@/priority3/infrastructure/persistence/storageEngine";
import type { P3StorageSchema } from "@/priority3/infrastructure/persistence/types";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Global Knowledge — Yash OS" },
      {
        name: "description",
        content:
          "Shared intelligence, cross-system navigation, and curated operating memory across Yash OS.",
      },
      { property: "og:title", content: "Global Knowledge — Yash OS" },
      {
        property: "og:description",
        content:
          "Explore the global knowledge graph and curated operating memory.",
      },
    ],
  }),
  component: GlobalKnowledgeWorkspacePage,
});

type KnowledgeViewMode = "graph" | "cards";

type SystemFilter = "all" | "p1" | "p2" | "p3" | "reviews" | "curated";

const SYSTEM_PILLS: ReadonlyArray<{
  readonly id: SystemFilter;
  readonly label: string;
  readonly clusterMatches?: readonly GraphClusterType[];
}> = [
  { id: "all", label: "All Systems" },
  {
    id: "p1",
    label: "P1 Founder",
    clusterMatches: ["p1_founder"],
  },
  {
    id: "p2",
    label: "P2 Cashflow",
    clusterMatches: ["p2_cashflow"],
  },
  {
    id: "p3",
    label: "P3 Learning",
    clusterMatches: [
      "foundation_human",
      "foundation_reality",
      "foundation_custom",
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    clusterMatches: ["reviews_intelligence"],
  },
  {
    id: "curated",
    label: "Curated Memory",
    clusterMatches: ["curated_memory"],
  },
];

function GlobalKnowledgeWorkspacePage() {
  const { state, update } = useOS();
  const navigate = useNavigate();

  // View state: Graph map vs Curated cards
  const [viewMode, setViewMode] = useState<KnowledgeViewMode>("graph");
  const [systemFilter, setSystemFilter] = useState<SystemFilter>("all");

  // Secondary Card Filter states (when viewing curated cards)
  const [cardQuery, setCardQuery] = useState("");
  const [cardFormatFilter, setCardFormatFilter] = useState<string>("all");
  const [cardTypeFilter, setCardTypeFilter] = useState("all");
  const [cardPriorityFilter, setCardPriorityFilter] = useState("all");
  const [editItem, setEditItem] = useState<KnowledgeItem | null>(null);

  // Hydrate P3 Storage Schema for Priority 3 Knowledge Units
  const [p3Storage, setP3Storage] = useState<P3StorageSchema | undefined>(
    undefined,
  );

  useEffect(() => {
    try {
      const engine = new P3StorageEngine();
      const loaded = engine.load();
      setP3Storage(loaded);
    } catch {
      /* ignore */
    }
  }, []);

  // Compute Live Global Knowledge Graph Projection
  const rawProjection = useMemo(() => {
    return projectGlobalKnowledgeGraph(state, p3Storage);
  }, [state, p3Storage]);

  // Filter graph nodes and edges if a specific system pill is active
  const filteredGraph = useMemo(() => {
    if (systemFilter === "all") {
      return {
        nodes: rawProjection.nodes,
        edges: rawProjection.edges,
      };
    }

    const pill = SYSTEM_PILLS.find((p) => p.id === systemFilter);
    if (!pill || !pill.clusterMatches) {
      return {
        nodes: rawProjection.nodes,
        edges: rawProjection.edges,
      };
    }

    const clusterSet = new Set(pill.clusterMatches);
    // Include strictly nodes belonging to the selected system cluster
    const matchingNodes = rawProjection.nodes.filter((n) =>
      clusterSet.has(n.cluster),
    );
    const matchingNodeIds = new Set(matchingNodes.map((n) => n.id));

    const matchingEdges = rawProjection.edges.filter(
      (e) => matchingNodeIds.has(e.source) && matchingNodeIds.has(e.target),
    );

    return {
      nodes: matchingNodes,
      edges: matchingEdges,
    };
  }, [rawProjection, systemFilter]);

  // Filter curated cards for the cards view mode
  const filteredCardItems = useMemo(() => {
    return state.knowledge.filter((k) => {
      const kFmt = getKnowledgeFormat(k);
      if (cardFormatFilter !== "all" && kFmt !== cardFormatFilter) return false;
      if (cardTypeFilter !== "all" && k.type !== cardTypeFilter) return false;
      if (
        cardPriorityFilter !== "all" &&
        String(k.priorityId) !== cardPriorityFilter
      ) {
        return false;
      }
      return matchesKnowledgeQuery(k, cardQuery);
    });
  }, [
    state.knowledge,
    cardFormatFilter,
    cardTypeFilter,
    cardPriorityFilter,
    cardQuery,
  ]);

  const blankItem = (): KnowledgeItem => ({
    id: uid(),
    title: "",
    type: "Note",
    knowledgeFormat: "principle",
    body: "",
    tags: "",
    createdAt: today(),
    schemaVersion: 1,
  });

  const handleSaveItem = (saved: KnowledgeItem) => {
    update((s) => ({
      ...s,
      knowledge: s.knowledge.some((k) => k.id === saved.id)
        ? s.knowledge.map((k) => (k.id === saved.id ? saved : k))
        : [saved, ...s.knowledge],
    }));
    toast.success("Knowledge entry saved");
  };

  const handleDeleteItem = (id: string) => {
    update((s) => ({
      ...s,
      knowledge: s.knowledge.filter((k) => k.id !== id),
    }));
    toast.success("Knowledge entry deleted");
  };

  // Cross-System Routing from Graph Inspector
  const handleNavigateToSource = (
    system: string,
    entityType: string,
    entityId: string,
  ) => {
    if (system === "priority1") {
      void navigate({ to: "/projects" });
    } else if (system === "priority2") {
      void navigate({ to: "/projects" });
    } else if (system === "priority3") {
      void navigate({ to: "/projects" });
    } else if (system === "reviews") {
      void navigate({ to: "/reviews" });
    } else if (system === "knowledge") {
      const item = state.knowledge.find((k) => k.id === entityId);
      if (item) {
        setEditItem(item);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header */}
      <PageHeader
        eyebrow="OS Intelligence & Memory"
        title="Global Knowledge"
        subtitle="Shared intelligence, cross-system navigation, and curated operating memory."
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div
              role="tablist"
              aria-label="Knowledge View Mode"
              className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-1 backdrop-blur-md"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "graph"}
                onClick={() => setViewMode("graph")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "graph"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Network className="h-3.5 w-3.5 text-primary" />
                <span>Knowledge Graph</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "cards"}
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "cards"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookMarked className="h-3.5 w-3.5 text-blue-400" />
                <span>Curated Records ({state.knowledge.length})</span>
              </button>
            </div>

            <Button variant="primary" onClick={() => setEditItem(blankItem())}>
              <Plus className="h-4 w-4" />
              New memory
            </Button>
          </div>
        }
      />

      {/* System Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            System:
          </span>
          {SYSTEM_PILLS.map((pill) => {
            const isSelected = systemFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSystemFilter(pill.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-muted-foreground font-mono">
          {rawProjection.nodes.length} nodes · {rawProjection.edges.length}{" "}
          edges
        </div>
      </div>

      {/* Main Workspace Body */}
      {viewMode === "graph" ? (
        <section
          aria-label="Interactive Knowledge Graph Map"
          className="relative h-[calc(100vh-16rem)] min-h-[620px] w-full rounded-2xl border border-border/80 bg-background overflow-hidden shadow-sm"
        >
          <KnowledgeGraphView
            nodes={filteredGraph.nodes}
            edges={filteredGraph.edges}
            osState={state}
            p3Storage={p3Storage}
            onNavigateToSource={handleNavigateToSource}
          />
        </section>
      ) : (
        <section
          aria-label="Curated Operating Records Library"
          className="space-y-4"
        >
          <KnowledgeFilters
            query={cardQuery}
            onQueryChange={setCardQuery}
            formatFilter={cardFormatFilter}
            onFormatFilterChange={setCardFormatFilter}
            typeFilter={cardTypeFilter}
            onTypeFilterChange={setCardTypeFilter}
            priorityFilter={cardPriorityFilter}
            onPriorityFilterChange={setCardPriorityFilter}
            priorities={state.priorities}
          />

          {filteredCardItems.length === 0 ? (
            <Empty title="No curated knowledge entries found">
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting your search query or format filter, or create a
                new entry.
              </p>
            </Empty>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCardItems.map((k) => {
                const linkedProject = state.projects.find(
                  (p) => p.id === k.projectId,
                );

                return (
                  <KnowledgeCard
                    key={k.id}
                    item={k}
                    linkedProject={linkedProject}
                    onClick={() => setEditItem(k)}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Curated Item Edit / Create Modal */}
      {editItem && (
        <KnowledgeEditorModal
          open={!!editItem}
          onClose={() => setEditItem(null)}
          item={editItem}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
}
