/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Local Repository Adapters: Modular implementations of Application Ports
 *
 * Strict Architectural Rule: Each repository interface is implemented by its own
 * dedicated class, backed by the atomic P3StorageEngine.
 */

import type {
  ApplicationRecordEntity,
  CaptureInboxItemEntity,
  DomainEntity,
  EvidenceEntity,
  FoundationEntity,
  KnowledgeRelationshipEntity,
  KnowledgeUnitEntity,
  LearningContextEntity,
  LearningQuestionEntity,
  LearningSessionEntity,
  ReviewEntity,
  SourceEntity,
  SubjectEntity,
  TopicEntity,
} from "../../domain/entities";
import {
  canCreateKnowledgeRelationship,
  canTransitionQuestionStatus,
  canTransitionSessionStatus,
} from "../../domain/rules";
import {
  validateApplicationRecord,
  validateCaptureInboxItem,
  validateEvidence,
  validateKnowledgeUnit,
  validateLearningQuestion,
  validateLearningSession,
  validateReview,
  validateSource,
} from "../../domain/validation";
import type {
  ApplicationRecordFilter,
  CaptureInboxFilter,
  EvidenceFilter,
  IApplicationRecordRepository,
  ICaptureInboxRepository,
  IEvidenceRepository,
  IKnowledgeRelationshipRepository,
  IKnowledgeUnitRepository,
  ILearningContextRepository,
  ILearningQuestionRepository,
  ILearningSessionRepository,
  IReviewRepository,
  ISourceRepository,
  ITaxonomyRepository,
  KnowledgeUnitFilter,
  QuestionFilter,
  RelationshipFilter,
  ReviewFilter,
  SessionFilter,
  SourceFilter,
} from "../../application/ports/repositories";
import { P3StorageEngine } from "./storageEngine";

// ===========================================================================
// 1. LEARNING QUESTIONS REPOSITORY
// ===========================================================================

export class LocalLearningQuestionRepository implements ILearningQuestionRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(
    question: LearningQuestionEntity,
  ): Promise<LearningQuestionEntity> {
    const val = validateLearningQuestion(question);
    if (!val.valid) {
      throw new Error(
        `Validation failed for LearningQuestion: ${val.errors.join("; ")}`,
      );
    }

    this.engine.save((s) => {
      if (s.questions.some((q) => q.id === question.id)) {
        throw new Error(`Question with ID '${question.id}' already exists.`);
      }
      return { ...s, questions: [question, ...s.questions] };
    });

    return question;
  }

  async findById(id: string): Promise<LearningQuestionEntity | null> {
    const q = this.engine.load().questions.find((item) => item.id === id);
    return q ?? null;
  }

  async list(filter?: QuestionFilter): Promise<LearningQuestionEntity[]> {
    let items = [...this.engine.load().questions];

    if (filter) {
      if (!filter.includeArchived) {
        items = items.filter((q) => q.status !== "archived");
      }
      if (filter.origin)
        items = items.filter((q) => q.origin === filter.origin);
      if (filter.priority)
        items = items.filter((q) => q.priority === filter.priority);
      if (filter.status)
        items = items.filter((q) => q.status === filter.status);
      if (filter.foundationId)
        items = items.filter((q) => q.foundationId === filter.foundationId);
      if (filter.domainId)
        items = items.filter((q) => q.domainId === filter.domainId);
      if (filter.subjectId)
        items = items.filter((q) => q.subjectId === filter.subjectId);
      if (filter.topicId)
        items = items.filter((q) => q.topicId === filter.topicId);
      if (filter.search && filter.search.trim()) {
        const qStr = filter.search.toLowerCase();
        items = items.filter(
          (q) =>
            q.question.toLowerCase().includes(qStr) ||
            q.description.toLowerCase().includes(qStr) ||
            q.currentUnderstanding.toLowerCase().includes(qStr),
        );
      }
    } else {
      items = items.filter((q) => q.status !== "archived");
    }

    return items;
  }

  async update(
    id: string,
    updates: Partial<LearningQuestionEntity>,
  ): Promise<LearningQuestionEntity> {
    let updatedEntity: LearningQuestionEntity | null = null;
    const now = new Date().toISOString();

    this.engine.save((s) => {
      const idx = s.questions.findIndex((q) => q.id === id);
      if (idx === -1) throw new Error(`Question with ID '${id}' not found.`);

      const current = s.questions[idx]!;
      if (updates.status && updates.status !== current.status) {
        if (!canTransitionQuestionStatus(current.status, updates.status)) {
          throw new Error(
            `Illegal status transition from '${current.status}' to '${updates.status}'.`,
          );
        }
      }

      updatedEntity = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: now,
      };

      const copy = [...s.questions];
      copy[idx] = updatedEntity;
      return { ...s, questions: copy };
    });

    if (!updatedEntity) throw new Error(`Failed to update question '${id}'.`);
    return updatedEntity;
  }

  async archive(id: string): Promise<LearningQuestionEntity> {
    return this.update(id, {
      status: "archived",
      archivedAt: new Date().toISOString(),
    });
  }

  async restore(id: string): Promise<LearningQuestionEntity> {
    return this.update(id, {
      status: "open",
      archivedAt: undefined,
    });
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.questions.filter((q) => q.id !== id);
      deleted = next.length < s.questions.length;
      return { ...s, questions: next };
    });
    return deleted;
  }

  async findQuestionsForKnowledgeUnit(
    kuId: string,
  ): Promise<LearningQuestionEntity[]> {
    return this.engine
      .load()
      .questions.filter((q) => q.linkedKnowledgeUnitIds.includes(kuId));
  }

  async findQuestionsForSession(
    sessionId: string,
  ): Promise<LearningQuestionEntity[]> {
    return this.engine
      .load()
      .questions.filter((q) => q.linkedSessionIds.includes(sessionId));
  }
}

