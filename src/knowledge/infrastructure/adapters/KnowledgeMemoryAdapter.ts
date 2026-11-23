/**
 * Knowledge Memory Adapter: Pure read-only projection of Curated KnowledgeItems
 *
 * Strict Architectural Rule: Pure function; projects existing KnowledgeItem records
 * and resolves their explicit cross-system source references.
 */

import type { KnowledgeItem } from "@/lib/os/types/knowledge";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../../domain/entities";
import type { GlobalRelationshipType } from "../../domain/enums";

export interface KnowledgeProjectionOutput {
  readonly nodes: readonly GlobalKnowledgeNode[];
  readonly edges: readonly GlobalKnowledgeEdge[];
}

function truncateExcerpt(text: string, maxLen = 220): string {
  if (!text) return "";
  const cleaned = text.replace(/[\r\n\t]+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 3) + "...";
}

function formatSystemPrefix(system: string): string {
  if (system === "priority1") return "p1";
  if (system === "priority2") return "p2";
  if (system === "priority3") return "p3";
  return system;
}

/**
 * Projects curated KnowledgeItems and their explicit source references into Global Knowledge.
 */
export function projectKnowledgeRecords(
  knowledge: readonly KnowledgeItem[] = [],
): KnowledgeProjectionOutput {
  const nodes: GlobalKnowledgeNode[] = [];
  const edges: GlobalKnowledgeEdge[] = [];

  for (const item of knowledge) {
    const itemUri = `gkn://knowledge/item/${item.id}`;

    // Compute excerpt based on formatData
    let excerpt = item.body || "";
    if (item.knowledgeFormat === "principle" && item.formatData?.principle) {
      excerpt =
        item.formatData.principle.corePrinciple ||
        item.formatData.principle.whyItMatters ||
        item.body;
    } else if (item.knowledgeFormat === "method" && item.formatData?.method) {
      excerpt =
        item.formatData.method.purpose ||
        (item.formatData.method.steps || []).join(" · ") ||
        item.body;
    } else if (
      item.knowledgeFormat === "framework" &&
      item.formatData?.framework
    ) {
      excerpt =
        item.formatData.framework.purpose ||
        (item.formatData.framework.components || []).join(" → ") ||
        item.body;
    }

    const formatBadge = item.knowledgeFormat
      ? item.knowledgeFormat.charAt(0).toUpperCase() +
        item.knowledgeFormat.slice(1)
      : item.type;

    nodes.push({
      id: itemUri,
      label: item.title,
      cluster: "curated_memory",
      entityType: "curated_memory",
      formatBadge,
      excerpt: truncateExcerpt(excerpt),
      depth: 1,
      sourceRef: {
        system: "knowledge",
        entityType: "knowledge_item",
        entityId: item.id,
        humanReadablePath: `Knowledge > ${item.title}`,
      },
      tags: [
        ...(item.tags ? item.tags.split(",").map((t) => t.trim()) : []),
        item.type,
        item.knowledgeFormat || "custom",
        ...(item.confidence ? [item.confidence] : []),
      ],
      metadata: {
        knowledgeFormat: item.knowledgeFormat,
        confidence: item.confidence, // experimental | supported | established
        promotedFromReviewId: item.promotedFromReviewId,
        priorityId: item.priorityId,
        projectId: item.projectId,
        updatedAt: item.updatedAt,
      },
    });

    // Cross-system edges derived from explicit sourceReferences
    for (const ref of item.sourceReferences || []) {
      const targetSystemPrefix = formatSystemPrefix(ref.system);
      const targetUri = `gkn://${targetSystemPrefix}/${ref.entityType}/${ref.entityId}`;

      let relationship: GlobalRelationshipType = "informs";
      if (
        item.promotedFromReviewId === ref.entityId ||
        ref.system === "reviews"
      ) {
        relationship = "derived_from";
      } else if (
        item.knowledgeFormat === "method" ||
        item.knowledgeFormat === "framework"
      ) {
        relationship = "applies_to";
      }

      edges.push({
        id: `gke://${itemUri}/${targetUri}/${relationship}`,
        source: itemUri,
        target: targetUri,
        relationship,
        direction: "directed",
        provenance: "curated_reference",
        label: relationship.replace(/_/g, " "),
        explanation: `Curated memory explicitly references ${ref.humanReadablePath || ref.entityId}.`,
      });
    }

    // Direct project linkage if projectId is populated and not already in sourceReferences
    if (
      item.projectId &&
      !(item.sourceReferences || []).some((r) => r.entityId === item.projectId)
    ) {
      const targetProjectUri = `gkn://p${item.priorityId || 1}/project/${item.projectId}`;
      edges.push({
        id: `gke://${itemUri}/${targetProjectUri}/informs`,
        source: itemUri,
        target: targetProjectUri,
        relationship: "informs",
        direction: "directed",
        provenance: "curated_reference",
        label: "informs",
      });
    }
  }

  return { nodes, edges };
}
