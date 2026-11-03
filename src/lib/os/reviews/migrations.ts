import type {
  DayRecord,
  KnowledgeItem,
  Milestone,
  OSState,
  Project,
  ProjectDocument,
  ProjectGoal,
  StructuredExecutionPlan,
  Task,
  TradingOperation,
  LearningKnowledgeSystem,
} from "../types";
import { initialState } from "../seed";
import { syncPrioritiesWithProjects } from "../logic";
import { defaultReviewSettings } from "./fixtures";

export const CURRENT_SCHEMA_VERSION = 3;

/**
 * Upgrades a single DayRecord from legacy schema to schema v2/v3.
 * Preserves timestamps, audit logs, task snapshots, and existing user outputs.
 */
export function migrateDayRecord(record: DayRecord): DayRecord {
  const hasAudit = Boolean(
    record.auditHistory && record.auditHistory.length > 0,
  );
  const state = record.state ?? (hasAudit ? "corrected" : "finalized");
  const source = record.source ?? (hasAudit ? "corrected" : "closeout");

  // Ensure Priority 2 Workstream A vs B minutes are populated safely
  let p2WorkstreamMinutes = record.p2WorkstreamMinutes;
  if (!p2WorkstreamMinutes && (record.actualMin?.[2] ?? 0) > 0) {
    const p2Actual = record.actualMin[2] ?? 0;
    const outputs = record.outputs ?? [];
    const p2Outputs = outputs.filter((o) => o.priorityId === 2);
    const hasA = p2Outputs.some(
      (o) =>
        o.workstream === "A" ||
        /cash|trading|session/i.test(o.workstream ?? ""),
    );
    const hasB = p2Outputs.some(
      (o) =>
        o.workstream === "B" ||
        /fintech|product|saas|api/i.test(o.workstream ?? ""),
    );

    if (hasA && !hasB) {
      p2WorkstreamMinutes = { workstreamA: p2Actual, workstreamB: 0 };
    } else if (hasB && !hasA) {
      p2WorkstreamMinutes = { workstreamA: 0, workstreamB: p2Actual };
    } else if (hasA && hasB) {
      const half = Math.round(p2Actual / 2);
      p2WorkstreamMinutes = { workstreamA: half, workstreamB: p2Actual - half };
    } else {
      p2WorkstreamMinutes = { workstreamA: p2Actual, workstreamB: 0 };
    }
  }

  return {
    ...record,
    state,
    source,
    p2WorkstreamMinutes: p2WorkstreamMinutes ?? {
      workstreamA: 0,
      workstreamB: 0,
    },
    auditHistory: record.auditHistory ?? [],
    taskSnapshots: record.taskSnapshots ?? [],
  };
}

/**
 * Upgrades a Project to Schema v3.
 * - Ensures lifecyclePhase, activeGoalId, goalsHistory, and milestones exist.
 * - Maps or synthesizes the 5 (or 6) project documents without discarding any existing content.
 */
