import { createDefaultLegalComplianceDoc } from "./reviews/migrations";
import { evaluateDailyOutcome } from "./projects/logic";
import type {
  DayRecord,
  OSState,
  Plan,
  PriorityId,
  Project,
  ProjectDoc,
  ProjectDocument,
  StructuredExecutionPlan,
  Task,
  TradingOperatingProfile,
  FinancialTransitionPlan,
  TradingStrategy,
  TradingSystem,
  TradingAccount,
  TradingExecutionRecord,
  FinancialPerformanceRecord,
  TradingRiskIncident,
  TradingDevelopmentStage,
  LegalComplianceContent,
} from "./types";

export const elapsed = (t: Task, now = Date.now()) =>
  t.elapsedMs +
  (t.status === "active" && t.startedAt != null ? now - t.startedAt : 0);

export const selectedTasks = (p: Plan | null) =>
  p ? p.tasks.filter((t) => t.selected) : [];

export const plannedMinutes = (p: Plan | null) =>
  selectedTasks(p).reduce((s, t) => s + t.duration, 0);

const mapTask = (s: OSState, id: string, fn: (t: Task) => Task): OSState =>
  s.plan
    ? {
        ...s,
        plan: {
          ...s.plan,
          tasks: s.plan.tasks.map((t) => (t.id === id ? fn(t) : t)),
        },
      }
    : s;

const pauseT = (t: Task, now: number): Task =>
  t.status === "active"
    ? {
        ...t,
        status: "paused",
        elapsedMs: elapsed(t, now),
        startedAt: undefined,
      }
    : t;

/** Approving saves the plan but never starts a task. */
export function approvePlan(s: OSState, now = new Date()): OSState {
  if (!s.draft) return s;
  const plan: Plan = {
    ...s.draft,
    tasks: s.draft.tasks.map((t) => ({
      ...t,
      status: "pending",
      elapsedMs: 0,
      startedAt: undefined,
    })),
    approvedAt: now.toISOString(),
  };
  return {
    ...s,
    plan,
    draft: null,
    draftStage: 1,
    activeTaskId: null,
    interruptedTaskId: null,
  };
}

/** Start/resume a task; any other running task is paused (only one active at a time). */
export function startTask(s: OSState, id: string, now = Date.now()): OSState {
  if (!s.plan) return s;
  const tasks = s.plan.tasks.map((t) =>
    t.id === id
      ? t.status === "done"
        ? t
        : { ...t, status: "active" as const, startedAt: now }
      : pauseT(t, now),
  );
  return { ...s, plan: { ...s.plan, tasks }, activeTaskId: id };
}

export function pauseTask(s: OSState, id: string, now = Date.now()): OSState {
  return mapTask(s, id, (t) => pauseT(t, now));
}

export function finishTask(
  s: OSState,
  id: string,
  output: Record<string, string> = {},
  outcomeAchieved = false,
  now = Date.now(),
): OSState {
  const next = mapTask(s, id, (t) => ({
    ...t,
    status: "done",
    elapsedMs: elapsed(t, now),
    startedAt: undefined,
    output,
    outcomeAchieved,
  }));
  return {
    ...next,
    activeTaskId: next.activeTaskId === id ? null : next.activeTaskId,
  };
}

/** Emergency switch: pause current task, preserving its time/output, and remember it. */
export function emergencyPause(s: OSState, now = Date.now()): OSState {
  if (!s.activeTaskId) return s;
  const next = pauseTask(s, s.activeTaskId, now);
  return { ...next, interruptedTaskId: s.activeTaskId, activeTaskId: null };
}

export function moveTask(s: OSState, id: string, dir: -1 | 1): OSState {
  if (!s.plan) return s;
  const tasks = [...s.plan.tasks];
  const sel = tasks.filter((t) => t.selected);
  const i = sel.findIndex((t) => t.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sel.length) return s;
  const a = tasks.indexOf(sel[i]!);
  const b = tasks.indexOf(sel[j]!);
  [tasks[a], tasks[b]] = [tasks[b]!, tasks[a]!];
  return { ...s, plan: { ...s.plan, tasks } };
}

