/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Application Ports: Typed Repository Contracts
 *
 * Strict Architectural Rule: Defines abstractions for application use-cases.
 * Infrastructure layer implements these contracts; domain remains pure.
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
import type {
  CaptureInboxMethod,
  CaptureInboxStatus,
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
} from "../../domain/enums";

export interface QuestionFilter {
  readonly origin?: QuestionOrigin | undefined;
  readonly priority?: QuestionPriority | undefined;
  readonly status?: QuestionStatus | undefined;
  readonly foundationId?: FoundationId | undefined;
  readonly domainId?: string | undefined;
  readonly subjectId?: string | undefined;
  readonly topicId?: string | undefined;
  readonly includeArchived?: boolean | undefined;
  readonly search?: string | undefined;
}

export interface ILearningQuestionRepository {
  create(question: LearningQuestionEntity): Promise<LearningQuestionEntity>;
  findById(id: string): Promise<LearningQuestionEntity | null>;
  list(filter?: QuestionFilter): Promise<LearningQuestionEntity[]>;
  update(
    id: string,
    updates: Partial<LearningQuestionEntity>,
  ): Promise<LearningQuestionEntity>;
  archive(id: string): Promise<LearningQuestionEntity>;
  restore(id: string): Promise<LearningQuestionEntity>;
  delete(id: string): Promise<boolean>;
  findQuestionsForKnowledgeUnit(
    kuId: string,
  ): Promise<LearningQuestionEntity[]>;
  findQuestionsForSession(sessionId: string): Promise<LearningQuestionEntity[]>;
}

export interface SessionFilter {
  readonly status?: SessionStatus | undefined;
  readonly questionId?: string | undefined;
  readonly kuId?: string | undefined;
  readonly search?: string | undefined;
}

export interface ILearningSessionRepository {
  create(session: LearningSessionEntity): Promise<LearningSessionEntity>;
  findById(id: string): Promise<LearningSessionEntity | null>;
  list(filter?: SessionFilter): Promise<LearningSessionEntity[]>;
  update(
    id: string,
    updates: Partial<LearningSessionEntity>,
  ): Promise<LearningSessionEntity>;
  archive(id: string): Promise<LearningSessionEntity>;
  delete(id: string): Promise<boolean>;
  findSessionsForQuestion(questionId: string): Promise<LearningSessionEntity[]>;
  findSessionsForKnowledgeUnit(kuId: string): Promise<LearningSessionEntity[]>;
}

export interface KnowledgeUnitFilter {
  readonly perspective?: KnowledgePerspective | undefined;
  readonly status?: KnowledgeDevelopmentStatus | undefined;
  readonly foundationId?: FoundationId | undefined;
  readonly domainId?: string | undefined;
  readonly subjectId?: string | undefined;
  readonly topicId?: string | undefined;
  readonly includeArchived?: boolean | undefined;
  readonly search?: string | undefined;
}

export interface IKnowledgeUnitRepository {
  create(unit: KnowledgeUnitEntity): Promise<KnowledgeUnitEntity>;
  findById(id: string): Promise<KnowledgeUnitEntity | null>;
  list(filter?: KnowledgeUnitFilter): Promise<KnowledgeUnitEntity[]>;
  update(
    id: string,
    updates: Partial<KnowledgeUnitEntity>,
  ): Promise<KnowledgeUnitEntity>;
  archive(id: string): Promise<KnowledgeUnitEntity>;
  restore(id: string): Promise<KnowledgeUnitEntity>;
  delete(id: string): Promise<boolean>;
  findRelatedKnowledgeUnits(kuId: string): Promise<
    {
      unit: KnowledgeUnitEntity;
      relationship: KnowledgeRelationshipEntity;
    }[]
  >;
}

export interface SourceFilter {
  readonly type?: SourceCategory | undefined;
  readonly search?: string | undefined;
}

export interface ISourceRepository {
  create(source: SourceEntity): Promise<SourceEntity>;
  findById(id: string): Promise<SourceEntity | null>;
  list(filter?: SourceFilter): Promise<SourceEntity[]>;
  update(id: string, updates: Partial<SourceEntity>): Promise<SourceEntity>;
  delete(id: string): Promise<boolean>;
  findSourcesForKnowledgeUnit(kuId: string): Promise<SourceEntity[]>;
}

export interface EvidenceFilter {
  readonly knowledgeUnitId?: string | undefined;
  readonly polarity?: EvidencePolarity | undefined;
}