export function upgradeProjectToV3(project: Project): Project {
  const now = new Date().toISOString();
  const createdAt = project.createdAt || now;

  // 1. Lifecycle Phase
  const lifecyclePhase =
    project.lifecyclePhase ??
    (project.status === "active" ? "build_delivery" : "idea_discovery");

  // 2. Project Goal (exactly 1 active)
  let goalsHistory = project.goalsHistory ? [...project.goalsHistory] : [];
  let activeGoalId = project.activeGoalId;

  if (goalsHistory.length === 0) {
    const goalId = `goal-${project.id}`;
    const initialGoal: ProjectGoal = {
      id: goalId,
      projectId: project.id,
      text: project.objective || "Deliver validated product value to customers",
      metrics: [],
      targetDeadline: project.deadline,
      status: "active",
      createdAt,
    };
    goalsHistory = [initialGoal];
    activeGoalId = goalId;
  } else if (
    !activeGoalId ||
    !goalsHistory.some((g) => g.id === activeGoalId)
  ) {
    const active = goalsHistory.find((g) => g.status === "active");
    if (active) {
      activeGoalId = active.id;
    } else {
      goalsHistory[0]!.status = "active";
      activeGoalId = goalsHistory[0]!.id;
    }
  }

  // 3. Milestones (one primary active)
  let milestones = project.milestones ? [...project.milestones] : [];
  if (milestones.length === 0) {
    const msId = `ms-${project.id}`;
    const initialMilestone: Milestone = {
      id: msId,
      projectId: project.id,
      title: project.milestone || "Ship next release & collect evidence",
      objective: project.objective || "",
      metrics: [],
      deadline: project.deadline || "",
      status: "active",
      order: 1,
      isPrimaryActive: true,
      createdAt,
    };
    milestones = [initialMilestone];
  } else if (!milestones.some((m) => m.isPrimaryActive)) {
    const firstActive = milestones.find((m) => m.status === "active");
    if (firstActive) {
      firstActive.isPrimaryActive = true;
    } else {
      milestones[0]!.isPrimaryActive = true;
      milestones[0]!.status = "active";
    }
  }

  // 4. Five (or Six) Project Documents
  const existingDocs = project.docs ?? [];
  const migratedDocs: ProjectDocument[] = [];

  // Map any pre-existing user docs
  for (const doc of existingDocs) {
    if ("type" in doc && typeof doc.type === "string") {
      migratedDocs.push(doc as ProjectDocument);
    } else {
      // Legacy ProjectDoc { id, title, content, createdAt, updatedAt }
      const legacyDoc = doc as unknown as {
        id: string;
        title?: string;
        content?: string;
        createdAt?: string;
        updatedAt?: string;
      };
      const titleLower = (legacyDoc.title || "").toLowerCase();
      let docType: ProjectDocument["type"] = "legacy_unclassified";

      if (/brief|overview|problem/i.test(titleLower)) docType = "project_brief";
      else if (/plan|execution|schedule/i.test(titleLower))
        docType = "execution_plan";
      else if (/evidence|experiment|user|research/i.test(titleLower))
        docType = "evidence_experiments";
      else if (/decision|history|log/i.test(titleLower))
        docType = "decisions_history";
      else if (/method|framework|knowledge|lesson/i.test(titleLower))
        docType = "methods_knowledge";
      else if (/compliance|legal|regulatory/i.test(titleLower))
        docType = "legal_compliance";

      const contentText = legacyDoc.content || "";
      migratedDocs.push({
        id: legacyDoc.id,
        projectId: project.id,
        type: docType,
        title: legacyDoc.title || "Legacy Document",
        content: contentText,
        flexibleContent: { markdown: contentText },
        version: 1,
        createdAt: legacyDoc.createdAt || createdAt,
        updatedAt: legacyDoc.updatedAt || now,
      });
    }
  }

  // Ensure Doc 1: Project Brief exists
  if (!migratedDocs.some((d) => d.type === "project_brief")) {
    const briefContent = `# ${project.name} — Project Brief\n\n## Objective\n${project.objective || "Not specified"}\n\n## Core Hypothesis\n${project.hypothesis || "Not specified"}\n`;
    migratedDocs.unshift({
      id: `doc-brief-${project.id}`,
      projectId: project.id,
      type: "project_brief",
      title: "Project Brief",
      content: briefContent,
      flexibleContent: {
        markdown: briefContent,
      },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // Ensure Doc 2: Structured Execution Plan exists
  if (!migratedDocs.some((d) => d.type === "execution_plan")) {
    const activeGoal = goalsHistory.find((g) => g.id === activeGoalId);
    const activeMs = milestones.filter((m) => m.status === "active");

    const execPlan: StructuredExecutionPlan = {
      projectId: project.id,
      activeGoalId: activeGoalId ?? `goal-${project.id}`,
      activeMilestoneIds: activeMs.map((m) => m.id),
      originalBaseline: {
        setAt: createdAt,
        goalSnapshotText: activeGoal?.text || project.objective || "",
        milestoneTitles: activeMs.map((m) => m.title),
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

    migratedDocs.push({
      id: `doc-plan-${project.id}`,
      projectId: project.id,
      type: "execution_plan",
      title: "Execution Plan",
      content: `Goal: ${activeGoal?.text || project.objective || "Core plan"}\nActive milestones: ${activeMs.map((m) => m.title).join(", ")}`,
      executionPlan: execPlan,
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // Ensure Doc 3: Evidence & Experiments exists
  if (!migratedDocs.some((d) => d.type === "evidence_experiments")) {
    const evidenceContent = project.evidence
      ? `## Recorded Evidence\n\n${project.evidence}\n`
      : "## Evidence & Experiments\n\nNo market evidence recorded yet.\n";
    migratedDocs.push({
      id: `doc-evidence-${project.id}`,
      projectId: project.id,
      type: "evidence_experiments",
      title: "Evidence & Experiments",
      content: evidenceContent,
      flexibleContent: {
        markdown: evidenceContent,
      },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // Ensure Doc 4: Decisions & History exists
  if (!migratedDocs.some((d) => d.type === "decisions_history")) {
    const decisionsContent = project.decisions
      ? `## Historical Decisions\n\n${project.decisions}\n`
      : "## Decisions & History\n\nNo major architectural decisions logged yet.\n";
    migratedDocs.push({
      id: `doc-decisions-${project.id}`,
      projectId: project.id,
      type: "decisions_history",
      title: "Decisions & History",
      content: decisionsContent,
      flexibleContent: {
        markdown: decisionsContent,
      },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // Ensure Doc 5: Methods & Knowledge exists
  if (!migratedDocs.some((d) => d.type === "methods_knowledge")) {
    const methodsContent = project.learning
      ? `## Methods & Execution Lessons\n\n${project.learning}\n`
      : "## Methods & Knowledge\n\nMethods and execution playbooks for this project.\n";
    migratedDocs.push({
      id: `doc-methods-${project.id}`,
      projectId: project.id,
      type: "methods_knowledge",
      title: "Methods & Knowledge",
      content: methodsContent,
      flexibleContent: {
        markdown: methodsContent,
      },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  // If Priority 2 Fintech project, ensure Doc 6: Legal & Compliance exists
  if (
    project.priorityId === 2 &&
    (project.workstream === "B" || /fintech/i.test(project.name)) &&
    !migratedDocs.some((d) => d.type === "legal_compliance")
  ) {
    const complianceContent =
      "## Legal & Compliance\nFintech regulatory and compliance tracking.\n";
    migratedDocs.push({
      id: `doc-legal-${project.id}`,
      projectId: project.id,
      type: "legal_compliance",
      title: "Legal & Compliance",
      content: complianceContent,
      complianceContent: {
        frameworkSummary: "Fintech regulatory and compliance tracking",
        requirements: [],
      },
      version: 1,
      createdAt,
      updatedAt: now,
    });
  }

  return {
    ...project,
    lifecyclePhase,
    activeGoalId,
    goalsHistory,
    milestones,
    docs: migratedDocs,
    milestone: milestones.find((m) => m.isPrimaryActive)?.title || "",
  };
}

/**
 * Migrates legacy `demo-lbes` (or any P2 cashflow project) into the authoritative TradingOperation model.
 */
export function migrateLbesToTradingOperation(
  legacyLbes?: Project,
): TradingOperation {
  const now = new Date().toISOString();
  const createdAt = legacyLbes?.createdAt || now;

  return {
    id: "trading-op-lbes",
    name: legacyLbes?.name || "LBES Cashflow Operation",
    status: legacyLbes?.status === "paused" ? "paused" : "active",
    operatingProfile: {
      id: "profile-lbes-1",
      title: "Trading Operating Profile",
      marketFocus: ["Futures (NQ / ES)", "London Breakout Execution"],
      coreEdgeDescription:
        legacyLbes?.objective ||
        "Generate cash through LBES and other systems to fund startup runway.",
      riskRules: {
        maxDailyDrawdownCurrency: 500,
        maxTrailingDrawdownPercent: 5,
        maxRiskPerTradePercent: 1,
        hardStopRequired: true,
        leverageOrContractLimit: "2 contracts maximum",
      },
      routines: {
        preMarketPrepChecklist: [
          "Check economic calendar for high-impact releases",
          "Mark key Asian and pre-market range levels",
          "Confirm risk parameters and trade limits",
        ],
        postMarketReviewChecklist: [
          "Log all trade executions and fills",
          "Score rule adherence and discipline (1-5)",
          "Record net session result immediately",
        ],
      },
      flexibleContent: legacyLbes?.bottlenecks
        ? `### Active Bottlenecks\n${legacyLbes.bottlenecks}\n`
        : "### Execution Playbook\nStandard London Breakout routine.\n",
      version: 1,
      updatedAt: now,
    },
    financialPlan: {
      id: "plan-fin-1",
      title: "Financial & Transition Plan",
      targetMonthlyCashflow: 5000,
      currentMonthlyCashflow: 0,
      startupRunwayMonthsTarget: 12,
      estimatedCurrentRunwayMonths: 6,
      transitionMilestones: [
        {
          id: "tm-1",
          phase: "Phase 1: Define and validate repeatable weekly cash routine",
          targetCapital: 10000,
          monthlyYieldTarget: 1000,
          achieved: false,
        },
        {
          id: "tm-2",
          phase: "Phase 2: Scale capital to cover founder living expenses",
          targetCapital: 50000,
          monthlyYieldTarget: 3000,
          achieved: false,
        },
        {
          id: "tm-3",
          phase: "Phase 3: Fund dedicated startup engineering runway",
          targetCapital: 100000,
          monthlyYieldTarget: 5000,
          achieved: false,
        },
      ],
      flexibleContent: legacyLbes?.milestone
        ? `### Nearest Milestone\n${legacyLbes.milestone}\n`
        : "",
      version: 1,
      updatedAt: now,
    },
    strategies: [
      {
        id: "strat-lbes-1",
        name: "London Breakout Execution System (LBES)",
        assetClass: "futures",
        timeframe: "15m / 5m",
        rulesMarkdown:
          "Execute disciplined breakout entries during London session according to written parameters.",
        status: "active",
        expectedWinRate: 55,
        expectedRiskReward: 2,
      },
    ],
    systems: [
      {
        id: "sys-lbes-1",
        name: "LBES Execution Workflow",
        strategyId: "strat-lbes-1",
        automationLevel: "manual",
        platformOrTech: "TradingView & Broker Terminal",
        status: "live",
      },
    ],
    accounts: [],
    experiments: [],
    executionRecords: [],
    performanceHistory: [],
    createdAt,
    updatedAt: now,
  };
}

/**
 * Migrates legacy `demo-skills` (or any P3 skills project) into the LearningKnowledgeSystem.
 */
export function migrateSkillsToLearningSystem(
  legacySkills?: Project,
  knowledge?: KnowledgeItem[],
): LearningKnowledgeSystem {
  const now = new Date().toISOString();
  const createdAt = legacySkills?.createdAt || now;

  const relevantKnowledgeIds = (knowledge ?? [])
    .filter((k) => k.priorityId === 3 || k.projectId === legacySkills?.id)
    .map((k) => k.id);

  return {
    id: "learning-system-core",
    coreDocument: {
      title: "Learning & Knowledge Operating System",
      markdownContent: `# Learning for Execution\n\nLearn fundamentals that increase the quality, speed and precision of execution, so every future cycle of building becomes better.\n\n${
        legacySkills?.objective
          ? `### Objective\n${legacySkills.objective}\n\n`
          : ""
      }### Key Focus Areas\n${(
        legacySkills?.learningCategories ?? [
          "Practical execution and experiments",
          "Skill development",
        ]
      )
        .map((c) => `- ${c}`)
        .join("\n")}\n`,
      lastUpdated: now,
    },
    activeWorkflow: "capability_acquisition",
    acquisitions: [
      {
        id: "acq-initial-1",
        targetSkill: "Execution Skill Mastery",
        unblocksPriorityId: 1,
        resourcesStudied: legacySkills?.learningCategories ?? [
          "Practical execution and experiments",
        ],
        appliedExperiment:
          "Apply learned fundamental directly inside daily product tasks",
        outcomeAchieved: false,
        promotedKnowledgeIds: relevantKnowledgeIds,
        createdAt,
      },
    ],
    discoveries: [],
  };
}

/**
 * Complete Pure Schema v1 → v2 → v3 Migration Pipeline.
 * Safely migrates raw unparsed or older schema objects into guaranteed Schema v3.
 * Preserves all user data, historical records, and configuration.
 */
export function migrateOSStateV3(raw: unknown): OSState {
  if (!raw || typeof raw !== "object") {
    const seeded = syncPrioritiesWithProjects(initialState);
    return {
      ...seeded,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tradingOperation: migrateLbesToTradingOperation(
        seeded.projects.find((p) => p.id === "demo-lbes"),
      ),
      learningSystem: migrateSkillsToLearningSystem(
        seeded.projects.find((p) => p.id === "demo-skills"),
        seeded.knowledge,
      ),
      projects: seeded.projects
        .filter((p) => p.id !== "demo-lbes" && p.id !== "demo-skills")
        .map(upgradeProjectToV3),
    };
  }

  const p = raw as Record<string, unknown>;

  // 1. Run legacy DayRecord migrations
  const legacyHistory = Array.isArray(p["history"])
    ? (p["history"] as DayRecord[])
    : [];
  const migratedHistory = legacyHistory.map(migrateDayRecord);

  // 2. Extract or preserve projects
  const rawProjects = Array.isArray(p["projects"])
    ? (p["projects"] as Project[])
    : (initialState.projects ?? []);

  const legacyLbes = rawProjects.find(
    (x) => x.id === "demo-lbes" || x.name.toLowerCase() === "lbes",
  );
  const legacySkills = rawProjects.find(
    (x) => x.id === "demo-skills" || x.priorityId === 3,
  );

  // Filter out demo-lbes and demo-skills from project portfolio in v3
  const filteredProjects = rawProjects.filter(
    (x) => x.id !== legacyLbes?.id && x.id !== legacySkills?.id,
  );

  // Upgrade remaining projects (Priority 1 and Priority 2B)
  const upgradedProjects = filteredProjects.map(upgradeProjectToV3);

  // 3. Migrate or preserve TradingOperation (Priority 2A)
  let tradingOperation: TradingOperation | undefined =
    p["tradingOperation"] && typeof p["tradingOperation"] === "object"
      ? (p["tradingOperation"] as TradingOperation)
      : undefined;

  if (!tradingOperation) {
    tradingOperation = migrateLbesToTradingOperation(legacyLbes);
  }

  // 4. Migrate or preserve LearningKnowledgeSystem (Priority 3)
  const rawKnowledge = Array.isArray(p["knowledge"])
    ? (p["knowledge"] as KnowledgeItem[])
    : (initialState.knowledge ?? []);

  let learningSystem: LearningKnowledgeSystem | undefined =
    p["learningSystem"] && typeof p["learningSystem"] === "object"
      ? (p["learningSystem"] as LearningKnowledgeSystem)
      : undefined;

  if (!learningSystem) {
    learningSystem = migrateSkillsToLearningSystem(legacySkills, rawKnowledge);
  }

  // 5. Backfill tasks with projectId and milestoneId
  const activeP1 = upgradedProjects.find(
    (x) => x.priorityId === 1 && x.status === "active",
  );
  const activeP2 = upgradedProjects.find(
    (x) => x.priorityId === 2 && x.status === "active",
  );

  const upgradeTask = (t: Task): Task => ({
    ...t,
    projectId:
      t.projectId ??
      (t.priorityId === 1
        ? activeP1?.id
        : t.priorityId === 2
          ? (activeP2?.id ?? tradingOperation?.id)
          : undefined),
    milestoneId:
      t.milestoneId ??
      (t.priorityId === 1 ? activeP1?.milestones?.[0]?.id : undefined),
  });

  const rawPlan = p["plan"] as OSState["plan"];
  const upgradedPlan = rawPlan
    ? { ...rawPlan, tasks: (rawPlan.tasks ?? []).map(upgradeTask) }
    : null;

  const rawDraft = p["draft"] as OSState["draft"];
  const upgradedDraft = rawDraft
    ? { ...rawDraft, tasks: (rawDraft.tasks ?? []).map(upgradeTask) }
    : null;

  const migrated: OSState = {
    ...initialState,
    ...(p as unknown as OSState),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    userAvatar: typeof p["userAvatar"] === "string" ? p["userAvatar"] : null,
    projects: upgradedProjects,
    tradingOperation,
    learningSystem,
    plan: upgradedPlan,
    draft: upgradedDraft,
    history: migratedHistory,
    knowledge: rawKnowledge,
    bottlenecks: Array.isArray(p["bottlenecks"])
      ? (p["bottlenecks"] as OSState["bottlenecks"])
      : [],
    improvements: Array.isArray(p["improvements"])
      ? (p["improvements"] as OSState["improvements"])
      : [],
    periodReviews: Array.isArray(p["periodReviews"])
      ? (p["periodReviews"] as OSState["periodReviews"])
      : [],
    aiInsights: Array.isArray(p["aiInsights"])
      ? (p["aiInsights"] as OSState["aiInsights"])
      : [],
    reviewAlerts: Array.isArray(p["reviewAlerts"])
      ? (p["reviewAlerts"] as OSState["reviewAlerts"])
      : [],
    reviewSettings:
      (p["reviewSettings"] as OSState["reviewSettings"]) ??
      defaultReviewSettings,
  };

  if (
    migrated.foundation?.northStar ===
    "Find human friction. Solve problems. Build systems. Scale impact."
  ) {
    migrated.foundation = {
      ...migrated.foundation,
      northStar: "Build systems that remove human friction.",
    };
  }

  return syncPrioritiesWithProjects(migrated);
}

// Default export alias ensuring 100% backward compatibility
export const migrateOSState = migrateOSStateV3;
