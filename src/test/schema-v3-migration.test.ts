import { describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  SCHEMA_V3_VERSION,
  migrateOSState,
  migrateOSStateV3,
  migrateDayRecord,
  upgradeProjectToV3,
  migrateLbesToTradingOperation,
  migrateSkillsToLearningSystem,
} from "../lib/os/reviews/migrations";
import {
  validateProject,
  validateTradingOperation,
  validateLearningSystem,
  validateTask,
} from "../lib/os/validation/schemas";
import type { DayRecord, OSState, Project } from "../lib/os/types";

describe("Phase 1: Schema v3 Foundation & Migration Tests", () => {
  it("declares SCHEMA_V3_VERSION as 3 and CURRENT_SCHEMA_VERSION as 4", () => {
    expect(SCHEMA_V3_VERSION).toBe(3);
    expect(CURRENT_SCHEMA_VERSION).toBe(4);
  });

  it("migrates raw legacy state to Schema v3 with all defaults and master repositories", () => {
    const rawLegacy = {
      userName: "Yash",
      theme: "dark",
    };

    const migrated = migrateOSStateV3(rawLegacy);

    expect(migrated.schemaVersion).toBe(SCHEMA_V3_VERSION);
    expect(migrated.tradingOperation).toBeDefined();
    expect(migrated.tradingOperation?.id).toBe("trading-op-lbes");
    expect(migrated.tradingOperation?.operatingProfile.title).toBe(
      "Trading Operating Profile",
    );
    expect(migrated.tradingOperation?.financialPlan.title).toBe(
      "Financial & Transition Plan",
    );

    expect(migrated.learningSystem).toBeDefined();
    expect(migrated.learningSystem?.id).toBe("learning-system-core");
    expect(migrated.learningSystem?.coreDocument.title).toBe(
      "Learning & Knowledge Operating System",
    );

    // demo-lbes and demo-skills removed from projects portfolio
    expect(migrated.projects.some((p) => p.id === "demo-lbes")).toBe(false);
    expect(migrated.projects.some((p) => p.id === "demo-skills")).toBe(false);

    // Remaining projects (Killarity Engine) upgraded to 5 docs
    const killarity = migrated.projects.find(
      (p) => p.id === "demo-killarity" || p.priorityId === 1,
    );
    expect(killarity).toBeDefined();
    expect(killarity?.lifecyclePhase).toBe("build_delivery");
    expect(killarity?.goalsHistory?.length).toBeGreaterThanOrEqual(1);
    expect(killarity?.milestones?.length).toBeGreaterThanOrEqual(1);
    expect(killarity?.docs?.length).toBeGreaterThanOrEqual(5);
  });

  it("migrates Schema v2 state to Schema v3 preserving history and analytics", () => {
    const v2State: Partial<OSState> = {
      schemaVersion: 2,
      userName: "Yash",
      theme: "dark",
      history: [
        {
          date: "2026-10-20",
          plannedMin: { 1: 120, 2: 60, 3: 30 },
          actualMin: { 1: 110, 2: 70, 3: 25 },
          tasksDone: 3,
          tasksPlanned: 3,
          outputs: [
            {
              title: "Shipped v2 update",
              priorityId: 1,
              text: "Deployed to production",
            },
          ],
          outcomesAchieved: [1, 2],
          unfinished: [],
          learning: "Great velocity today",
          state: "finalized",
          source: "closeout",
          p2WorkstreamMinutes: { workstreamA: 70, workstreamB: 0 },
        },
      ],
      projects: [
        {
          id: "demo-killarity",
          name: "Killarity Engine",
          objective: "Ship v2 and get users",
          priorityId: 1,
          status: "active",
          hypothesis: "Demand is real",
          milestone: "Ship v2",
          metrics: "Active users: 100",
          bottlenecks: "None",
          evidence: "3 user interviews",
          decisions: "Architecture approved",
          learning: "Rapid iteration",
          documents: "",
          createdAt: "2026-10-01",
          docs: [
            {
              id: "legacy-doc-1",
              title: "Product Overview Notes",
              content: "Legacy notes content",
              createdAt: "2026-10-02",
              updatedAt: "2026-10-02",
            },
          ],
        },
        {
          id: "demo-lbes",
          name: "LBES",
          objective: "Generate cash to fund the startup.",
          priorityId: 2,
          status: "active",
          hypothesis: "",
          milestone: "Repeatable weekly cash routine",
          metrics: "",
          bottlenecks: "Manual process",
          evidence: "",
          decisions: "",
          learning: "",
          documents: "",
          createdAt: "2026-10-01",
          workstream: "A",
          docs: [],
        },
        {
          id: "demo-skills",
          name: "Product + Trading Skills",
          objective: "Learn fundamentals that improve execution.",
          priorityId: 3,
          status: "active",
          hypothesis: "",
          milestone: "Apply two execution skills",
          metrics: "",
          bottlenecks: "",
          evidence: "",
          decisions: "",
          learning: "",
          documents: "",
          createdAt: "2026-10-01",
          learningCategories: ["Practical execution and experiments"],
          docs: [],
        },
      ],
    };

    const migrated = migrateOSState(v2State);

    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    // History strictly preserved
    expect(migrated.history.length).toBe(1);
    expect(migrated.history[0]?.date).toBe("2026-10-20");
    expect(migrated.history[0]?.p2WorkstreamMinutes?.workstreamA).toBe(70);

    // Legacy doc preserved without text loss
    const killarity = migrated.projects.find((p) => p.id === "demo-killarity")!;
    expect(killarity).toBeDefined();
    const preservedDoc = killarity.docs?.find((d) => d.id === "legacy-doc-1");
    expect(preservedDoc).toBeDefined();
    expect(preservedDoc?.content).toBe("Legacy notes content");
    expect(preservedDoc?.title).toBe("Product Overview Notes");

    // LBES extracted to tradingOperation
    expect(migrated.tradingOperation?.name).toBe("LBES");
    expect(
      migrated.tradingOperation?.operatingProfile.coreEdgeDescription,
    ).toBe("Generate cash to fund the startup.");

    // Skills extracted to learningSystem
    expect(migrated.learningSystem?.coreDocument.title).toBe(
      "Learning & Knowledge Operating System",
    );
  });

  it("backfills tasks with projectId and milestoneId during migration", () => {
    const rawWithPlan: Partial<OSState> = {
      projects: [
        {
          id: "demo-killarity",
          name: "Killarity Engine",
          objective: "Ship v2",
          priorityId: 1,
          status: "active",
          hypothesis: "",
          milestone: "Ship v2 milestone",
          metrics: "",
          bottlenecks: "",
          evidence: "",
          decisions: "",
          learning: "",
          documents: "",
          createdAt: "2026-10-01",
        },
      ],
      plan: {
        context: {
          date: "2026-11-03",
          dayType: "Non-College Day",
          hours: 8,
          commitments: "",
          energy: "High",
        },
        allocation: { 1: 4, 2: 2, 3: 2 },
        outcomes: { 1: "Outcome 1", 2: "Outcome 2", 3: "Outcome 3" },
        tasks: [
          {
            id: "task-1",
            priorityId: 1,
            title: "Task without project ID",
            duration: 60,
            timeBlock: "09:00-10:00",
            expectedOutput: "Done",
            successCriteria: "Done",
            what: "",
            how: "",
            where: "",
            kind: "measurable",
            selected: true,
            status: "pending",
            elapsedMs: 0,
          },
        ],
      },
    };

    const migrated = migrateOSState(rawWithPlan);
    const planTask = migrated.plan?.tasks[0];
    expect(planTask).toBeDefined();
    expect(planTask?.projectId).toBe("demo-killarity");
    expect(planTask?.milestoneId).toBeDefined();
  });

  it("validates Project schema: enforces exactly 1 active major goal constraint", () => {
    const validProject: Project = {
      id: "proj-1",
      name: "Test Project",
      objective: "Test objective",
      priorityId: 1,
      status: "active",
      lifecyclePhase: "build_delivery",
      activeGoalId: "g-1",
      goalsHistory: [
        {
          id: "g-1",
          projectId: "proj-1",
          text: "Active Major Goal",
          metrics: [{ label: "Users", target: "100", current: "0" }],
          status: "active",
          createdAt: "2026-11-01",
        },
        {
          id: "g-0",
          projectId: "proj-1",
          text: "Old Goal",
          metrics: [],
          status: "achieved",
          createdAt: "2026-10-01",
        },
      ],
      milestones: [
        {
          id: "m-1",
          projectId: "proj-1",
          title: "Milestone 1",
          objective: "First release",
          metrics: [],
          deadline: "2026-12-01",
          status: "active",
          order: 1,
          isPrimaryActive: true,
          createdAt: "2026-11-01",
        },
      ],
      hypothesis: "",
      milestone: "Milestone 1",
      metrics: "",
      bottlenecks: "",
      evidence: "",
      decisions: "",
      learning: "",
      documents: "",
      createdAt: "2026-11-01",
      docs: [],
    };

    const validResult = validateProject(validProject);
    expect(validResult.success).toBe(true);

    // Invalid project: 2 active goals
    const invalidTwoActiveGoals: Project = {
      ...validProject,
      goalsHistory: [
        {
          id: "g-1",
          projectId: "proj-1",
          text: "Active Major Goal 1",
          metrics: [],
          status: "active",
          createdAt: "2026-11-01",
        },
        {
          id: "g-2",
          projectId: "proj-1",
          text: "Active Major Goal 2",
          metrics: [],
          status: "active",
          createdAt: "2026-11-01",
        },
      ],
    };

    const invalidResult = validateProject(invalidTwoActiveGoals);
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error.issues[0]?.message).toContain(
        "Project must have exactly 1 active major goal",
      );
    }
  });

  it("validates Project schema: enforces justification when activating multiple concurrent milestones", () => {
    const baseProject: Project = {
      id: "proj-2",
      name: "Concurrency Test",
      objective: "Testing milestones",
      priorityId: 1,
      status: "active",
      lifecyclePhase: "solution_validation",
      activeGoalId: "g-1",
      goalsHistory: [
        {
          id: "g-1",
          projectId: "proj-2",
          text: "Primary Goal",
          metrics: [],
          status: "active",
          createdAt: "2026-11-01",
        },
      ],
      milestones: [
        {
          id: "m-1",
          projectId: "proj-2",
          title: "Primary Milestone",
          objective: "",
          metrics: [],
          deadline: "2026-12-01",
          status: "active",
          order: 1,
          isPrimaryActive: true,
          createdAt: "2026-11-01",
        },
        {
          id: "m-2",
          projectId: "proj-2",
          title: "Secondary Active Milestone Without Approval",
          objective: "",
          metrics: [],
          deadline: "2026-12-15",
          status: "active",
          order: 2,
          isPrimaryActive: false, // unapproved concurrent active
          createdAt: "2026-11-01",
        },
      ],
      hypothesis: "",
      milestone: "Primary Milestone",
      metrics: "",
      bottlenecks: "",
      evidence: "",
      decisions: "",
      learning: "",
      documents: "",
      createdAt: "2026-11-01",
      docs: [],
    };

    // Unapproved second active milestone must fail validation
    const unapprovedResult = validateProject(baseProject);
    expect(unapprovedResult.success).toBe(false);
    if (!unapprovedResult.success) {
      expect(unapprovedResult.error.issues[0]?.message).toContain(
        "Multiple active milestones require explicit approval record",
      );
    }

    // Approved second active milestone with reason >= 10 chars must pass
    const approvedProject: Project = {
      ...baseProject,
      milestones: [
        baseProject.milestones![0]!,
        {
          ...baseProject.milestones![1]!,
          additionalActiveApproval: {
            approvedBy: "Founder",
            approvedAt: "2026-11-03T10:00:00Z",
            reason:
              "Dual tracking legal review and product beta simultaneously",
          },
        },
      ],
    };

    const approvedResult = validateProject(approvedProject);
    expect(approvedResult.success).toBe(true);
  });

  it("validates TradingOperation and LearningSystem schemas", () => {
    const tradingOp = migrateLbesToTradingOperation();
    const tradingResult = validateTradingOperation(tradingOp);
    expect(tradingResult.success).toBe(true);

    const learningSys = migrateSkillsToLearningSystem();
    const learningResult = validateLearningSystem(learningSys);
    expect(learningResult.success).toBe(true);
  });

  it("is idempotent: re-migrating v3 state produces stable output", () => {
    const initial = migrateOSState({});
    const reMigrated = migrateOSState(initial);

    expect(reMigrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(reMigrated.projects.length).toBe(initial.projects.length);
    expect(reMigrated.tradingOperation?.id).toBe(initial.tradingOperation?.id);
    expect(reMigrated.learningSystem?.id).toBe(initial.learningSystem?.id);
  });
});