export function buildDayRecord(
  p: Plan,
  learning: string,
  now = Date.now(),
): DayRecord {
  const sel = selectedTasks(p);
  const z = (): Record<PriorityId, number> => ({ 1: 0, 2: 0, 3: 0 });
  const plannedMin = z();
  const actualMin = z();
  sel.forEach((t) => {
    plannedMin[t.priorityId] += t.duration;
    actualMin[t.priorityId] += Math.round(elapsed(t, now) / 60000);
  });
  const done = sel.filter((t) => t.status === "done");

  // Priority 2 Workstream A vs B minute breakdown
  let p2WorkstreamAMin = 0;
  let p2WorkstreamBMin = 0;
  done
    .filter((t) => t.priorityId === 2)
    .forEach((t) => {
      const ws = t.output?.["Workstream"];
      const min = Math.round(elapsed(t, now) / 60000);
      if (ws === "Fintech Product Capability" || ws === "B") {
        p2WorkstreamBMin += min;
      } else {
        p2WorkstreamAMin += min;
      }
    });

  const taskSnapshots = sel.map((t) => ({
    id: `snap-${t.id}`,
    taskId: t.id,
    priorityId: t.priorityId,
    title: t.title,
    durationPlannedMin: t.duration,
    durationActualMin: Math.round(elapsed(t, now) / 60000),
    kind: t.kind,
    status: (t.status === "done" ? "done" : "unfinished") as
      "done" | "unfinished",
    expectedOutput: t.expectedOutput,
    actualOutput: t.output,
    outcomeAchieved: Boolean(t.outcomeAchieved),
    workstream: t.output?.["Workstream"],
    where: t.where,
    timeBlock: t.timeBlock,
  }));

  return {
    date: p.context.date,
    plannedMin,
    actualMin,
    tasksDone: done.length,
    tasksPlanned: sel.length,
    outputs: done
      .filter((t) => t.output && Object.values(t.output).some(Boolean))
      .map((t) => {
        const ws = t.output?.["Workstream"];
        const entries = Object.entries(t.output!).filter(
          ([k, v]) => Boolean(v) && k !== "Workstream",
        );
        return {
          title: t.title,
          priorityId: t.priorityId,
          text: entries.length
            ? entries.map(([k, v]) => `${k}: ${v}`).join(" · ")
            : Object.values(t.output!).filter(Boolean).join(" · "),
          workstream: ws,
        };
      }),
    outcomesAchieved: ([1, 2, 3] as PriorityId[]).filter((id) =>
      done.some((t) => t.priorityId === id && t.outcomeAchieved),
    ),
    unfinished: sel.filter((t) => t.status !== "done").map((t) => t.title),
    learning,
    state: "finalized",
    source: "closeout",
    dayType: p.context.dayType,
    availableHours: p.context.hours,
    energy: p.context.energy,
    p2WorkstreamMinutes: {
      workstreamA: p2WorkstreamAMin,
      workstreamB: p2WorkstreamBMin,
    },
    taskSnapshots,
    finalizedAt: new Date(now).toISOString(),
  };
}

export interface OutcomeEvaluationPayload {
  projectId: string;
  outcomeId: string;
  status: "pending" | "achieved" | "missed";
  actualEvidenceSummary: string;
  founderNotes?: string | undefined;
}

