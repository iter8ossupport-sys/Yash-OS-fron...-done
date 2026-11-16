/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Core Domain Entities & Structural Contracts
 *
 * Strict Architectural Rule: Pure TypeScript; 0 React or Browser dependencies.
 */

import type {
  CapabilityDimension,
  CaptureInboxMethod,
  CaptureInboxStatus,
  DataClassificationLevel,
  EvidencePolarity,
  FoundationId,
  KnowledgeDevelopmentStatus,
  KnowledgePerspective,
  QuestionOrigin,
  QuestionPriority,
  QuestionStatus,
  RelationshipType,
  ReviewType,
  SessionStatus,
  SourceCategory,
} from "./enums";

/** Permanent Foundation: Human Understanding or Reality Understanding */
export interface FoundationEntity {
  readonly id: FoundationId;
  readonly name: string;
  readonly description: string;
  readonly examples: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Evolving knowledge domain; can attach to a foundation or stand independently */
export interface DomainEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly foundationId?: FoundationId | undefined;
  readonly isArchived: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string | undefined;
}

/** Subject / field under a specific domain */
export interface SubjectEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly domainId: string;
  readonly isArchived: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string | undefined;
}

/** Specific topic or research area under a subject */
export interface TopicEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly subjectId: string;
  readonly isArchived: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string | undefined;
}

/**
 * Learning Question: Central driver of inquiry and investigation.
 * One question can span multiple sessions and connect to multiple Knowledge Units.
 */
export interface LearningQuestionEntity {
  readonly id: string;
  readonly question: string;
  readonly description: string;
  readonly origin: QuestionOrigin;
  readonly foundationId?: FoundationId | undefined;
  readonly domainId?: string | undefined;
  readonly subjectId?: string | undefined;
  readonly topicId?: string | undefined;
  readonly priority: QuestionPriority;
  readonly status: QuestionStatus;
  readonly linkedSessionIds: readonly string[];
  readonly linkedKnowledgeUnitIds: readonly string[];
  readonly currentUnderstanding: string;
  readonly remainingGaps: string;
  readonly nextLogicalStep: string;
  readonly classification: DataClassificationLevel;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string | undefined;
}

/**
 * Learning Session: Active or historical investigation block.
 * Represents learning effort; one session can update zero, one or many Knowledge Units.
 */
export interface LearningSessionEntity {
  readonly id: string;
  readonly title: string;
  readonly status: SessionStatus;
  readonly linkedQuestionIds: readonly string[];
  readonly learningContext: string;
  readonly investigation: string;
  readonly explanationInOwnWords: string;
  readonly findings: string;
  readonly remainingGaps: string;
  readonly linkedKnowledgeUnitIds: readonly string[];
  readonly sourceIds: readonly string[];
  readonly durationMinutes?: number | undefined;
  readonly startTime: string;
  readonly completionTime?: string | undefined;
  readonly nextLogicalStep: string;
  readonly classification: DataClassificationLevel;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Immutable record of historical change when revising a Knowledge Unit */
export interface KnowledgeRevision {
  readonly id: string;
  readonly timestamp: string;
  readonly previousStatus: KnowledgeDevelopmentStatus;
  readonly newStatus: KnowledgeDevelopmentStatus;
  readonly previousSummary: string;
  readonly previousExplanation: string;
  readonly reasonForChange: string;
  readonly authorOrContext: string;
}

/**
 * Section 1: Identity and Classification
 */
export interface KnowledgeSectionIdentity {
  readonly id: string;
  readonly title: string;
  readonly perspective: KnowledgePerspective;
  readonly classification: DataClassificationLevel;
  readonly tags: readonly string[];
  readonly foundationId?: FoundationId | undefined;
  readonly domainId?: string | undefined;
  readonly subjectId?: string | undefined;
  readonly topicId?: string | undefined;
}

/**
 * Section 2: Core Understanding
 */
export interface KnowledgeSectionCore {
  readonly plainEnglishExplanation: string;
  readonly corePrinciples: readonly string[];
  readonly mentalModels: readonly string[];
}

/**
 * Section 3: Deeper Understanding
 */
export interface KnowledgeSectionDeeper {
  readonly nuancedMechanisms: string;
  readonly boundaryConditions: string;
  readonly counterExamples: readonly string[];
}

/**
 * Section 4: Sources and Evidence
 */
export interface KnowledgeSectionSourcesAndEvidence {
  readonly sourceIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly competingTheories: readonly string[];
}

/**
 * Section 5: Relationships and Applications
 */
export interface KnowledgeSectionRelationshipsAndApplications {
  readonly relationshipIds: readonly string[];
  readonly applicationRecordIds: readonly string[];
  readonly operationalNotes?: string | undefined;
}

/**
 * Section 6: Development History
 */
export interface KnowledgeSectionHistory {
  readonly revisions: readonly KnowledgeRevision[];
}

/**
 * Knowledge Unit: Canonical reusable knowledge record.
 * Formatted into 6 distinct sections with progressive enrichment and revision preservation.
 */
export interface KnowledgeUnitEntity {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly perspective: KnowledgePerspective;
  readonly status: KnowledgeDevelopmentStatus;
  readonly classification: DataClassificationLevel;
  readonly foundationId?: FoundationId | undefined;
  readonly domainId?: string | undefined;
  readonly subjectId?: string | undefined;
  readonly topicId?: string | undefined;

