/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Pure Domain Rules, State Transitions & Invariant Logic
 *
 * Strict Architectural Rule: Pure TypeScript; 0 React or Browser dependencies.
 */

import type {
  DataClassificationLevel,
  FoundationId,
  KnowledgeDevelopmentStatus,
  KnowledgePerspective,
  QuestionStatus,
  RelationshipType,
  SessionStatus,
} from "./enums";
import type {
  FoundationEntity,
  KnowledgeRevision,
  KnowledgeUnitEntity,
} from "./entities";

/**
 * The Two Permanent Foundations of Yash OS Priority 3.
 * These are immutable architectural pillars.
 */
export const PERMANENT_FOUNDATIONS: Record<FoundationId, FoundationEntity> = {
  human_understanding: {
    id: "human_understanding",
    name: "Human Understanding",
    description:
      "Understand humans as biological, cognitive, psychological, and social beings to improve communication, trust, and execution.",
    examples: [
      "Biology & physiology",
      "Neuroscience & cognition",
      "Psychology & behavioral heuristics",
      "Human motivation & deep needs",
      "Interpersonal communication & persuasion",
      "Social dynamics & institutional structures",
      "Trust building & deception detection",
      "Customer behavior & market demand",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  reality_understanding: {
    id: "reality_understanding",
    name: "Reality Understanding",
    description:
      "Understand the physical, mathematical, logical, and technological reality to build robust systems and solve non-trivial problems.",
    examples: [
      "Physics & thermodynamics",
      "Mathematics & probability",
      "Formal logic & epistemological reasoning",
      "Chemistry & material properties",
      "Energy & mechanical engineering",
      "Computing architectures & information theory",
      "Software engineering & distributed systems",
      "Artificial intelligence & algorithmic dynamics",
      "Operational infrastructure & capital allocation",
      "Scientific invention & empirical testing",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
};

/**
 * Validates allowable state transitions for Learning Questions.
 * Note: Questions are never automatically resolved by completing a session.
 */
export function canTransitionQuestionStatus(
  from: QuestionStatus,
  to: QuestionStatus,
): boolean {
  if (from === to) return true;

  const validTransitions: Record<QuestionStatus, readonly QuestionStatus[]> = {
    open: ["investigating", "postponed", "archived"],
    investigating: [
      "partially_understood",
      "resolved_for_now",
      "postponed",
      "archived",
    ],
    partially_understood: [
      "investigating",
      "resolved_for_now",
      "postponed",
      "archived",
    ],
    resolved_for_now: ["reopened", "investigating", "archived"],
    reopened: [
      "investigating",
      "partially_understood",
      "resolved_for_now",
      "postponed",
      "archived",
    ],
    postponed: ["open", "investigating", "archived"],
    archived: ["open", "reopened"],
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Validates allowable state transitions for Learning Sessions.
 */
export function canTransitionSessionStatus(
  from: SessionStatus,
  to: SessionStatus,
): boolean {
  if (from === to) return true;

  const validTransitions: Record<SessionStatus, readonly SessionStatus[]> = {
    in_progress: ["paused", "completed", "archived"],
    paused: ["in_progress", "completed", "archived"],
    completed: ["archived"],
    archived: ["completed"],
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Validates allowable Knowledge Unit development progress.
 * Transitioning to "validated" requires empirical evidence or application.
 */
export function canDevelopKnowledgeUnit(
  from: KnowledgeDevelopmentStatus,
  to: KnowledgeDevelopmentStatus,
  evidenceCount = 0,
): { allowed: boolean; reason?: string } {
  if (from === to) return { allowed: true };

  // Can always revise backward when new counter-evidence or nuances are uncovered
  const hierarchy: Record<KnowledgeDevelopmentStatus, number> = {
    captured: 0,
    understood: 1,
    tested: 2,
    validated: 3,
  };

  if (hierarchy[to] < hierarchy[from]) {
    return { allowed: true };
  }

  // To reach "validated", must have at least 1 verified evidence record or application
  if (to === "validated" && evidenceCount < 1) {
    return {
      allowed: false,
      reason:
        "Knowledge Unit cannot transition to 'validated' without at least one verifiable evidence record or real-world application.",
    };
  }

  // Step-wise forward progression
  if (hierarchy[to] <= hierarchy[from] + 1) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Cannot skip development stages directly from '${from}' to '${to}'.`,
  };
}

/**
 * Pure function: revises a Knowledge Unit while preserving historical positions.
 * Never silently overwrites an existing position without a recorded revision.
 */
export function reviseKnowledgeUnit(
  unit: KnowledgeUnitEntity,
  updates: {
    title?: string;
    summary?: string;
    plainEnglishExplanation?: string;
    newStatus?: KnowledgeDevelopmentStatus;
    reasonForChange: string;
    authorOrContext?: string;
  },
  now = new Date().toISOString(),
): KnowledgeUnitEntity {
  const newStatus = updates.newStatus ?? unit.status;
  const newSummary = updates.summary ?? unit.summary;
  const newPlainEnglish =
    updates.plainEnglishExplanation ??
    unit.coreUnderstanding.plainEnglishExplanation;

  const revision: KnowledgeRevision = {
    id: `rev-${now}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now,
    previousStatus: unit.status,
    newStatus,
    previousSummary: unit.summary,
    previousExplanation: unit.coreUnderstanding.plainEnglishExplanation,
    reasonForChange:
      updates.reasonForChange.trim() ||
      "Understanding updated with new synthesis",
    authorOrContext:
      updates.authorOrContext?.trim() || "Founder Direct Synthesis",
  };

  return {
    ...unit,
    title: updates.title?.trim() || unit.title,
    summary: newSummary,
    status: newStatus,
    coreUnderstanding: {
      ...unit.coreUnderstanding,
      plainEnglishExplanation: newPlainEnglish,
    },
    developmentHistory: {
      revisions: [revision, ...unit.developmentHistory.revisions],
    },
    updatedAt: now,
  };
}

/**
 * Validates a proposed relationship between Knowledge Units.
 * Self-connections are disallowed; non-empty rationale is mandatory.
 */
export function canCreateKnowledgeRelationship(
  sourceId: string,
  targetId: string,
  type: RelationshipType,
  explanation: string,
): { valid: boolean; error?: string } {
  if (!sourceId || !targetId) {
    return { valid: false, error: "Source and target IDs are required." };
  }
  if (sourceId === targetId) {
    return {
      valid: false,
      error: "A Knowledge Unit cannot link to itself.",
    };
  }
  if (!explanation || explanation.trim().length < 5) {
    return {
      valid: false,
      error:
        "Every knowledge relationship must contain a meaningful explanation (minimum 5 characters).",
    };
  }
  return { valid: true };
}

/**
 * Factory for creating a progressively enrichable Knowledge Unit.
 * Initializes all 6 sections with safe, clean default structures so the entity
 * is immediately valid and renderable without forcing the user to complete
 * every section during initial capture.
 */
export function createInitialKnowledgeUnit(params: {
  id: string;
  title: string;
  summary?: string;
  perspective?: KnowledgePerspective;
  status?: KnowledgeDevelopmentStatus;
  classification?: DataClassificationLevel;
  foundationId?: FoundationId;
  domainId?: string;
  subjectId?: string;
  topicId?: string;
  tags?: string[];
  plainEnglishExplanation?: string;
  corePrinciples?: string[];
  mentalModels?: string[];
  now?: string;
}): KnowledgeUnitEntity {
  const now = params.now ?? new Date().toISOString();
  const perspective = params.perspective ?? "personal_understanding";
  const status = params.status ?? "captured";
  const classification = params.classification ?? "general";
  const summary = params.summary ?? "";
  const plainEnglish = params.plainEnglishExplanation ?? summary;

  return {
    id: params.id,
    title: params.title.trim(),
    summary,
    perspective,
    status,
    classification,
    foundationId: params.foundationId,
    domainId: params.domainId,
    subjectId: params.subjectId,
    topicId: params.topicId,
    identity: {
      id: params.id,
      title: params.title.trim(),
      perspective,
      classification,
      tags: params.tags ?? [],
      foundationId: params.foundationId,
      domainId: params.domainId,
      subjectId: params.subjectId,
      topicId: params.topicId,
    },
    coreUnderstanding: {
      plainEnglishExplanation: plainEnglish,
      corePrinciples: params.corePrinciples ?? [],
      mentalModels: params.mentalModels ?? [],
    },
    deeperUnderstanding: {
      nuancedMechanisms: "",
      boundaryConditions: "",
      counterExamples: [],
    },
    sourcesAndEvidence: {
      sourceIds: [],
      evidenceIds: [],
      competingTheories: [],
    },
    relationshipsAndApplications: {
      relationshipIds: [],
      applicationRecordIds: [],
      operationalNotes: undefined,
    },
    developmentHistory: {
      revisions: [],
    },
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}
