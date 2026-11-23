/**
 * Graph Projection Service: Deterministic Cross-System Projection Engine
 *
 * Strict Architectural Rule: Pure function; zero mutations; stable URIs;
 * deterministic ordering; comprehensive orphan reference diagnostics.
 */

import type { OSState } from "@/lib/os/types/core";
import type { P3StorageSchema } from "@/priority3/infrastructure/persistence/types";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
  OrphanDiagnostic,
  ProjectionResult,
} from "../../domain/entities";
import type { GraphClusterType } from "../../domain/enums";
import { GRAPH_CLUSTER_TYPES } from "../../domain/enums";
import {
  projectKnowledgeRecords,
  projectP1Records,
  projectP2Records,
  projectP3Records,
  projectReviewRecords,
} from "../../infrastructure/adapters";

export interface ProjectionOptions {
  readonly nowIso?: string;
  readonly includeArchived?: boolean;
}

/**
 * Projects the authoritative OSState and P3StorageSchema into a unified,
 * deterministic Global Knowledge Graph with full referential integrity checks.
 */
export function projectGlobalKnowledgeGraph(
  osState: OSState,
  p3Storage?: P3StorageSchema,
  options?: ProjectionOptions,
): ProjectionResult {
  const includeArchived = options?.includeArchived ?? true;
  const nowIso = options?.nowIso ?? new Date().toISOString();

  // 1. Run All Source Adapters
  const p1Output = projectP1Records(osState.projects);
  const p2Output = projectP2Records(osState.tradingOperation, osState.projects);
  const p3Output = projectP3Records(p3Storage);
  const reviewOutput = projectReviewRecords(
    osState.improvements,
    osState.bottlenecks,
  );
  const knowledgeOutput = projectKnowledgeRecords(osState.knowledge);

  // 2. Aggregate Nodes with Stable De-duplication
  const nodeMap = new Map<string, GlobalKnowledgeNode>();

  const rawNodeList: GlobalKnowledgeNode[] = [
    ...p1Output.nodes,
    ...p2Output.nodes,
    ...p3Output.nodes,
    ...reviewOutput.nodes,
    ...knowledgeOutput.nodes,
  ];

  for (const node of rawNodeList) {
    if (!includeArchived && node.isArchived) {
      continue;
    }
    // Prevent duplicate URIs; earlier adapter definition is preserved
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
    }
  }

  // 3. Aggregate Edges with Stable De-duplication
  const edgeCandidateMap = new Map<string, GlobalKnowledgeEdge>();

  const rawEdgeList: GlobalKnowledgeEdge[] = [
    ...p1Output.edges,
    ...p2Output.edges,
    ...p3Output.edges,
    ...reviewOutput.edges,
    ...knowledgeOutput.edges,
  ];

  for (const edge of rawEdgeList) {
    if (!edgeCandidateMap.has(edge.id)) {
      edgeCandidateMap.set(edge.id, edge);
    }
  }

  // 4. Referential Integrity Audit & Orphan Diagnostics
  const validEdges: GlobalKnowledgeEdge[] = [];
  const orphanDiagnostics: OrphanDiagnostic[] = [];

  for (const edge of edgeCandidateMap.values()) {
    const hasSource = nodeMap.has(edge.source);
    const hasTarget = nodeMap.has(edge.target);

    if (hasSource && hasTarget) {
      validEdges.push(edge);
    } else {
      let missingEndpoint: "source" | "target" | "both" = "target";
      if (!hasSource && !hasTarget) {
        missingEndpoint = "both";
      } else if (!hasSource) {
        missingEndpoint = "source";
      }

      orphanDiagnostics.push({
        edgeId: edge.id,
        sourceUri: edge.source,
        targetUri: edge.target,
        missingEndpoint,
        relationship: edge.relationship,
        provenance: edge.provenance,
        reason: `Unresolved endpoint in knowledge graph: missing ${
          missingEndpoint === "both"
            ? `source ('${edge.source}') and target ('${edge.target}')`
            : missingEndpoint === "source"
              ? `source ('${edge.source}')`
              : `target ('${edge.target}')`
        }.`,
      });
    }
  }

  // 5. Deterministic Lexicographical Sorting (Guarantees identical output for identical input)
  const sortedNodes = Array.from(nodeMap.values()).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const sortedEdges = validEdges.sort((a, b) => a.id.localeCompare(b.id));
  const sortedOrphans = orphanDiagnostics.sort((a, b) =>
    a.edgeId.localeCompare(b.edgeId),
  );

  // 6. Manifest & Cluster Statistics Calculation
  const clusterCounts: Record<GraphClusterType, number> = {
    foundation_human: 0,
    foundation_reality: 0,
    foundation_custom: 0,
    p1_founder: 0,
    p2_cashflow: 0,
    reviews_intelligence: 0,
    core_os: 0,
    curated_memory: 0,
  };

  for (const node of sortedNodes) {
    if (GRAPH_CLUSTER_TYPES.includes(node.cluster)) {
      clusterCounts[node.cluster] = (clusterCounts[node.cluster] || 0) + 1;
    }
  }

  return Object.freeze({
    nodes: Object.freeze(sortedNodes),
    edges: Object.freeze(sortedEdges),
    orphans: Object.freeze(sortedOrphans),
    manifest: Object.freeze({
      projectedAt: nowIso,
      totalNodes: sortedNodes.length,
      totalEdges: sortedEdges.length,
      totalOrphans: sortedOrphans.length,
      clusterCounts: Object.freeze(clusterCounts),
    }),
  });
}
