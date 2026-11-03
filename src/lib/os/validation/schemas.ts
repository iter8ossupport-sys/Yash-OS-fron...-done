import { z } from "zod";

export const MetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  target: z.string().min(1, "Metric target is required"),
  current: z.string().default(""),
});

export const ProjectGoalSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  text: z.string().min(3, "Goal text must be at least 3 characters"),
  metrics: z.array(MetricSchema),
  targetDeadline: z.string().optional(),
  status: z.enum(["active", "achieved", "superseded", "abandoned"]),
  createdAt: z.string(),
  achievedAt: z.string().optional(),
  supersededBy: z.string().optional(),
  notes: z.string().optional(),
});

export const MilestoneApprovalRecordSchema = z.object({
  approvedBy: z.string().min(1),
  approvedAt: z.string(),
  reason: z
    .string()
    .min(
      10,
      "A justification of at least 10 characters is required to approve multiple active milestones",
    ),
});

export const MilestoneSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(2, "Milestone title required"),
  objective: z.string().default(""),
  metrics: z.array(MetricSchema).default([]),
  deadline: z.string().default(""),
  status: z.enum(["pending", "active", "completed", "blocked", "abandoned"]),
  order: z.number().int().nonnegative(),
  isPrimaryActive: z.boolean(),
  additionalActiveApproval: MilestoneApprovalRecordSchema.optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
});

export const FlexibleDocumentContentSchema = z.object({
  markdown: z.string(),
  lastEditedBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const PlanOutcomeItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  successCriteria: z.string().default(""),
  status: z.enum(["pending", "achieved", "missed"]),
  targetDeadline: z.string().optional(),
  evidenceNotes: z.string().optional(),
});

export const ExecutionPlanOutcomeHorizonSchema = z.object({
  monthly: z.array(PlanOutcomeItemSchema).default([]),
  weekly: z.array(PlanOutcomeItemSchema).default([]),
  daily: z.array(PlanOutcomeItemSchema).default([]),
});

export const RecommendedTaskTemplateSchema = z.object({
  id: z.string().min(1),
  milestoneId: z.string().min(1),
  title: z.string().min(1),
  duration: z.number().positive(),
  kind: z.enum(["simple", "measurable", "validation"]),
  expectedOutput: z.string().default(""),
  successCriteria: z.string().default(""),
  what: z.string().default(""),
  how: z.string().default(""),
  where: z.string().default(""),
});

export const PlanRevisionRecordSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  proposedAt: z.string(),
  proposedBy: z.enum(["founder", "ai_recommendation", "review_closeout"]),
  reason: z.string().min(1),
  evidenceReferences: z.array(z.string()).default([]),
  status: z.enum(["proposed", "approved", "rejected"]),
  approvedAt: z.string().optional(),
  approvedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
  snapshot: z.object({
    outcomes: ExecutionPlanOutcomeHorizonSchema,
    recommendedTasks: z.array(RecommendedTaskTemplateSchema),
  }),
});

export const StructuredExecutionPlanSchema = z.object({
  projectId: z.string().min(1),
  activeGoalId: z.string().min(1),
  activeMilestoneIds: z.array(z.string()).default([]),
  originalBaseline: z.object({
    setAt: z.string(),
    goalSnapshotText: z.string(),
    milestoneTitles: z.array(z.string()),
    outcomes: ExecutionPlanOutcomeHorizonSchema,
  }),
  currentApproved: z.object({
    version: z.number().int().positive(),
    approvedAt: z.string(),
    outcomes: ExecutionPlanOutcomeHorizonSchema,
    recommendedTasks: z.array(RecommendedTaskTemplateSchema),
  }),
  proposedRevisions: z.array(PlanRevisionRecordSchema).default([]),
  actualExecutionRefs: z
    .object({
      recordedDayDates: z.array(z.string()),
      linkedSnapshotIds: z.array(z.string()),
    })
    .optional(),
});

export const ComplianceItemSchema = z.object({
  id: z.string().min(1),
  jurisdiction: z.string().min(1),
  domain: z.enum([
    "data_privacy",
    "licensing",
    "terms_of_service",
    "aml_kyc",
    "ip_copyright",
  ]),
  summary: z.string().min(1),
  details: z.string().default(""),
  status: z.enum([
    "verified_requirement",
    "potential_requirement",
    "unresolved_question",
    "reviewed_requirement",
  ]),
  reviewedAt: z.string().optional(),
  referenceUrl: z.string().optional(),
});

export const LegalComplianceContentSchema = z.object({
  frameworkSummary: z.string().default(""),
  requirements: z.array(ComplianceItemSchema).default([]),
  lastAuditDate: z.string().optional(),
  legalCounselNotes: z.string().optional(),
});

export const ProjectDocumentSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  type: z.enum([
    "project_brief",
    "execution_plan",
    "evidence_experiments",
    "decisions_history",
    "methods_knowledge",
    "legal_compliance",
    "legacy_unclassified",
  ]),
  title: z.string().min(1),
  flexibleContent: FlexibleDocumentContentSchema.optional(),
  executionPlan: StructuredExecutionPlanSchema.optional(),
  complianceContent: LegalComplianceContentSchema.optional(),
  version: z.number().int().positive().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  history: z
    .array(
      z.object({
        version: z.number(),
        snapshotAt: z.string(),
        reason: z.string().optional(),
        content: z.any(),
      }),
    )
    .optional(),
});

