import type { Metric, PriorityId, TaskKind } from "./core";

export interface ProjectDoc {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

/** Six predefined founder lifecycle phases */
export type PredefinedLifecyclePhase =
  | "idea_discovery" // Phase 1: Exploring problem space & founder-market fit
  | "problem_validation" // Phase 2: User interviews & acute pain discovery
  | "solution_validation" // Phase 3: Prototypes, LOIs, early commitments
  | "build_delivery" // Phase 4: Active engineering, MVP deployment & iteration
  | "growth_scaling" // Phase 5: Distribution, repeatable sales & retention
  | "fundraising_team"; // Phase 6: Capital allocation & team expansion

/** Custom phase extension allowing user-defined phases without weakening enum safety */
export interface CustomLifecyclePhase {
  id: string;
  name: string;
  description: string;
  order: number;
}

export type LifecyclePhase = PredefinedLifecyclePhase | string;

export type ProjectGoalStatus =
  "active" | "achieved" | "superseded" | "abandoned";

/** Project-level Major Goal entity */
export interface ProjectGoal {
  id: string;
  projectId: string;
  text: string;
  metrics: Metric[];
  targetDeadline?: string | undefined;
  status: ProjectGoalStatus;
  createdAt: string; // ISO 8601
  resolvedAt?: string | undefined; // ISO 8601
  achievementEvidence?: string | undefined; // Required when status === 'achieved'
  supersededBy?: string | undefined; // ProjectGoal.id, required when status === 'superseded'
  transitionReason?: string | undefined; // Required when status === 'superseded' | 'abandoned'
  notes?: string | undefined;
}

/** Milestone lifecycle status */
export type MilestoneStatus =
  "pending" | "active" | "completed" | "blocked" | "abandoned";

/** Audit record required when activating more than one concurrent milestone */
export interface MilestoneApprovalRecord {
  approvedBy: string; // e.g. "Founder"
  approvedAt: string; // ISO 8601
  reason: string; // Explicit architectural justification for concurrency
}

/** Formal milestone assessment evaluating outcomes, metrics and evidence */
export interface MilestoneAssessment {
  id: string;
  milestoneId: string;
  assessedAt: string; // ISO 8601
  assessedBy: "founder";
  status: "completed" | "blocked" | "abandoned" | "active";
  actualMetrics: Metric[];
  actualResultsSummary: string;
  evidenceReferences: string[];
  founderNotes: string;
  systemRecommendation?:
    | "recommended_completed"
    | "recommended_blocked"
    | "needs_review"
    | undefined;
}

/** Granular milestone entity */
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  objective: string;
  metrics: Metric[];
  deadline: string;
  status: MilestoneStatus;
  order: number;
  isPrimaryActive: boolean; // Exactly one primary active milestone
  additionalActiveApproval?: MilestoneApprovalRecord | undefined; // Required if multiple active
  assessmentHistory?: MilestoneAssessment[] | undefined;
  currentAssessment?: MilestoneAssessment | undefined;
  completedAt?: string | undefined;
  createdAt: string;
}

/** Strictly classified 5 + 1 document types */
export type ProjectDocumentType =
  | "project_brief" // Doc 1: Flexible content
  | "execution_plan" // Doc 2: Structured execution plan
  | "evidence_experiments" // Doc 3: Flexible content
  | "decisions_history" // Doc 4: Flexible content
  | "methods_knowledge" // Doc 5: Flexible content
  | "legal_compliance" // Doc 6 (Fintech only): Structured + flexible
  | "legacy_unclassified"; // Fallback for pre-v3 user documents

export interface FlexibleDocumentContent {
  markdown: string;
  lastEditedBy?: string | undefined;
  tags?: string[] | undefined;
}

export interface DocumentVersionSnapshot {
  version: number;
  snapshotAt: string; // ISO 8601
  reason?: string | undefined;
  content: FlexibleDocumentContent | Record<string, unknown>;
}

export interface OutcomeEvaluationRecord {
  id: string;
  outcomeId: string;
  evaluatedAt: string; // ISO 8601
  status: "pending" | "achieved" | "missed";
  evaluatedBy: "founder";
  successCriteria: string;
  actualEvidenceSummary: string;
  linkedTaskOutputs: {
    taskId: string;
    taskTitle: string;
    output?: Record<string, string> | undefined;
    elapsedMinutes: number;
  }[];
  founderNotes?: string | undefined;
}

export interface PlanOutcomeItem {
  id: string;
  text: string;
  successCriteria: string;
  status: "pending" | "achieved" | "missed";
  targetDeadline?: string | undefined;
  evaluations?: OutcomeEvaluationRecord[] | undefined;
  evidenceNotes?: string | undefined;
}

export interface ExecutionPlanOutcomeHorizon {
  monthly: PlanOutcomeItem[];
  weekly: PlanOutcomeItem[];
  daily: PlanOutcomeItem[];
}