// ===========================================================================
// 2. LEARNING SESSIONS REPOSITORY
// ===========================================================================

export class LocalLearningSessionRepository implements ILearningSessionRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(session: LearningSessionEntity): Promise<LearningSessionEntity> {
    const val = validateLearningSession(session);
    if (!val.valid) {
      throw new Error(
        `Validation failed for LearningSession: ${val.errors.join("; ")}`,
      );
    }

    this.engine.save((s) => {
      if (s.sessions.some((item) => item.id === session.id)) {
        throw new Error(`Session with ID '${session.id}' already exists.`);
      }
      return { ...s, sessions: [session, ...s.sessions] };
    });

    return session;
  }

  async findById(id: string): Promise<LearningSessionEntity | null> {
    const s = this.engine.load().sessions.find((item) => item.id === id);
    return s ?? null;
  }

  async list(filter?: SessionFilter): Promise<LearningSessionEntity[]> {
    let items = [...this.engine.load().sessions];

    if (filter) {
      if (filter.status)
        items = items.filter((s) => s.status === filter.status);
      if (filter.questionId) {
        items = items.filter((s) =>
          s.linkedQuestionIds.includes(filter.questionId!),
        );
      }
      if (filter.kuId) {
        items = items.filter((s) =>
          s.linkedKnowledgeUnitIds.includes(filter.kuId!),
        );
      }
      if (filter.search && filter.search.trim()) {
        const qStr = filter.search.toLowerCase();
        items = items.filter(
          (s) =>
            s.title.toLowerCase().includes(qStr) ||
            s.investigation.toLowerCase().includes(qStr) ||
            s.findings.toLowerCase().includes(qStr),
        );
      }
    }

    return items;
  }

  async update(
    id: string,
    updates: Partial<LearningSessionEntity>,
  ): Promise<LearningSessionEntity> {
    let updatedEntity: LearningSessionEntity | null = null;
    const now = new Date().toISOString();

    this.engine.save((s) => {
      const idx = s.sessions.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error(`Session with ID '${id}' not found.`);

      const current = s.sessions[idx]!;
      if (updates.status && updates.status !== current.status) {
        if (!canTransitionSessionStatus(current.status, updates.status)) {
          throw new Error(
            `Illegal status transition from '${current.status}' to '${updates.status}'.`,
          );
        }
      }

      updatedEntity = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: now,
      };

      const copy = [...s.sessions];
      copy[idx] = updatedEntity;
      return { ...s, sessions: copy };
    });

    if (!updatedEntity) throw new Error(`Failed to update session '${id}'.`);
    return updatedEntity;
  }

  async archive(id: string): Promise<LearningSessionEntity> {
    return this.update(id, { status: "archived" });
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.sessions.filter((item) => item.id !== id);
      deleted = next.length < s.sessions.length;
      return { ...s, sessions: next };
    });
    return deleted;
  }

  async findSessionsForQuestion(
    questionId: string,
  ): Promise<LearningSessionEntity[]> {
    return this.engine
      .load()
      .sessions.filter((s) => s.linkedQuestionIds.includes(questionId));
  }

  async findSessionsForKnowledgeUnit(
    kuId: string,
  ): Promise<LearningSessionEntity[]> {
    return this.engine
      .load()
      .sessions.filter((s) => s.linkedKnowledgeUnitIds.includes(kuId));
  }
}

