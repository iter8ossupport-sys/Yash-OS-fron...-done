import type {
  DayRecord,
  Metric,
  Milestone,
  MilestoneApprovalRecord,
  MilestoneAssessment,
  OutcomeEvaluationRecord,
  PlanOutcomeItem,
  Project,
  ProjectGoal,
  ProjectGoalStatus,
  ProjectPerformanceSummary,
} from "../types";

/**
 * Generates a unique, collision-resistant identifier.
 */
function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

/**
 * Returns the canonical goals collection for a project.
 * `project.goals` is the authoritative single source of truth;
 * `goalsHistory` is a non-authoritative fallback for pre-v4 structures.
 */
export function getCanonicalGoals(project: Project): ProjectGoal[] {
  return project.goals ?? project.goalsHistory ?? [];
}

/**
 * Pure domain function to add a new goal to a project.
 * If no active goal exists, the new goal becomes active.
 * If an active goal already exists, the new goal is added as pending unless explicitly activated via transition.
 */
export function addProjectGoal(
  project: Project,
  text: string,
  metrics: Metric[] = [],
  targetDeadline?: string,
): { project: Project; goal: ProjectGoal } {
  const now = new Date().toISOString();
  const goals = project.goals ? [...project.goals] : [];

  const hasActive = goals.some((g) => g.status === "active");
  const initialStatus: ProjectGoalStatus = hasActive ? "superseded" : "active";

  const goal: ProjectGoal = {
    id: uid("goal"),
    projectId: project.id,
    text: text.trim(),
    metrics,
    targetDeadline,
    status: initialStatus,
    createdAt: now,
  };

  const updatedGoals = [...goals, goal];
  const activeGoalId = hasActive ? project.activeGoalId : goal.id;

  return {
    goal,
    project: {
      ...project,
      goals: updatedGoals,
      goalsHistory: updatedGoals,
      activeGoalId,
    },
  };
}

/**
 * Pure domain function to explicitly transition an active goal.
 * Never auto-completes; requires an explicit founder decision:
 * - 'achieved': Requires achievementEvidence
 * - 'superseded': Requires transitionReason and optional supersededBy
 * - 'abandoned': Requires transitionReason
 */
export function transitionActiveGoal(
  project: Project,
  decision: {
    type: "achieved" | "superseded" | "abandoned";
    evidence?: string | undefined;
    reason?: string | undefined;
    newGoalText?: string | undefined;
    newGoalMetrics?: Metric[] | undefined;
    newGoalDeadline?: string | undefined;
  },
): {
  project: Project;
  archivedGoal?: ProjectGoal | undefined;
  newGoal?: ProjectGoal | undefined;
} {
  const now = new Date().toISOString();
  const goals = project.goals ? [...project.goals] : [];

  const activeIdx = goals.findIndex((g) => g.id === project.activeGoalId);
  let archivedGoal: ProjectGoal | undefined;

  let newGoal: ProjectGoal | undefined;
  if (decision.newGoalText && decision.newGoalText.trim().length >= 3) {
    newGoal = {
      id: uid("goal"),
      projectId: project.id,
      text: decision.newGoalText.trim(),
      metrics: decision.newGoalMetrics ?? [],
      targetDeadline: decision.newGoalDeadline,
      status: "active",
      createdAt: now,
    };
  }

  if (activeIdx !== -1) {
    const current = goals[activeIdx]!;
    archivedGoal = {
      ...current,
      status: decision.type,
      resolvedAt: now,
      achievementEvidence:
        decision.type === "achieved"
          ? decision.evidence?.trim() || "Verified by founder"
          : undefined,
      transitionReason:
        decision.type !== "achieved"
          ? decision.reason?.trim() || "Superseded by founder decision"
          : undefined,
      supersededBy: decision.type === "superseded" ? newGoal?.id : undefined,
    };
    goals[activeIdx] = archivedGoal;
  }

  if (newGoal) {
    goals.push(newGoal);
  }

  const updatedActiveGoalId = newGoal
    ? newGoal.id
    : goals.find((g) => g.status === "active")?.id;

  return {
    archivedGoal,
    newGoal,
    project: {
      ...project,
      goals,
      goalsHistory: goals,
      activeGoalId: updatedActiveGoalId,
    },
  };
}

/**
 * Adds a new milestone to a project in sequential order.
 */
