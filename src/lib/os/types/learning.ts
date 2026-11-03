/**
 * Priority 3: Learning for Execution Domain Types
 * Core Purpose: Continuously develop founder capabilities and understanding.
 * Supports:
 *  1. Skill Development (practical capability backed by real-world execution evidence)
 *  2. Subject Exploration (understanding, retention, and synthesis; application optional)
 */

export type LearningJourneyType =
  | "skill_development" // Practical skill capability with real-world application & evidence
  | "subject_exploration"; // Independent subject study with conceptual synthesis; application optional

export type LearningJourneyStatus =
  "active" | "paused" | "completed" | "archived";

export type LearningObjectiveStatus =
  "active" | "in_progress" | "achieved" | "completed" | "deferred";

export interface LearningObjective {
  id: string;
  journeyId: string;
  title: string;
  description?: string | undefined;
  status: LearningObjectiveStatus;
  targetCapabilityId?: string | undefined;
  targetDeadline?: string | undefined;
  evidenceSummary?: string | undefined;
  completionEvidence?: string | undefined;
  practicalApplicationRequirement?: string | undefined;
  createdAt?: string | undefined;
  achievedAt?: string | undefined;
}

export type LearningResourceType =
  | "book"
  | "course"
  | "documentation"
  | "academic_paper"
  | "paper"
  | "video"
  | "podcast"
  | "article"
  | "expert_conversation"
  | "expert_session"
  | "exercise"
  | "experiment_data"
  | "custom";

export type LearningResourceStatus =
  | "queued"
  | "to_study"
  | "in_progress"
  | "completed"
  | "referenced"
  | "reference"
  | "archived";

export interface LearningResource {
  id: string;
  title: string;
  type: LearningResourceType;
  authorOrSource?: string | undefined;
  urlOrLocation?: string | undefined;
  description?: string | undefined;
  whyStudying?: string | undefined;
  status: LearningResourceStatus;
  journeyIds: string[]; // Many-to-many relationship: resource can be reused across journeys without duplicate canonical records
  notes: string;
  distilledTakeaways: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | undefined;
}

export interface LearningSession {
  id: string;
  journeyId: string;
  title?: string | undefined;
  date: string; // YYYY-MM-DD
  conceptStudied: string; // The core concept, principle or mental model examined
  durationMinutes?: number | undefined;
  questionsAndUncertainties?: string | undefined;
  uncertaintyOrQuestions?: string | undefined;
  explanationInOwnWords?: string | undefined;
  plainEnglishExplanation?: string | undefined;
  newInsights?: string | undefined;
  referencedResourceIds?: string[] | undefined;
  referencedObjectiveIds?: string[] | undefined;
  optionalNextAction?: string | undefined;
  nextAction?: string | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
}

export type ApplicationRecordType =
  | "project_task"
  | "task_execution"
  | "prototype"
  | "product_implementation"
  | "experiment"
  | "trading_execution"
  | "playbook_creation"
  | "practice";

export interface ApplicationRecord {
  id: string;
  journeyId: string;
  title: string;
  type: ApplicationRecordType;
  description: string;
  linkedObjectiveIds?: string[] | undefined;
  linkedPriorityId?: 1 | 2 | 3 | undefined;
  linkedProjectId?: string | undefined; // Canonical link to active project
  linkedTaskId?: string | undefined; // Canonical link to active task
  evidenceOutput: string; // Verifiable proof (PR, commit, code, transaction log, metric)
  outcomeAchieved: boolean; // Did reality match the hypothesis?
  appliedAt?: string | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
}

export type CapabilityAssessmentState =
  | "not_assessed"
  | "developing"
  | "demonstrated_with_support"
  | "demonstrated_independently";

export interface CapabilityArea {
  id: string;
  name: string;
  description: string;
  journeyIds?: string[] | undefined; // Associated journeys
  currentState: CapabilityAssessmentState;
  evidence: string; // Strict requirement: Demonstrated capability requires verifiable evidence
  reviewDate?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export type KnowledgeArtifactCategory =
  "principle" | "mental_model" | "framework" | "method" | "playbook" | "note";

export interface KnowledgeArtifactProvenance {
  journeyId: string;
  journeyTitle?: string | undefined;
  resourceId?: string | undefined;
  resourceTitle?: string | undefined;
  sessionId?: string | undefined;
  applicationId?: string | undefined;
}

export interface KnowledgeArtifact {
  id: string;
  title: string;
  category: KnowledgeArtifactCategory;
  content: string;
  sourceProvenance?: KnowledgeArtifactProvenance | undefined;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningReview {
  id: string;
  journeyId: string;
  date: string;
  intendedLearning: string;
  actualUnderstanding: string;
  practicalApplication?: string | undefined; // Optional for Subject Exploration
  evidence: string;
  remainingGaps: string;
  nextImprovement: string;
  createdAt: string;
}

export interface LearningJourney {
  id: string;
  title: string;
  description: string;
  type: LearningJourneyType;
  status: LearningJourneyStatus;
  purposeAndOutcome?: string | undefined;
  purpose?: string | undefined;
  objectives?: LearningObjective[] | undefined;
  capabilityAreaIds?: string[] | undefined;
  targetCapabilityAreaIds?: string[] | undefined;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | undefined;
  archivedAt?: string | undefined;
}

/** Legacy record backward compatibility */
export type LearningWorkflowType =
  "capability_acquisition" | "discovery_synthesis";

export interface CapabilityAcquisitionRecord {
  id: string;
  targetSkill: string;
  unblocksPriorityId: 1 | 2;
  unblocksProjectId?: string | undefined;
  bottleneckReferenceId?: string | undefined;
  resourcesStudied: string[];
  appliedExperiment: string;
  outcomeAchieved: boolean;
  promotedKnowledgeIds: string[];
  createdAt: string;
  completedAt?: string | undefined;
}

export interface DiscoverySynthesisRecord {
  id: string;
  subjectDomain: string;
  inquiryHypothesis: string;
  sourcesSurveyed: string[];
  coreSyntheses: string[];
  distilledFrameworks: string[];
  createdAt: string;
}

export interface LearningKnowledgeSystem {
  id: string;
  version: number;
  coreDocument: {
    title: string;
    markdownContent: string;
    lastUpdated: string;
  };
  activeWorkflow: LearningWorkflowType;
  journeys: LearningJourney[];
  resources: LearningResource[];
  sessions: LearningSession[];
  applications: ApplicationRecord[];
  capabilities: CapabilityArea[];
  knowledgeArtifacts: KnowledgeArtifact[];
  reviews: LearningReview[];
  acquisitions?: CapabilityAcquisitionRecord[] | undefined;
  discoveries?: DiscoverySynthesisRecord[] | undefined;
}