  // Six Canonical Sections
  readonly identity: KnowledgeSectionIdentity;
  readonly coreUnderstanding: KnowledgeSectionCore;
  readonly deeperUnderstanding: KnowledgeSectionDeeper;
  readonly sourcesAndEvidence: KnowledgeSectionSourcesAndEvidence;
  readonly relationshipsAndApplications: KnowledgeSectionRelationshipsAndApplications;
  readonly developmentHistory: KnowledgeSectionHistory;

  readonly isArchived: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string | undefined;
}

/** Independent Source entity */
export interface SourceEntity {
  readonly id: string;
  readonly title: string;
  readonly type: SourceCategory;
  readonly authorOrCreator?: string | undefined;
  readonly urlOrLocation?: string | undefined;
  readonly publicationDate?: string | undefined;
  readonly accessDate: string;
  readonly description: string;
  readonly provenanceMetadata: Record<string, unknown>;
  readonly reliabilityAssessment: string; // Qualitative, contextual assessment (no fake universal numbers)
  readonly classification: DataClassificationLevel;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Independent Evidence entity */
export interface EvidenceEntity {
  readonly id: string;
  readonly description: string;
  readonly evidenceType: string;
  readonly sourceId?: string | undefined;
  readonly knowledgeUnitId: string;
  readonly polarity: EvidencePolarity; // supports or challenges
  readonly context: string;
  readonly qualityAssessment: string;
  readonly date: string;
  readonly provenance: string;
  readonly classification: DataClassificationLevel;
  readonly createdAt: string;
}

/** Explicit semantic relationship between two Knowledge Units */
export interface KnowledgeRelationshipEntity {
  readonly id: string;
  readonly sourceKnowledgeUnitId: string;
  readonly targetKnowledgeUnitId: string;
  readonly type: RelationshipType;
  readonly explanation: string; // Mandatory architectural rationale
  readonly createdAt: string;
}

/** Lightweight or formal reference to P1 operational tasks/projects */
export interface OperationalP1Ref {
  readonly projectId?: string | undefined;
  readonly milestoneId?: string | undefined;
  readonly taskId?: string | undefined;
  readonly label?: string | undefined;
}

/** Lightweight or formal reference to P2 cashflow/trading execution */
export interface OperationalP2Ref {
  readonly workstream: "A" | "B";
  readonly sessionDate?: string | undefined;
  readonly label?: string | undefined;
}

/** Real-world Application Record derived from execution */
export interface ApplicationRecordEntity {
  readonly id: string;
  readonly title: string;
  readonly contextAndProblem: string;
  readonly connectedKnowledgeUnitIds: readonly string[];
  readonly relatedP1Reference?: OperationalP1Ref | undefined;
  readonly relatedP2Reference?: OperationalP2Ref | undefined;
  readonly intendedAction: string;
  readonly expectedOutcome: string;
  readonly actualOutcome: string;
  readonly outcomeMatched: boolean;
  readonly evidence: string;
  readonly reflectionAndLessons: string;
  readonly followUpQuestions: readonly string[];
  readonly classification: DataClassificationLevel;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Qualitative evidence evaluation for capability development */
export interface CapabilityEvidenceDimension {
  readonly dimension: CapabilityDimension;
  readonly qualitativeAssessment: string;
  readonly supportingEvidence: readonly string[];
}

/** Structured Learning or Capability Review */
export interface ReviewEntity {
  readonly id: string;
  readonly type: ReviewType;
  readonly period: string; // e.g. "2026-W46" or "2026-M11"
  readonly findings: string;
  readonly updatedUnderstanding: string;
  readonly unresolvedQuestions: readonly string[];
  readonly capabilityEvidence: readonly CapabilityEvidenceDimension[];
  readonly nextFocus: string;
  readonly approvalState: "draft" | "approved" | "archived";
  readonly classification: DataClassificationLevel;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Captured inbox item pending review and classification */
export interface CaptureInboxItemEntity {
  readonly id: string;
  readonly title: string;
  readonly rawContent: string;
  readonly method: CaptureInboxMethod;
  readonly status: CaptureInboxStatus;
  readonly sourceUrlOrLocation?: string | undefined;
  readonly processedTargetType?:
    "question" | "knowledge_unit" | "source" | undefined;
  readonly processedTargetId?: string | undefined;
  readonly classification: DataClassificationLevel;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Active learning context preserving workflow continuity across sessions */
export interface LearningContextEntity {
  readonly id: string;
  readonly currentQuestionId?: string | undefined;
  readonly activeSessionId?: string | undefined;
  readonly currentFocus: string;
  readonly lastStoppingPoint: string;
  readonly remainingGaps: string;
  readonly nextLogicalStep: string;
  readonly lastActivityAt: string;
  readonly updatedAt: string;
}
