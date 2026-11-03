import { describe, expect, it } from "vitest";
import {
  approvePlanRevision,
  calculateProjectPerformance,
  evaluateDailyOutcome,
} from "../lib/os/projects/logic";
import type { DayRecord, Project } from "../lib/os/types";

describe("Phase 2: Structured Execution Plan & Single Source of Truth", () => {
  const baseProjectWithPlan: Project = {
    id: "proj-exec-plan",
    name: "Execution Plan Test Project",
    objective: "Validate market demand with paid commitments",
    priorityId: 1,
    status: "active",
    hypothesis: "Test hypothesis",
    milestone: "Ship MVP",
    metrics: "$1k MRR",
    bottlenecks: "None",
    evidence: "None",
    decisions: "None",
    learning: "None",
    documents: "",
    createdAt: "2026-11-01T00:00:00.000Z",
    executionPlan: {
      projectId: "proj-exec-plan",
      activeGoalId: "goal-1",
      activeMilestoneIds: ["ms-1"],
      originalBaseline: {
        setAt: "2026-11-01T00:00:00.000Z",
        goalSnapshotText: "Validate market demand with paid commitments",
        milestoneTitles: ["Ship MVP"],
        outcomes: {
          monthly: [
            {
              id: "out-m-1",
              text: "10 paid customers onboarded",
              successCriteria: "Stripe transactions settled",
              status: "pending",
            },
          ],
          weekly: [],
          daily: [
            {
              id: "out-d-1",
              text: "Deploy payment gateway webhook handler",
              successCriteria: "Pass all webhook automated integration tests",
              status: "pending",
            },
          ],
        },
      },
      currentApproved: {
        version: 1,
        approvedAt: "2026-11-01T00:00:00.000Z",
        outcomes: {
          monthly: [
            {
              id: "out-m-1",
              text: "10 paid customers onboarded",
              successCriteria: "Stripe transactions settled",
              status: "pending",
            },
          ],
          weekly: [],
          daily: [
            {
              id: "out-d-1",
              text: "Deploy payment gateway webhook handler",
              successCriteria: "Pass all webhook automated integration tests",
              status: "pending",
            },
          ],
        },
        recommendedTasks: [],
      },
      proposedRevisions: [],
    },
    docs: [
      {
        id: "doc-handle-plan",
        projectId: "proj-exec-plan",
        type: "execution_plan",
        title: "Execution Plan",
        content: "Presentation handle",
        version: 1,
        createdAt: "2026-11-01T00:00:00.000Z",
        updatedAt: "2026-11-01T00:00:00.000Z",
      },
    ],
  };

  it("1. evaluates daily outcome deliberately against success criteria preserving task evidence", () => {
    const taskOutputs = [
      {
        taskId: "task-webhook-1",
        taskTitle: "Implement Stripe signature validation",
        output: { result: "Endpoints tested with Stripe CLI webhook fixture" },
        elapsedMinutes: 45,
      },
    ];

    const { project: evaluatedProject, record } = evaluateDailyOutcome(
      baseProjectWithPlan,
      "out-d-1",
      {
        status: "achieved",
        actualEvidenceSummary:
          "Stripe CLI verified webhook signature validation; 12 automated tests passed",
        linkedTaskOutputs: taskOutputs,
        founderNotes: "Webhook handler is robust against replay attacks",
      },
    );

    const updatedOutcome =
      evaluatedProject.executionPlan?.currentApproved.outcomes.daily.find(
        (o) => o.id === "out-d-1",
      );

    expect(updatedOutcome?.status).toBe("achieved");
    expect(updatedOutcome?.evidenceNotes).toContain(
      "Stripe CLI verified webhook",
    );
    expect(updatedOutcome?.evaluations?.length).toBe(1);
    expect(record.status).toBe("achieved");
    expect(record.linkedTaskOutputs.length).toBe(1);
  });

  it("2. supports marking daily outcome as 'missed' when criteria are unmet", () => {
    const { project: evaluatedProject, record } = evaluateDailyOutcome(
      baseProjectWithPlan,
      "out-d-1",
      {
        status: "missed",
        actualEvidenceSummary:
          "Cloudflare Workers environment variables not syncing properly; deferred to tomorrow",
        linkedTaskOutputs: [],
        founderNotes: "Need to re-authenticate Wrangler CLI",
      },
    );

    const updatedOutcome =
      evaluatedProject.executionPlan?.currentApproved.outcomes.daily.find(
        (o) => o.id === "out-d-1",
      );

    expect(updatedOutcome?.status).toBe("missed");
    expect(record.status).toBe("missed");
    expect(record.actualEvidenceSummary).toContain("Cloudflare Workers");
  });

  it("3. preserves originalBaseline immutably when approving plan revisions", () => {
    const projectWithRevision: Project = {
      ...baseProjectWithPlan,
      executionPlan: {
        ...baseProjectWithPlan.executionPlan!,
        proposedRevisions: [
          {
            id: "rev-1",
            version: 2,
            proposedAt: "2026-11-02T10:00:00.000Z",
            proposedBy: "founder",
            reason: "Accelerated timeline: Add 5 enterprise trials",
            evidenceReferences: ["https://evidence.founder.os"],
            status: "proposed",
            snapshot: {
              outcomes: {
                monthly: [
                  {
                    id: "out-m-revised",
                    text: "5 Enterprise pilot contracts",
                    successCriteria: "Signed agreements",
                    status: "pending",
                  },
                ],
                weekly: [],
                daily: [],
              },
              recommendedTasks: [],
            },
          },
        ],
      },
    };

    const approved = approvePlanRevision(
      projectWithRevision,
      "rev-1",
      "Founder",
    );

    // Current approved plan is updated to version 2
    expect(approved.executionPlan?.currentApproved.version).toBe(2);
    expect(
      approved.executionPlan?.currentApproved.outcomes.monthly[0]?.text,
    ).toBe("5 Enterprise pilot contracts");

    // Original baseline remains 100% UNCHANGED
    expect(
      approved.executionPlan?.originalBaseline.outcomes.monthly[0]?.text,
    ).toBe("10 paid customers onboarded");
    expect(approved.executionPlan?.originalBaseline.setAt).toBe(
      "2026-11-01T00:00:00.000Z",
    );
  });

  it("4. calculates project performance metrics and output history without task completion bias", () => {
    const mockHistory: DayRecord[] = [
      {
        date: "2026-11-01",
        tasksDone: 2,
        tasksPlanned: 2,
        plannedMin: { 1: 120, 2: 0, 3: 0 },
        actualMin: { 1: 135, 2: 0, 3: 0 },
        outputs: [
          {
            priorityId: 1,
            title: "Shipped auth flow",
            text: "Google and GitHub OAuth integrated",
          },
        ],
        taskSnapshots: [
          {
            id: "t1",
            taskId: "task-1",
            priorityId: 1,
            projectId: "proj-exec-plan",
            title: "OAuth setup",
            durationPlannedMin: 60,
            durationActualMin: 60,
            status: "done",
            kind: "measurable",
            expectedOutput: "OAuth done",
            outcomeAchieved: true,
          },
          {
            id: "t2",
            taskId: "task-2",
            priorityId: 1,
            projectId: "proj-exec-plan",
            title: "Token refresh handler",
            durationPlannedMin: 60,
            durationActualMin: 75,
            status: "done",
            kind: "validation",
            expectedOutput: "Token refresh done",
            outcomeAchieved: true,
          },
        ],
        outcomesAchieved: [1],
        unfinished: [],
        learning: "OAuth state parameter prevents CSRF",
        state: "finalized",
        source: "closeout",
        dayType: "Non-College Day",
        availableHours: 8,
        energy: "High",
        finalizedAt: "2026-11-01T20:00:00.000Z",
      },
    ];

    const perf = calculateProjectPerformance(baseProjectWithPlan, mockHistory);

    expect(perf.projectId).toBe("proj-exec-plan");
    expect(perf.tasksPlannedTotal).toBe(2);
    expect(perf.tasksDoneTotal).toBe(2);
    expect(perf.taskCompletionRate).toBe(100);
    expect(perf.totalActualHours).toBe(2.3); // (60 + 75) / 60
    expect(perf.outputsCount).toBe(1);
    expect(perf.outputs[0]?.text).toContain("Google and GitHub OAuth");
  });
});
