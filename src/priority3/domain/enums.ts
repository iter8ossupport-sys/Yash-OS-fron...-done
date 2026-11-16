/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Domain Enums & Value Object Definitions
 *
 * Strict Architectural Rule: Pure TypeScript; 0 React or Browser dependencies.
 */

/** The two permanent foundational pillars of human and reality understanding. */
export const FOUNDATION_IDS = [
  "human_understanding",
  "reality_understanding",
] as const;
export type FoundationId = (typeof FOUNDATION_IDS)[number];

/** Origins of a Learning Question */
export const QUESTION_ORIGINS = ["foundation", "reality", "execution"] as const;
export type QuestionOrigin = (typeof QUESTION_ORIGINS)[number];

/** Strategic priority levels for Learning Questions */
export const QUESTION_PRIORITIES = [
  "immediate",
  "important",
  "exploratory",
] as const;
export type QuestionPriority = (typeof QUESTION_PRIORITIES)[number];

/** Complete lifecycle states of a Learning Question */
export const QUESTION_STATUSES = [
  "open",
  "investigating",
  "partially_understood",
  "resolved_for_now",
  "reopened",
  "postponed",
  "archived",
] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

/** Lifecycle states of an active or past Learning Session */
export const SESSION_STATUSES = [
  "in_progress",
  "paused",
  "completed",
  "archived",
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

/**
 * Epistemological perspective of a Knowledge Unit:
 * 1. Objective Knowledge: Proven facts, natural laws, empirical data.
 * 2. Personal Understanding: Mental models, translated interpretations.
 * 3. Hypothesis / Interpretation: Working assumptions, unproven conjectures.
 */
export const KNOWLEDGE_PERSPECTIVES = [
  "objective_knowledge",
  "personal_understanding",
  "hypothesis",
] as const;
export type KnowledgePerspective = (typeof KNOWLEDGE_PERSPECTIVES)[number];

/**
 * Maturity and verification states of a Knowledge Unit:
 * progressive development without claiming universal dogmatic certainty.
 */
export const KNOWLEDGE_DEVELOPMENT_STATUSES = [
  "captured",
  "understood",
  "tested",
  "validated",
] as const;
export type KnowledgeDevelopmentStatus =
  (typeof KNOWLEDGE_DEVELOPMENT_STATUSES)[number];

/** Categories of learning and evidence sources */
export const SOURCE_CATEGORIES = [
  "primary_evidence",
  "expert_interpretation",
  "practical_experience",
  "secondary_information",
  "ai_generated",
] as const;
export type SourceCategory = (typeof SOURCE_CATEGORIES)[number];

/** Polarity of evidence with respect to a Knowledge Unit or hypothesis */
export const EVIDENCE_POLARITIES = ["supports", "challenges"] as const;
export type EvidencePolarity = (typeof EVIDENCE_POLARITIES)[number];

/** Explicit semantic relationships between Knowledge Units */
export const RELATIONSHIP_TYPES = [
  "related_to",
  "depends_on",
  "part_of",
  "explains",
  "contrasts_with",
  "applied_in",
  "supported_by",
  "challenges",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

/** Strict 4-tier data classification and privacy levels */
export const DATA_CLASSIFICATIONS = [
  "general",
  "personal",
  "sensitive",
  "highly_restricted",
] as const;
export type DataClassificationLevel = (typeof DATA_CLASSIFICATIONS)[number];

/** Supported structured review cadences */
export const REVIEW_TYPES = [
  "weekly_learning_review",
  "monthly_capability_review",
] as const;
export type ReviewType = (typeof REVIEW_TYPES)[number];

/** Four qualitative dimensions of founder capability */
export const CAPABILITY_DIMENSIONS = [
  "understanding",
  "reasoning",
  "transfer",
  "reality_accuracy",
] as const;
export type CapabilityDimension = (typeof CAPABILITY_DIMENSIONS)[number];

/** Capture channels for raw learning material */
export const CAPTURE_INBOX_METHODS = [
  "quick_capture",
  "source_capture",
  "file_import",
  "ai_assisted",
] as const;
export type CaptureInboxMethod = (typeof CAPTURE_INBOX_METHODS)[number];

/** Processing stages of captured inbox material */
export const CAPTURE_INBOX_STATUSES = [
  "captured",
  "reviewed",
  "processed",
  "integrated",
  "archived",
] as const;
export type CaptureInboxStatus = (typeof CAPTURE_INBOX_STATUSES)[number];