// ===========================================================================
// 3. KNOWLEDGE UNITS REPOSITORY
// ===========================================================================

export class LocalKnowledgeUnitRepository implements IKnowledgeUnitRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(unit: KnowledgeUnitEntity): Promise<KnowledgeUnitEntity> {
    const val = validateKnowledgeUnit(unit, "capture");
    if (!val.valid) {
      throw new Error(
        `Validation failed for KnowledgeUnit: ${val.errors.join("; ")}`,
      );
    }

    this.engine.save((s) => {
      if (s.knowledgeUnits.some((ku) => ku.id === unit.id)) {
        throw new Error(`KnowledgeUnit with ID '${unit.id}' already exists.`);
      }
      return { ...s, knowledgeUnits: [unit, ...s.knowledgeUnits] };
    });

    return unit;
  }

  async findById(id: string): Promise<KnowledgeUnitEntity | null> {
    const ku = this.engine.load().knowledgeUnits.find((item) => item.id === id);
    return ku ?? null;
  }

  async list(filter?: KnowledgeUnitFilter): Promise<KnowledgeUnitEntity[]> {
    let items = [...this.engine.load().knowledgeUnits];

    if (filter) {
      if (!filter.includeArchived) {
        items = items.filter((ku) => !ku.isArchived);
      }
      if (filter.perspective)
        items = items.filter((ku) => ku.perspective === filter.perspective);
      if (filter.status)
        items = items.filter((ku) => ku.status === filter.status);
      if (filter.foundationId)
        items = items.filter((ku) => ku.foundationId === filter.foundationId);
      if (filter.domainId)
        items = items.filter((ku) => ku.domainId === filter.domainId);
      if (filter.subjectId)
        items = items.filter((ku) => ku.subjectId === filter.subjectId);
      if (filter.topicId)
        items = items.filter((ku) => ku.topicId === filter.topicId);
      if (filter.search && filter.search.trim()) {
        const qStr = filter.search.toLowerCase();
        items = items.filter(
          (ku) =>
            ku.title.toLowerCase().includes(qStr) ||
            ku.summary.toLowerCase().includes(qStr) ||
            ku.coreUnderstanding.plainEnglishExplanation
              .toLowerCase()
              .includes(qStr),
        );
      }
    } else {
      items = items.filter((ku) => !ku.isArchived);
    }

    return items;
  }

  async update(
    id: string,
    updates: Partial<KnowledgeUnitEntity>,
  ): Promise<KnowledgeUnitEntity> {
    let updatedEntity: KnowledgeUnitEntity | null = null;
    const now = new Date().toISOString();

    this.engine.save((s) => {
      const idx = s.knowledgeUnits.findIndex((ku) => ku.id === id);
      if (idx === -1)
        throw new Error(`KnowledgeUnit with ID '${id}' not found.`);

      const current = s.knowledgeUnits[idx]!;
      updatedEntity = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: now,
      };

      const copy = [...s.knowledgeUnits];
      copy[idx] = updatedEntity;
      return { ...s, knowledgeUnits: copy };
    });

    if (!updatedEntity)
      throw new Error(`Failed to update KnowledgeUnit '${id}'.`);
    return updatedEntity;
  }

  async archive(id: string): Promise<KnowledgeUnitEntity> {
    return this.update(id, {
      isArchived: true,
      archivedAt: new Date().toISOString(),
    });
  }

  async restore(id: string): Promise<KnowledgeUnitEntity> {
    return this.update(id, {
      isArchived: false,
      archivedAt: undefined,
    });
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.knowledgeUnits.filter((ku) => ku.id !== id);
      deleted = next.length < s.knowledgeUnits.length;
      return { ...s, knowledgeUnits: next };
    });
    return deleted;
  }

  async findRelatedKnowledgeUnits(
    kuId: string,
  ): Promise<
    { unit: KnowledgeUnitEntity; relationship: KnowledgeRelationshipEntity }[]
  > {
    const s = this.engine.load();
    const rels = s.relationships.filter(
      (r) =>
        r.sourceKnowledgeUnitId === kuId || r.targetKnowledgeUnitId === kuId,
    );
    const results: {
      unit: KnowledgeUnitEntity;
      relationship: KnowledgeRelationshipEntity;
    }[] = [];

    rels.forEach((rel) => {
      const otherId =
        rel.sourceKnowledgeUnitId === kuId
          ? rel.targetKnowledgeUnitId
          : rel.sourceKnowledgeUnitId;
      const otherUnit = s.knowledgeUnits.find((ku) => ku.id === otherId);
      if (otherUnit && !otherUnit.isArchived) {
        results.push({ unit: otherUnit, relationship: rel });
      }
    });

    return results;
  }
}