/** Project Validation Contract enforcing Goal & Milestone Multiplicity Constraints */
export const ProjectSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1, "Project name is required"),
    objective: z.string().default(""),
    priorityId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    status: z.enum(["active", "paused", "completed", "archived"]),
    lifecyclePhase: z.string().optional(),
    activeGoalId: z.string().optional(),
    goalsHistory: z.array(ProjectGoalSchema).optional(),
    milestones: z.array(MilestoneSchema).optional(),
    docs: z.array(z.any()).optional(),
    createdAt: z.string(),
  })
  .superRefine((val, ctx) => {
    // Rule 1: Exactly one active major goal per project (if goalsHistory is provided)
    if (val.goalsHistory && val.goalsHistory.length > 0) {
      const activeGoals = val.goalsHistory.filter((g) => g.status === "active");
      if (activeGoals.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Project must have exactly 1 active major goal. Found: ${activeGoals.length}`,
          path: ["goalsHistory"],
        });
      }
    }

    // Rule 2: Active milestones constraint
    if (val.milestones && val.milestones.length > 0) {
      const activeMilestones = val.milestones.filter(
        (m) => m.status === "active",
      );
      if (activeMilestones.length > 1) {
        const unapproved = activeMilestones.filter(
          (m) => !m.isPrimaryActive && !m.additionalActiveApproval,
        );
        if (unapproved.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Multiple active milestones require explicit approval record and justification reason.`,
            path: ["milestones"],
          });
        }
      }
    }
  });

export const TaskSchema = z.object({
  id: z.string().min(1),
  priorityId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  projectId: z.string().optional(),
  milestoneId: z.string().optional(),
  planOutcomeId: z.string().optional(),
  title: z.string().min(1),
  duration: z.number().int().positive(),
  timeBlock: z.string().default(""),
  expectedOutput: z.string().default(""),
  successCriteria: z.string().default(""),
  what: z.string().default(""),
  how: z.string().default(""),
  where: z.string().default(""),
  kind: z.enum(["simple", "measurable", "validation"]),
  selected: z.boolean(),
  status: z.enum(["pending", "active", "paused", "done"]),
  elapsedMs: z.number().int().nonnegative().default(0),
  startedAt: z.number().optional(),
  output: z.record(z.string()).optional(),
  outcomeAchieved: z.boolean().optional(),
  knowledgeIds: z.array(z.string()).optional(),
});

export const TradingOperationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(["active", "paused"]),
  operatingProfile: z.object({
    id: z.string().min(1),
    title: z.string(),
    marketFocus: z.array(z.string()),
    coreEdgeDescription: z.string(),
    riskRules: z.object({
      maxDailyDrawdownCurrency: z.number(),
      maxTrailingDrawdownPercent: z.number(),
      maxRiskPerTradePercent: z.number(),
      hardStopRequired: z.boolean(),
      leverageOrContractLimit: z.string(),
    }),
    routines: z.object({
      preMarketPrepChecklist: z.array(z.string()),
      postMarketReviewChecklist: z.array(z.string()),
    }),
    flexibleContent: z.string(),
    version: z.number(),
    updatedAt: z.string(),
  }),
  financialPlan: z.object({
    id: z.string().min(1),
    title: z.string(),
    targetMonthlyCashflow: z.number(),
    currentMonthlyCashflow: z.number(),
    startupRunwayMonthsTarget: z.number(),
    estimatedCurrentRunwayMonths: z.number(),
    transitionMilestones: z.array(
      z.object({
        id: z.string().min(1),
        phase: z.string(),
        targetCapital: z.number(),
        monthlyYieldTarget: z.number(),
        achieved: z.boolean(),
      }),
    ),
    flexibleContent: z.string(),
    version: z.number(),
    updatedAt: z.string(),
  }),
  strategies: z.array(z.any()).default([]),
  systems: z.array(z.any()).default([]),
  accounts: z.array(z.any()).default([]),
  experiments: z.array(z.any()).default([]),
  executionRecords: z.array(z.any()).default([]),
  performanceHistory: z.array(z.any()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LearningKnowledgeSystemSchema = z.object({
  id: z.string().min(1),
  coreDocument: z.object({
    title: z.string(),
    markdownContent: z.string(),
    lastUpdated: z.string(),
  }),
  activeWorkflow: z.enum(["capability_acquisition", "discovery_synthesis"]),
  acquisitions: z.array(z.any()).default([]),
  discoveries: z.array(z.any()).default([]),
});

export function validateProject(project: unknown) {
  return ProjectSchema.safeParse(project);
}

export function validateTradingOperation(op: unknown) {
  return TradingOperationSchema.safeParse(op);
}

export function validateLearningSystem(sys: unknown) {
  return LearningKnowledgeSystemSchema.safeParse(sys);
}

export function validateTask(task: unknown) {
  return TaskSchema.safeParse(task);
}
