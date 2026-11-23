/**
 * KnowledgeContextInspector: Dynamic Context Inspector for Global Knowledge
 *
 * Strict Architectural Rule: Resolves actual records through owning source;
 * shows only fields that exist; preserves original-record navigation;
 * zero duplicate documents cloned into graph nodes.
 */

import React, { memo } from "react";
import {
  ExternalLink,
  GitBranch,
  Layers,
  Network,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { OSState } from "@/lib/os/types/core";
import type { P3StorageSchema } from "@/priority3/infrastructure/persistence/types";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../../domain/entities";
import type { ResolvedSourceDetails } from "../types";
import { resolveAuthoritativeRecord } from "../utils/recordResolver";

export interface KnowledgeContextInspectorProps {
  readonly selectedNode: GlobalKnowledgeNode | null;
  readonly allNodes: readonly GlobalKnowledgeNode[];
  readonly allEdges: readonly GlobalKnowledgeEdge[];
  readonly osState: OSState;
  readonly p3Storage?: P3StorageSchema | undefined;
  readonly onClose: () => void;
  readonly onSelectNode: (nodeId: string) => void;
  readonly onNavigateToSource?:
    | ((system: string, entityType: string, entityId: string) => void)
    | undefined;
}

export const KnowledgeContextInspector = memo(
  function KnowledgeContextInspector({
    selectedNode,
    allNodes,
    allEdges,
    osState,
    p3Storage,
    onClose,
    onSelectNode,
    onNavigateToSource,
  }: KnowledgeContextInspectorProps) {
    if (!selectedNode) {
      return (
        <aside
          aria-label="Knowledge Context Inspector"
          className="flex h-full w-80 flex-col items-center justify-center border-l border-border/70 bg-card/40 p-6 text-center text-muted-foreground backdrop-blur-md"
        >
          <Network className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <h4 className="text-xs font-semibold text-foreground">
            No Node Selected
          </h4>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Select any node in the global knowledge graph to inspect its
            authoritative records, source links, and relationship neighborhood.
          </p>
        </aside>
      );
    }

    const resolved = resolveAuthoritativeRecord(
      selectedNode,
      osState,
      p3Storage,
    );

    // Compute immediate connected graph neighborhood
    const incomingEdges = allEdges.filter((e) => e.target === selectedNode.id);
    const outgoingEdges = allEdges.filter((e) => e.source === selectedNode.id);

    const relatedNodes = [
      ...incomingEdges.map((e) => ({
        edge: e,
        direction: "incoming" as const,
        node: allNodes.find((n) => n.id === e.source),
      })),
      ...outgoingEdges.map((e) => ({
        edge: e,
        direction: "outgoing" as const,
        node: allNodes.find((n) => n.id === e.target),
      })),
    ].filter(
      (
        item,
      ): item is {
        edge: GlobalKnowledgeEdge;
        direction: "incoming" | "outgoing";
        node: GlobalKnowledgeNode;
      } => item.node !== undefined,
    );

    return (
      <aside
        aria-label={`Context Inspector: ${resolved.primaryLabel}`}
        className="flex h-full w-88 flex-col border-l border-border/80 bg-card/95 text-card-foreground shadow-lg backdrop-blur-md overflow-hidden z-10 transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="truncate text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              {resolved.systemTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Inspector"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Node Identity & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {resolved.statusBadge && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-medium text-primary">
                  {resolved.statusBadge}
                </span>
              )}
              {resolved.perspectiveBadge && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono font-medium text-secondary-foreground">
                  {resolved.perspectiveBadge}
                </span>
              )}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                Depth {selectedNode.depth}
              </span>
            </div>

            <h3 className="text-base font-semibold text-foreground tracking-tight leading-snug">
              {resolved.primaryLabel}
            </h3>

            {resolved.secondarySubtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {resolved.secondarySubtitle}
              </p>
            )}

            <p className="mt-1.5 text-[10px] font-mono text-muted-foreground/80 truncate">
              {resolved.directPath}
            </p>
          </div>

          {/* Excerpt */}
          {selectedNode.excerpt && (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Excerpt
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {selectedNode.excerpt}
              </p>
            </div>
          )}

          {/* Dynamic Authoritative Attributes */}
          {resolved.attributes.length > 0 && (
            <div className="space-y-2.5 border-t border-border/60 pt-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Authoritative Record Fields
              </span>
              {resolved.attributes.map((attr, idx) => (
                <div key={idx} className="text-xs">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    {attr.label}
                  </span>
                  {Array.isArray(attr.value) ? (
                    <ul className="mt-1 list-disc list-inside space-y-0.5 text-foreground/90 pl-1 text-xs">
                      {attr.value.map((val, vIdx) => (
                        <li key={vIdx}>{val}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-0.5 text-foreground/90 font-normal leading-normal">
                      {String(attr.value)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Connected Graph Neighborhood */}
          {relatedNodes.length > 0 && (
            <div className="border-t border-border/60 pt-3 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Network className="h-3 w-3" /> Connected Neighborhood (
                {relatedNodes.length})
              </span>
              <div className="space-y-1.5">
                {relatedNodes.map(({ edge, direction, node: relNode }) => (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => onSelectNode(relNode.id)}
                    className="w-full flex items-center justify-between rounded-md border border-border/50 bg-background/50 hover:bg-muted/50 p-2 text-left transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono uppercase text-muted-foreground">
                          {edge.relationship.replace(/_/g, " ")}
                        </span>
                        <span className="text-[9px] text-muted-foreground/60">
                          {direction === "incoming" ? "←" : "→"}
                        </span>
                      </div>
                      <p className="truncate text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {relNode.label}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Original Record Navigation Link */}
        {resolved.actionLinks.length > 0 && (
          <div className="border-t border-border/70 p-3 bg-muted/20">
            {resolved.actionLinks.map((link, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onNavigateToSource) {
                    onNavigateToSource(
                      selectedNode.sourceRef.system,
                      selectedNode.sourceRef.entityType,
                      selectedNode.sourceRef.entityId,
                    );
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
              >
                <span>{link.label}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}
      </aside>
    );
  },
);
