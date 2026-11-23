/**
 * Global Knowledge Presentation Layer: Types & Contracts
 *
 * Strict Architectural Rule: Pure UI contracts and layout interfaces.
 * Provides an abstraction over the underlying graph rendering technology.
 */

import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../domain/entities";
import type { GlobalRelationshipType, GraphClusterType } from "../domain/enums";

export type GraphLayoutDirection = "TB" | "LR";

export interface GraphLayoutOptions {
  readonly direction?: GraphLayoutDirection;
  readonly rankSeparation?: number;
  readonly nodeSeparation?: number;
  readonly expandedNodeIds?: ReadonlySet<string>;
}

export interface LayoutedNode extends GlobalKnowledgeNode {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly isExpanded: boolean;
  readonly hasChildren: boolean;
  readonly childCount: number;
}

export interface LayoutedEdge extends GlobalKnowledgeEdge {
  readonly animated?: boolean;
}

export interface LayoutedGraph {
  readonly nodes: readonly LayoutedNode[];
  readonly edges: readonly LayoutedEdge[];
  readonly width: number;
  readonly height: number;
}

/**
 * Abstraction for graph layout algorithms.
 * Allows switching from Dagre to ELK or custom hierarchical layouts without altering React components.
 */
export interface GraphLayoutEngine {
  calculateLayout(
    nodes: readonly GlobalKnowledgeNode[],
    edges: readonly GlobalKnowledgeEdge[],
    options?: GraphLayoutOptions,
  ): LayoutedGraph;
}

/**
 * Authoritative record payload resolved dynamically for the context inspector.
 * Contains only non-empty fields directly from source storage.
 */
export interface ResolvedSourceDetails {
  readonly systemTitle: string;
  readonly primaryLabel: string;
  readonly secondarySubtitle?: string | undefined;
  readonly statusBadge?: string | undefined;
  readonly perspectiveBadge?: string | undefined;
  readonly directPath: string;
  readonly attributes: ReadonlyArray<{
    readonly label: string;
    readonly value: string | number | boolean | readonly string[];
  }>;
  readonly actionLinks: ReadonlyArray<{
    readonly label: string;
    readonly destination: string;
    readonly icon?: string | undefined;
  }>;
}
