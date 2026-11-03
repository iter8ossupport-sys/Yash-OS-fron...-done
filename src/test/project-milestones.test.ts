import { describe, expect, it } from "vitest";
import {
  addMilestone,
  assessMilestone,
  setPrimaryActiveMilestone,
} from "../lib/os/projects/logic";
import { validateProject } from "../lib/os/validation/schemas";
import type { Project } from "../lib/os/types";

describe("Phase 2: Project Milestones & Deliberate Assessment", () => {
  const baseProject: Project = {
    id: "proj-milestone-test",
    name: "Founder System",
    objective: "Deliver verified founder tooling",
    priorityId: 1,
    status: "active",
    hypothesis: "Test hypothesis",
    milestone: "",
    metrics: "",
    bottlenecks: "",
    evidence: "",
    decisions: "",
    learning: "",
    documents: "",
    createdAt: new Date().toISOString(),
    milestones: [],
  };

  it("1. adds milestones sequentially with exactly one primary active milestone", () => {
    const { project: p1, milestone: m1 } = addMilestone(baseProject, {
      title: "Milestone 1: Prototype validation",
      objective: "Get 5 user signoffs on wireframe flow",
      deadline: "2026-11-20",
    });

    expect(m1.order).toBe(1);
    expect(m1.isPrimaryActive).toBe(true);
    expect(p1.milestones?.length).toBe(1);

    const { project: p2, milestone: m2 } = addMilestone(p1, {
      title: "Milestone 2: Beta release",
      objective: "Deploy MVP to private staging environment",
      deadline: "2026-12-05",
      isPrimaryActive: false,
    });

    expect(m2.order).toBe(2);
    expect(m2.isPrimaryActive).toBe(false);
    expect(p2.milestones?.find((m) => m.id === m1.id)?.isPrimaryActive).toBe(
      true,
    );
  });

  it("2. enforces formal milestone assessment and records audit history without auto-completing", () => {
    const { project: p1, milestone: m1 } = addMilestone(baseProject, {
      title: "Milestone 1: 10 User Interviews",
      metrics: [{ label: "Interviews", target: "10", current: "0" }],
      deadline: "2026-11-15",
    });

    // Milestone is active
    expect(p1.milestones?.[0]?.status).toBe("active");
    expect(p1.milestones?.[0]?.completedAt).toBeUndefined();

    // Perform formal founder assessment
    const { project: assessedProject, assessment } = assessMilestone(
      p1,
      m1.id,
      {
        status: "completed",
        actualMetrics: [{ label: "Interviews", target: "10", current: "12" }],
        actualResultsSummary:
          "12 recorded founder interviews completed with transcripts",
        evidenceReferences: ["https://interviews.founder.os/transcripts"],
        founderNotes:
          "Exceeded target interviews, validated core pricing thesis",
        systemRecommendation: "recommended_completed",
      },
    );

    const assessedMs = assessedProject.milestones?.find((m) => m.id === m1.id);
    expect(assessedMs?.status).toBe("completed");
    expect(assessedMs?.completedAt).toBeDefined();
    expect(assessedMs?.assessmentHistory?.length).toBe(1);
    expect(assessment.assessedBy).toBe("founder");
    expect(assessment.actualResultsSummary).toContain(
      "12 recorded founder interviews",
    );
  });

  it("3. requires explicit approval record when activating more than one concurrent milestone", () => {
    const { project: p1, milestone: m1 } = addMilestone(baseProject, {
      title: "Milestone 1: Core Engine",
      isPrimaryActive: true,
    });

    const { project: p2, milestone: m2 } = addMilestone(p1, {
      title: "Milestone 2: User Onboarding",
      isPrimaryActive: false,
    });

    // Valid approval record justifying concurrent execution
    const justifiedApproval = {
      approvedBy: "Founder",
      approvedAt: new Date().toISOString(),
      reason:
        "Concurrent execution required: Onboarding copy team operates in parallel with engine backend",
    };

    const updatedWithApproval = {
      ...p2,
      milestones: p2.milestones?.map((m) =>
        m.id === m2.id
          ? {
              ...m,
              status: "active" as const,
              isPrimaryActive: false,
              additionalActiveApproval: justifiedApproval,
            }
          : m,
      ),
    };

    const validResult = validateProject(updatedWithApproval);
    expect(validResult.success).toBe(true);

    // Invalid unapproved second active milestone
    const unapproved = {
      ...p2,
      milestones: p2.milestones?.map((m) =>
        m.id === m2.id
          ? {
              ...m,
              status: "active" as const,
              isPrimaryActive: false,
              additionalActiveApproval: undefined, // Missing approval
            }
          : m,
      ),
    };

    const invalidResult = validateProject(unapproved);
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error.issues[0]?.message).toContain(
        "Multiple active milestones require explicit approval record",
      );
    }
  });
});
