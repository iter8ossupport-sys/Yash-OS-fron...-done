/**
 * P2 Source Adapter: Pure read-only projection of Priority 2 Cashflow Infrastructure
 *
 * Strict Architectural Rule: Strictly redacts sensitive financials, account sizes,
 * broker credentials, and live execution PnL. Projects structural strategies only.
 */

import type { Project } from "@/lib/os/types/projects";
import type { TradingOperation } from "@/lib/os/types/trading";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "../../domain/entities";

export interface P2ProjectionOutput {
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
 * Projects Priority 2 structural strategies, systems, and risk rules with strict financial redaction.
 */
export function projectP2Records(
  tradingOperation?: TradingOperation,
  projects: readonly Project[] = [],
): P2ProjectionOutput {
  const nodes: GlobalKnowledgeNode[] = [];
  const edges: GlobalKnowledgeEdge[] = [];

  // 1. Project-level P2 Projects (Workstream A: Cashflow, Workstream B: Fintech)
  const p2Projects = projects.filter((p) => p.priorityId === 2);
  for (const proj of p2Projects) {
    const projectUri = `gkn://p2/project/${proj.id}`;

    nodes.push({
      id: projectUri,
      label: proj.name,
      cluster: "p2_cashflow",
      entityType: "project",
      formatBadge: "P2 Project",
      excerpt: truncateExcerpt(
        proj.objective || `Priority 2 cashflow project: ${proj.name}`,
      ),
      depth: 1,
      sourceRef: {
        system: "priority2",
        entityType: "project",
        entityId: proj.id,
        humanReadablePath: `Priority 2 > ${proj.name}`,
      },
      tags: ["cashflow", "trading", proj.status],
      isArchived: proj.status === "archived",
      metadata: {
        status: proj.status,
      },
    });

    for (const doc of proj.docs || []) {
      const docUri = `gkn://p2/project_doc/${doc.id}`;
      const docTitle = doc.title || "Document";
      const docContent = "content" in doc ? doc.content : "";

      nodes.push({
        id: docUri,
        label: docTitle,
        cluster: "p2_cashflow",
        entityType: "project_doc",
        formatBadge: "Doc",
        excerpt: truncateExcerpt(docContent || `Document: ${docTitle}`),
        depth: 2,
        sourceRef: {
          system: "priority2",
          entityType: "project_doc",
          entityId: doc.id,
          secondaryId: proj.id,
          humanReadablePath: `Priority 2 > ${proj.name} > ${docTitle}`,
        },
      });

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
  }

  // 2. Structural Trading Operations
  if (tradingOperation) {
    const opUri = `gkn://p2/operation/${tradingOperation.id}`;

    nodes.push({
      id: opUri,
      label: tradingOperation.name || "Trading Operation",
      cluster: "p2_cashflow",
      entityType: "trading_operation",
      formatBadge: "Trading Engine",
      excerpt: truncateExcerpt(
        tradingOperation.operatingProfile?.coreEdgeDescription ||
          "Quantitative and discretionary trading operations infrastructure.",
      ),
      depth: 1,
      sourceRef: {
        system: "priority2",
        entityType: "trading_operation",
        entityId: tradingOperation.id,
        humanReadablePath: `Priority 2 > ${tradingOperation.name}`,
      },
      tags: ["trading_engine", tradingOperation.status],
      metadata: {
        status: tradingOperation.status,
        stage: tradingOperation.currentStage,
      },
    });

    // 2.1 Structural Strategies (Zero Financial Figures)
    for (const strat of tradingOperation.strategies || []) {
      const stratUri = `gkn://p2/strategy/${strat.id}`;

      nodes.push({
        id: stratUri,
        label: strat.name,
        cluster: "p2_cashflow",
        entityType: "trading_strategy",
        formatBadge: "Strategy",
        excerpt: truncateExcerpt(
          strat.rulesMarkdown || `Trading Strategy: ${strat.name}`,
        ),
        depth: 2,
        sourceRef: {
          system: "priority2",
          entityType: "trading_strategy",
          entityId: strat.id,
          secondaryId: tradingOperation.id,
          humanReadablePath: `Priority 2 > ${tradingOperation.name} > Strategy: ${strat.name}`,
        },
        tags: [strat.assetClass, strat.timeframe, strat.status],
        metadata: {
          assetClass: strat.assetClass,
          timeframe: strat.timeframe,
          status: strat.status,
          stage: strat.stage,
        },
      });

      edges.push({
        id: `gke://${opUri}/${stratUri}/contains`,
        source: opUri,
        target: stratUri,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
        label: "contains",
      });
    }

    // 2.2 Execution Systems
    for (const sys of tradingOperation.systems || []) {
      const sysUri = `gkn://p2/system/${sys.id}`;

      nodes.push({
        id: sysUri,
        label: sys.name,
        cluster: "p2_cashflow",
        entityType: "trading_system",
        formatBadge: "System",
        excerpt: `Execution platform: ${sys.platformOrTech} (${sys.automationLevel})`,
        depth: 2,
        sourceRef: {
          system: "priority2",
          entityType: "trading_system",
          entityId: sys.id,
          secondaryId: tradingOperation.id,
          humanReadablePath: `Priority 2 > System: ${sys.name}`,
        },
        tags: [sys.automationLevel, sys.status],
        metadata: {
          automationLevel: sys.automationLevel,
          platformOrTech: sys.platformOrTech,
          status: sys.status,
        },
      });

      edges.push({
        id: `gke://${opUri}/${sysUri}/contains`,
        source: opUri,
        target: sysUri,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
        label: "contains",
      });

      // Link system to its strategy if strategy exists
      if (sys.strategyId) {
        const stratUri = `gkn://p2/strategy/${sys.strategyId}`;
        edges.push({
          id: `gke://${sysUri}/${stratUri}/applies_to`,
          source: sysUri,
          target: stratUri,
          relationship: "applies_to",
          direction: "directed",
          provenance: "projected_hierarchy",
          label: "implements",
        });
      }
    }

    // 2.3 Conceptual Risk Management Framework (Pure Structural Policy)
    if (tradingOperation.operatingProfile?.riskRules) {
      const riskRules = tradingOperation.operatingProfile.riskRules;
      const riskUri = `gkn://p2/risk_framework/${tradingOperation.id}-risk`;

      nodes.push({
        id: riskUri,
        label: "Trading Risk Framework",
        cluster: "p2_cashflow",
        entityType: "risk_framework",
        formatBadge: "Risk Framework",
        excerpt: `Hard stop required: ${riskRules.hardStopRequired ? "Yes" : "No"} · Circuit breaker: ${riskRules.circuitBreakerAction || "None"}`,
        depth: 2,
        sourceRef: {
          system: "priority2",
          entityType: "risk_framework",
          entityId: `${tradingOperation.id}-risk`,
          secondaryId: tradingOperation.id,
          humanReadablePath: `Priority 2 > Trading Risk Framework`,
        },
        tags: ["risk_management", "rules"],
        metadata: {
          hardStopRequired: riskRules.hardStopRequired,
          circuitBreakerAction: riskRules.circuitBreakerAction,
        },
      });

      edges.push({
        id: `gke://${opUri}/${riskUri}/contains`,
        source: opUri,
        target: riskUri,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
        label: "enforces",
      });
    }
  }

  return { nodes, edges };
}
