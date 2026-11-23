/**
 * P1 Source Adapter: Pure read-only projection of Priority 1 Founder Capability
 *
 * Strict Architectural Rule: Pure function; zero mutations; no document cloning.
 */

import type { Project } from "@/lib/os/types/projects";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../../domain/entities";

export interface P1ProjectionOutput {
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
 * Projects Priority 1 projects, documents, milestones, and goals into Global Knowledge.
 */
export function projectP1Records(
  projects: readonly Project[] = [],
): P1ProjectionOutput {
  const nodes: GlobalKnowledgeNode[] = [];
  const edges: GlobalKnowledgeEdge[] = [];

  // Filter for Priority 1 projects
  const p1Projects = projects.filter((p) => p.priorityId === 1);

  for (const proj of p1Projects) {
    const projectUri = `gkn://p1/project/${proj.id}`;

    // 1. Project Root Node
    nodes.push({
      id: projectUri,
      label: proj.name,
      cluster: "p1_founder",
      entityType: "project",
      formatBadge: "P1 Project",
      excerpt: truncateExcerpt(
        proj.objective || `Priority 1 founder project: ${proj.name}`,
      ),
      depth: 1,
      sourceRef: {
        system: "priority1",
        entityType: "project",
        entityId: proj.id,
        humanReadablePath: `Priority 1 > ${proj.name}`,
      },
      tags: ["founder", proj.status],
      isArchived: proj.status === "archived",
      metadata: {
        status: proj.status,
        deadline: proj.deadline,
        hypothesis: proj.hypothesis,
      },
    });

    // 2. Project Documents (ProjectDoc)
    for (const doc of proj.docs || []) {
      const docUri = `gkn://p1/project_doc/${doc.id}`;
      const docTitle = doc.title || "Document";
      const docContent = "content" in doc ? doc.content : "";

      nodes.push({
        id: docUri,
        label: docTitle,
        cluster: "p1_founder",
        entityType: "project_doc",
        formatBadge: "Doc",
        excerpt: truncateExcerpt(docContent || `Document: ${docTitle}`),
        depth: 2,
        sourceRef: {
          system: "priority1",
          entityType: "project_doc",
          entityId: doc.id,
          secondaryId: proj.id,
          humanReadablePath: `Priority 1 > ${proj.name} > ${docTitle}`,
        },
        metadata: {
          projectId: proj.id,
          updatedAt: doc.updatedAt,
        },
      });

      // Hierarchy Edge: Project contains Doc
      edges.push({
        id: `gke://${projectUri}/${docUri}/contains`,
        source: projectUri,
        target: docUri,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
        label: "contains",
      });
    }

    // 3. Project Milestones
    for (const ms of proj.milestones || []) {
      const msUri = `gkn://p1/milestone/${ms.id}`;
      nodes.push({
        id: msUri,
        label: ms.title,
        cluster: "p1_founder",
        entityType: "milestone",
        formatBadge: "Milestone",
        excerpt: truncateExcerpt(ms.objective || `Milestone: ${ms.title}`),
        depth: 2,
        sourceRef: {
          system: "priority1",
          entityType: "milestone",
          entityId: ms.id,
          secondaryId: proj.id,
          humanReadablePath: `Priority 1 > ${proj.name} > ${ms.title}`,
        },
        tags: [ms.status],
        metadata: {
          projectId: proj.id,
          status: ms.status,
          deadline: ms.deadline,
        },
      });

      edges.push({
        id: `gke://${projectUri}/${msUri}/contains`,
        source: projectUri,
        target: msUri,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
        label: "contains",
      });
    }

    // 4. Project Goals
    for (const goal of proj.goals || []) {
      const goalUri = `gkn://p1/project_goal/${goal.id}`;
      nodes.push({
        id: goalUri,
        label: goal.text,
        cluster: "p1_founder",
        entityType: "project_goal",
        formatBadge: "Goal",
        excerpt: truncateExcerpt(goal.text),
        depth: 2,
        sourceRef: {
          system: "priority1",
          entityType: "project_goal",
          entityId: goal.id,
          secondaryId: proj.id,
          humanReadablePath: `Priority 1 > ${proj.name} > Goal`,
        },
        tags: [goal.status],
        metadata: {
          projectId: proj.id,
          status: goal.status,
        },
      });

      edges.push({
        id: `gke://${projectUri}/${goalUri}/contains`,
        source: projectUri,
        target: goalUri,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
        label: "contains",
      });
    }
  }

  return { nodes, edges };
}
