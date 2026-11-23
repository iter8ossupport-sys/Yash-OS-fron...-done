/**
 * KnowledgeNode: Custom React Flow Node Component
 *
 * Strict Architectural Rule: Visual component only; uses Yash OS theme tokens;
 * supports both light and dark themes; zero business logic mutations.
 */

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import {
  Activity,
  BookOpen,
  Brain,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Compass,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { LayoutedNode } from "../types";
import type { GraphClusterType } from "../../domain/enums";

export interface KnowledgeNodeData {
  readonly node: LayoutedNode;
  readonly isDimmed?: boolean;
  readonly onToggleExpand?: (nodeId: string) => void;
}

function getClusterIcon(cluster: GraphClusterType) {
  switch (cluster) {
    case "foundation_human":
      return <Brain className="h-3.5 w-3.5 text-indigo-400" />;
    case "foundation_reality":
      return <Compass className="h-3.5 w-3.5 text-cyan-400" />;
    case "foundation_custom":
      return <Layers className="h-3.5 w-3.5 text-violet-400" />;
    case "p1_founder":
      return <Briefcase className="h-3.5 w-3.5 text-sky-400" />;
    case "p2_cashflow":
      return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
    case "reviews_intelligence":
      return <Activity className="h-3.5 w-3.5 text-amber-400" />;
    case "curated_memory":
      return <Sparkles className="h-3.5 w-3.5 text-blue-400" />;
    default:
      return <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function getClusterAccentBorder(cluster: GraphClusterType): string {
  switch (cluster) {
    case "foundation_human":
      return "border-l-indigo-500";
    case "foundation_reality":
      return "border-l-cyan-500";
    case "foundation_custom":
      return "border-l-violet-500";
    case "p1_founder":
      return "border-l-sky-500";
    case "p2_cashflow":
      return "border-l-emerald-500";
    case "reviews_intelligence":
      return "border-l-amber-500";
    case "curated_memory":
      return "border-l-blue-500";
    default:
      return "border-l-border";
  }
}

export const KnowledgeNodeComponent = memo(function KnowledgeNodeComponent({
  data,
  selected,
}: NodeProps) {
  const nodeData = data as unknown as KnowledgeNodeData;
  const node = nodeData?.node;

  if (!node) return null;

  const isDimmed = nodeData?.isDimmed ?? false;
  const onToggleExpand = nodeData?.onToggleExpand;
  const accentBorder = getClusterAccentBorder(node.cluster);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(node.id);
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Node: ${node.label}, ${node.formatBadge || node.entityType}`}
      className={`group relative flex flex-col justify-between rounded-xl border border-border/80 border-l-4 ${accentBorder} bg-card/95 p-2.5 text-card-foreground shadow-sm backdrop-blur-md transition-all duration-200 select-none ${
        selected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md border-primary/90"
          : "hover:border-border hover:shadow hover:bg-card"
      } ${isDimmed ? "opacity-30 blur-[0.3px]" : "opacity-100"}`}
      style={{
        width: node.width,
        height: node.height,
      }}
    >
      {/* Handles for Hierarchical (Top/Bottom) and Horizontal (Left/Right) layout */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground/60"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground/60"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground/60 opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground/60 opacity-0"
      />

      {/* Header: Cluster Icon + Format Badge + Expand/Collapse */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {getClusterIcon(node.cluster)}
          <span className="truncate text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
            {node.formatBadge || node.entityType}
          </span>
        </div>

        {node.hasChildren && (
          <button
            type="button"
            onClick={handleExpandClick}
            aria-label={
              node.isExpanded ? "Collapse children" : "Expand children"
            }
            className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-mono font-medium text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground transition-colors"
          >
            {node.isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <span>{node.childCount}</span>
          </button>
        )}
      </div>

      {/* Main Body: Node Label */}
      <div className="my-1 overflow-hidden">
        <h4 className="truncate text-xs font-semibold text-foreground tracking-tight leading-snug">
          {node.label}
        </h4>
        {node.excerpt && (
          <p className="line-clamp-1 text-[11px] text-muted-foreground/90 font-normal leading-tight">
            {node.excerpt}
          </p>
        )}
      </div>

      {/* Footer: Depth & Source Tag */}
      <div className="flex items-center justify-between text-[9px] text-muted-foreground/70 font-mono">
        <span className="truncate max-w-[120px]">
          {node.sourceRef.system.toUpperCase()}
        </span>
        {node.tags && node.tags.length > 0 && (
          <span className="truncate max-w-[70px] text-right">
            #{node.tags[0]}
          </span>
        )}
      </div>
    </div>
  );
});