export function closeDay(
  s: OSState,
  learning: string,
  now = Date.now(),
  outcomeEvaluations?: OutcomeEvaluationPayload[] | undefined,
): OSState {
  if (!s.plan) return s;
  let rec = buildDayRecord(s.plan, learning, now);

  let updatedProjects = s.projects;

  // Apply outcome evaluations to authoritative projects
  if (outcomeEvaluations && outcomeEvaluations.length > 0) {
    const doneTasks = s.plan.tasks.filter(
      (t) => t.selected && t.status === "done",
    );
    for (const evalPayload of outcomeEvaluations) {
      const projIdx = updatedProjects.findIndex(
        (p) => p.id === evalPayload.projectId,
      );
      if (projIdx !== -1 && updatedProjects[projIdx]?.executionPlan) {
        const proj = updatedProjects[projIdx]!;
        const linkedTasks = doneTasks
          .filter((t) => t.projectId === proj.id)
          .map((t) => ({
            taskId: t.id,
            taskTitle: t.title,
            output: t.output,
            elapsedMinutes: Math.round(t.elapsedMs / 60000),
          }));

        const { project: evaluatedProj } = evaluateDailyOutcome(
          proj,
          evalPayload.outcomeId,
          {
            status: evalPayload.status,
            actualEvidenceSummary: evalPayload.actualEvidenceSummary,
            linkedTaskOutputs: linkedTasks,
            founderNotes: evalPayload.founderNotes,
          },
        );

        updatedProjects = [
          ...updatedProjects.slice(0, projIdx),
          evaluatedProj,
          ...updatedProjects.slice(projIdx + 1),
        ];
      }
    }

    const evaluatedAchievedPIds = outcomeEvaluations
      .filter((e) => e.status === "achieved")
      .map((e) => updatedProjects.find((p) => p.id === e.projectId)?.priorityId)
      .filter((id): id is PriorityId => id !== undefined);

    const evaluatedNonAchievedPIds = outcomeEvaluations
      .filter((e) => e.status !== "achieved")
      .map((e) => updatedProjects.find((p) => p.id === e.projectId)?.priorityId)
      .filter((id): id is PriorityId => id !== undefined);

    const adjustedOutcomes = Array.from(
      new Set([
        ...rec.outcomesAchieved.filter(
          (id) => !evaluatedNonAchievedPIds.includes(id),
        ),
        ...evaluatedAchievedPIds,
      ]),
    );

    rec = {
      ...rec,
      outcomesAchieved: adjustedOutcomes,
    };
  }

  return {
    ...s,
    projects: updatedProjects,
    history: [...s.history.filter((h) => h.date !== rec.date), rec],
    plan: null,
    activeTaskId: null,
    interruptedTaskId: null,
  };
}

/**
 * Ensures priorities stay in 100% sync with their active project records.
 * Resolves missing, renamed, reassigned, or deleted projects safely.
 */
export function syncPrioritiesWithProjects(s: OSState): OSState {
  const projects = s.projects ?? [];
  const priorities = (s.priorities ?? []).map((p) => {
    // 1. If activeProjectId is set, look up the referenced project
    let activeProj = p.activeProjectId
      ? projects.find((x) => x.id === p.activeProjectId)
      : undefined;

    // If activeProj exists but was reassigned to a different priority, it cannot remain active for this priority
    if (activeProj && activeProj.priorityId !== p.id) {
      activeProj = undefined;
    }

    // 2. If no valid activeProj yet (or activeProjectId missing/invalid/deleted), attempt fallback lookup:
    if (!activeProj) {
      // First try matching by project name within this priority
      if (p.project) {
        activeProj = projects.find(
          (x) =>
            x.priorityId === p.id &&
            x.name.toLowerCase() === p.project.toLowerCase(),
        );
      }
      // Next try the first project marked active under this priority
      if (!activeProj) {
        activeProj = projects.find(
          (x) => x.priorityId === p.id && x.status === "active",
        );
      }
      // Next try any project assigned to this priority
      if (!activeProj) {
        activeProj = projects.find((x) => x.priorityId === p.id);
      }
    }

    if (activeProj) {
      return {
        ...p,
        activeProjectId: activeProj.id,
        project: activeProj.name,
        milestone: activeProj.milestone || "",
        bottleneck: activeProj.bottlenecks || p.bottleneck || "",
        status:
          activeProj.status === "active"
            ? "Active"
            : activeProj.status === "paused"
              ? "Paused"
              : activeProj.status,
      };
    }

    // Safe empty state when no project exists for this priority
    return {
      ...p,
      activeProjectId: undefined,
      project: "",
      milestone: "",
      bottleneck: "",
      status: "No active project",
    };
  });

  return { ...s, priorities };
}

