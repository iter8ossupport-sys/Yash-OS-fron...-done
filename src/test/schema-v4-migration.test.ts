import { describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  SCHEMA_V4_VERSION,
  migrateOSState,
  migrateOSStateV4,
  upgradeProjectToV4,
} from "../lib/os/reviews/migrations";
import {
  validateProject,
  validateTradingOperation,
  validateLearningSystem,
  validateTask,
} from "../lib/os/validation/schemas";
import type { OSState, Project, Task } from "../lib/os/types";

describe("Phase 2: Schema v4 Migration & Architecture Tests", () => {
  it("1. declares CURRENT_SCHEMA_VERSION as 5", () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(5);
    expect(SCHEMA_V4_VERSION).toBe(4);
  });

  it("2. upgrades a v3 state to v4 via normal migrateOSState entry point and sets schemaVersion: 4", () => {
    const v3State: Record<string, unknown> = {
      schemaVersion: 3,
      userName: "Yash",
      theme: "dark",
      projects: [
        {
          id: "proj-killarity",
          name: "Killarity Engine",
          objective: "High-conviction founder execution system",
          priorityId: 1,
          status: "active",
          hypothesis: "Disciplined execution outperforms ad-hoc planning",
          milestone: "Ship core engine v1",
          metrics: "5 paying customers",
          bottlenecks: "Outreach friction",
          evidence: "10 founder user interviews",
          decisions: "Architecture based on modular local store",
          learning: "Rapid feedback prevents premature feature bloat",
          documents: "",
          createdAt: "2026-10-01T00:00:00.000Z",
          milestones: [
            {
              id: "ms-engine-1",
              projectId: "proj-killarity",
              title: "Ship core engine v1",
              objective: "Deploy MVP to private staging environment",
              metrics: [{ label: "Users", target: "10", current: "2" }],
              deadline: "2026-11-30",
              status: "active",
              order: 1,
              isPrimaryActive: true,
              createdAt: "2026-10-01T00:00:00.000Z",
            },
          ],
          docs: [
            {
              id: "doc-legacy-1",
              title: "Problem Overview & Brief",
              content:
                "Detailed market problem statement and customer pain thesis.",
              createdAt: "2026-10-01T00:00:00.000Z",
            },
          ],
        },
      ],
      tradingOperation: {
        id: "trading-op-lbes",
        operatingProfile: {
          title: "Trading Operating Profile",
          status: "active",
          parameters: [],
          rules: [],
          accountRequirements: [],
          updatedAt: "2026-10-01T00:00:00.000Z",
        },
        financialPlan: {
          title: "Financial Plan",
          phases: [],
          milestones: [],
          updatedAt: "2026-10-01T00:00:00.000Z",
        },
        riskLimits: {
          maxDailyLossDollars: 500,
          maxPositionSizeLots: 2,
          maxDrawdownPercent: 5,
          lockoutThresholdConsecutiveLosses: 3,
        },
        sessions: [],
        checklist: [],
        updatedAt: "2026-10-01T00:00:00.000Z",
      },
      learningSystem: {
        id: "learning-system-core",
        coreDocument: {
          title: "Learning Operating System",
          markdown: "Foundational knowledge and frameworks",
          updatedAt: "2026-10-01T00:00:00.000Z",
        },
        knowledgeItems: [],
        curriculum: [],
        updatedAt: "2026-10-01T00:00:00.000Z",
      },
      plan: {
        date: "2026-11-03",
        allocation: { 1: 4, 2: 2, 3: 2 },
        context: { sleep: "Good", energy: "High", focus: "Deep execution" },
        outcomes: {
          1: "Ship v1 milestone",
          2: "Cashflow session",
          3: "Study fundamentals",
        },
        tasks: [
          {
            id: "task-engine-1",
            priorityId: 1,
            title: "Implement core state machine",
            duration: 60,
            timeBlock: "09:00-10:00",
            expectedOutput: "State transitions pass unit tests",
            successCriteria: "Test suite green",
            what: "Code pure transitions",
            how: "TDD",
            where: "IDE",
            kind: "measurable",
            selected: true,
            status: "pending",
            elapsedMs: 0,
          },
        ],
      },
      history: [],
      priorities: [
        {
          id: 1,
          name: "Founder Capability",
          targetPercent: 50,
          project: "Killarity Engine",
          activeProjectId: "proj-killarity",
        },
        { id: 2, name: "Cashflow Infrastructure", targetPercent: 30 },
        { id: 3, name: "Learning for Execution", targetPercent: 20 },
      ],
    };

    const migrated = migrateOSState(v3State);

    // Schema version must be 4
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrateOSStateV4(v3State).schemaVersion).toBe(4);

    // Existing projects and identifiers preserved
    expect(migrated.projects.length).toBe(1);
    const p1 = migrated.projects[0]!;
    expect(p1.id).toBe("proj-killarity");
    expect(p1.name).toBe("Killarity Engine");

    // Canonical goals initialized from genuine objective
    expect(p1.goals).toBeDefined();
    expect(p1.goals?.length).toBe(1);
    expect(p1.activeGoalId).toBe(p1.goals?.[0]?.id);
    expect(p1.goals?.[0]?.text).toBe(
      "High-conviction founder execution system",
    );
    expect(p1.goals?.[0]?.status).toBe("active");

    // Non-authoritative compatibility mirror matches canonical goals exactly
    expect(p1.goalsHistory).toBe(p1.goals);

    // Authoritative Structured Execution Plan initialized
    expect(p1.executionPlan).toBeDefined();
    expect(p1.executionPlan?.projectId).toBe("proj-killarity");
    expect(p1.executionPlan?.originalBaseline.goalSnapshotText).toBe(
      "High-conviction founder execution system",
    );
    expect(p1.executionPlan?.originalBaseline.milestoneTitles).toEqual([
      "Ship core engine v1",
    ]);
    expect(p1.executionPlan?.currentApproved.outcomes.monthly).toBeDefined();
    expect(p1.executionPlan?.currentApproved.outcomes.weekly).toBeDefined();
    expect(p1.executionPlan?.currentApproved.outcomes.daily).toBeDefined();

    // 5 Standardized documents represented
    expect(p1.docs).toBeDefined();
    expect(p1.docs?.length).toBeGreaterThanOrEqual(5);
    const docTypes = (p1.docs ?? []).map((d) =>
      "type" in d ? d.type : "legacy_unclassified",
    );
    expect(docTypes).toContain("project_brief");
    expect(docTypes).toContain("execution_plan");
    expect(docTypes).toContain("evidence_experiments");
    expect(docTypes).toContain("decisions_history");
    expect(docTypes).toContain("methods_knowledge");

    // Tasks backfilled with relationships and scope
    expect(migrated.plan?.tasks).toBeDefined();
    const task = migrated.plan!.tasks[0]!;
    expect(task.projectId).toBe("proj-killarity");
    expect(task.milestoneId).toBe("ms-engine-1");
    expect(task.scope).toBe("milestone_execution");

    // Priority 2 and Priority 3 master structures intact
    expect(migrated.tradingOperation?.id).toBe("trading-op-lbes");
    expect(migrated.learningSystem?.id).toBe("learning-system-core");

    // Zod validation confirms project validity
    const projValid = validateProject(p1);
    expect(projValid.success).toBe(true);
  });

  it("3. Safeguard 1: Never fabricates an active goal from an empty or placeholder objective", () => {
    const emptyObjProject: Project = {
      id: "proj-empty-obj",
      name: "Empty Goal Project",
      objective: "   ", // Blank placeholder
      priorityId: 1,
      status: "active",
      hypothesis: "",
      milestone: "",
      metrics: "",
      bottlenecks: "",
      evidence: "",
      decisions: "",
      learning: "",
      documents: "",
      createdAt: "2026-11-01T00:00:00.000Z",
    };

    const upgraded = upgradeProjectToV4(emptyObjProject);

    expect(upgraded.goals).toBeDefined();
    expect(upgraded.goals?.length).toBe(0);
    expect(upgraded.activeGoalId).toBeUndefined();

    // Still valid under ProjectSchema (0 active goals allowed for uninitialized project)
    const valid = validateProject(upgraded);
    expect(valid.success).toBe(true);
  });

  it("4. Safeguard 2: Tasks without active milestones receive milestoneId: undefined and scope: 'project_scoping'", () => {
    const rawStateWithoutMilestone: Record<string, unknown> = {
      schemaVersion: 3,
      projects: [
        {
          id: "proj-no-ms",
          name: "Early Discovery Project",
          objective: "Validate market pain before writing code",
          priorityId: 1,
          status: "active",
          hypothesis: "",
          milestone: "",
          metrics: "",
          bottlenecks: "",
          evidence: "",
          decisions: "",
          learning: "",
          documents: "",
          createdAt: "2026-11-01T00:00:00.000Z",
          milestones: [], // No milestones!
        },
      ],
      plan: {
        date: "2026-11-03",
        allocation: { 1: 4, 2: 2, 3: 2 },
        context: { sleep: "Good", energy: "High", focus: "Exploration" },
        outcomes: { 1: "Define problem statement", 2: "", 3: "" },
        tasks: [
          {
            id: "task-scope-1",
            priorityId: 1,
            title: "Interview 5 prospective users about workflow pain",
            duration: 60,
            timeBlock: "10:00-11:00",
            expectedOutput: "5 interview notes",
            successCriteria: "Clear recurring pain identified",
            what: "User research",
            how: "Direct outreach",
            where: "Zoom",
            kind: "validation",
            selected: true,
            status: "pending",
            elapsedMs: 0,
          },
        ],
      },
      priorities: [
        {
          id: 1,
          name: "Founder Capability",
          targetPercent: 50,
          project: "Early Discovery Project",
          activeProjectId: "proj-no-ms",
        },
        { id: 2, name: "Cashflow Infrastructure", targetPercent: 30 },
        { id: 3, name: "Learning for Execution", targetPercent: 20 },
      ],
    };

    const migrated = migrateOSState(rawStateWithoutMilestone);

    const task = migrated.plan!.tasks[0]!;
    expect(task.projectId).toBe("proj-no-ms");
    // Explicit safeguard: Never invent a milestone ID
    expect(task.milestoneId).toBeUndefined();
    expect(task.scope).toBe("project_scoping");

    const taskValid = validateTask(task);
    expect(taskValid.success).toBe(true);
  });

  it("5. is idempotent: repeating migrateOSState produces deterministic and stable v4 output", () => {
    const raw: Partial<OSState> = {
      userName: "Yash",
      theme: "dark",
    };

    const firstPass = migrateOSState(raw);
    const secondPass = migrateOSState(firstPass);

    expect(firstPass.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(secondPass.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(secondPass.projects.length).toBe(firstPass.projects.length);
    expect(secondPass.projects[0]?.id).toBe(firstPass.projects[0]?.id);
    expect(secondPass.projects[0]?.executionPlan?.projectId).toBe(
      firstPass.projects[0]?.executionPlan?.projectId,
    );
    expect(secondPass.tradingOperation?.id).toBe(
      firstPass.tradingOperation?.id,
    );
    expect(secondPass.learningSystem?.id).toBe(firstPass.learningSystem?.id);
  });
});