export type EvidenceScope = "project" | "priority" | "founder_system";

export interface EvidenceProvenance {
  scope: EvidenceScope;
  sourceType:
    | "project_bottleneck"
    | "project_document"
    | "project_task_output"
    | "priority_bottleneck"
    | "review_bottleneck";
  sourceId: string;
  sourceDate?: string | undefined;
  description: string;
}

export interface RecommendedTaskTemplate {
  id: string;
  projectId: string;
  milestoneId?: string | undefined; // Optional when recommending project-scoping tasks
  planOutcomeId?: string | undefined;
  title: string;
  duration: number; // minutes
  kind: TaskKind;
  expectedOutput: string;
  successCriteria: string;
  what: string;
  how: string;
  where: string;
  provenance?: EvidenceProvenance[] | undefined;
  scope?: "milestone_execution" | "project_scoping" | undefined;
}

export interface PlanRevisionRecord {
  id: string;
  version: number;
  proposedAt: string; // ISO 8601
  proposedBy: "founder" | "ai_recommendation" | "review_closeout";
  reason: string;
  evidenceReferences: string[]; // URLs, ReviewBottleneck.id, or DayRecord dates
  status: "proposed" | "approved" | "rejected";
  approvedAt?: string | undefined; // ISO 8601
  approvedBy?: string | undefined;
  rejectionReason?: string | undefined;
  snapshot: {
    outcomes: ExecutionPlanOutcomeHorizon;
    recommendedTasks: RecommendedTaskTemplate[];
  };
}

export interface StructuredExecutionPlan {
  projectId: string;
  activeGoalId?: string | undefined;
  activeMilestoneIds: string[];

  // 1. Original Plan Baseline (Immutable founder benchmark)
  originalBaseline: {
    setAt: string;
    goalSnapshotText: string;
    milestoneTitles: string[];
    outcomes: ExecutionPlanOutcomeHorizon;
  };

  // 2. Current Approved Plan (Active operational driver)
  currentApproved: {
    version: number;
    approvedAt: string;
    outcomes: ExecutionPlanOutcomeHorizon;
    recommendedTasks: RecommendedTaskTemplate[];
  };

  // 3. Proposed Revisions & Audit Trail
  proposedRevisions: PlanRevisionRecord[];

  // 4. Actual Execution Cross-References (Read-only aggregate linkage)
  actualExecutionRefs?:
    | {
        recordedDayDates: string[];
        linkedSnapshotIds: string[];
      }
    | undefined;
}

export type ComplianceRequirementStatus =
  | "verified_requirement" // Officially confirmed statute/rule
  | "potential_requirement" // Under legal exploration
  | "unresolved_question" // Flagged for legal counsel/regulatory clarity
  | "reviewed_requirement"; // Assessed and mitigated

export interface ComplianceItem {
  id: string;
  jurisdiction: string; // e.g. "US (SEC/CFTC)", "EU (MiCA)", "India (SEBI/RBI)"
  domain:
    | "data_privacy"
    | "licensing"
    | "terms_of_service"
    | "aml_kyc"
    | "ip_copyright";
  summary: string;
  details: string;
  status: ComplianceRequirementStatus;
  reviewedAt?: string | undefined;
  referenceUrl?: string | undefined;
}

export interface JurisdictionTrackingRecord {
  jurisdictionCode: string; // e.g. "US", "UK", "EU", "IN"
  regulatoryBody: string; // e.g. "SEC / CFTC", "FCA", "SEBI"
  applicableRegime: string;
  targetLaunchPhase:
    "tier_1_launch" | "tier_2_expansion" | "restricted_blocked";
  complianceStatus: "compliant" | "in_review" | "unverified" | "exempt";
  notes?: string | undefined;
}

export interface LicensingRequirementItem {
  id: string;
  licenseType: string; // e.g. "RIA Registration", "CTA", "Technology Publisher"
  thresholdCriteria: string;
  status: ComplianceRequirementStatus;
  actionRequired: string;
  statutoryReference?: string | undefined;
}

export interface MandatoryDisclosureItem {
  id: string;
  disclosureTitle: string; // e.g. "CFTC Rule 4.41 Disclaimer"
  requiredPlacement:
    | "pre_signup"
    | "modal_confirmation"
    | "footer_all_pages"
    | "export_watermark";
  text: string;
  status: ComplianceRequirementStatus;
}

export interface ThirdPartyObligationItem {
  id: string;
  counterparty: string; // e.g. "Broker API", "Market Data Vendor"
  agreementType:
    | "api_terms_of_service"
    | "developer_agreement"
    | "data_redistribution_license";
  restrictions: string[];
  auditFrequency: string;
  status: ComplianceRequirementStatus;
}

