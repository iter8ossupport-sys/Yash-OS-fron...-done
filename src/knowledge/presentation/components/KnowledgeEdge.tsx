/**
 * KnowledgeEdge: Custom React Flow Edge Component
 *
 * Strict Architectural Rule: Visual component; renders distinct relationship semantics;
 * restrained theme-compliant colors; clear hierarchy vs cross-links.
 */

import React, { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import type { GlobalRelationshipType } from "../../domain/enums";

export interface KnowledgeEdgeData {
  readonly relationship: GlobalRelationshipType;
  readonly label?: string | undefined;
  readonly explanation?: string | undefined;
  readonly isHighlighted?: boolean;
  readonly isDimmed?: boolean;
}

function getEdgeStyles(
  rel: GlobalRelationshipType,
  isHighlighted?: boolean,
  isDimmed?: boolean,
): {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string | undefined;
  opacity: number;
} {
  let stroke = "hsl(var(--border))";
  let strokeWidth = 1.5;
  let strokeDasharray: string | undefined = undefined;

  switch (rel) {
    case "contains":
      stroke = "hsl(var(--muted-foreground) / 0.4)";
      strokeWidth = 1.2;
      strokeDasharray = "4 4";
      break;
    case "informs":
      stroke = "rgb(56 189 248)"; // sky-400
      strokeWidth = 2;
      break;
    case "applies_to":
      stroke = "rgb(52 211 153)"; // emerald-400
      strokeWidth = 2;
      break;
    case "derived_from":
      stroke = "rgb(251 191 36)"; // amber-400
      strokeWidth = 2;
      strokeDasharray = "5 3";
      break;
    case "mitigates":
      stroke = "rgb(74 222 128)"; // green-400
      strokeWidth = 2;
      break;
    case "challenges":
      stroke = "rgb(251 113 133)"; // rose-400
      strokeWidth = 2;
      strokeDasharray = "3 3";
      break;
    case "contrasts_with":
      stroke = "rgb(167 139 250)"; // violet-400
      strokeWidth = 2;
      strokeDasharray = "6 3";
      break;
    default:
      stroke = "hsl(var(--primary) / 0.6)";
      strokeWidth = 1.5;
      break;
  }

  if (isHighlighted) {
    strokeWidth = Math.max(strokeWidth + 1, 2.5);
  }

  const opacity = isDimmed ? 0.15 : isHighlighted ? 1 : 0.7;

  return {
    stroke,
    strokeWidth,
    opacity,
    ...(strokeDasharray ? { strokeDasharray } : {}),
  };
}

export const KnowledgeEdgeComponent = memo(function KnowledgeEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const edgeData = data as unknown as KnowledgeEdgeData | undefined;
  const rel = edgeData?.relationship || "contains";
  const isHighlighted = edgeData?.isHighlighted ?? false;
  const isDimmed = edgeData?.isDimmed ?? false;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { stroke, strokeWidth, strokeDasharray, opacity } = getEdgeStyles(
    rel,
    isHighlighted,
    isDimmed,
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        {...(markerEnd ? { markerEnd } : {})}
        style={{
          stroke,
          strokeWidth,
          opacity,
          ...(strokeDasharray ? { strokeDasharray } : {}),
          transition: "stroke 0.2s, stroke-width 0.2s, opacity 0.2s",
        }}
      />
      {/* Show semantic edge label on non-structural or highlighted edges */}
      {edgeData?.label && rel !== "contains" && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            title={edgeData.explanation || edgeData.label}
            className={`cursor-default rounded border border-border/60 bg-card/90 px-1.5 py-0.5 text-[9px] font-mono font-medium text-muted-foreground shadow-xs backdrop-blur-xs transition-opacity ${
              isDimmed ? "opacity-20" : "opacity-90 hover:opacity-100"
            }`}
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
