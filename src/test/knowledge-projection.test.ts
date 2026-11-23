import { describe, expect, it } from "vitest";
import { initialState } from "@/lib/os/seed";
import type { OSState } from "@/lib/os/types/core";
import type {
  KnowledgeConfidence,
  KnowledgeItem,
  KnowledgeSourceSystem,
} from "@/lib/os/types/knowledge";
import { validateKnowledgeItemExtensions } from "@/lib/os/types/knowledge";
import type { Project } from "@/lib/os/types/projects";
import type {
  ReviewBottleneck,
  ReviewImprovement,
} from "@/lib/os/types/reviews";
import type { TradingOperation } from "@/lib/os/types/trading";
import {
  projectKnowledgeRecords,
  projectP1Records,
  projectP2Records,
  projectP3Records,
  projectReviewRecords,
} from "@/knowledge/infrastructure/adapters";
import { projectGlobalKnowledgeGraph } from "@/knowledge/application/services/GraphProjectionService";
import {
  validateGlobalKnowledgeEdge,
  validateGlobalKnowledgeNode,
} from "@/knowledge/domain/validation";
import type { P3StorageSchema } from "@/priority3/infrastructure/persistence/types";

describe("Global Knowledge Phase 1: Domain Foundation & Projection Layer", () => {
  // =========================================================================
  // 1. KnowledgeItem Extensions & Runtime Validation
  // =========================================================================
  describe("KnowledgeItem Extensions & Validation", () => {
    it("validates backward compatibility with legacy KnowledgeItem records", () => {
      const legacyItem: KnowledgeItem = {
        id: "k-101",
        title: "Test Legacy Principle",
        type: "Note",
        knowledgeFormat: "principle",
        body: "Core content without extensions",
        tags: "legacy, test",
        createdAt: "2026-11-20",
        schemaVersion: 1,
      };

      const result = validateKnowledgeItemExtensions(legacyItem);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("accepts valid Phase 1 extensions (sourceReferences, confidence, promotedFromReviewId)", () => {
      const extendedItem: KnowledgeItem = {
        id: "k-102",
        title: "Test Extended Principle",
        type: "Lesson",
        knowledgeFormat: "principle",
        confidence: "supported",
        promotedFromReviewId: "imp-001",
        sourceReferences: [
          {
            system: "reviews",
            entityType: "improvement",
            entityId: "imp-001",
            secondaryId: "2026-W44",
            humanReadablePath: "Reviews > 2026-W44 > Improvement",
          },
        ],
        body: "Synthesized review lesson",
        tags: "extended, lesson",
        createdAt: "2026-11-22",
        updatedAt: "2026-11-22T17:00:00.000Z",
        schemaVersion: 2,
      };

      const result = validateKnowledgeItemExtensions(extendedItem);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects invalid confidence levels", () => {
      const invalidItem = {
        id: "k-103",
        confidence: "scientifically_proven" as unknown as KnowledgeConfidence,
      };

      const result = validateKnowledgeItemExtensions(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Invalid confidence level");
    });

    it("rejects malformed sourceReferences", () => {
      const invalidItem = {
        id: "k-104",
        sourceReferences: [
          {
            system: "unsupported_system" as unknown as KnowledgeSourceSystem,
            entityType: "foo",
            entityId: "",
            humanReadablePath: "",
          },
        ],
      };

      const result = validateKnowledgeItemExtensions(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 2. P1 Source Adapter Tests
  // =========================================================================
  describe("P1 Source Adapter", () => {
    const mockP1Projects: Project[] = [
      {
        id: "proj-founder-mvp",
        name: "Founder System MVP",
        objective: "Deploy initial production slice of Yash OS.",
        priorityId: 1,
        status: "active",
        hypothesis: "Building personal OS compounds founder velocity.",
        milestone: "M1",
        metrics: "100% test coverage",
        bottlenecks: "None",
        evidence: "Weekly closeout logs",
        decisions: "Clean architecture",
        learning: "Local-first is fast",
        documents: "Architecture Doc",
        createdAt: "2026-11-01",
        docs: [
          {
            id: "doc-mvp-spec",
            title: "MVP Specification",
            content: "Detailed markdown specification for MVP slice...",
            createdAt: "2026-11-01",
            updatedAt: "2026-11-05",
          },
        ],
        milestones: [
          {
            id: "ms-core-runtime",
            projectId: "proj-founder-mvp",
            title: "Core Runtime",
            objective: "Complete state hydration and store initialization.",
            metrics: [],
            deadline: "2026-11-30",
            status: "active",
            order: 1,
            isPrimaryActive: true,
            createdAt: "2026-11-01",
          },
        ],
        goals: [
          {
            id: "goal-first-version",
            projectId: "proj-founder-mvp",
            text: "Achieve functional system parity.",
            metrics: [],
            status: "active",
            createdAt: "2026-11-01",
          },
        ],
      },
      {
        id: "proj-p2-trading",
        name: "Trading Strategy Execution",
        objective: "Ignored by P1 adapter because priorityId is 2.",
        priorityId: 2,
        status: "active",
        hypothesis: "Edge validation",
        milestone: "M1",
        metrics: "Win rate",
        bottlenecks: "",
        evidence: "",
        decisions: "",
        learning: "",
        documents: "",
        createdAt: "2026-11-01",
      },
    ];

    it("projects only Priority 1 projects and generates hierarchical 'contains' edges", () => {
      const output = projectP1Records(mockP1Projects);

      // Only P1 project is projected, P2 is ignored
      expect(
        output.nodes.some((n) => n.id === "gkn://p1/project/proj-founder-mvp"),
      ).toBe(true);
      expect(
        output.nodes.some((n) => n.id === "gkn://p1/project/proj-p2-trading"),
      ).toBe(false);

      // Sub-entities are projected with stable URIs
      expect(
        output.nodes.some((n) => n.id === "gkn://p1/project_doc/doc-mvp-spec"),
      ).toBe(true);
      expect(
        output.nodes.some((n) => n.id === "gkn://p1/milestone/ms-core-runtime"),
      ).toBe(true);
      expect(
        output.nodes.some(
          (n) => n.id === "gkn://p1/project_goal/goal-first-version",
        ),
      ).toBe(true);

      // Hierarchy edges are created
      expect(
        output.edges.some(
          (e) =>
            e.source === "gkn://p1/project/proj-founder-mvp" &&
            e.target === "gkn://p1/project_doc/doc-mvp-spec" &&
            e.relationship === "contains",
        ),
      ).toBe(true);
    });

    it("does not clone full markdown document bodies into node excerpts", () => {
      const output = projectP1Records(mockP1Projects);
      const docNode = output.nodes.find(
        (n) => n.id === "gkn://p1/project_doc/doc-mvp-spec",
      );

      expect(docNode).toBeDefined();
      expect(docNode!.excerpt.length).toBeLessThanOrEqual(200);
      expect("content" in (docNode ?? {})).toBe(false);
    });
  });

  // =========================================================================
  // 3. P2 Source Adapter & Strict Financial Redaction Tests
  // =========================================================================
  describe("P2 Source Adapter & Financial Redaction Boundaries", () => {
    const mockTradingOp: TradingOperation = {
      id: "trade-op-lbes",
      name: "London Breakout Execution System",
      status: "active",
      currentStage: "live_funded",
      operatingProfile: {
        id: "profile-1",
        title: "Operating Profile",
        marketFocus: ["NQ Futures", "ES"],
        coreEdgeDescription:
          "London session opening range breakout with volume confirmation.",
        riskRules: {
          maxDailyDrawdownCurrency: 1000,
          maxTrailingDrawdownPercent: 3,
          maxRiskPerTradePercent: 1,
          hardStopRequired: true,
          leverageOrContractLimit: "2 Contracts Max",
          circuitBreakerAction: "stop_for_day",
        },
        routines: {
          preMarketPrepChecklist: [
            "Review overnight economic calendar",
            "Mark key levels",
          ],
          postMarketReviewChecklist: ["Log execution discipline score"],
        },
        flexibleContent: "Playbook rules...",
        version: 1,
        updatedAt: "2026-11-20",
      },
      financialPlan: {
        id: "fin-plan-1",
        title: "Financial Plan",
        targetMonthlyCashflow: 10000,
        currentMonthlyCashflow: 4500,
        monthlyLivingExpenses: 2500,
        startupRunwayMonthsTarget: 18,
        estimatedCurrentRunwayMonths: 9,
        transitionMilestones: [],
        flexibleContent: "",
        version: 1,
        updatedAt: "2026-11-20",
      },
      strategies: [
        {
          id: "strat-london-orb",
          name: "London ORB Strategy",
          assetClass: "futures",
          timeframe: "5m",
          rulesMarkdown: "Enter on candle close breaking 15m range high...",
          status: "active",
          stage: "live_funded",
        },
      ],
      systems: [
        {
          id: "sys-tradingview-alerts",
          name: "TradingView Webhook Engine",
          strategyId: "strat-london-orb",
          automationLevel: "semi_automated",
          platformOrTech: "PineScript v5",
          status: "live",
        },
      ],
      accounts: [
        {
          id: "acct-prop-apex",
          institutionOrFirm: "Apex Trader Funding",
          accountType: "prop_firm_funded",
          identifierMasked: "****-8831",
          accountSize: 150000,
          currency: "USD",
          isFunded: true,
          status: "active",
          currentBalance: 154250,
          dailyLossLimit: 2500,
        },
      ],
      experiments: [],
      executionRecords: [
        {
          id: "exec-101",
          date: "2026-11-21",
          sessionType: "London",
          tradesCount: 2,
          disciplineScore: 5,
          ruleAdherence: true,
          netPnL: 850, // Highly sensitive
          isVerified: true,
          isConfidential: true,
          notes: "Executed cleanly according to plan.",
        },
      ],
      performanceHistory: [
        {
          id: "perf-2026-w46",
          periodRef: "2026-W46",
          grossPnL: 3200, // Highly sensitive
          feesAndCommissions: 120, // Highly sensitive
          totalNetCashExtracted: 2500,
          injectedToStartupFund: 1500,
          runwayMonthsCalculated: 9.5,
          isVerified: true,
          confidential: true,
        },
      ],
      createdAt: "2026-11-01",
      updatedAt: "2026-11-20",
    };

    it("projects structural strategies, systems, and risk frameworks", () => {
      const output = projectP2Records(mockTradingOp, []);

      expect(
        output.nodes.some((n) => n.id === "gkn://p2/strategy/strat-london-orb"),
      ).toBe(true);
      expect(
        output.nodes.some(
          (n) => n.id === "gkn://p2/system/sys-tradingview-alerts",
        ),
      ).toBe(true);
      expect(
        output.nodes.some(
          (n) => n.id === "gkn://p2/risk_framework/trade-op-lbes-risk",
        ),
      ).toBe(true);

      // System points to its implemented strategy
      expect(
        output.edges.some(
          (e) =>
            e.source === "gkn://p2/system/sys-tradingview-alerts" &&
            e.target === "gkn://p2/strategy/strat-london-orb" &&
            e.relationship === "applies_to",
        ),
      ).toBe(true);
    });

    it("STRICT FINANCIAL REDACTION: zero sensitive financial numbers or credentials leak into graph nodes", () => {
      const output = projectP2Records(mockTradingOp, []);
      const serializedOutput = JSON.stringify(output);

      // Sensitive financial values must NEVER appear
      expect(serializedOutput).not.toContain("154250"); // currentBalance
      expect(serializedOutput).not.toContain("150000"); // accountSize
      expect(serializedOutput).not.toContain("****-8831"); // identifierMasked
      expect(serializedOutput).not.toContain("850"); // netPnL
      expect(serializedOutput).not.toContain("3200"); // grossPnL
      expect(serializedOutput).not.toContain("netPnL");
      expect(serializedOutput).not.toContain("grossPnL");
      expect(serializedOutput).not.toContain("currentBalance");
    });
  });

  // =========================================================================
  // 4. P3 Source Adapter & Epistemological Perspective Tests
  // =========================================================================
  describe("P3 Source Adapter & Epistemic Perspective Preservation", () => {
    const mockP3Storage: P3StorageSchema = {
      schemaVersion: 1,
      updatedAt: "2026-11-22T17:00:00.000Z",
      foundations: [
        {
          id: "human_understanding",
          name: "Human Understanding",
          description: "Biological, cognitive, and behavioral dynamics.",
          examples: ["Biology", "Neuroscience", "Psychology"],
          createdAt: "2026-11-01",
          updatedAt: "2026-11-01",
        },
      ],
      domains: [
        {
          id: "p3-dom-neuro",
          name: "Neuroscience",
          description: "Brain architecture and information processing.",
          foundationId: "human_understanding",
          isArchived: false,
          createdAt: "2026-11-01",
          updatedAt: "2026-11-01",
        },
      ],
      subjects: [
        {
          id: "p3-sub-cortex",
          name: "Neocortical Computation",
          description: "Hierarchical temporal memory and sensory processing.",
          domainId: "p3-dom-neuro",
          isArchived: false,
          createdAt: "2026-11-01",
          updatedAt: "2026-11-01",
        },
      ],
      topics: [
        {
          id: "p3-top-columns",
          name: "Cortical Columns",
          description: "Canonical microcircuits across cortical layers.",
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
          id: "p3-ku-htm",
          title: "Hierarchical Temporal Memory",
          summary:
            "Cortical algorithm modeling predictive learning in neocortical layers.",
          perspective: "objective_knowledge", // Approved Perspective 1
          status: "validated", // Knowledge development stage
          classification: "general",
          foundationId: "human_understanding",
          domainId: "p3-dom-neuro",
          subjectId: "p3-sub-cortex",
          topicId: "p3-top-columns",
          identity: {
            id: "ident-htm",
            topicId: "p3-top-columns",
            title: "Hierarchical Temporal Memory",
            perspective: "objective_knowledge",
            classification: "general",
            tags: ["neuroscience", "computation", "neocortex"],
          },
          coreUnderstanding: {
            plainEnglishExplanation:
              "The neocortex learns sequences of patterns through sparse distributed representations.",
            corePrinciples: [
              "Sparse Distributed Representation",
              "Predictive Cell States",
            ],
            mentalModels: ["Columnar Voting"],
          },
          deeperUnderstanding: {
            nuancedMechanisms:
              "Dendritic segment depolarization primes somatic action potentials.",
            boundaryConditions: "Requires continuous temporal input sequences.",
            counterExamples: [],
          },
          sourcesAndEvidence: {
            sourceIds: ["p3-src-hawkins-2016"],
            evidenceIds: ["p3-evi-bcm-paper"],
            competingTheories: ["Backpropagation in Deep Learning"],
          },
          relationshipsAndApplications: {
            relationshipIds: ["p3-rel-htm-backprop"],
            applicationRecordIds: ["p3-app-anomaly-detector"],
          },
          developmentHistory: {
            revisions: [],
          },
          isArchived: false,
          createdAt: "2026-11-10",
          updatedAt: "2026-11-20",
        },
        {
          id: "p3-ku-intuition",
          title: "Tacit Execution Intuition",
          summary:
            "Founder heuristic for evaluating high-uncertainty commitments.",
          perspective: "personal_understanding", // Approved Perspective 2
          status: "tested",
          classification: "general",
          foundationId: "human_understanding",
          topicId: "p3-top-columns",
          identity: {
            id: "ident-intuition",
            topicId: "p3-top-columns",
            title: "Tacit Execution Intuition",
            perspective: "personal_understanding",
            classification: "general",
            tags: ["intuition", "decision_making"],
          },
          coreUnderstanding: {
            plainEnglishExplanation:
              "Pattern recognition developed through deliberate trial feedback.",
            corePrinciples: ["Skin in the game"],
            mentalModels: ["Feedback calibration"],
          },
          deeperUnderstanding: {
            nuancedMechanisms: "",
            boundaryConditions: "",
            counterExamples: [],
          },
          sourcesAndEvidence: {
            sourceIds: [],
            evidenceIds: [],
            competingTheories: [],
          },
          relationshipsAndApplications: {
            relationshipIds: [],
            applicationRecordIds: [],
          },
          developmentHistory: {
            revisions: [],
          },
          isArchived: false,
          createdAt: "2026-11-12",
          updatedAt: "2026-11-20",
        },
        {
          id: "p3-ku-legacy",
          title: "Legacy Unmigrated Unit",
          summary: "Imported from legacy note without perspective classified.",
          perspective: "unclassified", // Migration sentinel fallback
          status: "captured",
          classification: "general",
          foundationId: "human_understanding",
          topicId: "p3-top-columns",
          identity: {
            id: "ident-legacy",
            topicId: "p3-top-columns",
            title: "Legacy Unmigrated Unit",
            perspective: "unclassified",
            classification: "general",
            tags: ["legacy"],
          },
          coreUnderstanding: {
            plainEnglishExplanation: "Legacy content.",
            corePrinciples: [],
            mentalModels: [],
          },
          deeperUnderstanding: {
            nuancedMechanisms: "",
            boundaryConditions: "",
            counterExamples: [],
          },
          sourcesAndEvidence: {
            sourceIds: [],
            evidenceIds: [],
            competingTheories: [],
          },
          relationshipsAndApplications: {
            relationshipIds: [],
            applicationRecordIds: [],
          },
          developmentHistory: {
            revisions: [],
          },
          isArchived: false,
          createdAt: "2026-11-15",
          updatedAt: "2026-11-15",
        },
      ],
      sources: [],
      evidence: [],
      relationships: [
        {
          id: "p3-rel-htm-backprop",
          sourceKnowledgeUnitId: "p3-ku-htm",
          targetKnowledgeUnitId: "p3-ku-intuition",
          type: "contrasts_with", // Native P3 relationship type
          explanation:
            "HTM relies on local Hebbian plasticity while backprop uses global loss derivatives.",
          createdAt: "2026-11-15",
        },
      ],
      applications: [],
      reviews: [],
      inbox: [],
      context: {
        id: "ctx-default",
        currentFocus: "Neocortical sequence learning",
        lastStoppingPoint: "HTM layers",
        remainingGaps: "None",
        nextLogicalStep: "Columnar voting",
        lastActivityAt: "2026-11-20T10:00:00.000Z",
        updatedAt: "2026-11-20T10:00:00.000Z",
      },
      backupSnapshots: [],
    };

    it("projects foundations, domains, subjects, topics, and KUs with correct depth", () => {
      const output = projectP3Records(mockP3Storage);

      const foundNode = output.nodes.find(
        (n) => n.id === "gkn://p3/foundation/human_understanding",
      );
      const domNode = output.nodes.find(
        (n) => n.id === "gkn://p3/domain/p3-dom-neuro",
      );
      const subNode = output.nodes.find(
        (n) => n.id === "gkn://p3/subject/p3-sub-cortex",
      );
      const topNode = output.nodes.find(
        (n) => n.id === "gkn://p3/topic/p3-top-columns",
      );
      const kuNode = output.nodes.find((n) => n.id === "gkn://p3/ku/p3-ku-htm");

      expect(foundNode?.depth).toBe(0);
      expect(domNode?.depth).toBe(1);
      expect(subNode?.depth).toBe(2);
      expect(topNode?.depth).toBe(3);
      expect(kuNode?.depth).toBe(4);
    });

    it("maps approved perspectives and handles 'unclassified' sentinel as a diagnostic fallback", () => {
      const output = projectP3Records(mockP3Storage);

      const htmNode = output.nodes.find(
        (n) => n.id === "gkn://p3/ku/p3-ku-htm",
      );
      const intuitionNode = output.nodes.find(
        (n) => n.id === "gkn://p3/ku/p3-ku-intuition",
      );
      const legacyNode = output.nodes.find(
        (n) => n.id === "gkn://p3/ku/p3-ku-legacy",
      );

      expect(htmNode?.formatBadge).toBe("Objective Knowledge");
      expect(intuitionNode?.formatBadge).toBe("Personal Understanding");

      // Sentinel fallback: does not treat unclassified as a valid 4th philosophy
      expect(legacyNode?.formatBadge).toBe("Pending Classification");
      expect(legacyNode?.metadata?.["isPendingClassification"]).toBe(true);
    });

    it("preserves native P3 relationships with provenance 'native_p3'", () => {
      const output = projectP3Records(mockP3Storage);

      const relEdge = output.edges.find(
        (e) => e.relationship === "contrasts_with",
      );
      expect(relEdge).toBeDefined();
      expect(relEdge?.source).toBe("gkn://p3/ku/p3-ku-htm");
      expect(relEdge?.target).toBe("gkn://p3/ku/p3-ku-intuition");
      expect(relEdge?.provenance).toBe("native_p3");
      expect(relEdge?.direction).toBe("bidirectional");
    });
  });

  // =========================================================================
  // 5. Review Source Adapter & Promotion Backlinks Tests
  // =========================================================================
  describe("Review Source Adapter & Promotion Backlinks", () => {
    const mockImprovements: ReviewImprovement[] = [
      {
        id: "imp-2026-01",
        periodType: "weekly",
        periodRef: "2026-W44",
        problemStatement: "Afternoon energy crash reduces deep work focus.",
        evidence: {
          metrics: ["Focus score: 2/5", "Delayed task completion: 3 tasks"],
          dayDates: ["2026-11-03", "2026-11-04"],
        },
        recommendation:
          "Take mandatory 20-minute walk after lunch before resuming execution.",
        status: "evaluated",
        approvedAction: "Mandatory 20-minute post-lunch walk.",
        expectedResult: "Focus score recovers to 4/5.",
        evaluatedAt: "2026-11-08",
        evaluationOutcome: "succeeded",
        evaluationNotes: "Validated: afternoon deep work velocity sustained.",
        promotedToKnowledgeId: "k-imp-walk-rule", // Promoted backlink
        createdAt: "2026-11-04",
      },
      {
        id: "imp-2026-02",
        periodType: "weekly",
        periodRef: "2026-W45",
        problemStatement:
          "Over-checking market news during execution time block.",
        evidence: {
          metrics: ["Distractions: 4"],
          dayDates: ["2026-11-10"],
        },
        recommendation: "Close browser tabs during 90-minute sprint.",
        status: "implemented",
        createdAt: "2026-11-11",
      },
    ];

    const mockBottlenecks: ReviewBottleneck[] = [
      {
        id: "btn-distraction-01",
        priorityId: 1,
        projectId: "proj-founder-mvp",
        title: "Tab Switching Friction",
        description:
          "Frequent context switching between code and documentation.",
        severity: "medium",
        status: "active",
        firstObservedDate: "2026-11-01",
        lastObservedDate: "2026-11-15",
        occurrenceCount: 5,
        sourceDayDates: ["2026-11-01", "2026-11-05", "2026-11-10"],
      },
    ];

    it("projects evaluated improvements and creates promotion backlink edge when promotedToKnowledgeId exists", () => {
      const output = projectReviewRecords(mockImprovements, mockBottlenecks);

      const impNode = output.nodes.find(
        (n) => n.id === "gkn://reviews/improvement/imp-2026-01",
      );
      expect(impNode).toBeDefined();
      expect(impNode?.cluster).toBe("reviews_intelligence");

      // Verify promotion backlink edge pointing to KnowledgeItem
      const promoEdge = output.edges.find(
        (e) => e.relationship === "derived_from",
      );
      expect(promoEdge).toBeDefined();
      expect(promoEdge?.source).toBe("gkn://knowledge/item/k-imp-walk-rule");
      expect(promoEdge?.target).toBe("gkn://reviews/improvement/imp-2026-01");
      expect(promoEdge?.provenance).toBe("native_review");
    });

    it("connects bottlenecks to linked projects via 'challenges' relationship", () => {
      const output = projectReviewRecords(mockImprovements, mockBottlenecks);

      const btnEdge = output.edges.find(
        (e) =>
          e.source === "gkn://reviews/bottleneck/btn-distraction-01" &&
          e.target === "gkn://p1/project/proj-founder-mvp",
      );

      expect(btnEdge).toBeDefined();
      expect(btnEdge?.relationship).toBe("challenges");
    });
  });

  // =========================================================================
  // 6. Knowledge Memory Adapter Tests
  // =========================================================================
  describe("Knowledge Memory Adapter", () => {
    const mockKnowledgeItems: KnowledgeItem[] = [
      {
        id: "k-imp-walk-rule",
        title: "Principle: Post-Lunch Reset Protocol",
        type: "Lesson",
        knowledgeFormat: "principle",
        confidence: "established",
        promotedFromReviewId: "imp-2026-01",
        formatData: {
          principle: {
            corePrinciple:
              "A mandatory 20-minute walk after lunch preserves deep work velocity.",
            whyItMatters: "Prevents circadian post-prandial cognitive dip.",
          },
        },
        body: "Detailed walk rule...",
        tags: "energy, focus, protocol",
        createdAt: "2026-11-08",
        sourceReferences: [
          {
            system: "reviews",
            entityType: "improvement",
            entityId: "imp-2026-01",
            humanReadablePath: "Reviews > 2026-W44 > Improvement",
          },
        ],
      },
      {
        id: "k-framework-dd",
        title: "Framework: First-Principles Decomposition",
        type: "Documentation",
        knowledgeFormat: "framework",
        confidence: "supported",
        projectId: "proj-founder-mvp",
        formatData: {
          framework: {
            purpose: "Break complex problem into fundamental axioms.",
            components: [
              "Identify Assumptions",
              "Deconstruct into Physics",
              "Reconstruct Solution",
            ],
          },
        },
        body: "First principles thinking...",
        tags: "thinking, framework",
        createdAt: "2026-11-02",
      },
    ];

    it("projects curated knowledge items and generates cross-system edges from sourceReferences", () => {
      const output = projectKnowledgeRecords(mockKnowledgeItems);

      expect(
        output.nodes.some(
          (n) => n.id === "gkn://knowledge/item/k-imp-walk-rule",
        ),
      ).toBe(true);
      expect(
        output.nodes.some(
          (n) => n.id === "gkn://knowledge/item/k-framework-dd",
        ),
      ).toBe(true);

      // Verify edge generated from sourceReferences
      const refEdge = output.edges.find(
        (e) => e.source === "gkn://knowledge/item/k-imp-walk-rule",
      );
      expect(refEdge).toBeDefined();
      expect(refEdge?.target).toBe("gkn://reviews/improvement/imp-2026-01");
      expect(refEdge?.relationship).toBe("derived_from");

      // Verify edge generated from direct projectId linkage
      const projEdge = output.edges.find(
        (e) => e.source === "gkn://knowledge/item/k-framework-dd",
      );
      expect(projEdge).toBeDefined();
      expect(projEdge?.target).toBe("gkn://p1/project/proj-founder-mvp");
      expect(projEdge?.relationship).toBe("informs");
    });
  });

  // =========================================================================
  // 7. Graph Projection Service: Determinism, Immutability & Orphan Audit
  // =========================================================================
  describe("Graph Projection Service Invariants", () => {
    it("DETERMINISM: Calling projection twice on the same state produces 100% identical JSON and sort order", () => {
      const state = { ...initialState };
      const res1 = projectGlobalKnowledgeGraph(state, undefined, {
        nowIso: "2026-11-22T12:00:00.000Z",
      });
      const res2 = projectGlobalKnowledgeGraph(state, undefined, {
        nowIso: "2026-11-22T12:00:00.000Z",
      });

      expect(JSON.stringify(res1)).toBe(JSON.stringify(res2));
      expect(res1.nodes.length).toBe(res2.nodes.length);
      expect(res1.edges.length).toBe(res2.edges.length);
      expect(res1.manifest.totalNodes).toBe(res2.manifest.totalNodes);
    });

    it("SOURCE IMMUTABILITY: Projection does not mutate input state or P3 storage", () => {
      const state = JSON.parse(JSON.stringify(initialState));
      const stateCopy = JSON.parse(JSON.stringify(initialState));

      projectGlobalKnowledgeGraph(state);

      expect(state).toEqual(stateCopy);
    });

    it("ORPHAN DIAGNOSTICS: Accurately identifies unresolved endpoints without crashing or silently dropping", () => {
      const stateWithOrphanRef: OSState = {
        ...initialState,
        knowledge: [
          {
            id: "k-orphan-test",
            title: "Principle referencing missing records",
            type: "Note",
            knowledgeFormat: "principle",
            body: "Points to non-existent project and non-existent KU",
            tags: "orphan, test",
            createdAt: "2026-11-22",
            sourceReferences: [
              {
                system: "priority1",
                entityType: "project",
                entityId: "proj-ghost-id-404",
                humanReadablePath: "Missing Project",
              },
              {
                system: "priority3",
                entityType: "ku",
                entityId: "p3-ku-ghost-id-404",
                humanReadablePath: "Missing KU",
              },
            ],
          },
        ],
      };

      const result = projectGlobalKnowledgeGraph(stateWithOrphanRef);

      // Active edges array must NOT include broken edges
      expect(
        result.edges.some(
          (e) => e.target === "gkn://p1/project/proj-ghost-id-404",
        ),
      ).toBe(false);
      expect(
        result.edges.some((e) => e.target === "gkn://p3/ku/p3-ku-ghost-id-404"),
      ).toBe(false);

      // Orphans array MUST contain diagnostic reports
      expect(result.orphans.length).toBeGreaterThanOrEqual(2);
      const ghostProjOrphan = result.orphans.find(
        (o) => o.targetUri === "gkn://p1/project/proj-ghost-id-404",
      );
      expect(ghostProjOrphan).toBeDefined();
      expect(ghostProjOrphan?.missingEndpoint).toBe("target");
      expect(ghostProjOrphan?.reason).toContain("missing target");
    });

    it("URI VALIDATION: All generated node and edge URIs conform strictly to gkn:// and gke:// grammar", () => {
      const result = projectGlobalKnowledgeGraph(initialState);

      for (const node of result.nodes) {
        const val = validateGlobalKnowledgeNode(node);
        expect(
          val.valid,
          `Node URI validation failed for ${node.id}: ${val.errors.join(", ")}`,
        ).toBe(true);
      }

      for (const edge of result.edges) {
        const val = validateGlobalKnowledgeEdge(edge);
        expect(
          val.valid,
          `Edge URI validation failed for ${edge.id}: ${val.errors.join(", ")}`,
        ).toBe(true);
      }
    });
  });

  // =========================================================================
  // 8. Performance & Scalability Benchmark Suite
  // =========================================================================
  describe("Performance Benchmark (100, 500, 1000 Synthetic Nodes)", () => {
    function generateSyntheticState(entityCount: number): OSState {
      const projects: Project[] = [];
      const knowledge: KnowledgeItem[] = [];

      const projectsCount = Math.floor(entityCount * 0.3);
      const knowledgeCount = entityCount - projectsCount;

      for (let i = 0; i < projectsCount; i++) {
        projects.push({
          id: `proj-synth-${i}`,
          name: `Synthetic Project ${i}`,
          objective: `Benchmark project objective ${i}`,
          priorityId: 1,
          status: "active",
          hypothesis: "H",
          milestone: "M",
          metrics: "Metric",
          bottlenecks: "",
          evidence: "",
          decisions: "",
          learning: "",
          documents: "",
          createdAt: "2026-11-20",
          docs: [
            {
              id: `doc-synth-${i}-1`,
              title: `Spec ${i}`,
              content: `Markdown content for project ${i}`,
              createdAt: "2026-11-20",
              updatedAt: "2026-11-20",
            },
          ],
        });
      }

      for (let j = 0; j < knowledgeCount; j++) {
        const linkedProjIndex = j % projectsCount;
        knowledge.push({
          id: `k-synth-${j}`,
          title: `Curated Principle ${j}`,
          type: "Lesson",
          knowledgeFormat: "principle",
          confidence: "supported",
          body: `Curated operating lesson body ${j}`,
          tags: `benchmark, tag-${j % 5}`,
          createdAt: "2026-11-20",
          sourceReferences: [
            {
              system: "priority1",
              entityType: "project",
              entityId: `proj-synth-${linkedProjIndex}`,
              humanReadablePath: `Synthetic Project ${linkedProjIndex}`,
            },
          ],
        });
      }

      return {
        ...initialState,
        projects,
        knowledge,
      };
    }

    it("measures projection latency for 100, 500, and 1,000 synthetic nodes", () => {
      const benchmarkSizes = [100, 500, 1000];
      const timings: Record<number, number> = {};

      for (const size of benchmarkSizes) {
        const syntheticState = generateSyntheticState(size);

        const start = performance.now();
        const result = projectGlobalKnowledgeGraph(syntheticState);
        const elapsed = performance.now() - start;

        timings[size] = elapsed;

        expect(result.nodes.length).toBeGreaterThanOrEqual(size);
        expect(result.edges.length).toBeGreaterThan(0);
      }

      console.log("\n📊 Global Knowledge Projection Performance Benchmark:");
      console.log(`   • 100 Entities:  ${timings[100]?.toFixed(2)} ms`);
      console.log(`   • 500 Entities:  ${timings[500]?.toFixed(2)} ms`);
      console.log(`   • 1000 Entities: ${timings[1000]?.toFixed(2)} ms`);

      // Latency thresholds for synchronous in-memory projection
      expect(timings[100]).toBeLessThan(35);
      expect(timings[500]).toBeLessThan(75);
      expect(timings[1000]).toBeLessThan(150);
    });
  });
});
