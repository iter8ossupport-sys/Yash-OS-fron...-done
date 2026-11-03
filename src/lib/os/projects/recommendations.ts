import type {
  EvidenceProvenance,
  Project,
  RecommendedTaskTemplate,
  TaskKind,
} from "../types";

export interface RecommendationContext {
  project: Project;
  priorityBottleneck?: string | undefined;
  reviewBottlenecks?: string[] | undefined;
  availableHours?: number | undefined;
  energy?: "Low" | "Medium" | "High" | undefined;
}

function uid(prefix = "rec"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Evidence-aware task recommendation engine with strict provenance tracking.
 * Distinguishes between project-specific, priority-level, and founder-level evidence.
 * Deterministically handles projects without an active milestone (scoping tasks with milestoneId: undefined).
 */
export function generateEvidenceAwareTaskRecommendations(
  ctx: RecommendationContext,
): RecommendedTaskTemplate[] {
  const {
    project,
    priorityBottleneck,
    reviewBottlenecks,
    energy = "Medium",
  } = ctx;

  const milestones = project.milestones ?? [];
  const primaryMilestone =
    milestones.find((m) => m.isPrimaryActive && m.status === "active") ??
    milestones.find((m) => m.status === "active");

  const activeGoal = (project.goals ?? []).find(
    (g) => g.id === project.activeGoalId && g.status === "active",
  );

  const execPlan = project.executionPlan;
  const pendingDailyOutcomes = (
    execPlan?.currentApproved.outcomes.daily ?? []
  ).filter((o) => o.status === "pending");

  // 1. Gather Provenance Items
  const projectProvenance: EvidenceProvenance[] = [];
  if (project.bottlenecks?.trim()) {
    projectProvenance.push({
      scope: "project",
      sourceType: "project_bottleneck",
      sourceId: `bottleneck-${project.id}`,
      description: project.bottlenecks.trim(),
    });
  }

  const priorityProvenance: EvidenceProvenance[] = [];
  if (priorityBottleneck?.trim()) {
    priorityProvenance.push({
      scope: "priority",
      sourceType: "priority_bottleneck",
      sourceId: `priority-bottleneck-${project.priorityId}`,
      description: priorityBottleneck.trim(),
    });
  }

  const systemProvenance: EvidenceProvenance[] = [];
  if (reviewBottlenecks && reviewBottlenecks.length > 0) {
    reviewBottlenecks.forEach((b, idx) => {
      systemProvenance.push({
        scope: "founder_system",
        sourceType: "review_bottleneck",
        sourceId: `review-bottleneck-${idx}`,
        description: b.trim(),
      });
    });
  }

  const defaultDuration = energy === "Low" ? 45 : energy === "High" ? 90 : 60;
  const taskKind: TaskKind =
    energy === "High"
      ? "validation"
      : energy === "Low"
        ? "simple"
        : "measurable";

  const recommendations: RecommendedTaskTemplate[] = [];

  // =========================================================================
  // CASE A: Project has NO milestones defined
  // =========================================================================
  if (milestones.length === 0) {
    recommendations.push({
      id: uid("rec-scope"),
      projectId: project.id,
      milestoneId: undefined, // Explicitly no invented milestone ID
      title: `Define Milestone 1 & success criteria for ${project.name}`,
      duration: defaultDuration,
      kind: "validation",
      expectedOutput:
        "Documented Milestone 1 with 2+ quantifiable target metrics",
      successCriteria:
        "Milestone 1 objective and deadline recorded in project settings",
      what: "Decompose project objective into a concrete first milestone checkpoint",
      how: "Assess core customer validation needs and establish immediate 2-week target",
      where: "Projects > Goals & Milestones",
      scope: "project_scoping",
      provenance:
        projectProvenance.length > 0 ? projectProvenance : priorityProvenance,
    });

    recommendations.push({
      id: uid("rec-scope"),
      projectId: project.id,
      milestoneId: undefined,
      title: `Draft Project Brief problem statement & user pain thesis`,
      duration: 45,
      kind: "simple",
      expectedOutput:
        "Completed Problem Statement and Ideal Customer Profile in Project Brief",
      successCriteria:
        "Brief document filled with concrete customer quotes or observed friction",
      what: "Clarify the core problem being solved before engineering features",
      how: "Document user interviews, observed workflow pain, or existing manual workarounds",
      where: "Projects > Documents > Project Brief",
      scope: "project_scoping",
      provenance: projectProvenance,
    });

    return recommendations;
  }

  // =========================================================================
  // CASE B: Milestones exist, but NONE is currently active
  // =========================================================================
  if (!primaryMilestone) {
    recommendations.push({
      id: uid("rec-select-ms"),
      projectId: project.id,
      milestoneId: undefined,
      title: `Review milestone progress & activate next milestone for ${project.name}`,
      duration: 30,
      kind: "simple",
      expectedOutput:
        "Formally assessed previous milestone and activated next sequential milestone",
      successCriteria:
        "Next milestone flagged as Primary Active with validated deadline",
      what: "Transition project focus to next milestone stage",
      how: "Review previous milestone deliverables in Project Performance tab and activate next milestone",
      where: "Projects > Goals & Milestones",
      scope: "project_scoping",
      provenance: projectProvenance,
    });

    return recommendations;
  }

  // =========================================================================
  // CASE C: Active Goal exists, but no pending daily outcomes
  // =========================================================================
  if (pendingDailyOutcomes.length === 0) {
    // Generate milestone-execution task directly from primaryMilestone
    recommendations.push({
      id: uid("rec-ms-exec"),
      projectId: project.id,
      milestoneId: primaryMilestone.id,
      title: `Execute deliverable for Milestone: ${primaryMilestone.title}`,
      duration: defaultDuration,
      kind: taskKind,
      expectedOutput: `Tangible deliverable advancing ${primaryMilestone.title}`,
      successCriteria: `Deliverable tested and evidence logged in Evidence & Experiments`,
      what:
        primaryMilestone.objective ||
        `Direct execution on ${primaryMilestone.title}`,
      how: "Focus on highest-leverage engineering or customer experiment",
      where: "Development environment & user testing channel",
      scope: "milestone_execution",
      provenance: [
        ...projectProvenance,
        ...(priorityProvenance.length ? priorityProvenance : []),
      ],
    });

    // If bottlenecks exist, generate a targeted unblocking task
    if (project.bottlenecks?.trim()) {
      recommendations.push({
        id: uid("rec-unblock"),
        projectId: project.id,
        milestoneId: primaryMilestone.id,
        title: `Resolve active bottleneck: ${project.bottlenecks.slice(0, 50)}...`,
        duration: defaultDuration,
        kind: "validation",
        expectedOutput:
          "Root-cause diagnosis and implemented fix or experiment",
        successCriteria:
          "Bottleneck friction eliminated or verified mitigation in place",
        what: `Tackle project bottleneck: ${project.bottlenecks}`,
        how: "Eliminate blocker through targeted refactoring, user call, or constraint removal",
        where: "Codebase or customer channel",
        scope: "milestone_execution",
        provenance: projectProvenance,
      });
    }

    return recommendations;
  }

  // =========================================================================
  // CASE D: Structured Plan Daily Outcomes exist & Milestone is Active
  // =========================================================================
  pendingDailyOutcomes.slice(0, 3).forEach((outcome) => {
    recommendations.push({
      id: uid("rec-outcome"),
      projectId: project.id,
      milestoneId: primaryMilestone.id,
      planOutcomeId: outcome.id,
      title: outcome.text,
      duration: defaultDuration,
      kind: taskKind,
      expectedOutput:
        outcome.successCriteria ||
        `Evidence proving achievement of: ${outcome.text}`,
      successCriteria:
        outcome.successCriteria ||
        "Outcome verified against acceptance criteria",
      what: `Execute daily operational outcome: ${outcome.text}`,
      how: "Execute focused block and record outcome proof upon completion",
      where: "Primary workspace",
      scope: "milestone_execution",
      provenance:
        projectProvenance.length > 0 ? projectProvenance : priorityProvenance,
    });
  });

  return recommendations;
}
