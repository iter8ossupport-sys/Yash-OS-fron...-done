/**
 * Review Source Adapter: Pure read-only projection of Reviews & Reflection Intelligence
 *
 * Strict Architectural Rule: Pure function; preserves review immutability and promotion backlinks.
 */

import type {
  ReviewBottleneck,
  ReviewImprovement,
} from "@/lib/os/types/reviews";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../../domain/entities";

export interface ReviewProjectionOutput {
  readonly nodes: readonly GlobalKnowledgeNode[];
  readonly edges: readonly GlobalKnowledgeEdge[];
}

function truncateExcerpt(text: string, maxLen = 200): string {
  if (!text) return "";
  const cleaned = text.replace(/[\r\n\t]+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 3) + "...";
}

/**
 * Projects evaluated Review improvements, recurring bottlenecks, and promotion backlinks into Global Knowledge.
 */
export function projectReviewRecords(
  improvements: readonly ReviewImprovement[] = [],
  bottlenecks: readonly ReviewBottleneck[] = [],
): ReviewProjectionOutput {
  const nodes: GlobalKnowledgeNode[] = [];
  const edges: GlobalKnowledgeEdge[] = [];

  // 1. Evaluated Improvements
  for (const imp of improvements) {
    const impUri = `gkn://reviews/improvement/${imp.id}`;

    nodes.push({
      id: impUri,
      label: truncateExcerpt(imp.problemStatement, 60),
      cluster: "reviews_intelligence",
      entityType: "improvement",
      formatBadge: `Improvement (${imp.status})`,
      excerpt: truncateExcerpt(
        `Problem: ${imp.problemStatement} · Action: ${imp.approvedAction || imp.recommendation}`,
      ),
      depth: 1,
      sourceRef: {
        system: "reviews",
        entityType: "improvement",
        entityId: imp.id,
        secondaryId: imp.periodRef,
        humanReadablePath: `Reviews > ${imp.periodRef} > Improvement`,
      },
      tags: [
        "review_improvement",
        imp.periodType,
        imp.status,
        ...(imp.evaluationOutcome ? [imp.evaluationOutcome] : []),
      ],
      metadata: {
        periodRef: imp.periodRef,
        status: imp.status,
        evaluationOutcome: imp.evaluationOutcome,
        evaluatedAt: imp.evaluatedAt,
        promotedToKnowledgeId: imp.promotedToKnowledgeId,
      },
    });

    // Promotion Backlink Edge: If promoted to Knowledge, connect to KnowledgeItem
    if (imp.promotedToKnowledgeId) {
      const knowledgeUri = `gkn://knowledge/item/${imp.promotedToKnowledgeId}`;
      edges.push({
        id: `gke://${knowledgeUri}/${impUri}/derived_from`,
        source: knowledgeUri,
        target: impUri,
        relationship: "derived_from",
        direction: "directed",
        provenance: "native_review",
        label: "derived from review",
        explanation: `Curated operating principle forged from evaluated review improvement in ${imp.periodRef}.`,
      });
    }
  }

  // 2. Recurring Bottlenecks
  for (const btn of bottlenecks) {
    const btnUri = `gkn://reviews/bottleneck/${btn.id}`;

    nodes.push({
      id: btnUri,
      label: btn.title,
      cluster: "reviews_intelligence",
      entityType: "bottleneck",
      formatBadge: `Bottleneck (${btn.severity})`,
      excerpt: truncateExcerpt(btn.description || `Bottleneck: ${btn.title}`),
      depth: 1,
      sourceRef: {
        system: "reviews",
        entityType: "bottleneck",
        entityId: btn.id,
        humanReadablePath: `Reviews > Bottleneck: ${btn.title}`,
      },
      tags: ["bottleneck", btn.severity, btn.status],
      metadata: {
        severity: btn.severity,
        status: btn.status,
        occurrenceCount: btn.occurrenceCount,
        mitigationPlan: btn.mitigationPlan,
      },
    });

    // If bottleneck is linked to a Priority 1 project, create cross-system edge
    if (btn.projectId) {
      const projectUri = `gkn://p1/project/${btn.projectId}`;
      edges.push({
        id: `gke://${btnUri}/${projectUri}/challenges`,
        source: btnUri,
        target: projectUri,
        relationship: "challenges",
        direction: "directed",
        provenance: "native_review",
        label: "impedes project",
      });
    }
  }

  return { nodes, edges };
}
