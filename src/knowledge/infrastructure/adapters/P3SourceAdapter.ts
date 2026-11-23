/**
 * P3 Source Adapter: Pure read-only projection of Priority 3 Learning & Knowledge Intelligence
 *
 * Strict Architectural Rule: Pure function; preserves P3 isolated storage, 6 sections,
 * 3 epistemological perspectives, and native 8 relationship types. Zero data duplication.
 */

import type { P3StorageSchema } from "@/priority3/infrastructure/persistence/types";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../../domain/entities";
import type { GraphClusterType } from "../../domain/enums";

export interface P3ProjectionOutput {
  readonly nodes: readonly GlobalKnowledgeNode[];
  readonly edges: readonly GlobalKnowledgeEdge[];
}

function truncateExcerpt(text: string, maxLen = 220): string {
  if (!text) return "";
  const cleaned = text.replace(/[\r\n\t]+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 3) + "...";
}

function getClusterForFoundation(foundationId?: string): GraphClusterType {
  if (foundationId === "human_understanding") return "foundation_human";
  if (foundationId === "reality_understanding") return "foundation_reality";
  return "foundation_custom";
}

/**
 * Projects Priority 3 foundations, domains, subjects, topics, and Knowledge Units into Global Knowledge.
 */
export function projectP3Records(
  p3Storage?: P3StorageSchema,
): P3ProjectionOutput {
  const nodes: GlobalKnowledgeNode[] = [];
  const edges: GlobalKnowledgeEdge[] = [];

  if (!p3Storage) {
    return { nodes, edges };
  }

  // 1. Foundations (Root Hubs, Depth 0)
  for (const foundation of p3Storage.foundations || []) {
    const cluster = getClusterForFoundation(foundation.id);
    const foundationUri = `gkn://p3/foundation/${foundation.id}`;

    nodes.push({
      id: foundationUri,
      label: foundation.name,
      cluster,
      entityType: "foundation",
      formatBadge: "Foundation",
      excerpt: truncateExcerpt(
        foundation.description || `Permanent Foundation: ${foundation.name}`,
      ),
      depth: 0,
      sourceRef: {
        system: "priority3",
        entityType: "foundation",
        entityId: foundation.id,
        humanReadablePath: `Priority 3 > ${foundation.name}`,
      },
      tags: ["permanent_foundation", foundation.id],
    });
  }

  // 2. Domains (Depth 1)
  for (const domain of p3Storage.domains || []) {
    const foundationId = domain.foundationId || "human_understanding";
    const cluster = getClusterForFoundation(foundationId);
    const domainUri = `gkn://p3/domain/${domain.id}`;
    const parentFoundationUri = `gkn://p3/foundation/${foundationId}`;

    nodes.push({
      id: domainUri,
      label: domain.name,
      cluster,
      entityType: "domain",
      formatBadge: "Domain",
      excerpt: truncateExcerpt(domain.description || `Domain: ${domain.name}`),
      depth: 1,
      sourceRef: {
        system: "priority3",
        entityType: "domain",
        entityId: domain.id,
        secondaryId: foundationId,
        humanReadablePath: `Priority 3 > Foundation > ${domain.name}`,
      },
      tags: ["domain", foundationId],
      metadata: {
        foundationId,
      },
    });

    edges.push({
      id: `gke://${parentFoundationUri}/${domainUri}/contains`,
      source: parentFoundationUri,
      target: domainUri,
      relationship: "contains",
      direction: "directed",
      provenance: "projected_hierarchy",
      label: "contains",
    });
  }

  // 3. Subjects (Depth 2)
  for (const subject of p3Storage.subjects || []) {
    const domain = (p3Storage.domains || []).find(
      (d) => d.id === subject.domainId,
    );
    const foundationId = domain?.foundationId || "human_understanding";
    const cluster = getClusterForFoundation(foundationId);
    const subjectUri = `gkn://p3/subject/${subject.id}`;
    const parentDomainUri = `gkn://p3/domain/${subject.domainId}`;

    nodes.push({
      id: subjectUri,
      label: subject.name,
      cluster,
      entityType: "subject",
      formatBadge: "Subject",
      excerpt: truncateExcerpt(
        subject.description || `Subject: ${subject.name}`,
      ),
      depth: 2,
      sourceRef: {
        system: "priority3",
        entityType: "subject",
        entityId: subject.id,
        secondaryId: subject.domainId,
        humanReadablePath: `Priority 3 > Domain > ${subject.name}`,
      },
      tags: ["subject", subject.domainId],
      metadata: {
        domainId: subject.domainId,
      },
    });

    edges.push({
      id: `gke://${parentDomainUri}/${subjectUri}/contains`,
      source: parentDomainUri,
      target: subjectUri,
      relationship: "contains",
      direction: "directed",
      provenance: "projected_hierarchy",
      label: "contains",
    });
  }

  // 4. Topics (Depth 3)
  for (const topic of p3Storage.topics || []) {
    const subject = (p3Storage.subjects || []).find(
      (s) => s.id === topic.subjectId,
    );
    const domain = subject
      ? (p3Storage.domains || []).find((d) => d.id === subject.domainId)
      : undefined;
    const foundationId = domain?.foundationId || "human_understanding";
    const cluster = getClusterForFoundation(foundationId);

    const topicUri = `gkn://p3/topic/${topic.id}`;
    const parentSubjectUri = `gkn://p3/subject/${topic.subjectId}`;

    nodes.push({
      id: topicUri,
      label: topic.name,
      cluster,
      entityType: "topic",
      formatBadge: "Topic",
      excerpt: truncateExcerpt(topic.description || `Topic: ${topic.name}`),
      depth: 3,
      sourceRef: {
        system: "priority3",
        entityType: "topic",
        entityId: topic.id,
        secondaryId: topic.subjectId,
        humanReadablePath: `Priority 3 > Subject > ${topic.name}`,
      },
      tags: ["topic", topic.subjectId],
      metadata: {
        subjectId: topic.subjectId,
      },
    });

    edges.push({
      id: `gke://${parentSubjectUri}/${topicUri}/contains`,
      source: parentSubjectUri,
      target: topicUri,
      relationship: "contains",
      direction: "directed",
      provenance: "projected_hierarchy",
      label: "contains",
    });
  }

  // 5. Knowledge Units (Depth 4)
  for (const ku of p3Storage.knowledgeUnits || []) {
    const topicId = ku.topicId || "default";
    const topic = (p3Storage.topics || []).find((t) => t.id === topicId);
    const subject = topic
      ? (p3Storage.subjects || []).find((s) => s.id === topic.subjectId)
      : undefined;
    const domain = subject
      ? (p3Storage.domains || []).find((d) => d.id === subject.domainId)
      : undefined;
    const foundationId =
      domain?.foundationId || ku.foundationId || "human_understanding";
    const cluster = getClusterForFoundation(foundationId);

    const kuUri = `gkn://p3/ku/${ku.id}`;
    const parentTopicUri = `gkn://p3/topic/${topicId}`;

    // Epistemological Perspective Mapping:
    // Strictly separates the 3 authoritative perspectives from the legacy 'unclassified' sentinel
    let perspectiveLabel = "Personal Understanding";
    let isPendingClassification = false;

    if (ku.perspective === "objective_knowledge") {
      perspectiveLabel = "Objective Knowledge";
    } else if (ku.perspective === "hypothesis") {
      perspectiveLabel = "Hypothesis";
    } else if (ku.perspective === "unclassified") {
      perspectiveLabel = "Pending Classification";
      isPendingClassification = true;
    }

    const excerptText =
      ku.summary ||
      ku.coreUnderstanding?.plainEnglishExplanation ||
      `Knowledge Unit: ${ku.title}`;

    const tags = [
      ...(ku.identity?.tags || []),
      ku.perspective,
      ku.status,
      ku.classification,
    ];

    const evidenceCount = (ku.sourcesAndEvidence?.evidenceIds || []).length;
    const applicationCount = (
      ku.relationshipsAndApplications?.applicationRecordIds || []
    ).length;

    nodes.push({
      id: kuUri,
      label: ku.title,
      cluster,
      entityType: "knowledge_unit",
      formatBadge: isPendingClassification
        ? "Pending Classification"
        : perspectiveLabel,
      excerpt: truncateExcerpt(excerptText),
      depth: 4,
      sourceRef: {
        system: "priority3",
        entityType: "knowledge_unit",
        entityId: ku.id,
        secondaryId: topicId,
        humanReadablePath: `Priority 3 > ${domain?.name || "Learning"} > ${ku.title}`,
      },
      tags,
      isArchived: ku.isArchived,
      metadata: {
        perspective: ku.perspective,
        perspectiveLabel,
        isPendingClassification,
        status: ku.status, // Knowledge development: captured | understood | tested | validated
        classification: ku.classification,
        hasEvidence: evidenceCount > 0,
        evidenceCount,
        applicationCount,
      },
    });

    edges.push({
      id: `gke://${parentTopicUri}/${kuUri}/contains`,
      source: parentTopicUri,
      target: kuUri,
      relationship: "contains",
      direction: "directed",
      provenance: "projected_hierarchy",
      label: "contains",
    });
  }

  // 6. Native P3 Semantic Relationships (Preserving all 8 native relationship types)
  for (const rel of p3Storage.relationships || []) {
    const sourceKuUri = `gkn://p3/ku/${rel.sourceKnowledgeUnitId}`;
    const targetKuUri = `gkn://p3/ku/${rel.targetKnowledgeUnitId}`;

    edges.push({
      id: `gke://${sourceKuUri}/${targetKuUri}/${rel.type}`,
      source: sourceKuUri,
      target: targetKuUri,
      relationship: rel.type,
      direction: rel.type === "contrasts_with" ? "bidirectional" : "directed",
      provenance: "native_p3",
      label: rel.type.replace(/_/g, " "),
      explanation: rel.explanation,
    });
  }

  return { nodes, edges };
}