// ===========================================================================
// 4. SOURCES REPOSITORY
// ===========================================================================

export class LocalSourceRepository implements ISourceRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(source: SourceEntity): Promise<SourceEntity> {
    const val = validateSource(source);
    if (!val.valid) {
      throw new Error(`Validation failed for Source: ${val.errors.join("; ")}`);
    }

    this.engine.save((s) => {
      if (s.sources.some((item) => item.id === source.id)) {
        throw new Error(`Source with ID '${source.id}' already exists.`);
      }
      return { ...s, sources: [source, ...s.sources] };
    });

    return source;
  }

  async findById(id: string): Promise<SourceEntity | null> {
    const src = this.engine.load().sources.find((item) => item.id === id);
    return src ?? null;
  }

  async list(filter?: SourceFilter): Promise<SourceEntity[]> {
    let items = [...this.engine.load().sources];
    if (filter) {
      if (filter.type) items = items.filter((src) => src.type === filter.type);
      if (filter.search && filter.search.trim()) {
        const qStr = filter.search.toLowerCase();
        items = items.filter(
          (src) =>
            src.title.toLowerCase().includes(qStr) ||
            src.description.toLowerCase().includes(qStr) ||
            src.reliabilityAssessment.toLowerCase().includes(qStr),
        );
      }
    }
    return items;
  }

  async update(
    id: string,
    updates: Partial<SourceEntity>,
  ): Promise<SourceEntity> {
    let updatedEntity: SourceEntity | null = null;
    const now = new Date().toISOString();

    this.engine.save((s) => {
      const idx = s.sources.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error(`Source with ID '${id}' not found.`);

      const current = s.sources[idx]!;
      updatedEntity = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: now,
      };

      const copy = [...s.sources];
      copy[idx] = updatedEntity;
      return { ...s, sources: copy };
    });

    if (!updatedEntity) throw new Error(`Failed to update Source '${id}'.`);
    return updatedEntity;
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.sources.filter((item) => item.id !== id);
      deleted = next.length < s.sources.length;
      return { ...s, sources: next };
    });
    return deleted;
  }

  async findSourcesForKnowledgeUnit(kuId: string): Promise<SourceEntity[]> {
    const ku = this.engine
      .load()
      .knowledgeUnits.find((item) => item.id === kuId);
    if (!ku) return [];
    const sourceIds = new Set(ku.sourcesAndEvidence.sourceIds);
    return this.engine.load().sources.filter((src) => sourceIds.has(src.id));
  }
}

// ===========================================================================
// 5. EVIDENCE REPOSITORY
// ===========================================================================

export class LocalEvidenceRepository implements IEvidenceRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(evidence: EvidenceEntity): Promise<EvidenceEntity> {
    const val = validateEvidence(evidence);
    if (!val.valid) {
      throw new Error(
        `Validation failed for Evidence: ${val.errors.join("; ")}`,
      );
    }

    this.engine.save((s) => {
      if (s.evidence.some((item) => item.id === evidence.id)) {
        throw new Error(`Evidence with ID '${evidence.id}' already exists.`);
      }
      const knowledgeUnits = s.knowledgeUnits.map((ku) => {
        if (ku.id !== evidence.knowledgeUnitId) return ku;
        const existingIds = ku.sourcesAndEvidence?.evidenceIds ?? [];
        if (existingIds.includes(evidence.id)) return ku;
        return {
          ...ku,
          sourcesAndEvidence: {
            ...ku.sourcesAndEvidence,
            evidenceIds: [...existingIds, evidence.id],
          },
          updatedAt: new Date().toISOString(),
        };
      });
      return {
        ...s,
        evidence: [evidence, ...s.evidence],
        knowledgeUnits,
      };
    });