export interface ComplianceEvidenceItem {
  id: string;
  title: string;
  evidenceType:
    | "counsel_memo"
    | "audit_report"
    | "statute_text"
    | "tos_acceptance"
    | "screenshot";
  referenceUrlOrDoc: string;
  dateRecorded: string;
  verificationMethod: string;
}

export interface UnresolvedComplianceQuestion {
  id: string;
  question: string;
  impactSeverity:
    | "blocking_mvp"
    | "blocking_public_launch"
    | "scaling_limitation"
    | "low_risk";
  hypothesizedAnswer: string;
  requiredExpertise:
    | "securities_lawyer"
    | "tax_accountant"
    | "privacy_officer"
    | "fintech_counsel";
  status: "open" | "assigned" | "clarified" | "resolved";
}

export interface ProductClassificationDetails {
  category:
    | "non_custodial_tool"
    | "analytics_dashboard"
    | "trade_journal"
    | "signal_service"
    | "algo_execution"
    | "ria_advisory";
  custodyStatus: "non_custodial" | "third_party_custody" | "custodial";
  regulatoryRole:
    "technology_provider" | "educational_publisher" | "registered_entity";
  classificationRationale: string;
}

export interface PrivacyAndDataGovernance {
  dataClassification:
    | "public"
    | "pseudonymous_trading_data"
    | "financial_records"
    | "pii_sensitive";
  storageRegime: "local_first_only" | "client_encrypted" | "cloud_synced";
  applicableStatutes: string[];
  dataRetentionPolicy: string;
  redactionRules: string;
}

export interface ProfessionalLegalReviewDetails {
  counselNameOrFirm?: string | undefined;
  lastFormalReviewDate?: string | undefined;
  nextScheduledReviewDate?: string | undefined;
  counselOpinionSummary?: string | undefined;
  disclaimerOfNonLegalAdvice: string;
}

export interface LegalComplianceContent {
  frameworkSummary: string;
  productClassification?: ProductClassificationDetails | undefined;
  jurisdictions?: JurisdictionTrackingRecord[] | undefined;
  licensing?: LicensingRequirementItem[] | undefined;
  privacyAndData?: PrivacyAndDataGovernance | undefined;
  disclosures?: MandatoryDisclosureItem[] | undefined;
  thirdPartyObligations?: ThirdPartyObligationItem[] | undefined;
  evidence?: ComplianceEvidenceItem[] | undefined;
  unresolvedQuestions?: UnresolvedComplianceQuestion[] | undefined;
  professionalReview?: ProfessionalLegalReviewDetails | undefined;
  requirements?: ComplianceItem[] | undefined;
  lastAuditDate?: string | undefined;
  legalCounselNotes?: string | undefined;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  type: ProjectDocumentType;
  title: string;
  content: string; // Unified markdown/text content for backward compatibility
  flexibleContent?: FlexibleDocumentContent | undefined;
  executionPlan?: StructuredExecutionPlan | undefined;
  complianceContent?: LegalComplianceContent | undefined;
  version: number; // Incremented on explicit milestone/founder save
  createdAt: string;
  updatedAt: string;
  history?: DocumentVersionSnapshot[] | undefined;
}

export interface Project {
  id: string;
  name: string;
  objective: string;
  priorityId: PriorityId;
  status: ProjectStatus;
  hypothesis: string;
  milestone: string;
  metrics: string;
  bottlenecks: string;
  evidence: string;
  decisions: string;
  learning: string;
  documents: string;
  createdAt: string;
  demo?: boolean | undefined;
  deadline?: string | undefined;
  workstream?: "A" | "B" | undefined;
  learningCategories?: string[] | undefined;
  docs?: (ProjectDoc | ProjectDocument)[] | undefined;

  // Schema v3 & v4 enhancements
  lifecyclePhase?: LifecyclePhase | undefined;
  customPhases?: CustomLifecyclePhase[] | undefined;
  activeGoalId?: string | undefined;
  goals?: ProjectGoal[] | undefined; // Canonical authoritative collection (v4)
  goalsHistory?: ProjectGoal[] | undefined; // Non-authoritative backward compatibility mirror (projected from goals)
  milestones?: Milestone[] | undefined;
  executionPlan?: StructuredExecutionPlan | undefined; // Authoritative structured plan (v4)
  complianceContent?: LegalComplianceContent | undefined;
}

export interface ProjectPerformanceSummary {
  projectId: string;
  totalActualHours: number;
  totalPlannedHours: number;
  tasksPlannedTotal: number;
  tasksDoneTotal: number;
  taskCompletionRate: number; // 0 to 100
  outputsCount: number;
  outputs: {
    date: string;
    title: string;
    text: string;
    workstream?: string | undefined;
  }[];
  activeDaysCount: number;
  firstActiveDate?: string | undefined;
  lastActiveDate?: string | undefined;
}
