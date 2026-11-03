import { describe, expect, it } from "vitest";
import { generateEvidenceAwareTaskRecommendations } from "../lib/os/projects/recommendations";
import type { Project } from "../lib/os/types";

describe("Phase 2: Evidence-Aware Task Recommendations & Provenance", () => {
  const sampleProject: Project = {
    id: "proj-rec-test",
    name: "Founder Pipeline",
    objective: "Establish 10 qualified customer pilot opportunities",
    priorityId: 1,
    status: "active",
    hypothesis: "Direct cold Loom demos convert at 15%",
    milestone: "5 LOIs signed",
    metrics: "5 LOIs",
    bottlenecks: "Email deliverability dropping below 90%",
    evidence: "3 responses from 20 outreach emails",
    decisions: "Use dedicated outreach domains with warm-up",
    learning: "Short personalized Loom videos increase reply rate",
    documents: "",
    createdAt: "2026-11-01T00:00:00.000Z",
    milestones: [
      {
        id: "ms-loi-1",
        projectId: "proj-rec-test",
        title: "5 LOIs signed",
        objective: "Secure 5 signed letters of intent",
        metrics: [{ label: "LOIs", target: "5", current: "1" }],
        deadline: "2026-11-25",
        status: "active",
        order: 1,
        isPrimaryActive: true,
        createdAt: "2026-11-01T00:00:00.000Z",
      },
    ],
    executionPlan: {
      projectId: "proj-rec-test",
      activeMilestoneIds: ["ms-loi-1"],
      originalBaseline: {
        setAt: "2026-11-01T00:00:00.000Z",
        goalSnapshotText: "Establish 10 qualified customer pilot opportunities",
        milestoneTitles: ["5 LOIs signed"],
        outcomes: { monthly: [], weekly: [], daily: [] },
      },
      currentApproved: {
        version: 1,
        approvedAt: "2026-11-01T00:00:00.000Z",
        outcomes: {
          monthly: [],
          weekly: [],
          daily: [
            {
              id: "out-daily-warmup",
              text: "Configure DKIM, SPF and DMARC on outreach domain",
              successCriteria: "Mail-tester score 10/10",
              status: "pending",
            },
          ],
        },
        recommendedTasks: [],
      },
      proposedRevisions: [],
    },
  };

  it("1. generates milestone-linked tasks when primary milestone and daily outcomes exist", () => {
    const tasks = generateEvidenceAwareTaskRecommendations({
      project: sampleProject,
      priorityBottleneck: "Priority 1 broad pipeline velocity",
      reviewBottlenecks: ["Sleep disruption reducing morning deep work hours"],
      availableHours: 4,
      energy: "High",
    });

    expect(tasks.length).toBeGreaterThan(0);
    const dailyTask = tasks.find((t) => t.planOutcomeId === "out-daily-warmup");
    expect(dailyTask).toBeDefined();
    expect(dailyTask?.projectId).toBe("proj-rec-test");
    expect(dailyTask?.milestoneId).toBe("ms-loi-1");
    expect(dailyTask?.scope).toBe("milestone_execution");
    expect(dailyTask?.expectedOutput).toContain("Mail-tester score 10/10");
  });

  it("2. preserves evidence provenance and segregates project vs priority bottlenecks", () => {
    const tasks = generateEvidenceAwareTaskRecommendations({
      project: sampleProject,
      priorityBottleneck: "Broad Priority 1 distribution focus",
      availableHours: 3,
      energy: "Medium",
    });

    const task = tasks[0];
    expect(task?.provenance).toBeDefined();

    // Verify project-specific provenance is correctly attributed
    const projectProv = task?.provenance?.find((p) => p.scope === "project");
    expect(projectProv).toBeDefined();
    expect(projectProv?.description).toContain("Email deliverability");
    expect(projectProv?.sourceType).toBe("project_bottleneck");
  });

  it("3. handles projects without milestones by recommending project-scoping tasks (milestoneId: undefined)", () => {
    const projectWithoutMilestones: Project = {
      ...sampleProject,
      milestones: [],
      executionPlan: undefined,
    };

    const tasks = generateEvidenceAwareTaskRecommendations({
      project: projectWithoutMilestones,
      availableHours: 2,
      energy: "Medium",
    });

    expect(tasks.length).toBeGreaterThan(0);
    // Explicit safeguard: Never invent a milestone ID
    tasks.forEach((t) => {
      expect(t.milestoneId).toBeUndefined();
      expect(t.scope).toBe("project_scoping");
      expect(t.projectId).toBe(projectWithoutMilestones.id);
    });

    expect(tasks[0]?.title).toContain("Define Milestone 1");
  });

  it("4. handles projects with inactive milestones by prompting milestone review", () => {
    const projectWithInactiveMilestones: Project = {
      ...sampleProject,
      milestones: [
        {
          id: "ms-prev-1",
          projectId: sampleProject.id,
          title: "Initial research",
          objective: "Completed research",
          metrics: [],
          deadline: "2026-10-31",
          status: "completed",
          order: 1,
          isPrimaryActive: false,
          createdAt: "2026-10-01T00:00:00.000Z",
        },
      ],
      executionPlan: undefined,
    };

    const tasks = generateEvidenceAwareTaskRecommendations({
      project: projectWithInactiveMilestones,
      availableHours: 2,
    });

    expect(tasks.length).toBe(1);
    expect(tasks[0]?.milestoneId).toBeUndefined();
    expect(tasks[0]?.scope).toBe("project_scoping");
    expect(tasks[0]?.title).toContain(
      "Review milestone progress & activate next milestone",
    );
  });
});