export function addMilestone(
  project: Project,
  data: {
    title: string;
    objective?: string;
    metrics?: Metric[];
    deadline?: string;
    isPrimaryActive?: boolean;
    additionalActiveApproval?: MilestoneApprovalRecord;
  },
): { project: Project; milestone: Milestone } {
  const now = new Date().toISOString();
  const milestones = project.milestones ? [...project.milestones] : [];
  const nextOrder = milestones.length + 1;

  const hasPrimaryActive = milestones.some(
    (m) => m.isPrimaryActive && m.status === "active",
  );
  const shouldBePrimary = data.isPrimaryActive ?? !hasPrimaryActive;

  const milestone: Milestone = {
    id: uid("ms"),
    projectId: project.id,
    title: data.title.trim(),
    objective: data.objective?.trim() || "",
    metrics: data.metrics ?? [],
    deadline: data.deadline || "",
    status: "active",
    order: nextOrder,
    isPrimaryActive: shouldBePrimary,
    additionalActiveApproval: data.additionalActiveApproval,
    assessmentHistory: [],
    createdAt: now,
  };

  const updatedMilestones = milestones.map((m) =>
    shouldBePrimary ? { ...m, isPrimaryActive: false } : m,
  );
  updatedMilestones.push(milestone);

  return {
    milestone,
    project: {
      ...project,
      milestones: updatedMilestones,
      milestone: shouldBePrimary ? milestone.title : project.milestone,
    },
  };
}

/**
 * Formal assessment of a milestone against success criteria, metrics, and evidence.
 * Task completion never auto-completes milestones.
 */
export function assessMilestone(
  project: Project,
  milestoneId: string,
  assessmentData: {
    status: "completed" | "blocked" | "abandoned" | "active";
    actualMetrics: Metric[];
    actualResultsSummary: string;
    evidenceReferences: string[];
    founderNotes: string;
    systemRecommendation?:
      "recommended_completed" | "recommended_blocked" | "needs_review";
  },
): { project: Project; assessment: MilestoneAssessment } {
  const now = new Date().toISOString();
  const milestones = project.milestones ? [...project.milestones] : [];

  const msIndex = milestones.findIndex((m) => m.id === milestoneId);
  if (msIndex === -1) {
    throw new Error(
      `Milestone ${milestoneId} not found in project ${project.id}`,
    );
  }

  const targetMs = milestones[msIndex]!;
  const assessment: MilestoneAssessment = {
    id: uid("eval-ms"),
    milestoneId: targetMs.id,
    assessedAt: now,
    assessedBy: "founder",
    status: assessmentData.status,
    actualMetrics: assessmentData.actualMetrics,
    actualResultsSummary: assessmentData.actualResultsSummary.trim(),
    evidenceReferences: assessmentData.evidenceReferences,
    founderNotes: assessmentData.founderNotes.trim(),
    systemRecommendation: assessmentData.systemRecommendation,
  };

  const updatedMs: Milestone = {
    ...targetMs,
    status: assessmentData.status,
    completedAt:
      assessmentData.status === "completed"
        ? targetMs.completedAt || now
        : undefined,
    currentAssessment: assessment,
    assessmentHistory: [...(targetMs.assessmentHistory ?? []), assessment],
  };

  milestones[msIndex] = updatedMs;

  return {
    assessment,
    project: {
      ...project,
      milestones,
    },
  };
}

/**
 * Sets a milestone as primary active with concurrency governance.
 * If another milestone is active, requires a MilestoneApprovalRecord.
 */
export function setPrimaryActiveMilestone(
  project: Project,
  milestoneId: string,
  approval?: MilestoneApprovalRecord,
): Project {
  const milestones = (project.milestones ?? []).map((m) => {
    if (m.id === milestoneId) {
      return {
        ...m,
        status: "active" as const,
        isPrimaryActive: true,
        additionalActiveApproval: approval,
      };
    }
    // Any other active milestone loses primary flag
    return {
      ...m,
      isPrimaryActive: false,
    };
  });

  const active = milestones.find((m) => m.id === milestoneId);

  return {
    ...project,
    milestones,
    milestone: active?.title || project.milestone,
  };
}

/**
 * Evaluates a daily outcome against its success criteria and recorded task output evidence.
 * Operates on the authoritative `project.executionPlan`.
 */
