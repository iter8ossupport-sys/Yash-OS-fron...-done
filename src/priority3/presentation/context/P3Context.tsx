/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Presentation Layer: Typed React Context & Repository Provider
 *
 * Strict Architectural Rule: UI never accesses browser storage directly.
 * All operations go through typed Application Repository interfaces.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  createLocalP3Repositories,
  type P3Repositories,
} from "../../infrastructure/persistence/localRepositoryAdapter";
import {
  P3StorageEngine,
  type IStorageDriver,
} from "../../infrastructure/persistence/storageEngine";

export type P3WorkspaceTab =
  "overview" | "learning" | "knowledge" | "applications" | "reviews";

export interface P3ContextValue {
  readonly engine: P3StorageEngine;
  readonly repositories: P3Repositories;

  // Active UI Navigation & Filters
  readonly activeTab: P3WorkspaceTab;
  readonly setActiveTab: (tab: P3WorkspaceTab) => void;
  readonly searchQuery: string;
  readonly setSearchQuery: (q: string) => void;

  // Reactive Entity Collections
  readonly questions: readonly LearningQuestionEntity[];
  readonly sessions: readonly LearningSessionEntity[];
  readonly knowledgeUnits: readonly KnowledgeUnitEntity[];
  readonly sources: readonly SourceEntity[];
  readonly evidence: readonly EvidenceEntity[];
  readonly relationships: readonly KnowledgeRelationshipEntity[];
  readonly applications: readonly ApplicationRecordEntity[];
  readonly reviews: readonly ReviewEntity[];
  readonly foundations: readonly FoundationEntity[];
  readonly domains: readonly DomainEntity[];
  readonly subjects: readonly SubjectEntity[];
  readonly topics: readonly TopicEntity[];
  readonly inbox: readonly CaptureInboxItemEntity[];
  readonly learningContext: LearningContextEntity | null;

  // Refresh & Mutation Hooks
  readonly refreshData: () => Promise<void>;
  readonly isLoading: boolean;
  readonly lastError: string | null;

  // Direct High-level Actions
  readonly createQuestion: (
    q: LearningQuestionEntity,
  ) => Promise<LearningQuestionEntity>;
  readonly updateQuestion: (
    id: string,
    updates: Partial<LearningQuestionEntity>,
  ) => Promise<LearningQuestionEntity>;
  readonly createSession: (
    s: LearningSessionEntity,
  ) => Promise<LearningSessionEntity>;
  readonly updateSession: (
    id: string,
    updates: Partial<LearningSessionEntity>,
  ) => Promise<LearningSessionEntity>;
  readonly createKnowledgeUnit: (
    ku: KnowledgeUnitEntity,
  ) => Promise<KnowledgeUnitEntity>;
  readonly updateKnowledgeUnit: (
    id: string,
    updates: Partial<KnowledgeUnitEntity>,
  ) => Promise<KnowledgeUnitEntity>;
  readonly createSource: (src: SourceEntity) => Promise<SourceEntity>;
  readonly createEvidence: (ev: EvidenceEntity) => Promise<EvidenceEntity>;
  readonly createRelationship: (
    rel: KnowledgeRelationshipEntity,
  ) => Promise<KnowledgeRelationshipEntity>;
  readonly createApplication: (
    app: ApplicationRecordEntity,
  ) => Promise<ApplicationRecordEntity>;
  readonly createReview: (rev: ReviewEntity) => Promise<ReviewEntity>;
  readonly createDomain: (dom: DomainEntity) => Promise<DomainEntity>;
  readonly createSubject: (sub: SubjectEntity) => Promise<SubjectEntity>;
  readonly createTopic: (top: TopicEntity) => Promise<TopicEntity>;
  readonly createInboxItem: (
    item: CaptureInboxItemEntity,
  ) => Promise<CaptureInboxItemEntity>;
  readonly updateInboxItem: (
    id: string,
    updates: Partial<CaptureInboxItemEntity>,
  ) => Promise<CaptureInboxItemEntity>;
  readonly archiveInboxItem: (id: string) => Promise<CaptureInboxItemEntity>;
  readonly deleteInboxItem: (id: string) => Promise<boolean>;
  readonly updateLearningContext: (
    updates: Partial<LearningContextEntity>,
  ) => Promise<LearningContextEntity>;
}