/**
 * Sets the active project for a given priority.
 * Updates priority's activeProjectId, project name, milestone, bottleneck, status.
 */
export function setActiveProject(
  s: OSState,
  priorityId: PriorityId,
  projectId: string | null,
): OSState {
  const priorities = s.priorities.map((p) => {
    if (p.id !== priorityId) return p;
    if (!projectId) {
      return {
        ...p,
        activeProjectId: undefined,
        project: "",
        milestone: "",
        bottleneck: "",
        status: "No active project",
      };
    }
    const proj = s.projects.find(
      (x) => x.id === projectId && x.priorityId === priorityId,
    );
    if (!proj) return p;
    return {
      ...p,
      activeProjectId: proj.id,
      project: proj.name,
      milestone: proj.milestone,
      bottleneck: proj.bottlenecks || p.bottleneck,
      status: proj.status === "active" ? "Active" : proj.status,
    };
  });

  return syncPrioritiesWithProjects({ ...s, priorities });
}

/**
 * Saves a project (new or edited), handling renaming, milestone changes, and reassignment.
 * Reassignment rule:
 * - If reassigned from Priority A to Priority B:
 *   - Priority A clears its activeProjectId if this project was active.
 *   - Priority B only adopts this project as active if Priority B currently has NO active project (does NOT overwrite).
 */
/**
 * Ensures Priority 2 Workstream B projects have Document 6 (Legal & Compliance) initialized.
 * Guaranteed: NEVER adds Document 6 to Workstream A or Priority 1 or 3 projects.
 */
/**
 * Ensures all standardized documents (Documents 1–5, and Document 6 for Workstream B)
 * are initialized, functional, and consistent with the project's canonical state.
 * - Doc 1: Project Brief (flexible markdown)
 * - Doc 2: Structured Execution Plan (authoritative structured plan and doc navigation handle)
 * - Doc 3: Evidence & Experiments (market evidence, customer validation)
 * - Doc 4: Decisions & History (ADRs, pivots, rationale)
 * - Doc 5: Methods & Knowledge (SOPs, playbooks)
 * - Doc 6: Legal & Compliance (Fintech Workstream B ONLY; strictly stripped for Workstream A and others)
 */