export function evaluateDailyOutcome(
  project: Project,
  outcomeId: string,
  evalData: {
    status: "pending" | "achieved" | "missed";
    actualEvidenceSummary: string;
    linkedTaskOutputs: {
      taskId: string;
      taskTitle: string;
      output?: Record<string, string> | undefined;
      elapsedMinutes: number;
    }[];
    founderNotes?: string | undefined;
  },
): { project: Project; record: OutcomeEvaluationRecord } {
  const now = new Date().toISOString();
  const execPlan = project.executionPlan;
  if (!execPlan) {
    throw new Error(
      `Project ${project.id} does not have an active execution plan`,
    );
  }

  const dailyOutcomes = execPlan.currentApproved.outcomes.daily ?? [];
  const targetIndex = dailyOutcomes.findIndex((o) => o.id === outcomeId);
  if (targetIndex === -1) {
    throw new Error(
      `Daily outcome ${outcomeId} not found in project ${project.id}`,
    );
  }

  const targetOutcome = dailyOutcomes[targetIndex]!;

  const record: OutcomeEvaluationRecord = {
    id: uid("eval-out"),
    outcomeId: targetOutcome.id,
    evaluatedAt: now,
    status: evalData.status,
    evaluatedBy: "founder",
    successCriteria: targetOutcome.successCriteria,
    actualEvidenceSummary: evalData.actualEvidenceSummary.trim(),
    linkedTaskOutputs: evalData.linkedTaskOutputs,
    founderNotes: evalData.founderNotes?.trim(),
  };

  const updatedOutcome: PlanOutcomeItem = {
    ...targetOutcome,
    status: evalData.status,
    evidenceNotes: evalData.actualEvidenceSummary.trim(),
    evaluations: [...(targetOutcome.evaluations ?? []), record],
  };

  const updatedDaily = [...dailyOutcomes];
  updatedDaily[targetIndex] = updatedOutcome;

  const updatedExecPlan = {
    ...execPlan,
    currentApproved: {
      ...execPlan.currentApproved,
      outcomes: {
        ...execPlan.currentApproved.outcomes,
        daily: updatedDaily,
      },
    },
  };

  return {
    record,
    project: {
      ...project,
      executionPlan: updatedExecPlan,
    },
  };
}

/**
 * Approves a proposed plan revision, updating `currentApproved` while leaving `originalBaseline` immutable.
 */
export function approvePlanRevision(
  project: Project,
  revisionId: string,
  approvedBy = "founder",
): Project {
  const now = new Date().toISOString();
  const execPlan = project.executionPlan;
  if (!execPlan) return project;

  const revIndex = execPlan.proposedRevisions.findIndex(
    (r) => r.id === revisionId,
  );
  if (revIndex === -1) return project;

  const revision = execPlan.proposedRevisions[revIndex]!;
  if (revision.status !== "proposed") return project;

  const updatedRevisions = [...execPlan.proposedRevisions];
  updatedRevisions[revIndex] = {
    ...revision,
    status: "approved",
    approvedAt: now,
    approvedBy,
  };

  const nextVersion = execPlan.currentApproved.version + 1;
  const updatedApproved = {
    version: nextVersion,
    approvedAt: now,
    outcomes: revision.snapshot.outcomes,
    recommendedTasks: revision.snapshot.recommendedTasks,
  };

  return {
    ...project,
    executionPlan: {
      ...execPlan,
      currentApproved: updatedApproved,
      proposedRevisions: updatedRevisions,
    },
  };
}

/**
 * Calculates multi-dimensional performance summary without relying on raw task completion percentage alone.
 */
export function calculateProjectPerformance(
  project: Project,
  history: DayRecord[],
): ProjectPerformanceSummary {
  // 1. Gather all tasks completed for this project across all day records
  const projectTasks = history.flatMap((h) =>
    (h.taskSnapshots ?? [])
      .filter((t) => t.projectId === project.id)
      .map((t) => ({ ...t, date: h.date })),
  );

  const plannedTotal = projectTasks.length;
  const doneTotal = projectTasks.filter((t) => t.status === "done").length;
  const completionRate =
    plannedTotal > 0 ? Math.round((doneTotal / plannedTotal) * 100) : 0;

  const totalActualMinutes = projectTasks
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + (t.durationActualMin || 0), 0);
  const totalPlannedMinutes = projectTasks.reduce(
    (sum, t) => sum + (t.durationPlannedMin || 0),
    0,
  );

  // 2. Gather outputs associated with this project
  const outputs = history.flatMap((h) =>
    (h.outputs ?? [])
      .filter((o) => o.priorityId === project.priorityId)
      .map((o) => ({
        date: h.date,
        title: o.title,
        text: o.text,
        workstream: o.workstream,
      })),
  );

  const activeDates = Array.from(
    new Set(projectTasks.map((t) => t.date)),
  ).sort();

  return {
    projectId: project.id,
    totalActualHours: +(totalActualMinutes / 60).toFixed(1),
    totalPlannedHours: +(totalPlannedMinutes / 60).toFixed(1),
    tasksPlannedTotal: plannedTotal,
    tasksDoneTotal: doneTotal,
    taskCompletionRate: completionRate,
    outputsCount: outputs.length,
    outputs,
    activeDaysCount: activeDates.length,
    firstActiveDate: activeDates[0],
    lastActiveDate: activeDates[activeDates.length - 1],
  };
}
