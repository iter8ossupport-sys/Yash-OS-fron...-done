/**
 * Global Knowledge: Domain Entities & Projection Contracts
 *
 * Strict Architectural Rule: Pure TypeScript; zero duplicate operational data.
 */

import type { KnowledgeSourceReference } from "@/lib/os/types/knowledge";
import type {
  EdgeDirection,
  EdgeProvenance,
  GlobalRelationshipType,
  GraphClusterType,
} from "./enums";

/**
 * A virtual projected node in the Global Knowledge graph.
 *
 * Note: Does not clone full operational markdown bodies. Contains only identity,
 * categorization, human-readable label, summary excerpt, and source pointer.
 */
export interface GlobalKnowledgeNode {
  readonly id: string; // Stable URI: "gkn://<system>/<entityType>/<id>"
  readonly label: string;
  readonly cluster: GraphClusterType;
  readonly entityType: string;
  readonly formatBadge?: string | undefined;
  readonly excerpt: string; // Truncated preview (max 240 chars)
  readonly depth: number; // Taxonomic level (0 = Foundation/Hub, 1 = Domain/Project, etc.)
  readonly sourceRef: KnowledgeSourceReference;
  readonly tags?: readonly string[] | undefined;
  readonly isArchived?: boolean | undefined;
  readonly metadata?: Readonly<Record<string, unknown>> | undefined;
}

/**
 * An explicit directed or bidirectional relationship between two Global Knowledge nodes.
 */
export interface GlobalKnowledgeEdge {
  readonly id: string; // Stable URI: "gke://<sourceUri>/<targetUri>/<relationshipType>"
  readonly source: string; // Source Node URI ("gkn://...")
  readonly target: string; // Target Node URI ("gkn://...")
  readonly relationship: GlobalRelationshipType;
  readonly direction: EdgeDirection;
  readonly provenance: EdgeProvenance;
  readonly label?: string | undefined;
  readonly explanation?: string | undefined;
  readonly weight?: number | undefined;
}

/**
 * Diagnostic report generated when an edge references an endpoint that cannot be resolved.
 */
export interface OrphanDiagnostic {
  readonly edgeId: string;
  readonly sourceUri: string;
  readonly targetUri: string;
  readonly missingEndpoint: "source" | "target" | "both";
  readonly relationship: GlobalRelationshipType;
  readonly provenance: EdgeProvenance;
  readonly reason: string;
}

/**
 * Complete immutable output of the Global Knowledge projection engine.
 */
export interface ProjectionResult {
  readonly nodes: readonly GlobalKnowledgeNode[];
  readonly edges: readonly GlobalKnowledgeEdge[];
  readonly orphans: readonly OrphanDiagnostic[];
  readonly manifest: {
    readonly projectedAt: string; // ISO 8601
    readonly totalNodes: number;
    readonly totalEdges: number;
    readonly totalOrphans: number;
    readonly clusterCounts: Readonly<Record<GraphClusterType, number>>;
  };
}
