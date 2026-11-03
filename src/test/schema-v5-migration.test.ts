import { describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  SCHEMA_V5_VERSION,
  migrateOSState,
  migrateOSStateV5,
  migrateLbesToTradingOperation,
} from "../lib/os/reviews/migrations";
import {
  validateTradingOperation,
  validateProject,
} from "../lib/os/validation/schemas";
import type { OSState, Project } from "../lib/os/types";

describe("Phase 3: Schema v5 Migration & Priority 2 Infrastructure Tests", () => {
  it("1. declares CURRENT_SCHEMA_VERSION as 5 and SCHEMA_V5_VERSION as 5", () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(5);
    expect(SCHEMA_V5_VERSION).toBe(5);
  });

  it("2. upgrades v4 state to v5, preserving existing projects and normalizing tradingOperation", () => {
    const v4State: Partial<OSState> = {
      schemaVersion: 4,
      userName: "Yash",
      theme: "dark",
      projects: [
        {
          id: "proj-killarity",
          name: "Killarity Engine",
          objective: "High-conviction founder capability system",
          priorityId: 1,
          status: "active",
          hypothesis: "Disciplined execution",
          milestone: "Ship v1",
          metrics: "5 users",
          bottlenecks: "",
          evidence: "",
          decisions: "",
          learning: "",
          documents: "",
          createdAt: "2026-10-01T00:00:00.000Z",
          goals: [
            {
              id: "goal-1",
              projectId: "proj-killarity",
              text: "Deliver validated value",
              metrics: [],
              status: "active",
              createdAt: "2026-10-01T00:00:00.000Z",
            },
          ],
          activeGoalId: "goal-1",
          milestones: [
            {
              id: "ms-1",
              projectId: "proj-killarity",
              title: "Ship v1",
              objective: "Deliver v1",
              metrics: [],
              deadline: "2026-11-30",
              status: "active",
              order: 1,
              isPrimaryActive: true,
              createdAt: "2026-10-01T00:00:00.000Z",
            },
          ],
          docs: [],
        },
        {
          id: "proj-fintech-1",
          name: "LBES Algorithmic SaaS",
          objective: "Build fintech software tool for breakout traders",
          priorityId: 2,
          workstream: "B",
          status: "active",
          hypothesis: "Traders want non-custodial automated execution",
          milestone: "Deploy non-custodial MVP",
          metrics: "10 pilot users",
          bottlenecks: "Regulatory clarity",
          evidence: "",
          decisions: "",
          learning: "",
          documents: "",
          createdAt: "2026-10-15T00:00:00.000Z",
          docs: [],
        },
      ],
      tradingOperation: {
        id: "trading-op-lbes",
        name: "LBES Cashflow Operation",
        status: "active",
        operatingProfile: {
          id: "profile-1",
          title: "Trading Operating Profile",
          marketFocus: ["Futures (NQ / ES)"],
          coreEdgeDescription: "London session breakout",
          riskRules: {
            maxDailyDrawdownCurrency: 500,
            maxTrailingDrawdownPercent: 5,
            maxRiskPerTradePercent: 1,
            hardStopRequired: true,
            leverageOrContractLimit: "2 contracts maximum",
          },
          routines: {
            preMarketPrepChecklist: ["Check calendar"],
            postMarketReviewChecklist: ["Log fills"],
          },
          flexibleContent: "",
          version: 1,
          updatedAt: "2026-10-01T00:00:00.000Z",
        },
        financialPlan: {
          id: "plan-1",
          title: "Financial & Transition Plan",
          targetMonthlyCashflow: 5000,
          currentMonthlyCashflow: 1200,
          startupRunwayMonthsTarget: 12,
          estimatedCurrentRunwayMonths: 6,
          transitionMilestones: [
            {
              id: "tm-1",
              phase: "Phase 1: Validate routine",
              targetCapital: 10000,
              monthlyYieldTarget: 1000,
              achieved: false,
            },
          ],
          flexibleContent: "",
          version: 1,
          updatedAt: "2026-10-01T00:00:00.000Z",
        },
        strategies: [],
        systems: [],
        accounts: [],
        experiments: [],
        executionRecords: [],
        performanceHistory: [],
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-01T00:00:00.000Z",
      },
    };

    const migrated = migrateOSStateV5(v4State);

    // Schema version must be 5
    expect(migrated.schemaVersion).toBe(5);

    // Trading operation normalized with v5 fields
    expect(migrated.tradingOperation).toBeDefined();
    expect(migrated.tradingOperation?.currentStage).toBe("paper_simulation");
    expect(
      migrated.tradingOperation?.operatingProfile.riskRules
        .circuitBreakerAction,
    ).toBe("stop_for_day");
    expect(
      migrated.tradingOperation?.operatingProfile.riskRules
        .maxConsecutiveLosses,
    ).toBe(2);
    expect(
      migrated.tradingOperation?.financialPlan.cashAllocationPolicy,
    ).toBeDefined();
    expect(
      migrated.tradingOperation?.financialPlan.cashAllocationPolicy
        ?.livingExpensesPercent,
    ).toBe(40);
    expect(migrated.tradingOperation?.riskIncidents).toEqual([]);

    // Priority 2 Workstream B project automatically receives Document 6 (Legal & Compliance)
    const fintechProj = migrated.projects.find(
      (p) => p.id === "proj-fintech-1",
    );
    expect(fintechProj).toBeDefined();
    expect(fintechProj?.workstream).toBe("B");

    const legalDoc = fintechProj?.docs?.find(
      (d) => "type" in d && d.type === "legal_compliance",
    );
    expect(legalDoc).toBeDefined();
    if (legalDoc && "complianceContent" in legalDoc) {
      expect(legalDoc.complianceContent).toBeDefined();
      expect(legalDoc.complianceContent?.productClassification?.category).toBe(
        "non_custodial_tool",
      );
      expect(legalDoc.complianceContent?.jurisdictions?.length).toBeGreaterThan(
        0,
      );
      expect(legalDoc.complianceContent?.licensing?.length).toBeGreaterThan(0);
      expect(legalDoc.complianceContent?.disclosures?.length).toBeGreaterThan(
        0,
      );
      expect(
        legalDoc.complianceContent?.unresolvedQuestions?.length,
      ).toBeGreaterThan(0);
    }
  });

  it("3. migrates legacy demo-lbes project into TradingOperation with full v5 integrity", () => {
    const legacyProject: Project = {
      id: "demo-lbes",
      name: "LBES",
      objective: "Generate cash through systematic breakouts to fund runway",
      priorityId: 2,
      status: "active",
      hypothesis: "London session momentum edge",
      milestone: "Define weekly cash routine",
      metrics: "$1,000 weekly net",
      bottlenecks: "Manual execution speed",
      evidence: "Paper trading screenshots",
      decisions: "Focus exclusively on NQ and ES",
      learning: "Wait for 08:00 AM London bar close",
      documents: "",
      createdAt: "2026-09-01T00:00:00.000Z",
    };

    const tradingOp = migrateLbesToTradingOperation(legacyProject);
    expect(tradingOp.id).toBe("trading-op-lbes");
    expect(tradingOp.name).toBe("LBES");
    expect(tradingOp.currentStage).toBe("paper_simulation");
    expect(tradingOp.operatingProfile.coreEdgeDescription).toContain(
      "Generate cash through systematic breakouts",
    );
    expect(tradingOp.operatingProfile.flexibleContent).toContain(
      "Manual execution speed",
    );
    expect(tradingOp.financialPlan.flexibleContent).toContain(
      "Define weekly cash routine",
    );

    const validation = validateTradingOperation(tradingOp);
    expect(validation.success).toBe(true);
  });

  it("4. is idempotent: repeated migration passes preserve all v5 structures without duplication", () => {
    const initial = migrateOSState({});
    expect(initial.schemaVersion).toBe(5);

    const pass2 = migrateOSState(initial);
    expect(pass2.schemaVersion).toBe(5);
    expect(pass2.tradingOperation?.id).toBe(initial.tradingOperation?.id);
    expect(pass2.projects.length).toBe(initial.projects.length);

    const pass3 = migrateOSState(pass2);
    expect(pass3.schemaVersion).toBe(5);
    expect(pass3.tradingOperation?.operatingProfile.version).toBe(
      initial.tradingOperation?.operatingProfile.version,
    );
  });
});
