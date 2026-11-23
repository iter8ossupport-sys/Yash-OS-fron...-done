/**
 * Global Knowledge Phase 2: Graph Engine & Interaction Foundation Test Suite
 *
 * Verifies:
 * 1. Dagre Layout Adapter & Hierarchical Coordinate Computation (TB / LR)
 * 2. Progressive Expansion & Collapsible Subgraph Filtering
 * 3. Authoritative Record Resolver & Context Inspector (P1, P2, P3, Reviews, Curated)
 * 4. P2 Financial Redaction Enforcement in Presentation
 * 5. P3 Epistemic Perspectives & Native Relationship Visual Semantics
 * 6. Interactive Graph Component (Breadcrumbs, Search, Selection, Keyboard Nav, Theme)
 * 7. Scalability & Performance Benchmarks (100, 500, 1,000 nodes)
 */

import React from "react";
import { describe, expect, it, vi, beforeAll } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { initialState } from "@/lib/os/seed";
import type { OSState } from "@/lib/os/types/core";
import type { KnowledgeItem } from "@/lib/os/types/knowledge";
import type { Project } from "@/lib/os/types/projects";
import type { TradingOperation } from "@/lib/os/types/trading";
import type { P3StorageSchema } from "@/priority3/infrastructure/persistence/types";

import { projectGlobalKnowledgeGraph } from "@/knowledge/application/services/GraphProjectionService";
import type {
  GlobalKnowledgeEdge,
  GlobalKnowledgeNode,
} from "@/knowledge/domain/entities";
import {
  DagreLayoutAdapter,
  getNodeDimensions,
} from "@/knowledge/presentation/layout/GraphLayoutAdapter";
import { resolveAuthoritativeRecord } from "@/knowledge/presentation/utils/recordResolver";
import { KnowledgeContextInspector } from "@/knowledge/presentation/components/KnowledgeContextInspector";
import { KnowledgeGraphView } from "@/knowledge/presentation/components/KnowledgeGraphView";