    return evidence;
  }

  async findById(id: string): Promise<EvidenceEntity | null> {
    const ev = this.engine.load().evidence.find((item) => item.id === id);
    return ev ?? null;
  }

  async list(filter?: EvidenceFilter): Promise<EvidenceEntity[]> {
    let items = [...this.engine.load().evidence];
    if (filter) {
      if (filter.knowledgeUnitId) {
        items = items.filter(
          (ev) => ev.knowledgeUnitId === filter.knowledgeUnitId,
        );
      }
      if (filter.polarity) {
        items = items.filter((ev) => ev.polarity === filter.polarity);
      }
    }
    return items;
  }

  async update(
    id: string,
    updates: Partial<EvidenceEntity>,
  ): Promise<EvidenceEntity> {
    let updatedEntity: EvidenceEntity | null = null;
    this.engine.save((s) => {
      const idx = s.evidence.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error(`Evidence with ID '${id}' not found.`);

      const current = s.evidence[idx]!;
      updatedEntity = {
        ...current,
        ...updates,
        id: current.id,
      };

      const copy = [...s.evidence];
      copy[idx] = updatedEntity;
      return { ...s, evidence: copy };
    });

    if (!updatedEntity) throw new Error(`Failed to update Evidence '${id}'.`);
    return updatedEntity;
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.evidence.filter((item) => item.id !== id);
      deleted = next.length < s.evidence.length;
      return { ...s, evidence: next };
    });
    return deleted;
  }

  async findEvidenceForKnowledgeUnit(kuId: string): Promise<EvidenceEntity[]> {
    return this.engine
      .load()
      .evidence.filter((ev) => ev.knowledgeUnitId === kuId);
  }
}

// ===========================================================================
// 6. KNOWLEDGE RELATIONSHIPS REPOSITORY
// ===========================================================================

export class LocalKnowledgeRelationshipRepository implements IKnowledgeRelationshipRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(
    relationship: KnowledgeRelationshipEntity,
  ): Promise<KnowledgeRelationshipEntity> {
    const check = canCreateKnowledgeRelationship(
      relationship.sourceKnowledgeUnitId,
      relationship.targetKnowledgeUnitId,
      relationship.type,
      relationship.explanation,
    );
    if (!check.valid) {
      throw new Error(`Relationship rule violation: ${check.error}`);
    }

    this.engine.save((s) => {
      if (s.relationships.some((r) => r.id === relationship.id)) {
        throw new Error(
          `Relationship with ID '${relationship.id}' already exists.`,
        );
      }
      return { ...s, relationships: [relationship, ...s.relationships] };
    });

    return relationship;
  }

  async findById(id: string): Promise<KnowledgeRelationshipEntity | null> {
    const rel = this.engine.load().relationships.find((r) => r.id === id);
    return rel ?? null;
  }

  async list(
    filter?: RelationshipFilter,
  ): Promise<KnowledgeRelationshipEntity[]> {
    let items = [...this.engine.load().relationships];
    if (filter) {
      if (filter.kuId) {
        items = items.filter(
          (r) =>
            r.sourceKnowledgeUnitId === filter.kuId ||
            r.targetKnowledgeUnitId === filter.kuId,
        );
      }
      if (filter.type) items = items.filter((r) => r.type === filter.type);
    }
    return items;
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.relationships.filter((r) => r.id !== id);
      deleted = next.length < s.relationships.length;
      return { ...s, relationships: next };
    });
    return deleted;
  }

  async findRelationshipsForUnit(
    kuId: string,
  ): Promise<KnowledgeRelationshipEntity[]> {
    return this.engine
      .load()
      .relationships.filter(
        (r) =>
          r.sourceKnowledgeUnitId === kuId || r.targetKnowledgeUnitId === kuId,
      );
  }
}

// ===========================================================================
// 7. APPLICATION RECORDS REPOSITORY
// ===========================================================================