export interface IEvidenceRepository {
  create(evidence: EvidenceEntity): Promise<EvidenceEntity>;
  findById(id: string): Promise<EvidenceEntity | null>;
  list(filter?: EvidenceFilter): Promise<EvidenceEntity[]>;
  update(id: string, updates: Partial<EvidenceEntity>): Promise<EvidenceEntity>;
  delete(id: string): Promise<boolean>;
  findEvidenceForKnowledgeUnit(kuId: string): Promise<EvidenceEntity[]>;
}

export interface RelationshipFilter {
  readonly kuId?: string | undefined;
  readonly type?: RelationshipType | undefined;
}

export interface IKnowledgeRelationshipRepository {
  create(
    relationship: KnowledgeRelationshipEntity,
  ): Promise<KnowledgeRelationshipEntity>;
  findById(id: string): Promise<KnowledgeRelationshipEntity | null>;
  list(filter?: RelationshipFilter): Promise<KnowledgeRelationshipEntity[]>;
  delete(id: string): Promise<boolean>;
  findRelationshipsForUnit(
    kuId: string,
  ): Promise<KnowledgeRelationshipEntity[]>;
}

export interface ApplicationRecordFilter {
  readonly kuId?: string | undefined;
  readonly search?: string | undefined;
}

export interface IApplicationRecordRepository {
  create(record: ApplicationRecordEntity): Promise<ApplicationRecordEntity>;
  findById(id: string): Promise<ApplicationRecordEntity | null>;
  list(filter?: ApplicationRecordFilter): Promise<ApplicationRecordEntity[]>;
  update(
    id: string,
    updates: Partial<ApplicationRecordEntity>,
  ): Promise<ApplicationRecordEntity>;
  delete(id: string): Promise<boolean>;
  findApplicationsForKnowledgeUnit(
    kuId: string,
  ): Promise<ApplicationRecordEntity[]>;
}

export interface ReviewFilter {
  readonly type?: ReviewType | undefined;
  readonly period?: string | undefined;
}

export interface IReviewRepository {
  create(review: ReviewEntity): Promise<ReviewEntity>;
  findById(id: string): Promise<ReviewEntity | null>;
  list(filter?: ReviewFilter): Promise<ReviewEntity[]>;
  update(id: string, updates: Partial<ReviewEntity>): Promise<ReviewEntity>;
  delete(id: string): Promise<boolean>;
}

export interface CaptureInboxFilter {
  readonly status?: CaptureInboxStatus | undefined;
  readonly method?: CaptureInboxMethod | undefined;
}

export interface ICaptureInboxRepository {
  create(item: CaptureInboxItemEntity): Promise<CaptureInboxItemEntity>;
  findById(id: string): Promise<CaptureInboxItemEntity | null>;
  list(filter?: CaptureInboxFilter): Promise<CaptureInboxItemEntity[]>;
  update(
    id: string,
    updates: Partial<CaptureInboxItemEntity>,
  ): Promise<CaptureInboxItemEntity>;
  archive(id: string): Promise<CaptureInboxItemEntity>;
  delete(id: string): Promise<boolean>;
}

export interface ILearningContextRepository {
  get(): Promise<LearningContextEntity>;
  update(
    updates: Partial<LearningContextEntity>,
  ): Promise<LearningContextEntity>;
}

export interface ITaxonomyRepository {
  getFoundations(): Promise<FoundationEntity[]>;
  listDomains(filter?: {
    foundationId?: FoundationId;
    includeArchived?: boolean;
  }): Promise<DomainEntity[]>;
  createDomain(domain: DomainEntity): Promise<DomainEntity>;
  updateDomain(
    id: string,
    updates: Partial<DomainEntity>,
  ): Promise<DomainEntity>;
  archiveDomain(id: string): Promise<DomainEntity>;

  listSubjects(filter?: {
    domainId?: string;
    includeArchived?: boolean;
  }): Promise<SubjectEntity[]>;
  createSubject(subject: SubjectEntity): Promise<SubjectEntity>;
  updateSubject(
    id: string,
    updates: Partial<SubjectEntity>,
  ): Promise<SubjectEntity>;
  archiveSubject(id: string): Promise<SubjectEntity>;

  listTopics(filter?: {
    subjectId?: string;
    includeArchived?: boolean;
  }): Promise<TopicEntity[]>;
  createTopic(topic: TopicEntity): Promise<TopicEntity>;
  updateTopic(id: string, updates: Partial<TopicEntity>): Promise<TopicEntity>;
  archiveTopic(id: string): Promise<TopicEntity>;
}