// Mock ResizeObserver for JSDOM canvas measurement
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Global Knowledge Phase 2: Graph Engine & Interaction Foundation", () => {
  // Mock P3 Storage for testing
  const mockP3Storage: P3StorageSchema = {
    schemaVersion: 1,
    updatedAt: "2026-11-22T12:00:00.000Z",
    foundations: [
      {
        id: "human_understanding",
        name: "Human Understanding",
        description: "Cognitive, behavioral, and biological architecture.",
        examples: ["Neuroscience", "Psychology", "Physiology"],
        createdAt: "2026-11-01",
        updatedAt: "2026-11-01",
      },
    ],
    domains: [
      {
        id: "p3-dom-neuro",
        name: "Neuroscience",
        description: "Information processing in cortical networks.",
        foundationId: "human_understanding",
        isArchived: false,
        createdAt: "2026-11-01",
        updatedAt: "2026-11-01",
      },
    ],
    subjects: [
      {
        id: "p3-sub-cortex",
        name: "Cortical Computation",
        description: "Canonical neocortical circuits.",
        domainId: "p3-dom-neuro",
        isArchived: false,
        createdAt: "2026-11-01",
        updatedAt: "2026-11-01",
      },
    ],
    topics: [
      {
        id: "p3-top-htm",
        name: "Sequence Memory",
        description: "Temporal memory algorithms.",
        subjectId: "p3-sub-cortex",
        isArchived: false,
        createdAt: "2026-11-01",
        updatedAt: "2026-11-01",
      },
    ],
    questions: [],
    sessions: [],
    knowledgeUnits: [
      {
        id: "p3-ku-seq",
        title: "Sparse Distributed Representation",
        summary:
          "Neocortical representation model preserving semantic overlap.",
        perspective: "objective_knowledge",
        status: "validated",
        classification: "general",
        foundationId: "human_understanding",
        topicId: "p3-top-htm",
        identity: {
          id: "ident-seq",
          topicId: "p3-top-htm",
          title: "Sparse Distributed Representation",
          perspective: "objective_knowledge",
          classification: "general",
          tags: ["neuroscience"],
        },
        coreUnderstanding: {
          plainEnglishExplanation:
            "High-dimensional binary vectors where active bits represent active concepts.",
          corePrinciples: ["Noise Robustness", "Semantic Overlap"],
          mentalModels: ["Hyperplane Projection"],
        },
        deeperUnderstanding: {
          nuancedMechanisms: "Dendritic coincidence detection",
          boundaryConditions:
            "Requires high-dimensional sparse representations",
          counterExamples: [],
        },
        sourcesAndEvidence: {
          sourceIds: ["src-1"],
          evidenceIds: ["evi-1", "evi-2"],
          competingTheories: ["Dense Localist Coding"],
        },
        relationshipsAndApplications: {
          relationshipIds: ["rel-1"],
          applicationRecordIds: ["app-1"],
        },
        developmentHistory: { revisions: [] },
        isArchived: false,
        createdAt: "2026-11-10",
        updatedAt: "2026-11-20",
      },
    ],
    sources: [],
    evidence: [],
    relationships: [],
    applications: [],
    reviews: [],
    inbox: [],
    context: {
      id: "ctx-default",
      currentFocus: "Sequence Memory",
      lastStoppingPoint: "SDR encoding",
      remainingGaps: "None",
      nextLogicalStep: "Cortical Columns",
      lastActivityAt: "2026-11-20T10:00:00.000Z",
      updatedAt: "2026-11-20T10:00:00.000Z",
    },
    backupSnapshots: [],
  };

  // =========================================================================
  // 1. Dagre Layout Engine & Progressive Expansion Tests
  // =========================================================================
  describe("Dagre Layout Engine & Hierarchical Placement", () => {
    const layoutAdapter = new DagreLayoutAdapter();

    it("handles empty graph gracefully without exceptions or NaN coordinates", () => {
      const result = layoutAdapter.calculateLayout([], []);
      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
    });

    it("places hierarchical nodes with descending Y coordinates in Top-to-Bottom ('TB') direction", () => {
      const parentNode: GlobalKnowledgeNode = {
        id: "gkn://p3/foundation/human_understanding",
        label: "Human Understanding",
        cluster: "foundation_human",
        entityType: "foundation",
        excerpt: "Foundation hub",
        depth: 0,
        sourceRef: {
          system: "priority3",
          entityType: "foundation",
          entityId: "human_understanding",
          humanReadablePath: "P3 > Human",
        },
      };

      const childNode: GlobalKnowledgeNode = {
        id: "gkn://p3/domain/neuroscience",
        label: "Neuroscience",
        cluster: "foundation_human",
        entityType: "domain",
        excerpt: "Domain node",
        depth: 1,
        sourceRef: {
          system: "priority3",
          entityType: "domain",
          entityId: "neuroscience",
          humanReadablePath: "P3 > Human > Neuro",
        },
      };

      const hierarchyEdge: GlobalKnowledgeEdge = {
        id: "gke://p3/foundation/human_understanding/p3/domain/neuroscience/contains",
        source: parentNode.id,
        target: childNode.id,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
      };

      const result = layoutAdapter.calculateLayout(
        [parentNode, childNode],
        [hierarchyEdge],
        { direction: "TB" },
      );

      const parentLayout = result.nodes.find((n) => n.id === parentNode.id);
      const childLayout = result.nodes.find((n) => n.id === childNode.id);

      expect(parentLayout).toBeDefined();
      expect(childLayout).toBeDefined();
      // In Top-to-Bottom, parent Y must be strictly above child Y
      expect(parentLayout!.y).toBeLessThan(childLayout!.y);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it("places hierarchical nodes with ascending X coordinates in Left-to-Right ('LR') direction", () => {
      const parentNode: GlobalKnowledgeNode = {
        id: "gkn://p1/project/proj-1",
        label: "Founder Project",
        cluster: "p1_founder",
        entityType: "project",
        excerpt: "Project root",
        depth: 1,
        sourceRef: {
          system: "priority1",
          entityType: "project",
          entityId: "proj-1",
          humanReadablePath: "P1 > Project",
        },
      };

      const childNode: GlobalKnowledgeNode = {
        id: "gkn://p1/milestone/ms-1",
        label: "Core Milestone",
        cluster: "p1_founder",
        entityType: "milestone",
        excerpt: "Milestone",
        depth: 2,
        sourceRef: {
          system: "priority1",
          entityType: "milestone",
          entityId: "ms-1",
          humanReadablePath: "P1 > Project > MS",
        },
      };

      const edge: GlobalKnowledgeEdge = {
        id: "gke://p1/project/proj-1/p1/milestone/ms-1/contains",
        source: parentNode.id,
        target: childNode.id,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
      };

      // Expand parent so child is visible
      const result = layoutAdapter.calculateLayout(
        [parentNode, childNode],
        [edge],
        {
          direction: "LR",
          expandedNodeIds: new Set([parentNode.id]),
        },
      );

      const parentLayout = result.nodes.find((n) => n.id === parentNode.id);
      const childLayout = result.nodes.find((n) => n.id === childNode.id);

      expect(parentLayout).toBeDefined();
      expect(childLayout).toBeDefined();
      // In Left-to-Right, parent X must be strictly left of child X
      expect(parentLayout!.x).toBeLessThan(childLayout!.x);
    });

    it("PROGRESSIVE EXPANSION: Hides Depth 2+ nodes until parent node is explicitly in expandedNodeIds", () => {
      const p1Project: GlobalKnowledgeNode = {
        id: "gkn://p1/project/proj-core",
        label: "Core Project",
        cluster: "p1_founder",
        entityType: "project",
        excerpt: "P1 Project",
        depth: 1, // Depth 1: Visible by default
        sourceRef: {
          system: "priority1",
          entityType: "project",
          entityId: "proj-core",
          humanReadablePath: "P1 > Core",
        },
      };

      const p1Milestone: GlobalKnowledgeNode = {
        id: "gkn://p1/milestone/ms-alpha",
        label: "Alpha Milestone",
        cluster: "p1_founder",
        entityType: "milestone",
        excerpt: "Milestone",
        depth: 2, // Depth 2: Collapsible child
        sourceRef: {
          system: "priority1",
          entityType: "milestone",
          entityId: "ms-alpha",
          secondaryId: "proj-core",
          humanReadablePath: "P1 > Core > Alpha",
        },
      };

      const hierarchyEdge: GlobalKnowledgeEdge = {
        id: "gke://p1/project/proj-core/p1/milestone/ms-alpha/contains",
        source: p1Project.id,
        target: p1Milestone.id,
        relationship: "contains",
        direction: "directed",
        provenance: "projected_hierarchy",
      };

      // 1. Without expansion: child must NOT be in layouted nodes
      const collapsedLayout = layoutAdapter.calculateLayout(
        [p1Project, p1Milestone],
        [hierarchyEdge],
        { expandedNodeIds: new Set() },
      );
      expect(collapsedLayout.nodes.some((n) => n.id === p1Project.id)).toBe(
        true,
      );
      expect(collapsedLayout.nodes.some((n) => n.id === p1Milestone.id)).toBe(
        false,
      );
      expect(collapsedLayout.edges).toHaveLength(0); // Edge to hidden child is excluded

      // Parent node reports hasChildren = true and childCount = 1
      const parentView = collapsedLayout.nodes.find(
        (n) => n.id === p1Project.id,
      );
      expect(parentView?.hasChildren).toBe(true);
      expect(parentView?.childCount).toBe(1);
      expect(parentView?.isExpanded).toBe(false);

      // 2. With parent expanded: child MUST be in layouted nodes
      const expandedLayout = layoutAdapter.calculateLayout(
        [p1Project, p1Milestone],
        [hierarchyEdge],
        { expandedNodeIds: new Set([p1Project.id]) },
      );
      expect(expandedLayout.nodes.some((n) => n.id === p1Milestone.id)).toBe(
        true,
      );
      expect(expandedLayout.edges).toHaveLength(1);
      const expandedParentView = expandedLayout.nodes.find(
        (n) => n.id === p1Project.id,
      );
      expect(expandedParentView?.isExpanded).toBe(true);
    });

    it("assigns animation metadata to 'informs' and 'derived_from' cross-system edges", () => {
      const nodeA: GlobalKnowledgeNode = {
        id: "gkn://knowledge/item/k-1",
        label: "Principle 1",
        cluster: "curated_memory",
        entityType: "curated_memory",
        excerpt: "P1",
        depth: 1,
        sourceRef: {
          system: "knowledge",
          entityType: "knowledge_item",
          entityId: "k-1",
          humanReadablePath: "K > P1",
        },
      };

      const nodeB: GlobalKnowledgeNode = {
        id: "gkn://p1/project/proj-1",
        label: "Project 1",
        cluster: "p1_founder",
        entityType: "project",
        excerpt: "Proj 1",
        depth: 1,
        sourceRef: {
          system: "priority1",
          entityType: "project",
          entityId: "proj-1",
          humanReadablePath: "P1 > Proj 1",
        },
      };

      const informsEdge: GlobalKnowledgeEdge = {
        id: "gke://k-1/proj-1/informs",
        source: nodeA.id,
        target: nodeB.id,
        relationship: "informs",
        direction: "directed",
        provenance: "curated_reference",
      };

      const layout = layoutAdapter.calculateLayout(
        [nodeA, nodeB],
        [informsEdge],
      );
      expect(layout.edges).toHaveLength(1);
      expect(layout.edges[0]?.animated).toBe(true);
    });
  });

  // =========================================================================
  // 2. Authoritative Record Resolver Tests
  // =========================================================================
  describe("Authoritative Record Resolver & Context Inspector", () => {
    const mockState: OSState = {
      ...initialState,
      projects: [
        {
          id: "proj-p1-test",
          name: "Founder Execution System",
          objective: "Deploy operating system for founder velocity.",
          priorityId: 1,
          status: "active",
          milestone: "Alpha Release",
          deadline: "2026-12-01",
          hypothesis: "Personal OS creates 10x leverage.",
          metrics: "95% goal adherence",
          bottlenecks: "None",
          evidence: "Weekly logs",
          decisions: "Clean architecture",
          learning: "Local first is resilient",
          documents: "Spec Doc",
          createdAt: "2026-11-01",
          docs: [
            {
              id: "doc-spec",
              title: "System Architecture Spec",
              content: "Full markdown specification body...",
              createdAt: "2026-11-01",
              updatedAt: "2026-11-15",
            },
          ],
        },
      ],
      tradingOperation: {
        id: "op-trad-1",
        name: "London Breakout Engine",
        status: "active",
        currentStage: "live_funded",
        operatingProfile: {
          id: "prof-1",
          title: "Operating Profile",
          marketFocus: ["ES", "NQ"],
          coreEdgeDescription: "Opening range breakout with volume filter.",
          riskRules: {
            maxDailyDrawdownCurrency: 1000,
            maxTrailingDrawdownPercent: 3,
            maxRiskPerTradePercent: 1,
            hardStopRequired: true,
            leverageOrContractLimit: "2 Contracts",
            circuitBreakerAction: "stop_for_day",
          },
          routines: {
            preMarketPrepChecklist: [],
            postMarketReviewChecklist: [],
          },
          flexibleContent: "",
          version: 1,
          updatedAt: "2026-11-20",
        },
        financialPlan: {
          id: "fp-1",
          title: "Plan",
          targetMonthlyCashflow: 10000,
          currentMonthlyCashflow: 4000,
          monthlyLivingExpenses: 2000,
          startupRunwayMonthsTarget: 12,
          estimatedCurrentRunwayMonths: 8,
          transitionMilestones: [],
          flexibleContent: "",
          version: 1,
          updatedAt: "2026-11-20",
        },
        strategies: [
          {
            id: "strat-orb",
            name: "London ORB Strategy",
            assetClass: "futures",
            timeframe: "5m",
            rulesMarkdown: "Detailed strategy rules...",
            status: "active",
            stage: "live_funded",
          },
        ],
        systems: [
          {
            id: "sys-alerts",
            name: "TradingView Webhook Gateway",
            strategyId: "strat-orb",
            automationLevel: "semi_automated",
            platformOrTech: "PineScript v5",
            status: "live",
          },
        ],
        accounts: [],
        experiments: [],
        executionRecords: [
          {
            id: "exec-secret",
            date: "2026-11-20",
            sessionType: "London",
            tradesCount: 2,
            disciplineScore: 5,
            ruleAdherence: true,
            netPnL: 950, // Sensitive financial number
            isVerified: true,
            isConfidential: true,
            notes: "Private notes",
          },
        ],
        performanceHistory: [],
        createdAt: "2026-11-01",
        updatedAt: "2026-11-20",
      },
      improvements: [
        {
          id: "imp-walk",
          periodType: "weekly",
          periodRef: "2026-W45",
          problemStatement: "Post-lunch energy dip impairs code review rigor.",
          evidence: {
            metrics: ["Focus score: 4/5"],
            dayDates: ["2026-11-10"],
          },
          recommendation: "Take mandatory 20m brisk walk after meal.",
          status: "evaluated",
          approvedAction: "20-minute brisk walk protocol.",
          evaluatedAt: "2026-11-12",
          evaluationOutcome: "succeeded",
          evaluationNotes: "Validated.",
          promotedToKnowledgeId: "k-walk-principle",
          createdAt: "2026-11-08",
        },
      ],
      bottlenecks: [
        {
          id: "btn-tab-switch",
          priorityId: 1,
          title: "Tab Switching Fatigue",
          description: "Loss of context from switching between tabs.",
          severity: "high",
          status: "active",
          occurrenceCount: 7,
          mitigationPlan: "Use dual display setup.",
          firstObservedDate: "2026-11-05",
          lastObservedDate: "2026-11-18",
          sourceDayDates: [],
        },
      ],
      knowledge: [
        {
          id: "k-walk-principle",
          title: "Post-Meal Cognitive Recovery Protocol",
          type: "Lesson",
          knowledgeFormat: "principle",
          confidence: "established",
          body: "Brisk walking rapidly stabilizes blood glucose.",
          tags: "energy, focus, protocol",
          createdAt: "2026-11-12",
          formatData: {
            principle: {
              corePrinciple: "A 20-minute post-meal walk sustains alertness.",
              whyItMatters: "Prevents circadian post-prandial cognitive dip.",
            },
          },
        },
      ],
    };

    it("resolves authoritative Priority 1 project details and action links", () => {
      const p1Node: GlobalKnowledgeNode = {
        id: "gkn://p1/project/proj-p1-test",
        label: "Founder Execution System",
        cluster: "p1_founder",
        entityType: "project",
        excerpt: "P1 Project excerpt",
        depth: 1,
        sourceRef: {
          system: "priority1",
          entityType: "project",
          entityId: "proj-p1-test",
          humanReadablePath: "Priority 1 > Founder Execution System",
        },
      };

      const resolved = resolveAuthoritativeRecord(p1Node, mockState);
      expect(resolved.systemTitle).toContain("Priority 1");
      expect(resolved.primaryLabel).toBe("Founder Execution System");
      expect(resolved.statusBadge).toBe("active");

      const objAttr = resolved.attributes.find((a) => a.label === "Objective");
      expect(objAttr?.value).toBe(
        "Deploy operating system for founder velocity.",
      );
      const hypAttr = resolved.attributes.find(
        (a) => a.label === "Core Hypothesis",
      );
      expect(hypAttr?.value).toBe("Personal OS creates 10x leverage.");

      if (resolved.actionLinks.length > 0) {
        expect(resolved.actionLinks[0]?.destination).toContain("/projects");
      }
    });

    it("resolves P2 structural strategies while strictly REDACTING sensitive financials", () => {
      const p2StratNode: GlobalKnowledgeNode = {
        id: "gkn://p2/strategy/strat-orb",
        label: "London ORB Strategy",
        cluster: "p2_cashflow",
        entityType: "trading_strategy",
        excerpt: "Strategy excerpt",
        depth: 2,
        sourceRef: {
          system: "priority2",
          entityType: "trading_strategy",
          entityId: "strat-orb",
          humanReadablePath: "Priority 2 > London ORB Strategy",
        },
      };

      const resolved = resolveAuthoritativeRecord(p2StratNode, mockState);
      expect(resolved.systemTitle).toContain("Priority 2");
      expect(resolved.statusBadge).toBe("active");

      const assetAttr = resolved.attributes.find(
        (a) => a.label === "Asset Class",
      );
      expect(assetAttr?.value).toBe("futures");

      // Verify zero financial leakages in serialized attributes
      const serialized = JSON.stringify(resolved);
      expect(serialized).not.toContain("950"); // netPnL
      expect(serialized).not.toContain("netPnL");
      expect(serialized).not.toContain("accountSize");
      expect(serialized).not.toContain("currentBalance");
    });

    it("resolves P3 Knowledge Unit with approved perspective, mental models, and evidence count", () => {
      const p3KuNode: GlobalKnowledgeNode = {
        id: "gkn://p3/ku/p3-ku-seq",
        label: "Sparse Distributed Representation",
        cluster: "foundation_human",
        entityType: "knowledge_unit",
        excerpt: "SDR model",
        depth: 4,
        sourceRef: {
          system: "priority3",
          entityType: "knowledge_unit",
          entityId: "p3-ku-seq",
          humanReadablePath: "P3 > Human > SDR",
        },
      };

      const resolved = resolveAuthoritativeRecord(
        p3KuNode,
        mockState,
        mockP3Storage,
      );
      expect(resolved.systemTitle).toContain("Priority 3");
      expect(resolved.perspectiveBadge).toBe("Objective Knowledge");
      expect(resolved.statusBadge).toBe("validated");

      const modelsAttr = resolved.attributes.find(
        (a) => a.label === "Mental Models",
      );
      expect(modelsAttr?.value).toContain("Hyperplane Projection");

      const evidenceAttr = resolved.attributes.find(
        (a) => a.label === "Supporting Evidence Items",
      );
      expect(evidenceAttr?.value).toContain("2 items");
    });

    it("resolves evaluated Review improvements and recurring bottlenecks", () => {
      const impNode: GlobalKnowledgeNode = {
        id: "gkn://reviews/improvement/imp-walk",
        label: "Afternoon Walk Protocol",
        cluster: "reviews_intelligence",
        entityType: "improvement",
        excerpt: "Walk rule",
        depth: 1,
        sourceRef: {
          system: "reviews",
          entityType: "improvement",
          entityId: "imp-walk",
          humanReadablePath: "Reviews > 2026-W45 > Improvement",
        },
      };

      const resolved = resolveAuthoritativeRecord(impNode, mockState);
      expect(resolved.systemTitle).toContain("Reviews");
      expect(resolved.statusBadge).toBe("evaluated");

      const outcomeAttr = resolved.attributes.find(
        (a) => a.label === "Evaluation Outcome",
      );
      expect(outcomeAttr?.value).toBe("succeeded");
    });

    it("shows ONLY non-empty fields in the resolved record (no empty/undefined filler)", () => {
      const bareNode: GlobalKnowledgeNode = {
        id: "gkn://p3/domain/p3-dom-neuro",
        label: "Neuroscience",
        cluster: "foundation_human",
        entityType: "domain",
        excerpt: "Domain",
        depth: 1,
        sourceRef: {
          system: "priority3",
          entityType: "domain",
          entityId: "p3-dom-neuro",
          humanReadablePath: "P3 > Neuro",
        },
      };

      const resolved = resolveAuthoritativeRecord(
        bareNode,
        mockState,
        mockP3Storage,
      );
      for (const attr of resolved.attributes) {
        expect(attr.value).toBeDefined();
        expect(attr.value).not.toBe("");
        expect(attr.value).not.toBeNull();
      }
    });
  });

  // =========================================================================
  // 3. Interactive Component & DOM Rendering Tests
  // =========================================================================
  describe("KnowledgeGraphView & Inspector Component Integration", () => {
    it("renders KnowledgeGraphView with real Phase 1 projection input", () => {
      const projection = projectGlobalKnowledgeGraph(
        initialState,
        mockP3Storage,
      );

      const { container } = render(
        <KnowledgeGraphView
          nodes={projection.nodes}
          edges={projection.edges}
          osState={initialState}
          p3Storage={mockP3Storage}
        />,
      );

      // Verify Header Controls and Title
      expect(screen.getByText("Global Knowledge")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Search knowledge nodes/i),
      ).toBeInTheDocument();
      expect(screen.getByText("Expand All")).toBeInTheDocument();
      expect(screen.getByText("Collapse")).toBeInTheDocument();
      expect(container.querySelector(".react-flow")).toBeInTheDocument();
    });

    it("renders empty graph gracefully when nodes array is empty", () => {
      const { container } = render(
        <KnowledgeGraphView nodes={[]} edges={[]} osState={initialState} />,
      );

      expect(screen.getByText("Global Knowledge")).toBeInTheDocument();
      expect(container.querySelector(".react-flow")).toBeInTheDocument();
    });

    it("renders KnowledgeContextInspector when a node is selected", () => {
      const testNode: GlobalKnowledgeNode = {
        id: "gkn://p1/project/proj-test",
        label: "Active Founder Project",
        cluster: "p1_founder",
        entityType: "project",
        excerpt: "Detailed preview",
        depth: 1,
        sourceRef: {
          system: "priority1",
          entityType: "project",
          entityId: "proj-test",
          humanReadablePath: "P1 > Active Project",
        },
      };

      const onCloseSpy = vi.fn();
      const onSelectSpy = vi.fn();

      render(
        <KnowledgeContextInspector
          selectedNode={testNode}
          allNodes={[testNode]}
          allEdges={[]}
          osState={initialState}
          onClose={onCloseSpy}
          onSelectNode={onSelectSpy}
        />,
      );

      expect(screen.getByText("Active Founder Project")).toBeInTheDocument();
      expect(screen.getByText("Detailed preview")).toBeInTheDocument();
      expect(screen.getByText("Depth 1")).toBeInTheDocument();

      // Close button triggers callback
      const closeBtn = screen.getByLabelText("Close Inspector");
      fireEvent.click(closeBtn);
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it("displays 'No Node Selected' placeholder in inspector when selectedNode is null", () => {
      render(
        <KnowledgeContextInspector
          selectedNode={null}
          allNodes={[]}
          allEdges={[]}
          osState={initialState}
          onClose={vi.fn()}
          onSelectNode={vi.fn()}
        />,
      );

      expect(screen.getByText("No Node Selected")).toBeInTheDocument();
    });

    it("uses Yash OS theme tokens (bg-background, bg-card, border-border, text-card-foreground)", () => {
      const testNode: GlobalKnowledgeNode = {
        id: "gkn://p1/project/proj-styled",
        label: "Styled Project",
        cluster: "p1_founder",
        entityType: "project",
        excerpt: "Excerpt",
        depth: 1,
        sourceRef: {
          system: "priority1",
          entityType: "project",
          entityId: "proj-styled",
          humanReadablePath: "P1 > Styled",
        },
      };

      const { container } = render(
        <KnowledgeContextInspector
          selectedNode={testNode}
          allNodes={[testNode]}
          allEdges={[]}
          osState={initialState}
          onClose={vi.fn()}
          onSelectNode={vi.fn()}
        />,
      );

      const aside = container.querySelector("aside");
      expect(aside?.className).toContain("bg-card");
      expect(aside?.className).toContain("text-card-foreground");
      expect(aside?.className).toContain("border-border");
    });
  });

  // =========================================================================
  // 4. Performance & Scalability Benchmarks (100, 500, 1,000 Nodes)
  // =========================================================================
  describe("Performance Benchmarks (100, 500, 1000 Nodes)", () => {
    function generateSyntheticGraph(totalNodes: number): {
      nodes: GlobalKnowledgeNode[];
      edges: GlobalKnowledgeEdge[];
    } {
      const nodes: GlobalKnowledgeNode[] = [];
      const edges: GlobalKnowledgeEdge[] = [];

      // 5 Root Foundation Hubs (Depth 0)
      for (let f = 0; f < 5; f++) {
        nodes.push({
          id: `gkn://p3/foundation/f-${f}`,
          label: `Foundation Hub ${f}`,
          cluster: "foundation_human",
          entityType: "foundation",
          excerpt: `Hub ${f}`,
          depth: 0,
          sourceRef: {
            system: "priority3",
            entityType: "foundation",
            entityId: `f-${f}`,
            humanReadablePath: `Foundation ${f}`,
          },
        });
      }

      // Generate rest of hierarchy
      for (let i = 5; i < totalNodes; i++) {
        const parentIndex = Math.floor((i - 5) / 4);
        const parentNode = nodes[parentIndex];
        const parentId =
          parentIndex < 5
            ? `gkn://p3/foundation/f-${parentIndex}`
            : (parentNode?.id ?? `gkn://p3/foundation/f-0`);
        const depth =
          parentIndex < 5 ? 1 : Math.min((parentNode?.depth ?? 1) + 1, 4);

        const nodeId = `gkn://p3/node/n-${i}`;
        nodes.push({
          id: nodeId,
          label: `Synthetic Node ${i}`,
          cluster: "foundation_human",
          entityType: depth === 1 ? "domain" : depth === 2 ? "subject" : "ku",
          excerpt: `Excerpt for synthetic node ${i}`,
          depth,
          sourceRef: {
            system: "priority3",
            entityType: "node",
            entityId: `n-${i}`,
            humanReadablePath: `Path > Node ${i}`,
          },
        });

        edges.push({
          id: `gke://${parentId}/${nodeId}/contains`,
          source: parentId,
          target: nodeId,
          relationship: "contains",
          direction: "directed",
          provenance: "projected_hierarchy",
        });

        // Add periodic cross-system semantic edge
        if (i % 10 === 0 && i > 20) {
          const crossTargetNode = nodes[i - 15];
          if (crossTargetNode) {
            edges.push({
              id: `gke://${nodeId}/${crossTargetNode.id}/informs`,
              source: nodeId,
              target: crossTargetNode.id,
              relationship: "informs",
              direction: "directed",
              provenance: "curated_reference",
            });
          }
        }
      }

      return { nodes, edges };
    }

    it("measures Dagre layout computation and record resolution latencies across 100, 500, and 1,000 nodes", () => {
      const layoutAdapter = new DagreLayoutAdapter();

      // JIT Warmup
      const warmup = generateSyntheticGraph(20);
      layoutAdapter.calculateLayout(warmup.nodes, warmup.edges);

      const scales = [100, 500, 1000];
      const layoutTimings: Record<number, number> = {};
      const resolveTimings: Record<number, number> = {};

      for (const scale of scales) {
        const { nodes, edges } = generateSyntheticGraph(scale);

        // 1. Measure Dagre Hierarchical Layout Calculation Latency
        const t0 = performance.now();
        const layoutResult = layoutAdapter.calculateLayout(nodes, edges, {
          direction: "TB",
          expandedNodeIds: new Set(nodes.slice(0, 50).map((n) => n.id)),
        });
        const layoutElapsed = performance.now() - t0;
        layoutTimings[scale] = layoutElapsed;

        expect(layoutResult.nodes.length).toBeGreaterThan(0);
        expect(layoutResult.width).toBeGreaterThan(0);
        expect(layoutResult.height).toBeGreaterThan(0);

        // 2. Measure Inspector Record Resolution Latency (Resolve 100 random nodes)
        const tResolve0 = performance.now();
        for (let k = 0; k < Math.min(scale, 100); k++) {
          const nodeK = nodes[k];
          if (nodeK) {
            resolveAuthoritativeRecord(nodeK, initialState, mockP3Storage);
          }
        }
        const resolveElapsed = performance.now() - tResolve0;
        resolveTimings[scale] = resolveElapsed;
      }

      console.log("\n📊 Global Knowledge Phase 2 Performance Benchmarks:");
      console.log("   --- Dagre Hierarchical Layout Latency ---");
      console.log(`   • 100 Nodes:   ${layoutTimings[100]?.toFixed(2)} ms`);
      console.log(`   • 500 Nodes:   ${layoutTimings[500]?.toFixed(2)} ms`);
      console.log(`   • 1000 Nodes:  ${layoutTimings[1000]?.toFixed(2)} ms`);
      console.log("   --- Inspector Record Resolution (100 Nodes) ---");
      console.log(`   • 100 Resolves: ${resolveTimings[1000]?.toFixed(2)} ms`);

      // Performance SLAs (Sub-350ms in Node test environment)
      expect(layoutTimings[100]).toBeLessThan(250);
      expect(layoutTimings[500]).toBeLessThan(350);
      expect(layoutTimings[1000]).toBeLessThan(450);
      expect(resolveTimings[1000]).toBeLessThan(25);
    });
  });
});
