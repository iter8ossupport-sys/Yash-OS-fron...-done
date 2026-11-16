/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Domain Validation & Integrity Checks
 *
 * Strict Architectural Rule: Pure TypeScript; 0 React or Browser dependencies.
 */

import type {
  ApplicationRecordEntity,
  CaptureInboxItemEntity,
  EvidenceEntity,
  KnowledgeRelationshipEntity,
  KnowledgeUnitEntity,
  LearningQuestionEntity,
  LearningSessionEntity,
  ReviewEntity,
  SourceEntity,
} from "./entities";
import {
  CAPTURE_INBOX_METHODS,
  CAPTURE_INBOX_STATUSES,
  DATA_CLASSIFICATIONS,
  EVIDENCE_POLARITIES,
  KNOWLEDGE_DEVELOPMENT_STATUSES,
  KNOWLEDGE_PERSPECTIVES,
  QUESTION_ORIGINS,
  QUESTION_PRIORITIES,
  QUESTION_STATUSES,
  RELATIONSHIP_TYPES,
  REVIEW_TYPES,
  SESSION_STATUSES,
  SOURCE_CATEGORIES,
} from "./enums";

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateLearningQuestion(
  q: Partial<LearningQuestionEntity>,
): ValidationResult {
  const errors: string[] = [];

  if (!q.id || !q.id.trim()) errors.push("Question ID is required.");
  if (!q.question || q.question.trim().length < 5) {
    errors.push("Question text must be at least 5 characters.");
  }
  if (!q.origin || !QUESTION_ORIGINS.includes(q.origin)) {
    errors.push(`Invalid origin: '${q.origin}'.`);
  }
  if (!q.priority || !QUESTION_PRIORITIES.includes(q.priority)) {
    errors.push(`Invalid priority: '${q.priority}'.`);
  }
  if (!q.status || !QUESTION_STATUSES.includes(q.status)) {
    errors.push(`Invalid status: '${q.status}'.`);
  }
  if (!q.classification || !DATA_CLASSIFICATIONS.includes(q.classification)) {
    errors.push(`Invalid classification: '${q.classification}'.`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateLearningSession(
  s: Partial<LearningSessionEntity>,
): ValidationResult {
  const errors: string[] = [];

  if (!s.id || !s.id.trim()) errors.push("Session ID is required.");
  if (!s.title || !s.title.trim()) errors.push("Session title is required.");
  if (!s.status || !SESSION_STATUSES.includes(s.status)) {
    errors.push(`Invalid session status: '${s.status}'.`);
  }
  if (!s.startTime || Number.isNaN(Date.parse(s.startTime))) {
    errors.push("Valid session startTime ISO string is required.");
  }
  if (!s.classification || !DATA_CLASSIFICATIONS.includes(s.classification)) {
    errors.push(`Invalid classification: '${s.classification}'.`);
  }

  return { valid: errors.length === 0, errors };
}

export type KnowledgeUnitValidationMode = "capture" | "complete";

export function validateKnowledgeUnit(
  ku: Partial<KnowledgeUnitEntity>,
  mode: KnowledgeUnitValidationMode = "capture",
): ValidationResult {
  const errors: string[] = [];

  if (!ku.id || !ku.id.trim()) errors.push("Knowledge Unit ID is required.");
  if (!ku.title || !ku.title.trim())
    errors.push("Knowledge Unit title is required.");
  if (!ku.perspective || !KNOWLEDGE_PERSPECTIVES.includes(ku.perspective)) {
    errors.push(`Invalid perspective: '${ku.perspective}'.`);
  }
  if (!ku.status || !KNOWLEDGE_DEVELOPMENT_STATUSES.includes(ku.status)) {
    errors.push(`Invalid development status: '${ku.status}'.`);
  }
  if (!ku.classification || !DATA_CLASSIFICATIONS.includes(ku.classification)) {
    errors.push(`Invalid classification: '${ku.classification}'.`);
  }

  // Progressive enrichment validation:
  // In "capture" mode, sections are permitted to be empty defaults.
  // In "complete" mode (e.g. before validating maturity), we check for substantive depth.
  if (mode === "complete") {
    if (
      !ku.coreUnderstanding ||
      !ku.coreUnderstanding.plainEnglishExplanation.trim()
    ) {
      errors.push(
        "Core Understanding plain-English explanation is required for complete validation.",
      );
    }
    if (
      !ku.sourcesAndEvidence ||
      (ku.sourcesAndEvidence.sourceIds.length === 0 &&
        ku.sourcesAndEvidence.evidenceIds.length === 0)
    ) {
      errors.push(
        "At least one Source or Evidence record is required for complete validation.",
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateSource(src: Partial<SourceEntity>): ValidationResult {
  const errors: string[] = [];

  if (!src.id || !src.id.trim()) errors.push("Source ID is required.");
  if (!src.title || !src.title.trim()) errors.push("Source title is required.");
  if (!src.type || !SOURCE_CATEGORIES.includes(src.type)) {
    errors.push(`Invalid source category: '${src.type}'.`);
  }
  if (!src.accessDate || Number.isNaN(Date.parse(src.accessDate))) {
    errors.push("Valid accessDate ISO string is required.");
  }
  if (
    !src.classification ||
    !DATA_CLASSIFICATIONS.includes(src.classification)
  ) {
    errors.push(`Invalid classification: '${src.classification}'.`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateEvidence(
  ev: Partial<EvidenceEntity>,
): ValidationResult {
  const errors: string[] = [];

  if (!ev.id || !ev.id.trim()) errors.push("Evidence ID is required.");
  if (!ev.description || !ev.description.trim()) {
    errors.push("Evidence description is required.");
  }
  if (!ev.knowledgeUnitId || !ev.knowledgeUnitId.trim()) {
    errors.push("Target Knowledge Unit ID is required.");
  }
  if (!ev.polarity || !EVIDENCE_POLARITIES.includes(ev.polarity)) {
    errors.push(`Invalid polarity: '${ev.polarity}'.`);
  }
  if (!ev.classification || !DATA_CLASSIFICATIONS.includes(ev.classification)) {
    errors.push(`Invalid classification: '${ev.classification}'.`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateKnowledgeRelationship(
  rel: Partial<KnowledgeRelationshipEntity>,
): ValidationResult {
  const errors: string[] = [];

  if (!rel.id || !rel.id.trim()) errors.push("Relationship ID is required.");
  if (!rel.sourceKnowledgeUnitId || !rel.sourceKnowledgeUnitId.trim()) {
    errors.push("Source Knowledge Unit ID is required.");
  }
  if (!rel.targetKnowledgeUnitId || !rel.targetKnowledgeUnitId.trim()) {
    errors.push("Target Knowledge Unit ID is required.");
  }
  if (rel.sourceKnowledgeUnitId === rel.targetKnowledgeUnitId) {
    errors.push("Source and target Knowledge Units must be different.");
  }
  if (!rel.type || !RELATIONSHIP_TYPES.includes(rel.type)) {
    errors.push(`Invalid relationship type: '${rel.type}'.`);
  }
  if (!rel.explanation || rel.explanation.trim().length < 5) {
    errors.push("Relationship explanation must be at least 5 characters.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateApplicationRecord(
  app: Partial<ApplicationRecordEntity>,
): ValidationResult {
  const errors: string[] = [];

  if (!app.id || !app.id.trim())
    errors.push("Application Record ID is required.");
  if (!app.title || !app.title.trim()) errors.push("Title is required.");
  if (!app.contextAndProblem || !app.contextAndProblem.trim()) {
    errors.push("Context and problem description is required.");
  }
  if (!app.evidence || !app.evidence.trim()) {
    errors.push("Verifiable evidence of application is required.");
  }
  if (
    !app.classification ||
    !DATA_CLASSIFICATIONS.includes(app.classification)
  ) {
    errors.push(`Invalid classification: '${app.classification}'.`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateReview(rev: Partial<ReviewEntity>): ValidationResult {
  const errors: string[] = [];

  if (!rev.id || !rev.id.trim()) errors.push("Review ID is required.");
  if (!rev.type || !REVIEW_TYPES.includes(rev.type)) {
    errors.push(`Invalid review type: '${rev.type}'.`);
  }
  if (!rev.period || !rev.period.trim())
    errors.push("Review period identifier is required.");
  if (!rev.findings || !rev.findings.trim()) {
    errors.push("Review findings are required.");
  }
  if (
    !rev.classification ||
    !DATA_CLASSIFICATIONS.includes(rev.classification)
  ) {
    errors.push(`Invalid classification: '${rev.classification}'.`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateCaptureInboxItem(
  item: Partial<CaptureInboxItemEntity>,
): ValidationResult {
  const errors: string[] = [];

  if (!item.id || !item.id.trim()) errors.push("Capture item ID is required.");
  if (!item.title || !item.title.trim())
    errors.push("Capture title is required.");
  if (!item.rawContent || !item.rawContent.trim()) {
    errors.push("Raw content cannot be empty.");
  }
  if (!item.method || !CAPTURE_INBOX_METHODS.includes(item.method)) {
    errors.push(`Invalid capture method: '${item.method}'.`);
  }
  if (!item.status || !CAPTURE_INBOX_STATUSES.includes(item.status)) {
    errors.push(`Invalid capture status: '${item.status}'.`);
  }
  if (
    !item.classification ||
    !DATA_CLASSIFICATIONS.includes(item.classification)
  ) {
    errors.push(`Invalid classification: '${item.classification}'.`);
  }

  return { valid: errors.length === 0, errors };
}