export class LocalApplicationRecordRepository implements IApplicationRecordRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(
    record: ApplicationRecordEntity,
  ): Promise<ApplicationRecordEntity> {
    const val = validateApplicationRecord(record);
    if (!val.valid) {
      throw new Error(
        `Validation failed for ApplicationRecord: ${val.errors.join("; ")}`,
      );
    }

    this.engine.save((s) => {
      if (s.applications.some((app) => app.id === record.id)) {
        throw new Error(
          `ApplicationRecord with ID '${record.id}' already exists.`,
        );
      }
      return { ...s, applications: [record, ...s.applications] };
    });

    return record;
  }

  async findById(id: string): Promise<ApplicationRecordEntity | null> {
    const app = this.engine.load().applications.find((item) => item.id === id);
    return app ?? null;
  }

  async list(
    filter?: ApplicationRecordFilter,
  ): Promise<ApplicationRecordEntity[]> {
    let items = [...this.engine.load().applications];
    if (filter) {
      if (filter.kuId) {
        items = items.filter((app) =>
          app.connectedKnowledgeUnitIds.includes(filter.kuId!),
        );
      }
      if (filter.search && filter.search.trim()) {
        const qStr = filter.search.toLowerCase();
        items = items.filter(
          (app) =>
            app.title.toLowerCase().includes(qStr) ||
            app.contextAndProblem.toLowerCase().includes(qStr) ||
            app.reflectionAndLessons.toLowerCase().includes(qStr),
        );
      }
    }
    return items;
  }

  async update(
    id: string,
    updates: Partial<ApplicationRecordEntity>,
  ): Promise<ApplicationRecordEntity> {
    let updatedEntity: ApplicationRecordEntity | null = null;
    const now = new Date().toISOString();

    this.engine.save((s) => {
      const idx = s.applications.findIndex((app) => app.id === id);
      if (idx === -1)
        throw new Error(`ApplicationRecord with ID '${id}' not found.`);

      const current = s.applications[idx]!;
      updatedEntity = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: now,
      };

      const copy = [...s.applications];
      copy[idx] = updatedEntity;
      return { ...s, applications: copy };
    });

    if (!updatedEntity)
      throw new Error(`Failed to update ApplicationRecord '${id}'.`);
    return updatedEntity;
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.applications.filter((app) => app.id !== id);
      deleted = next.length < s.applications.length;
      return { ...s, applications: next };
    });
    return deleted;
  }

  async findApplicationsForKnowledgeUnit(
    kuId: string,
  ): Promise<ApplicationRecordEntity[]> {
    return this.engine
      .load()
      .applications.filter((app) =>
        app.connectedKnowledgeUnitIds.includes(kuId),
      );
  }
}

// ===========================================================================
// 8. REVIEWS REPOSITORY
// ===========================================================================

export class LocalReviewRepository implements IReviewRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(review: ReviewEntity): Promise<ReviewEntity> {
    const val = validateReview(review);
    if (!val.valid) {
      throw new Error(`Validation failed for Review: ${val.errors.join("; ")}`);
    }

    this.engine.save((s) => {
      if (s.reviews.some((r) => r.id === review.id)) {
        throw new Error(`Review with ID '${review.id}' already exists.`);
      }
      return { ...s, reviews: [review, ...s.reviews] };
    });

    return review;
  }

  async findById(id: string): Promise<ReviewEntity | null> {
    const r = this.engine.load().reviews.find((item) => item.id === id);
    return r ?? null;
  }

  async list(filter?: ReviewFilter): Promise<ReviewEntity[]> {
    let items = [...this.engine.load().reviews];
    if (filter) {
      if (filter.type) items = items.filter((r) => r.type === filter.type);
      if (filter.period)
        items = items.filter((r) => r.period === filter.period);
    }
    return items;
  }

  async update(
    id: string,
    updates: Partial<ReviewEntity>,
  ): Promise<ReviewEntity> {
    let updatedEntity: ReviewEntity | null = null;
    const now = new Date().toISOString();

    this.engine.save((s) => {
      const idx = s.reviews.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`Review with ID '${id}' not found.`);

      const current = s.reviews[idx]!;
      updatedEntity = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: now,
      };

      const copy = [...s.reviews];
      copy[idx] = updatedEntity;
      return { ...s, reviews: copy };
    });

    if (!updatedEntity) throw new Error(`Failed to update Review '${id}'.`);
    return updatedEntity;
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.reviews.filter((r) => r.id !== id);
      deleted = next.length < s.reviews.length;
      return { ...s, reviews: next };
    });
    return deleted;
  }
}

// ===========================================================================
// 9. CAPTURE INBOX REPOSITORY
// ===========================================================================

export class LocalCaptureInboxRepository implements ICaptureInboxRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async create(item: CaptureInboxItemEntity): Promise<CaptureInboxItemEntity> {
    const val = validateCaptureInboxItem(item);
    if (!val.valid) {
      throw new Error(
        `Validation failed for CaptureInboxItem: ${val.errors.join("; ")}`,
      );
    }