export function ensureCanonicalProjectDocuments(project: Project): Project {
  const now = new Date().toISOString();
  const createdAt = project.createdAt || now;
  const docs = (project.docs ? [...project.docs] : []) as (
    ProjectDoc | ProjectDocument
  )[];

  // Helper to find document by type
  const findDocIndex = (type: string) =>
    docs.findIndex((d) => "type" in d && (d as ProjectDocument).type === type);

  // 1. Ensure Doc 1: Project Brief
  const briefIdx = findDocIndex("project_brief");
  if (briefIdx < 0) {
    const briefContent =
      project.objective || project.hypothesis
        ? `# ${project.name} — Project Brief\n\n## Objective\n${project.objective || "Not specified"}\n\n## Core Hypothesis\n${project.hypothesis || "Not specified"}\n`
        : `# ${project.name} — Project Brief\n\n## Objective\nDefine project objective and thesis.\n\n## Target Outcome\nDefine target customers and expected results.\n`;
    docs.unshift({
      id: `doc-brief-${project.id}`,
      projectId: project.id,
      type: "project_brief",
      title: "Project Brief",
      content: briefContent,
      flexibleContent: { markdown: briefContent },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // 2. Ensure Doc 2: Structured Execution Plan and project.executionPlan
  let executionPlan = project.executionPlan;
  const activeMilestones = (project.milestones ?? []).filter(
    (m) => m.status === "active" || m.isPrimaryActive,
  );
  const activeGoalText =
    project.goals?.find((g) => g.id === project.activeGoalId)?.text ||
    project.objective ||
    "Core execution plan";

  if (!executionPlan) {
    executionPlan = {
      projectId: project.id,
      activeGoalId:
        project.activeGoalId ??
        (project.goals?.[0]?.id || `goal-${project.id}`),
      activeMilestoneIds: activeMilestones.map((m) => m.id),
      originalBaseline: {
        setAt: createdAt,
        goalSnapshotText: activeGoalText,
        milestoneTitles: activeMilestones.map((m) => m.title),
        outcomes: { monthly: [], weekly: [], daily: [] },
      },
      currentApproved: {
        version: 1,
        approvedAt: createdAt,
        outcomes: { monthly: [], weekly: [], daily: [] },
        recommendedTasks: [],
      },
      proposedRevisions: [],
    };
  }

  const planDocIdx = findDocIndex("execution_plan");
  if (planDocIdx < 0) {
    docs.push({
      id: `doc-plan-${project.id}`,
      projectId: project.id,
      type: "execution_plan",
      title: "Execution Plan",
      content: `Authoritative Structured Execution Plan v${executionPlan.currentApproved.version}`,
      version: executionPlan.currentApproved.version,
      createdAt,
      updatedAt: now,
    });
  }

  // 3. Ensure Doc 3: Evidence & Experiments
  const evidenceIdx = findDocIndex("evidence_experiments");
  if (evidenceIdx < 0) {
    const evidenceContent = project.evidence
      ? `## Recorded Evidence\n\n${project.evidence}\n`
      : "## Evidence & Experiments\n\nDocument customer interview notes, pilot usage data, conversion proof, and LOIs.\n";
    docs.push({
      id: `doc-evidence-${project.id}`,
      projectId: project.id,
      type: "evidence_experiments",
      title: "Evidence & Experiments",
      content: evidenceContent,
      flexibleContent: { markdown: evidenceContent },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // 4. Ensure Doc 4: Decisions & History
  const decisionsIdx = findDocIndex("decisions_history");
  if (decisionsIdx < 0) {
    const decisionsContent = project.decisions
      ? `## Historical Decisions\n\n${project.decisions}\n`
      : "## Decisions & History\n\nArchitectural decision records (ADRs), pricing models, and strategic rationale.\n";
    docs.push({
      id: `doc-decisions-${project.id}`,
      projectId: project.id,
      type: "decisions_history",
      title: "Decisions & History",
      content: decisionsContent,
      flexibleContent: { markdown: decisionsContent },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // 5. Ensure Doc 5: Methods & Knowledge
  const methodsIdx = findDocIndex("methods_knowledge");
  if (methodsIdx < 0) {
    const methodsContent = project.learning
      ? `## Methods & Execution Lessons\n\n${project.learning}\n`
      : "## Methods & Knowledge\n\nRepeatable execution playbooks, SOPs, and domain knowledge distilled from shipping.\n";
    docs.push({
      id: `doc-methods-${project.id}`,
      projectId: project.id,
      type: "methods_knowledge",
      title: "Methods & Knowledge",
      content: methodsContent,
      flexibleContent: { markdown: methodsContent },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // 6. Ensure Doc 6: Legal & Compliance (Priority 2 Workstream B ONLY)
  let complianceContent = project.complianceContent;
  if (project.priorityId === 2 && project.workstream === "B") {
    const complianceDocIdx = findDocIndex("legal_compliance");
    if (complianceDocIdx < 0) {
      const defaultDoc = createDefaultLegalComplianceDoc(project.id, createdAt);
      docs.push(defaultDoc);
      complianceContent = defaultDoc.complianceContent;
    } else {
      const existingDoc = docs[complianceDocIdx] as ProjectDocument;
      if (!complianceContent && existingDoc.complianceContent) {
        complianceContent = existingDoc.complianceContent;
      }
    }
  } else {
    // Strictly strip Document 6 if NOT Priority 2 Workstream B
    const filteredDocs = docs.filter(
      (d) =>
        !("type" in d && (d as ProjectDocument).type === "legal_compliance"),
    );
    return {
      ...project,
      executionPlan,
      complianceContent: undefined,
      docs: filteredDocs,
    };
  }

  return {
    ...project,
    executionPlan,
    complianceContent,
    docs,
  };
}

export const ensureWorkstreamBDocuments = ensureCanonicalProjectDocuments;
export function saveProject(s: OSState, rawProject: Project): OSState {
  let project = rawProject;
  if (rawProject.priorityId === 2 && rawProject.workstream === "B") {
    project = ensureWorkstreamBDocuments(rawProject);
  } else {
    const filteredDocs = rawProject.docs?.filter(
      (d) => !("type" in d && d.type === "legal_compliance"),
    );
    project = {
      ...rawProject,
      complianceContent: undefined,
      docs: filteredDocs,
    };
  }
  const existing = s.projects.find((x) => x.id === project.id);
  const isReassigned = existing && existing.priorityId !== project.priorityId;
  const oldPriorityId = existing?.priorityId;

  // Update or insert project
  const updatedProjects = existing
    ? s.projects.map((x) =>
        x.id === project.id ? { ...project, demo: false } : x,
      )
    : [...s.projects, { ...project, demo: false }];

  let priorities = [...s.priorities];

  if (isReassigned && oldPriorityId) {
    // If it was active on old priority, clear reference from old priority
    priorities = priorities.map((p) => {
      if (p.id === oldPriorityId && p.activeProjectId === project.id) {
        return { ...p, activeProjectId: undefined };
      }
      return p;
    });

    // For new priority: only assign as active if new priority currently has NO active project
    const newPriority = priorities.find((p) => p.id === project.priorityId);
    const newPriorityHasActive =
      newPriority?.activeProjectId &&
      updatedProjects.some(
        (x) =>
          x.id === newPriority.activeProjectId &&
          x.priorityId === project.priorityId,
      );

    if (!newPriorityHasActive && project.status === "active") {
      priorities = priorities.map((p) => {
        if (p.id === project.priorityId) {
          return {
            ...p,
            activeProjectId: project.id,
            project: project.name,
            milestone: project.milestone,
            bottleneck: project.bottlenecks || p.bottleneck,
            status: "Active",
          };
        }
        return p;
      });
    }
  }

  // If this project is currently the active project for its priority, keep priority fields in sync
  const targetPriority = priorities.find((p) => p.id === project.priorityId);
  if (targetPriority?.activeProjectId === project.id) {
    priorities = priorities.map((p) => {
      if (p.id === project.priorityId) {
        return {
          ...p,
          project: project.name,
          milestone: project.milestone,
          bottleneck: project.bottlenecks || p.bottleneck,
          status:
            project.status === "active"
              ? "Active"
              : project.status === "paused"
                ? "Paused"
                : project.status,
        };
      }
      return p;
    });
  }

  return syncPrioritiesWithProjects({
    ...s,
    projects: updatedProjects,
    priorities,
  });
}

/**
 * Deletes a project by id.
 * Removes active reference from associated priority and safely resets or falls back.
 * Preserves all unrelated projects and execution history.
 */
export function deleteProject(s: OSState, projectId: string): OSState {
  const updatedProjects = s.projects.filter((x) => x.id !== projectId);

  // Clear activeProjectId if it was this project
  const priorities = s.priorities.map((p) => {
    if (p.activeProjectId === projectId) {
      return { ...p, activeProjectId: undefined };
    }
    return p;
  });

  // Clear dangling reference in knowledge items if any
  const knowledge = s.knowledge.map((k) =>
    k.projectId === projectId ? { ...k, projectId: undefined } : k,
  );

  return syncPrioritiesWithProjects({
    ...s,
    projects: updatedProjects,
    priorities,
    knowledge,
  });
}

export {
  correctDayRecord,
  addImprovement,
  updateImprovement,
  addOrUpdateBottleneck,
  resolveBottleneck,
  updateReviewSettings,
} from "./reviews/operations";

/**
 * Updates the Trading Operating Profile (Doc 1) on the consolidated TradingOperation.
 */
export function updateTradingOperatingProfile(
  s: OSState,
  profileUpdates: Partial<TradingOperatingProfile>,
): OSState {
  if (!s.tradingOperation) return s;
  const current = s.tradingOperation.operatingProfile;
  const updatedProfile: TradingOperatingProfile = {
    ...current,
    ...profileUpdates,
    riskRules: {
      ...current.riskRules,
      ...(profileUpdates.riskRules ?? {}),
    },
    routines: {
      ...current.routines,
      ...(profileUpdates.routines ?? {}),
    },
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
  };

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      operatingProfile: updatedProfile,
      currentStage:
        updatedProfile.developmentStage ?? s.tradingOperation.currentStage,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Updates the Financial & Transition Plan (Doc 2) on the consolidated TradingOperation.
 */
export function updateFinancialTransitionPlan(
  s: OSState,
  planUpdates: Partial<FinancialTransitionPlan>,
): OSState {
  if (!s.tradingOperation) return s;
  const current = s.tradingOperation.financialPlan;
  const updatedPlan: FinancialTransitionPlan = {
    ...current,
    ...planUpdates,
    cashAllocationPolicy: {
      livingExpensesPercent: 40,
      startupReinvestmentPercent: 30,
      capitalBufferPercent: 20,
      taxReservePercent: 10,
      ...(current.cashAllocationPolicy ?? {}),
      ...(planUpdates.cashAllocationPolicy ?? {}),
    },
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
  };

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      financialPlan: updatedPlan,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Adds or updates a Trading Strategy on TradingOperation.
 */
export function saveTradingStrategy(
  s: OSState,
  strategy: TradingStrategy,
): OSState {
  if (!s.tradingOperation) return s;
  const strategies = s.tradingOperation.strategies ?? [];
  const exists = strategies.some((x) => x.id === strategy.id);
  const updated = exists
    ? strategies.map((x) => (x.id === strategy.id ? strategy : x))
    : [...strategies, strategy];

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      strategies: updated,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Deletes a Trading Strategy and flags or dissociates child systems.
 */
export function deleteTradingStrategy(s: OSState, strategyId: string): OSState {
  if (!s.tradingOperation) return s;
  const strategies = (s.tradingOperation.strategies ?? []).filter(
    (x) => x.id !== strategyId,
  );
  const systems = (s.tradingOperation.systems ?? []).map((sys) =>
    sys.strategyId === strategyId ? { ...sys, strategyId: "" } : sys,
  );

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      strategies,
      systems,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Adds or updates a Trading System linked to a strategy.
 */
export function saveTradingSystem(s: OSState, system: TradingSystem): OSState {
  if (!s.tradingOperation) return s;
  const systems = s.tradingOperation.systems ?? [];
  const exists = systems.some((x) => x.id === system.id);
  const updated = exists
    ? systems.map((x) => (x.id === system.id ? system : x))
    : [...systems, system];

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      systems: updated,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Deletes a Trading System.
 */
export function deleteTradingSystem(s: OSState, systemId: string): OSState {
  if (!s.tradingOperation) return s;
  const systems = (s.tradingOperation.systems ?? []).filter(
    (x) => x.id !== systemId,
  );

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      systems,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Adds or updates a Trading Account.
 */
export function saveTradingAccount(
  s: OSState,
  account: TradingAccount,
): OSState {
  if (!s.tradingOperation) return s;
  const accounts = s.tradingOperation.accounts ?? [];
  const exists = accounts.some((x) => x.id === account.id);
  const updated = exists
    ? accounts.map((x) => (x.id === account.id ? account : x))
    : [...accounts, account];

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      accounts: updated,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Deletes a Trading Account.
 */
export function deleteTradingAccount(s: OSState, accountId: string): OSState {
  if (!s.tradingOperation) return s;
  const accounts = (s.tradingOperation.accounts ?? []).filter(
    (x) => x.id !== accountId,
  );

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      accounts,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Records a daily trading execution record.
 */
export function recordTradingSession(
  s: OSState,
  sessionRecord: TradingExecutionRecord,
): OSState {
  if (!s.tradingOperation) return s;
  const records = s.tradingOperation.executionRecords ?? [];
  const exists = records.some((x) => x.id === sessionRecord.id);
  const updated = exists
    ? records.map((x) => (x.id === sessionRecord.id ? sessionRecord : x))
    : [sessionRecord, ...records];

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      executionRecords: updated,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Records a financial performance extraction record and recalculates runway months.
 */
export function recordFinancialPerformance(
  s: OSState,
  perfRecord: FinancialPerformanceRecord,
): OSState {
  if (!s.tradingOperation) return s;
  const history = s.tradingOperation.performanceHistory ?? [];
  const exists = history.some((x) => x.id === perfRecord.id);
  const updated = exists
    ? history.map((x) => (x.id === perfRecord.id ? perfRecord : x))
    : [perfRecord, ...history];

  const latestNet = perfRecord.totalNetCashExtracted;
  const livingExp =
    s.tradingOperation.financialPlan.monthlyLivingExpenses ?? 2500;
  const runway =
    livingExp > 0
      ? Number((perfRecord.injectedToStartupFund / livingExp).toFixed(1))
      : 6;

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      financialPlan: {
        ...s.tradingOperation.financialPlan,
        currentMonthlyCashflow: latestNet,
        estimatedCurrentRunwayMonths: Math.max(
          s.tradingOperation.financialPlan.estimatedCurrentRunwayMonths,
          runway,
        ),
        version: s.tradingOperation.financialPlan.version + 1,
        updatedAt: new Date().toISOString(),
      },
      performanceHistory: updated,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Records a risk or discipline incident audit item.
 */
export function recordRiskIncident(
  s: OSState,
  incident: TradingRiskIncident,
): OSState {
  if (!s.tradingOperation) return s;
  const incidents = s.tradingOperation.riskIncidents ?? [];
  const exists = incidents.some((x) => x.id === incident.id);
  const updated = exists
    ? incidents.map((x) => (x.id === incident.id ? incident : x))
    : [incident, ...incidents];

  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      riskIncidents: updated,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Updates trading operation stage.
 */
export function updateTradingStage(
  s: OSState,
  stage: TradingDevelopmentStage,
): OSState {
  if (!s.tradingOperation) return s;
  return {
    ...s,
    tradingOperation: {
      ...s.tradingOperation,
      currentStage: stage,
      operatingProfile: {
        ...s.tradingOperation.operatingProfile,
        developmentStage: stage,
        version: s.tradingOperation.operatingProfile.version + 1,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Saves Document 6 (Legal & Compliance) on a Priority 2 Workstream B project.
 */
export function saveLegalComplianceContent(
  s: OSState,
  projectId: string,
  complianceContent: LegalComplianceContent,
): OSState {
  const now = new Date().toISOString();
  const updatedProjects = s.projects.map((proj) => {
    if (proj.id !== projectId) return proj;

    const currentDocs = proj.docs ?? [];
    const legalDocIndex = currentDocs.findIndex(
      (d) => "type" in d && (d as ProjectDocument).type === "legal_compliance",
    );

    let updatedDocs: (ProjectDocument | ProjectDoc)[];
    if (legalDocIndex >= 0) {
      const existing = currentDocs[legalDocIndex] as ProjectDocument;
      const updatedDoc: ProjectDocument = {
        ...existing,
        complianceContent,
        version: (existing.version ?? 1) + 1,
        updatedAt: now,
      };
      updatedDocs = [
        ...currentDocs.slice(0, legalDocIndex),
        updatedDoc,
        ...currentDocs.slice(legalDocIndex + 1),
      ];
    } else {
      const newDoc: ProjectDocument = {
        id: `doc-legal-${proj.id}`,
        projectId: proj.id,
        type: "legal_compliance",
        title: "Legal & Compliance",
        content:
          "Fintech regulatory posture, non-custodial boundaries, jurisdiction mapping, and disclosures.",
        version: 1,
        createdAt: now,
        updatedAt: now,
        complianceContent,
      };
      updatedDocs = [...currentDocs, newDoc];
    }

    return {
      ...proj,
      complianceContent,
      docs: updatedDocs,
    };
  });

  return {
    ...s,
    projects: updatedProjects,
  };
}

// Re-export Priority 3 Learning for Execution logic
export * from "./learning/state";