const P3Context = createContext<P3ContextValue | null>(null);

export interface P3ProviderProps {
  readonly children: React.ReactNode;
  readonly storageDriver?: IStorageDriver | undefined;
  readonly initialTab?: P3WorkspaceTab | undefined;
}

export function P3Provider({
  children,
  storageDriver,
  initialTab = "overview",
}: P3ProviderProps) {
  // Singleton Engine & Repositories per provider instance
  const engine = useMemo(
    () => new P3StorageEngine(storageDriver),
    [storageDriver],
  );
  const repositories = useMemo(
    () => createLocalP3Repositories(engine),
    [engine],
  );

  const [activeTab, setActiveTab] = useState<P3WorkspaceTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastError, setLastError] = useState<string | null>(null);

  // Collections state
  const [questions, setQuestions] = useState<LearningQuestionEntity[]>([]);
  const [sessions, setSessions] = useState<LearningSessionEntity[]>([]);
  const [knowledgeUnits, setKnowledgeUnits] = useState<KnowledgeUnitEntity[]>(
    [],
  );
  const [sources, setSources] = useState<SourceEntity[]>([]);
  const [evidence, setEvidence] = useState<EvidenceEntity[]>([]);
  const [relationships, setRelationships] = useState<
    KnowledgeRelationshipEntity[]
  >([]);
  const [applications, setApplications] = useState<ApplicationRecordEntity[]>(
    [],
  );
  const [reviews, setReviews] = useState<ReviewEntity[]>([]);
  const [foundations, setFoundations] = useState<FoundationEntity[]>([]);
  const [domains, setDomains] = useState<DomainEntity[]>([]);
  const [subjects, setSubjects] = useState<SubjectEntity[]>([]);
  const [topics, setTopics] = useState<TopicEntity[]>([]);
  const [inbox, setInbox] = useState<CaptureInboxItemEntity[]>([]);
  const [learningContext, setLearningContext] =
    useState<LearningContextEntity | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLastError(null);

      const [
        qList,
        sList,
        kuList,
        srcList,
        evList,
        relList,
        appList,
        revList,
        fList,
        dList,
        subList,
        topList,
        inList,
        ctx,
      ] = await Promise.all([
        repositories.questions.list({ includeArchived: true }),
        repositories.sessions.list(),
        repositories.knowledgeUnits.list({ includeArchived: true }),
        repositories.sources.list(),
        repositories.evidence.list(),
        repositories.relationships.list(),
        repositories.applications.list(),
        repositories.reviews.list(),
        repositories.taxonomy.getFoundations(),
        repositories.taxonomy.listDomains({ includeArchived: true }),
        repositories.taxonomy.listSubjects({ includeArchived: true }),
        repositories.taxonomy.listTopics({ includeArchived: true }),
        repositories.inbox.list(),
        repositories.context.get(),
      ]);

      setQuestions(qList);
      setSessions(sList);
      setKnowledgeUnits(kuList);
      setSources(srcList);
      setEvidence(evList);
      setRelationships(relList);
      setApplications(appList);
      setReviews(revList);
      setFoundations(fList);
      setDomains(dList);
      setSubjects(subList);
      setTopics(topList);
      setInbox(inList);
      setLearningContext(ctx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [repositories]);

  // Initial load
  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  // High-level Actions with auto-refresh
  const createQuestion = useCallback(
    async (q: LearningQuestionEntity) => {
      const res = await repositories.questions.create(q);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const updateQuestion = useCallback(
    async (id: string, updates: Partial<LearningQuestionEntity>) => {
      const res = await repositories.questions.update(id, updates);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createSession = useCallback(
    async (s: LearningSessionEntity) => {
      const res = await repositories.sessions.create(s);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const updateSession = useCallback(
    async (id: string, updates: Partial<LearningSessionEntity>) => {
      const res = await repositories.sessions.update(id, updates);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createKnowledgeUnit = useCallback(
    async (ku: KnowledgeUnitEntity) => {
      const res = await repositories.knowledgeUnits.create(ku);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const updateKnowledgeUnit = useCallback(
    async (id: string, updates: Partial<KnowledgeUnitEntity>) => {
      const res = await repositories.knowledgeUnits.update(id, updates);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createSource = useCallback(
    async (src: SourceEntity) => {
      const res = await repositories.sources.create(src);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createEvidence = useCallback(
    async (ev: EvidenceEntity) => {
      const res = await repositories.evidence.create(ev);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createRelationship = useCallback(
    async (rel: KnowledgeRelationshipEntity) => {
      const res = await repositories.relationships.create(rel);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createApplication = useCallback(
    async (app: ApplicationRecordEntity) => {
      const res = await repositories.applications.create(app);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createReview = useCallback(
    async (rev: ReviewEntity) => {
      const res = await repositories.reviews.create(rev);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createDomain = useCallback(
    async (dom: DomainEntity) => {
      const res = await repositories.taxonomy.createDomain(dom);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createSubject = useCallback(
    async (sub: SubjectEntity) => {
      const res = await repositories.taxonomy.createSubject(sub);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createTopic = useCallback(
    async (top: TopicEntity) => {
      const res = await repositories.taxonomy.createTopic(top);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const createInboxItem = useCallback(
    async (item: CaptureInboxItemEntity) => {
      const res = await repositories.inbox.create(item);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const updateInboxItem = useCallback(
    async (id: string, updates: Partial<CaptureInboxItemEntity>) => {
      const res = await repositories.inbox.update(id, updates);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const archiveInboxItem = useCallback(
    async (id: string) => {
      const res = await repositories.inbox.archive(id);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const deleteInboxItem = useCallback(
    async (id: string) => {
      const res = await repositories.inbox.delete(id);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const updateLearningContext = useCallback(
    async (updates: Partial<LearningContextEntity>) => {
      const res = await repositories.context.update(updates);
      await refreshData();
      return res;
    },
    [repositories, refreshData],
  );

  const value = useMemo<P3ContextValue>(
    () => ({
      engine,
      repositories,
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      questions,
      sessions,
      knowledgeUnits,
      sources,
      evidence,
      relationships,
      applications,
      reviews,
      foundations,
      domains,
      subjects,
      topics,
      inbox,
      learningContext,
      refreshData,
      isLoading,
      lastError,
      createQuestion,
      updateQuestion,
      createSession,
      updateSession,
      createKnowledgeUnit,
      updateKnowledgeUnit,
      createSource,
      createEvidence,
      createRelationship,
      createApplication,
      createReview,
      createDomain,
      createSubject,
      createTopic,
      createInboxItem,
      updateInboxItem,
      archiveInboxItem,
      deleteInboxItem,
      updateLearningContext,
    }),
    [
      engine,
      repositories,
      activeTab,
      searchQuery,
      questions,
      sessions,
      knowledgeUnits,
      sources,
      evidence,
      relationships,
      applications,
      reviews,
      foundations,
      domains,
      subjects,
      topics,
      inbox,
      learningContext,
      refreshData,
      isLoading,
      lastError,
      createQuestion,
      updateQuestion,
      createSession,
      updateSession,
      createKnowledgeUnit,
      updateKnowledgeUnit,
      createSource,
      createEvidence,
      createRelationship,
      createApplication,
      createReview,
      createDomain,
      createSubject,
      createTopic,
      createInboxItem,
      updateInboxItem,
      archiveInboxItem,
      deleteInboxItem,
      updateLearningContext,
    ],
  );

  return <P3Context.Provider value={value}>{children}</P3Context.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useP3(): P3ContextValue {
  const ctx = useContext(P3Context);
  if (!ctx) {
    throw new Error("useP3 must be used within a P3Provider");
  }
  return ctx;
}
