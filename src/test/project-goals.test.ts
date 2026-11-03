import { describe, expect, it } from "vitest";
import {
  addProjectGoal,
  getCanonicalGoals,
  transitionActiveGoal,
} from "../lib/os/projects/logic";
import { validateProject } from "../lib/os/validation/schemas";
import type { Project } from "../lib/os/types";

describe("Phase 2: Project Goals Architecture & Transitions", () => {
  const sampleProject: Project = {
    id: "proj-founder-1",
    name: "Founder OS",
    objective: "Scale founder capability to ship high-leverage products",
    priorityId: 1,
    status: "active",
    hypothesis: "Disciplined execution loops yield repeatable product traction",
    milestone: "Ship MVP v1",
    metrics: "10 weekly users",
    bottlenecks: "Customer interview scheduling friction",
    evidence: "3 customer discovery transcripts recorded",
    decisions: "Architecture based on TanStack and local-first store",
    learning: "Tight execution cycles prevent premature abstraction",
    documents: "https://specs.founder.os",
    createdAt: new Date().toISOString(),
    goals: [],
  };

  it("1. adds an initial goal and marks it active when no active goal exists", () => {
    const { project, goal } = addProjectGoal(
      sampleProject,
      "Achieve $1,000 monthly recurring revenue from 10 customers",
      [{ label: "MRR", target: "$1,000", current: "$0" }],
      "2026-12-31",
    );

    expect(project.goals?.length).toBe(1);
    expect(project.activeGoalId).toBe(goal.id);
    expect(goal.status).toBe("active");
    expect(goal.text).toContain("Achieve $1,000 monthly");

    const valid = validateProject(project);
    expect(valid.success).toBe(true);
  });

  it("2. does NOT automatically mark an existing goal as achieved when transitioning", () => {
    // Start with active goal
    const { project: withGoal, goal: initialGoal } = addProjectGoal(
      sampleProject,
      "Acquire 100 beta signups",
      [{ label: "Signups", target: "100", current: "40" }],
    );

    // Transition via 'superseded' decision
    const {
      project: transitioned,
      archivedGoal,
      newGoal,
    } = transitionActiveGoal(withGoal, {
      type: "superseded",
      reason: "Pivoted from broad consumer signups to enterprise pilot LOIs",
      newGoalText: "Secure 5 Enterprise LOIs",
    });

    expect(archivedGoal).toBeDefined();
    expect(archivedGoal?.id).toBe(initialGoal.id);
    expect(archivedGoal?.status).toBe("superseded");
    expect(archivedGoal?.status).not.toBe("achieved");
    expect(archivedGoal?.transitionReason).toContain(
      "Pivoted from broad consumer",
    );
    expect(archivedGoal?.supersededBy).toBe(newGoal?.id);

    expect(newGoal).toBeDefined();
    expect(newGoal?.status).toBe("active");
    expect(transitioned.activeGoalId).toBe(newGoal?.id);

    // Verify both goals exist in the canonical collection
    expect(transitioned.goals?.length).toBe(2);
    expect(
      transitioned.goals?.find((g) => g.id === initialGoal.id)?.status,
    ).toBe("superseded");
    expect(transitioned.goals?.find((g) => g.id === newGoal?.id)?.status).toBe(
      "active",
    );
  });

  it("3. requires and preserves achievement evidence when an active goal is marked achieved", () => {
    const { project: withGoal, goal: initialGoal } = addProjectGoal(
      sampleProject,
      "Conduct 20 user interviews",
    );

    const { project: achievedProject, archivedGoal } = transitionActiveGoal(
      withGoal,
      {
        type: "achieved",
        evidence:
          "22 recorded user interviews archived in Evidence & Experiments doc with full notes",
        newGoalText: "Build clickable prototype for highest-pain workflow",
      },
    );

    expect(archivedGoal?.status).toBe("achieved");
    expect(archivedGoal?.achievementEvidence).toContain(
      "22 recorded user interviews",
    );
    expect(archivedGoal?.resolvedAt).toBeDefined();

    // The achieved goal remains permanently in goals collection
    const foundArchived = achievedProject.goals?.find(
      (g) => g.id === initialGoal.id,
    );
    expect(foundArchived?.status).toBe("achieved");
    expect(foundArchived?.achievementEvidence).toContain(
      "22 recorded user interviews",
    );
  });

  it("4. retains reason and dates when an active goal is abandoned", () => {
    const { project: withGoal, goal: initialGoal } = addProjectGoal(
      sampleProject,
      "Build desktop electron wrapper",
    );

    const { project: abandonedProject, archivedGoal } = transitionActiveGoal(
      withGoal,
      {
        type: "abandoned",
        reason:
          "Web app performance and PWA capabilities satisfy 100% of user needs",
      },
    );

    expect(archivedGoal?.status).toBe("abandoned");
    expect(archivedGoal?.transitionReason).toContain(
      "Web app performance and PWA",
    );
    expect(archivedGoal?.resolvedAt).toBeDefined();
    expect(abandonedProject.activeGoalId).toBeUndefined();
  });

  it("5. validates schema constraint: prevents multiple active goals in canonical collection", () => {
    const invalidProject: Project = {
      ...sampleProject,
      goals: [
        {
          id: "g1",
          projectId: sampleProject.id,
          text: "First active goal",
          metrics: [],
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "g2",
          projectId: sampleProject.id,
          text: "Second concurrent active goal (violates single-goal constraint)",
          metrics: [],
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ],
      activeGoalId: "g1",
    };

    const result = validateProject(invalidProject);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Project must have exactly 1 active major goal",
      );
    }
  });

  it("6. maintains one canonical collection of ProjectGoal records and prevents divergence in goalsHistory", () => {
    const { project: p1, goal: g1 } = addProjectGoal(
      sampleProject,
      "Canonical primary goal",
    );
    expect(p1.goals).toBeDefined();
    expect(p1.goalsHistory).toBeDefined();
    expect(p1.goals?.length).toBe(1);
    // Compatibility mirror references the exact same canonical array
    expect(p1.goalsHistory).toBe(p1.goals);

    const canonical = getCanonicalGoals(p1);
    expect(canonical.length).toBe(1);
    expect(canonical[0]?.id).toBe(g1.id);

    // Reject divergence if a divergent goalsHistory is manually introduced
    const divergentProject: Project = {
      ...p1,
      goals: [g1],
      goalsHistory: [
        g1,
        {
          id: "divergent-goal",
          projectId: p1.id,
          text: "Divergent second goal not in canonical goals",
          metrics: [],
          status: "superseded",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    const validation = validateProject(divergentProject);
    expect(validation.success).toBe(false);
    if (!validation.success) {
      expect(validation.error.issues[0]?.message).toContain(
        "goalsHistory cannot diverge from canonical goals collection",
      );
    }
  });
});