    this.engine.save((s) => {
      if (s.inbox.some((i) => i.id === item.id)) {
        throw new Error(`Inbox item with ID '${item.id}' already exists.`);
      }
      return { ...s, inbox: [item, ...s.inbox] };
    });

    return item;
  }

  async findById(id: string): Promise<CaptureInboxItemEntity | null> {
    const item = this.engine.load().inbox.find((i) => i.id === id);
    return item ?? null;
  }

  async list(filter?: CaptureInboxFilter): Promise<CaptureInboxItemEntity[]> {
    let items = [...this.engine.load().inbox];
    if (filter) {
      if (filter.status)
        items = items.filter((i) => i.status === filter.status);
      if (filter.method)
        items = items.filter((i) => i.method === filter.method);
    }
    return items;
  }

  async update(
    id: string,
    updates: Partial<CaptureInboxItemEntity>,
  ): Promise<CaptureInboxItemEntity> {
    let updatedEntity: CaptureInboxItemEntity | null = null;
    const now = new Date().toISOString();

    this.engine.save((s) => {
      const idx = s.inbox.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error(`Inbox item with ID '${id}' not found.`);

      const current = s.inbox[idx]!;
      updatedEntity = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: now,
      };

      const copy = [...s.inbox];
      copy[idx] = updatedEntity;
      return { ...s, inbox: copy };
    });

    if (!updatedEntity) throw new Error(`Failed to update Inbox item '${id}'.`);
    return updatedEntity;
  }

  async archive(id: string): Promise<CaptureInboxItemEntity> {
    return this.update(id, { status: "archived" });
  }

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    this.engine.save((s) => {
      const next = s.inbox.filter((i) => i.id !== id);
      deleted = next.length < s.inbox.length;
      return { ...s, inbox: next };
    });
    return deleted;
  }
}

// ===========================================================================
// 10. LEARNING CONTEXT REPOSITORY
// ===========================================================================

export class LocalLearningContextRepository implements ILearningContextRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async get(): Promise<LearningContextEntity> {
    return this.engine.load().context;
  }

  async update(
    updates: Partial<LearningContextEntity>,
  ): Promise<LearningContextEntity> {
    let updatedContext: LearningContextEntity | null = null;
    const now = new Date().toISOString();

    this.engine.save((s) => {
      updatedContext = {
        ...s.context,
        ...updates,
        id: s.context.id,
        updatedAt: now,
      };
      return { ...s, context: updatedContext };
    });

    if (!updatedContext) throw new Error("Failed to update LearningContext.");
    return updatedContext;
  }
}

// ===========================================================================
// 11. TAXONOMY REPOSITORY
// ===========================================================================

export class LocalTaxonomyRepository implements ITaxonomyRepository {
  constructor(private readonly engine: P3StorageEngine) {}

  async getFoundations(): Promise<FoundationEntity[]> {
    return [...this.engine.load().foundations];
  }

  async listDomains(filter?: {
    foundationId?: string;
    includeArchived?: boolean;
  }): Promise<DomainEntity[]> {
    let items = [...this.engine.load().domains];
    if (!filter?.includeArchived) items = items.filter((d) => !d.isArchived);
    if (filter?.foundationId)
      items = items.filter((d) => d.foundationId === filter.foundationId);
    return items;
  }

  async createDomain(domain: DomainEntity): Promise<DomainEntity> {
    this.engine.save((s) => {
      if (s.domains.some((d) => d.id === domain.id)) {
        throw new Error(`Domain with ID '${domain.id}' already exists.`);
      }
      return { ...s, domains: [...s.domains, domain] };
    });
    return domain;
  }

  async updateDomain(
    id: string,
    updates: Partial<DomainEntity>,
  ): Promise<DomainEntity> {
    let updated: DomainEntity | null = null;
    this.engine.save((s) => {
      const idx = s.domains.findIndex((d) => d.id === id);
      if (idx === -1) throw new Error(`Domain with ID '${id}' not found.`);
      const current = s.domains[idx]!;
      updated = {
        ...current,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };
      const copy = [...s.domains];
      copy[idx] = updated;
      return { ...s, domains: copy };
    });
    if (!updated) throw new Error(`Failed to update domain '${id}'.`);
    return updated;
  }

  async archiveDomain(id: string): Promise<DomainEntity> {
    return this.updateDomain(id, {
      isArchived: true,
      archivedAt: new Date().toISOString(),
    });
  }

