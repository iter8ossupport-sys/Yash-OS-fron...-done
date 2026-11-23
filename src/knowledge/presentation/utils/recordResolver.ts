/**
 * Record Resolver: Resolves authoritative records dynamically from owning source systems
 *
 * Strict Architectural Rule: Pure function; zero mutations; returns only fields that exist.
 */

import type { OSState } from "@/lib/os/types/core";
import type { P3StorageSchema } from "@/priority3/infrastructure/persistence/types";
import type { GlobalKnowledgeNode } from "../../domain/entities";
import type { ResolvedSourceDetails } from "../types";

/**
 * Resolves authoritative source data dynamically from the owning system.
 * Only non-empty, authoritative fields are presented.
 */
export function resolveAuthoritativeRecord(
  node: GlobalKnowledgeNode,
  osState: OSState,
  p3Storage?: P3StorageSchema,
): ResolvedSourceDetails {
  const { system, entityType, entityId, secondaryId, humanReadablePath } =
    node.sourceRef;
  const attributes: Array<{
    label: string;
    value: string | number | boolean | readonly string[];
  }> = [];
  const actionLinks: Array<{ label: string; destination: string }> = [];

  let systemTitle = "System";
  const primaryLabel = node.label;
  let secondarySubtitle: string | undefined = undefined;
  let statusBadge: string | undefined = undefined;
  let perspectiveBadge: string | undefined = undefined;

  // 1. Priority 1: Founder Capability
  if (system === "priority1") {
    systemTitle = "Priority 1 — Founder Capability";
    actionLinks.push({
      label: "Open in P1 Workspace",
      destination: `/projects?priority=1`,
    });

    const project = (osState.projects || []).find(
      (p) => p.id === entityId || p.id === secondaryId,
    );

    if (entityType === "project" && project) {
      statusBadge = project.status;
      if (project.objective) {
        attributes.push({ label: "Objective", value: project.objective });
      }
      if (project.milestone) {
        attributes.push({ label: "Milestone", value: project.milestone });
      }
      if (project.deadline) {
        attributes.push({ label: "Target Date", value: project.deadline });
      }
      if (project.hypothesis) {
        attributes.push({
          label: "Core Hypothesis",
          value: project.hypothesis,
        });
      }
    } else if (entityType === "project_doc" && project) {
      const doc = (project.docs || []).find((d) => d.id === entityId);
      secondarySubtitle = `Document in ${project.name}`;
      if (doc?.updatedAt) {
        attributes.push({ label: "Last Updated", value: doc.updatedAt });
      }
    } else if (entityType === "milestone" && project) {
      const ms = (project.milestones || []).find((m) => m.id === entityId);
      secondarySubtitle = `Milestone in ${project.name}`;
      if (ms?.status) statusBadge = ms.status;
      if (ms?.objective) {
        attributes.push({ label: "Objective", value: ms.objective });
      }
      if (ms?.deadline) {
        attributes.push({ label: "Deadline", value: ms.deadline });
      }
    } else if (entityType === "project_goal" && project) {
      const goal = (project.goals || []).find((g) => g.id === entityId);
      secondarySubtitle = `Goal in ${project.name}`;
      if (goal?.status) statusBadge = goal.status;
    }
  }

  // 2. Priority 2: Cashflow & Trading Infrastructure
  else if (system === "priority2") {
    systemTitle = "Priority 2 — Cashflow Infrastructure";
    actionLinks.push({
      label: "Open in P2 Workspace",
      destination: `/projects?priority=2`,
    });

    const tradingOp = osState.tradingOperation;
    if (entityType === "trading_strategy" && tradingOp) {
      const strat = (tradingOp.strategies || []).find((s) => s.id === entityId);
      if (strat?.status) statusBadge = strat.status;
      if (strat?.assetClass) {
        attributes.push({ label: "Asset Class", value: strat.assetClass });
      }
      if (strat?.timeframe) {
        attributes.push({ label: "Timeframe", value: strat.timeframe });
      }
      if (strat?.stage) {
        attributes.push({ label: "Execution Stage", value: strat.stage });
      }
    } else if (entityType === "trading_system" && tradingOp) {
      const sys = (tradingOp.systems || []).find((s) => s.id === entityId);
      if (sys?.status) statusBadge = sys.status;
      if (sys?.automationLevel) {
        attributes.push({
          label: "Automation Level",
          value: sys.automationLevel,
        });
      }
      if (sys?.platformOrTech) {
        attributes.push({
          label: "Platform / Tech",
          value: sys.platformOrTech,
        });
      }
    } else if (entityType === "risk_framework" && tradingOp) {
      const risk = tradingOp.operatingProfile?.riskRules;
      statusBadge = "Enforced";
      if (risk) {
        attributes.push({
          label: "Hard Stop Required",
          value: risk.hardStopRequired ? "Yes" : "No",
        });
        if (risk.circuitBreakerAction) {
          attributes.push({
            label: "Circuit Breaker",
            value: risk.circuitBreakerAction,
          });
        }
      }
    }
  }

  // 3. Priority 3: Learning & Knowledge Intelligence
  else if (system === "priority3") {
    systemTitle = "Priority 3 — Learning Intelligence";
    actionLinks.push({
      label: "Open in P3 Workspace",
      destination: `/projects?priority=3`,
    });

    if (p3Storage) {
      if (entityType === "foundation") {
        const found = (p3Storage.foundations || []).find(
          (f) => f.id === entityId,
        );
        statusBadge = "Permanent";
        if (found?.description) {
          attributes.push({ label: "Description", value: found.description });
        }
        if (found?.examples && found.examples.length > 0) {
          attributes.push({ label: "Key Disciplines", value: found.examples });
        }
      } else if (entityType === "domain") {
        const dom = (p3Storage.domains || []).find((d) => d.id === entityId);
        if (dom?.description) {
          attributes.push({ label: "Description", value: dom.description });
        }
      } else if (entityType === "subject") {
        const sub = (p3Storage.subjects || []).find((s) => s.id === entityId);
        if (sub?.description) {
          attributes.push({ label: "Description", value: sub.description });
        }
      } else if (entityType === "topic") {
        const top = (p3Storage.topics || []).find((t) => t.id === entityId);
        if (top?.description) {
          attributes.push({ label: "Description", value: top.description });
        }
      } else if (entityType === "knowledge_unit") {
        const ku = (p3Storage.knowledgeUnits || []).find(
          (k) => k.id === entityId,
        );
        if (ku) {
          statusBadge = ku.status;
          perspectiveBadge =
            ku.perspective === "objective_knowledge"
              ? "Objective Knowledge"
              : ku.perspective === "hypothesis"
                ? "Hypothesis"
                : ku.perspective === "unclassified"
                  ? "Pending Classification"
                  : "Personal Understanding";

          if (ku.coreUnderstanding?.plainEnglishExplanation) {
            attributes.push({
              label: "Core Understanding",
              value: ku.coreUnderstanding.plainEnglishExplanation,
            });
          }
          if (
            ku.coreUnderstanding?.corePrinciples &&
            ku.coreUnderstanding.corePrinciples.length > 0
          ) {
            attributes.push({
              label: "Core Principles",
              value: ku.coreUnderstanding.corePrinciples,
            });
          }
          if (
            ku.coreUnderstanding?.mentalModels &&
            ku.coreUnderstanding.mentalModels.length > 0
          ) {
            attributes.push({
              label: "Mental Models",
              value: ku.coreUnderstanding.mentalModels,
            });
          }
          const evidenceCount = (ku.sourcesAndEvidence?.evidenceIds || [])
            .length;
          if (evidenceCount > 0) {
            attributes.push({
              label: "Supporting Evidence Items",
              value: `${evidenceCount} item${evidenceCount === 1 ? "" : "s"}`,
            });
          }
          const appCount = (
            ku.relationshipsAndApplications?.applicationRecordIds || []
          ).length;
          if (appCount > 0) {
            attributes.push({
              label: "Practical Applications",
              value: `${appCount} application${appCount === 1 ? "" : "s"}`,
            });
          }
        }
      }
    }
  }

  // 4. Reviews & Continuous Improvement
  else if (system === "reviews") {
    systemTitle = "Operating Reviews & Intelligence";
    actionLinks.push({
      label: "Open in Reviews Hub",
      destination: `/reviews`,
    });

    if (entityType === "improvement") {
      const imp = (osState.improvements || []).find((i) => i.id === entityId);
      if (imp) {
        statusBadge = imp.status;
        secondarySubtitle = `Review Period: ${imp.periodRef}`;
        attributes.push({
          label: "Problem Statement",
          value: imp.problemStatement,
        });
        if (imp.approvedAction || imp.recommendation) {
          attributes.push({
            label: "Action Protocol",
            value: imp.approvedAction || imp.recommendation,
          });
        }
        if (imp.evaluationOutcome) {
          attributes.push({
            label: "Evaluation Outcome",
            value: imp.evaluationOutcome,
          });
        }
        if (imp.evaluatedAt) {
          attributes.push({ label: "Evaluated At", value: imp.evaluatedAt });
        }
      }
    } else if (entityType === "bottleneck") {
      const btn = (osState.bottlenecks || []).find((b) => b.id === entityId);
      if (btn) {
        statusBadge = `${btn.severity.toUpperCase()} · ${btn.status}`;
        attributes.push({ label: "Description", value: btn.description });
        if (btn.occurrenceCount) {
          attributes.push({
            label: "Occurrences",
            value: btn.occurrenceCount,
          });
        }
        if (btn.mitigationPlan) {
          attributes.push({
            label: "Mitigation Plan",
            value: btn.mitigationPlan,
          });
        }
      }
    }
  }

  // 5. Curated Operating Memories
  else if (system === "knowledge") {
    systemTitle = "Curated Memory & Principles";
    actionLinks.push({
      label: "Open Knowledge Base",
      destination: `/knowledge`,
    });

    const item = (osState.knowledge || []).find((k) => k.id === entityId);
    if (item) {
      statusBadge = item.confidence
        ? `Confidence: ${item.confidence}`
        : item.type;
      perspectiveBadge = item.knowledgeFormat
        ? `Format: ${item.knowledgeFormat.toUpperCase()}`
        : undefined;

      if (item.knowledgeFormat === "principle" && item.formatData?.principle) {
        attributes.push({
          label: "Core Principle",
          value: item.formatData.principle.corePrinciple,
        });
        if (item.formatData.principle.whyItMatters) {
          attributes.push({
            label: "Why It Matters",
            value: item.formatData.principle.whyItMatters,
          });
        }
      } else if (item.knowledgeFormat === "method" && item.formatData?.method) {
        if (item.formatData.method.purpose) {
          attributes.push({
            label: "Purpose",
            value: item.formatData.method.purpose,
          });
        }
        if (
          item.formatData.method.steps &&
          item.formatData.method.steps.length > 0
        ) {
          attributes.push({
            label: "Protocol Steps",
            value: item.formatData.method.steps,
          });
        }
      } else if (
        item.knowledgeFormat === "framework" &&
        item.formatData?.framework
      ) {
        if (item.formatData.framework.purpose) {
          attributes.push({
            label: "Purpose",
            value: item.formatData.framework.purpose,
          });
        }
        if (
          item.formatData.framework.components &&
          item.formatData.framework.components.length > 0
        ) {
          attributes.push({
            label: "Framework Components",
            value: item.formatData.framework.components,
          });
        }
      }
    }
  }

  return {
    systemTitle,
    primaryLabel,
    secondarySubtitle,
    statusBadge,
    perspectiveBadge,
    directPath: humanReadablePath || `${system} > ${primaryLabel}`,
    attributes,
    actionLinks,
  };
}