  async listSubjects(filter?: {
    domainId?: string;
    includeArchived?: boolean;
  }): Promise<SubjectEntity[]> {
    let items = [...this.engine.load().subjects];
    if (!filter?.includeArchived)
      items = items.filter((sub) => !sub.isArchived);
    if (filter?.domainId)
      items = items.filter((sub) => sub.domainId === filter.domainId);
    return items;
  }

  async createSubject(subject: SubjectEntity): Promise<SubjectEntity> {
    this.engine.save((s) => {
      if (s.subjects.some((sub) => sub.id === subject.id)) {
        throw new Error(`Subject with ID '${subject.id}' already exists.`);
      }
      return { ...s, subjects: [...s.subjects, subject] };
    });
    return subject;
  }

  async updateSubject(
    id: string,
    updates: Partial<SubjectEntity>,
  ): Promise<SubjectEntity> {
    let updated: SubjectEntity | null = null;
    this.engine.save((s) => {
      const idx = s.subjects.findIndex((sub) => sub.id === id);
      if (idx === -1) throw new Error(`Subject with ID '${id}' not found.`);
      const current = s.subjects[idx]!;
      updated = {
        ...current,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };
      const copy = [...s.subjects];
      copy[idx] = updated;
      return { ...s, subjects: copy };
    });
    if (!updated) throw new Error(`Failed to update subject '${id}'.`);
    return updated;
  }

  async archiveSubject(id: string): Promise<SubjectEntity> {
    return this.updateSubject(id, {
      isArchived: true,
      archivedAt: new Date().toISOString(),
    });
  }

  async listTopics(filter?: {
    subjectId?: string;
    includeArchived?: boolean;
  }): Promise<TopicEntity[]> {
    let items = [...this.engine.load().topics];
    if (!filter?.includeArchived) items = items.filter((t) => !t.isArchived);
    if (filter?.subjectId)
      items = items.filter((t) => t.subjectId === filter.subjectId);
    return items;
  }

  async createTopic(topic: TopicEntity): Promise<TopicEntity> {
    this.engine.save((s) => {
      if (s.topics.some((t) => t.id === topic.id)) {
        throw new Error(`Topic with ID '${topic.id}' already exists.`);
      }
      return { ...s, topics: [...s.topics, topic] };
    });
    return topic;
  }

  async updateTopic(
    id: string,
    updates: Partial<TopicEntity>,
  ): Promise<TopicEntity> {
    let updated: TopicEntity | null = null;
    this.engine.save((s) => {
      const idx = s.topics.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error(`Topic with ID '${id}' not found.`);
      const current = s.topics[idx]!;
      updated = {
        ...current,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };
      const copy = [...s.topics];
      copy[idx] = updated;
      return { ...s, topics: copy };
    });
    if (!updated) throw new Error(`Failed to update topic '${id}'.`);
    return updated;
  }

  async archiveTopic(id: string): Promise<TopicEntity> {
    return this.updateTopic(id, {
      isArchived: true,
      archivedAt: new Date().toISOString(),
    });
  }
}

// ===========================================================================
// COMPOSITE REPOSITORIES BUNDLE
// ===========================================================================

export interface P3Repositories {
  readonly questions: ILearningQuestionRepository;
  readonly sessions: ILearningSessionRepository;
  readonly knowledgeUnits: IKnowledgeUnitRepository;
  readonly sources: ISourceRepository;
  readonly evidence: IEvidenceRepository;
  readonly relationships: IKnowledgeRelationshipRepository;
  readonly applications: IApplicationRecordRepository;
  readonly reviews: IReviewRepository;
  readonly inbox: ICaptureInboxRepository;
  readonly context: ILearningContextRepository;
  readonly taxonomy: ITaxonomyRepository;
}

export function createLocalP3Repositories(
  engine: P3StorageEngine,
): P3Repositories {
  return {
    questions: new LocalLearningQuestionRepository(engine),
    sessions: new LocalLearningSessionRepository(engine),
    knowledgeUnits: new LocalKnowledgeUnitRepository(engine),
    sources: new LocalSourceRepository(engine),
    evidence: new LocalEvidenceRepository(engine),
    relationships: new LocalKnowledgeRelationshipRepository(engine),
    applications: new LocalApplicationRecordRepository(engine),
    reviews: new LocalReviewRepository(engine),
    inbox: new LocalCaptureInboxRepository(engine),
    context: new LocalLearningContextRepository(engine),
    taxonomy: new LocalTaxonomyRepository(engine),
  };
}
