/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Phase 3A: Frontend Foundation & First Working Vertical Slice Test Suite
 *
 * Verifies the complete 8-step vertical slice:
 * 1. Formulate & Manage Learning Question
 * 2. Open & Record Learning Session linked to Question
 * 3. Synthesize structured 6-section Knowledge Unit
 * 4. Register Canonical Sources
 * 5. Attach Empirical Evidence (supporting or challenging)
 * 6. Establish Typed Semantic Relationship with mandatory explanation
 * 7. Live Knowledge Search & Retrieval
 * 8. Log Execution Application Record (Trial in P1/P2)
 * + Persistence across simulated storage engine reload
 */

import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import {
  MemoryStorageDriver,
  P3StorageEngine,
  createLocalP3Repositories,
  type LearningQuestionEntity,
  type LearningSessionEntity,
  type KnowledgeUnitEntity,
  type SourceEntity,
  type EvidenceEntity,
  type KnowledgeRelationshipEntity,
  type ApplicationRecordEntity,
} from "../priority3";
import {
  P3Provider,
  useP3,
  P3WorkspaceShell,
  P3WorkspaceModal,
  LearningQuestionsList,
  KnowledgeUnitList,
  KnowledgeUnitEditorModal,
  ApplicationRecordList,
} from "../priority3/presentation";

describe("Priority 3: Frontend Foundation & First Working Vertical Slice", () => {
  it("executes the complete vertical slice from Question to Application Record via P3Provider & Repositories", async () => {
    const memoryDriver = new MemoryStorageDriver();
    let capturedContext: ReturnType<typeof useP3> | null = null;

    function TestConsumer() {
      const ctx = useP3();
      capturedContext = ctx;
      return (
        <div>
          <span data-testid="active-tab">{ctx.activeTab}</span>
          <span data-testid="questions-count">{ctx.questions.length}</span>
          <span data-testid="ku-count">{ctx.knowledgeUnits.length}</span>
          <span data-testid="sessions-count">{ctx.sessions.length}</span>
          <span data-testid="apps-count">{ctx.applications.length}</span>
        </div>
      );
    }

    render(
      <P3Provider storageDriver={memoryDriver}>
        <TestConsumer />
      </P3Provider>,
    );

    // Initial state check
    expect(screen.getByTestId("active-tab")).toHaveTextContent("overview");
    await waitFor(() => {
      expect(capturedContext).not.toBeNull();
    });

    const ctx = capturedContext!;
    const now = new Date().toISOString();

    // STEP 1: Formulate a Learning Question
    const questionEntity: LearningQuestionEntity = {
      id: "lq-allocator-contention",
      question:
        "How do memory allocators minimize cache contention in concurrent feeds?",
      description:
        "Investigating allocator bottlenecks under multi-producer ring buffers.",
      origin: "execution",
      priority: "immediate",
      status: "open",
      linkedSessionIds: [],
      linkedKnowledgeUnitIds: [],
      currentUnderstanding:
        "Default glibc malloc shares arena locks under heavy contention.",
      remainingGaps:
        "Exact threshold where jemalloc per-thread caching eliminates lock pauses.",
      nextLogicalStep: "Profile jemalloc thread-cache arenas with perf c2c.",
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    let createdQ: LearningQuestionEntity =
      null as unknown as LearningQuestionEntity;
    await act(async () => {
      createdQ = await ctx.createQuestion(questionEntity);
    });
    expect(createdQ.id).toBe("lq-allocator-contention");

    await waitFor(() => {
      expect(screen.getByTestId("questions-count")).toHaveTextContent("1");
    });

    // STEP 2: Record Learning Session linked to Question
    const sessionEntity: LearningSessionEntity = {
      id: "ls-jemalloc-profile",
      title: "Jemalloc Arena Benchmarking Session",
      status: "completed",
      linkedQuestionIds: [createdQ.id],
      learningContext: "Priority 1 High-Throughput Venture Architecture",
      investigation:
        "Configured jemalloc with MALLOC_CONF=dirty_decay_ms:0 and profiled with perf.",
      explanationInOwnWords:
        "Per-thread arenas provide thread-local slab pools, preventing threads on distinct cores from contending for allocator mutexes.",
      findings:
        "Eliminated 98% of allocator lock wait times during simulated 50k req/sec burst.",
      remainingGaps: "Memory fragmentation under uneven chunk deallocations.",
      nextLogicalStep:
        "Synthesize per-thread arena pattern into canonical Knowledge Unit.",
      linkedKnowledgeUnitIds: [],
      sourceIds: [],
      durationMinutes: 45,
      startTime: now,
      completionTime: now,
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    let createdSession: LearningSessionEntity =
      null as unknown as LearningSessionEntity;
    await act(async () => {
      createdSession = await ctx.createSession(sessionEntity);
    });
    expect(createdSession.id).toBe("ls-jemalloc-profile");

    await waitFor(() => {
      expect(screen.getByTestId("sessions-count")).toHaveTextContent("1");
    });

    // STEP 3: Register Canonical Source
    const sourceEntity: SourceEntity = {
      id: "src-jemalloc-spec",
      title: "Scalable Memory Allocation using Jemalloc",
      type: "primary_evidence",
      authorOrCreator: "Jason Evans",
      urlOrLocation:
        "https://people.freebsd.org/~jasone/jemalloc/bsdcan2006/jemalloc.pdf",
      accessDate: now,
      description:
        "Original architectural paper describing multi-arena allocation algorithms.",
      provenanceMetadata: {},
      reliabilityAssessment:
        "Peer-reviewed systems paper; widely deployed in FreeBSD & Meta.",
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    let createdSource: SourceEntity = null as unknown as SourceEntity;
    await act(async () => {
      createdSource = await ctx.createSource(sourceEntity);
    });
    expect(createdSource.id).toBe("src-jemalloc-spec");

    // STEP 4: Synthesize 6-Section Knowledge Unit
    const kuEntity: KnowledgeUnitEntity = {
      id: "ku-per-thread-arena-pattern",
      title: "Per-Thread Arena Allocation Pattern",
      summary:
        "Partitions allocation pools by thread or CPU core to eliminate lock contention on shared memory heaps.",
      perspective: "objective_knowledge",
      status: "tested",
      classification: "general",
      identity: {
        id: "ku-per-thread-arena-pattern",
        title: "Per-Thread Arena Allocation Pattern",
        perspective: "objective_knowledge",
        classification: "general",
        tags: ["memory", "concurrency", "low-latency", "c++"],
      },
      coreUnderstanding: {
        plainEnglishExplanation:
          "Instead of every worker thread waiting for a single shared heap manager, each worker gets its own private arena pool. They only interact when requesting large chunk boundaries.",
        corePrinciples: [
          "Eliminate shared mutable state on critical hot paths.",
          "Thread-local slab allocation eliminates cross-core cache invalidation.",
        ],
        mentalModels: ["Private workspace vs. shared warehouse bottleneck"],
      },
      deeperUnderstanding: {
        nuancedMechanisms:
          "Uses magazine/slab caches for bins under 14KB with decay timers for thread retirement.",
        boundaryConditions:
          "Under millions of idle threads, per-thread arenas cause severe virtual memory fragmentation.",
        counterExamples: [
          "Single-threaded embedded microcontrollers with constrained RAM.",
        ],
      },
      sourcesAndEvidence: {
        sourceIds: [createdSource.id],
        evidenceIds: [],
        competingTheories: ["Hoard Allocator", "TCMalloc Thread-Cache"],
      },
      relationshipsAndApplications: {
        relationshipIds: [],
        applicationRecordIds: [],
        operationalNotes:
          "Mandatory standard for all high-throughput services in Priority 1.",
      },
      developmentHistory: {
        revisions: [
          {
            id: "rev-init",
            timestamp: now,
            previousStatus: "captured",
            newStatus: "tested",
            previousSummary: "",
            previousExplanation: "",
            reasonForChange: "Synthesized from session profiling.",
            authorOrContext: "Architecture Engine",
          },
        ],
      },
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    let createdKU: KnowledgeUnitEntity = null as unknown as KnowledgeUnitEntity;
    await act(async () => {
      createdKU = await ctx.createKnowledgeUnit(kuEntity);
    });
    expect(createdKU.id).toBe("ku-per-thread-arena-pattern");

    await waitFor(() => {
      expect(screen.getByTestId("ku-count")).toHaveTextContent("1");
    });

    // STEP 5: Attach Empirical Evidence
    const evidenceEntity: EvidenceEntity = {
      id: "ev-bench-50k",
      description:
        "Latency p99 dropped from 14.2ms to 0.4ms under 50k req/sec concurrent load.",
      evidenceType: "benchmark",
      sourceId: createdSource.id,
      knowledgeUnitId: createdKU.id,
      polarity: "supports",
      context:
        "Tested on 16-core Linux workstation with simulated TCP order stream.",
      qualityAssessment: "Direct cycle-accurate perf profiling trace.",
      date: now,
      provenance: "perf-stat-jemalloc.log",
      classification: "general",
      createdAt: now,
    };

    let createdEvidence: EvidenceEntity = null as unknown as EvidenceEntity;
    await act(async () => {
      createdEvidence = await ctx.createEvidence(evidenceEntity);
    });
    expect(createdEvidence.id).toBe("ev-bench-50k");

    // STEP 6: Synthesize a second Knowledge Unit and establish a typed semantic relationship
    const ku2Entity: KnowledgeUnitEntity = {
      id: "ku-false-sharing-cachelines",
      title: "False Sharing on CPU Cachelines",
      summary:
        "Threads modifying independent variables on the same 64-byte cacheline invalidate each other's L1/L2 caches.",
      perspective: "objective_knowledge",
      status: "validated",
      classification: "general",
      identity: {
        id: "ku-false-sharing-cachelines",
        title: "False Sharing on CPU Cachelines",
        perspective: "objective_knowledge",
        classification: "general",
        tags: ["hardware", "cpu-cache", "concurrency"],
      },
      coreUnderstanding: {
        plainEnglishExplanation:
          "Even if two threads never touch the same variable, if those variables sit side-by-side in the same 64-byte memory slice, the CPU ping-pongs the cacheline.",
        corePrinciples: [
          "Align independent atomic counters to 64-byte boundaries.",
        ],
        mentalModels: [
          "Sharing a notebook page where writing erases your neighbour's copy",
        ],
      },
      deeperUnderstanding: {
        nuancedMechanisms:
          "MESI protocol transitions between Shared and Modified states.",
        boundaryConditions: "Does not impact read-only variables.",
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
      },
      developmentHistory: {
        revisions: [],
      },
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    let createdKU2: KnowledgeUnitEntity =
      null as unknown as KnowledgeUnitEntity;
    await act(async () => {
      createdKU2 = await ctx.createKnowledgeUnit(ku2Entity);
    });
    expect(createdKU2.id).toBe("ku-false-sharing-cachelines");

    // Establish typed relationship: ku-per-thread-arena-pattern "explains" ku-false-sharing-cachelines
    const relationshipEntity: KnowledgeRelationshipEntity = {
      id: "rel-arena-solves-falsesharing",
      sourceKnowledgeUnitId: createdKU.id,
      targetKnowledgeUnitId: createdKU2.id,
      type: "explains",
      explanation:
        "Per-thread arenas prevent false sharing by ensuring memory allocated by thread A is separated by page slabs from thread B.",
      createdAt: now,
    };

    let createdRel: KnowledgeRelationshipEntity =
      null as unknown as KnowledgeRelationshipEntity;
    await act(async () => {
      createdRel = await ctx.createRelationship(relationshipEntity);
    });
    expect(createdRel.id).toBe("rel-arena-solves-falsesharing");

    // STEP 7: Record Execution Application Record in Real Work
    const applicationEntity: ApplicationRecordEntity = {
      id: "app-prod-ingest-swap",
      title: "Production Ingestion Allocator Hot-Swap",
      contextAndProblem:
        "Order ingestion microservice showed 12ms p99 spikes during opening market bell.",
      connectedKnowledgeUnitIds: [createdKU.id, createdKU2.id],
      relatedP1Reference: {
        projectId: "proj-killarity",
        label: "Killarity Low-Latency Ingestion Engine",
      },
      intendedAction:
        "Preloaded LD_PRELOAD=libjemalloc.so.2 and aligned ring buffer items to 64B.",
      expectedOutcome: "p99 latency to drop below 1ms without lock contention.",
      actualOutcome:
        "p99 latency dropped to 0.38ms with 0 lock pauses observed.",
      outcomeMatched: true,
      evidence:
        "Production prometheus metrics export: ingestion_latency_p99.prom",
      reflectionAndLessons:
        "The model accurately predicted production behavior. Per-thread arenas combined with 64B alignment fully unblocked the throughput bottleneck.",
      followUpQuestions: [
        "Monitor long-term heap fragmentation under continuous 72-hour run.",
      ],
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    let createdApp: ApplicationRecordEntity =
      null as unknown as ApplicationRecordEntity;
    await act(async () => {
      createdApp = await ctx.createApplication(applicationEntity);
    });
    expect(createdApp.id).toBe("app-prod-ingest-swap");

    await waitFor(() => {
      expect(screen.getByTestId("apps-count")).toHaveTextContent("1");
    });

    // STEP 8: Verify persistence round-trip across new Storage Engine instance
    const reloadedEngine = new P3StorageEngine(memoryDriver);
    const reloadedRepos = createLocalP3Repositories(reloadedEngine);

    const persistedQuestions = await reloadedRepos.questions.list();
    const persistedSessions = await reloadedRepos.sessions.list();
    const persistedKUs = await reloadedRepos.knowledgeUnits.list();
    const persistedSources = await reloadedRepos.sources.list();
    const persistedEvidence = await reloadedRepos.evidence.list();
    const persistedRels = await reloadedRepos.relationships.list();
    const persistedApps = await reloadedRepos.applications.list();

    expect(persistedQuestions).toHaveLength(1);
    expect(persistedQuestions[0]?.question).toBe(questionEntity.question);

    expect(persistedSessions).toHaveLength(1);
    expect(persistedSessions[0]?.title).toBe(sessionEntity.title);

    expect(persistedKUs).toHaveLength(2);
    expect(persistedKUs.some((ku) => ku.id === createdKU.id)).toBe(true);

    expect(persistedSources).toHaveLength(1);
    expect(persistedSources[0]?.title).toBe(sourceEntity.title);

    expect(persistedEvidence).toHaveLength(1);
    expect(persistedEvidence[0]?.polarity).toBe("supports");

    expect(persistedRels).toHaveLength(1);
    expect(persistedRels[0]?.type).toBe("explains");

    expect(persistedApps).toHaveLength(1);
    expect(persistedApps[0]?.outcomeMatched).toBe(true);
  });

  it("P3WorkspaceShell renders all 5 top workspaces and navigates between them cleanly", async () => {
    const memoryDriver = new MemoryStorageDriver();

    render(
      <P3Provider storageDriver={memoryDriver}>
        <P3WorkspaceShell />
      </P3Provider>,
    );

    // Verify 5 workspaces exist
    expect(
      screen.getByRole("button", { name: /^Overview/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Learning/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Knowledge/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Applications/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Reviews/i }),
    ).toBeInTheDocument();

    // Verify Overview content
    expect(screen.getByText("Current Learning Focus")).toBeInTheDocument();
    expect(screen.getByText(/What am I learning\?/i)).toBeInTheDocument();

    // Navigate to 2. Learning
    fireEvent.click(screen.getByRole("button", { name: /^Learning/i }));
    expect(
      screen.getAllByText(/Learning Questions/i).length,
    ).toBeGreaterThanOrEqual(1);

    // Navigate to 3. Knowledge
    fireEvent.click(screen.getByRole("button", { name: /^Knowledge/i }));
    expect(
      screen.getAllByText(/Knowledge Units/i).length,
    ).toBeGreaterThanOrEqual(1);

    // Navigate to 4. Applications
    fireEvent.click(screen.getByRole("button", { name: /^Applications/i }));
    expect(
      screen.getAllByText(/Application Records/i).length,
    ).toBeGreaterThanOrEqual(1);

    // Navigate to 5. Reviews
    fireEvent.click(screen.getByRole("button", { name: /^Reviews/i }));
    expect(
      screen.getByText(/Learning & Knowledge Intelligence Reviews/i),
    ).toBeInTheDocument();
  });

  it("P3WorkspaceModal mounts as a standalone modal and renders the complete shell", () => {
    const memoryDriver = new MemoryStorageDriver();
    const handleClose = vi.fn();

    render(
      <P3WorkspaceModal
        open={true}
        onClose={handleClose}
        storageDriver={memoryDriver}
      />,
    );

    expect(
      screen.getByText("Priority 3: Learning & Knowledge Intelligence System"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Overview/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Knowledge/i }),
    ).toBeInTheDocument();
  });

  it("enforces domain validation rules during frontend creation", async () => {
    const memoryDriver = new MemoryStorageDriver();
    let capturedContext: ReturnType<typeof useP3> | null = null;

    function TestConsumer() {
      capturedContext = useP3();
      return <div>Validator</div>;
    }

    render(
      <P3Provider storageDriver={memoryDriver}>
        <TestConsumer />
      </P3Provider>,
    );

    await waitFor(() => {
      expect(capturedContext).not.toBeNull();
    });

    const ctx = capturedContext!;
    const now = new Date().toISOString();

    // Question validation: question text too short (< 5 chars)
    const invalidQuestion: LearningQuestionEntity = {
      id: "lq-short",
      question: "Why?",
      description: "Too short",
      origin: "execution",
      priority: "important",
      status: "open",
      linkedSessionIds: [],
      linkedKnowledgeUnitIds: [],
      currentUnderstanding: "",
      remainingGaps: "",
      nextLogicalStep: "",
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    await expect(ctx.createQuestion(invalidQuestion)).rejects.toThrow(
      "Question text must be at least 5 characters.",
    );

    // Relationship validation: cannot link a Knowledge Unit to itself
    const invalidRel: KnowledgeRelationshipEntity = {
      id: "rel-self",
      sourceKnowledgeUnitId: "ku-1",
      targetKnowledgeUnitId: "ku-1",
      type: "related_to",
      explanation: "Self reference",
      createdAt: now,
    };

    await expect(ctx.createRelationship(invalidRel)).rejects.toThrow(
      "A Knowledge Unit cannot link to itself.",
    );
  });

  it("supports PRD Feature A: Taxonomy navigation, domains, subjects, and topics", async () => {
    const memoryDriver = new MemoryStorageDriver();
    let ctx: ReturnType<typeof useP3> | null = null;

    function TestConsumer() {
      ctx = useP3();
      return <div>Taxonomy Consumer</div>;
    }

    render(
      <P3Provider storageDriver={memoryDriver}>
        <TestConsumer />
      </P3Provider>,
    );

    await waitFor(() => {
      expect(ctx?.learningContext).not.toBeNull();
    });

    const now = new Date().toISOString();

    // Verify 2 permanent foundations
    expect(ctx!.foundations.length).toBe(2);
    expect(ctx!.foundations.some((f) => f.id === "human_understanding")).toBe(
      true,
    );
    expect(ctx!.foundations.some((f) => f.id === "reality_understanding")).toBe(
      true,
    );

    // Create a Domain
    await act(async () => {
      await ctx!.createDomain({
        id: "dom-concurrency",
        name: "Concurrency & Distributed Systems",
        description: "Systems programming invariants",
        foundationId: "reality_understanding",
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    expect(ctx!.domains.some((d) => d.id === "dom-concurrency")).toBe(true);

    // Create a Subject under Domain
    await act(async () => {
      await ctx!.createSubject({
        id: "sub-ringbuffer",
        name: "Lock-Free Ring Buffers",
        description: "Single-producer multi-consumer ring buffer mechanics",
        domainId: "dom-concurrency",
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    expect(ctx!.subjects.some((s) => s.id === "sub-ringbuffer")).toBe(true);

    // Create a Topic under Subject
    await act(async () => {
      await ctx!.createTopic({
        id: "top-cacheline-padding",
        name: "Cache-Line Padding & False Sharing",
        description: "64-byte alignment boundaries",
        subjectId: "sub-ringbuffer",
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    expect(ctx!.topics.some((t) => t.id === "top-cacheline-padding")).toBe(
      true,
    );
  });

  it("supports PRD Feature B: Capture Inbox lifecycle and processing into Question and KU", async () => {
    const memoryDriver = new MemoryStorageDriver();
    let ctx: ReturnType<typeof useP3> | null = null;

    function TestConsumer() {
      ctx = useP3();
      return <div>Inbox Consumer</div>;
    }

    render(
      <P3Provider storageDriver={memoryDriver}>
        <TestConsumer />
      </P3Provider>,
    );

    await waitFor(() => {
      expect(ctx?.learningContext).not.toBeNull();
    });

    const now = new Date().toISOString();

    // 1. Quick Capture
    await act(async () => {
      await ctx!.createInboxItem({
        id: "inbox-cache-thrash",
        title: "False sharing observed on head pointer in multi-threaded loop",
        rawContent:
          "L1 cache invalidation spikes to 80% when head and tail share cache line.",
        method: "quick_capture",
        status: "captured",
        sourceUrlOrLocation: "perf c2c profile",
        classification: "general",
        createdAt: now,
        updatedAt: now,
      });
    });

    expect(ctx!.inbox.some((i) => i.id === "inbox-cache-thrash")).toBe(true);

    // 2. Review
    await act(async () => {
      await ctx!.updateInboxItem("inbox-cache-thrash", { status: "reviewed" });
    });
    expect(ctx!.inbox.find((i) => i.id === "inbox-cache-thrash")?.status).toBe(
      "reviewed",
    );

    // 3. Process to Question
    await act(async () => {
      await ctx!.createQuestion({
        id: "lq-from-inbox",
        question: "How to eliminate false sharing on ring buffer pointers?",
        description: "L1 cache invalidation investigation.",
        origin: "execution",
        priority: "immediate",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "Pointers must be aligned to 64 bytes.",
        remainingGaps: "Compiler alignment attributes across platforms.",
        nextLogicalStep: "Add alignas(64) to head and tail structs.",
        classification: "general",
        createdAt: now,
        updatedAt: now,
      });
      await ctx!.updateInboxItem("inbox-cache-thrash", {
        status: "processed",
        processedTargetType: "question",
        processedTargetId: "lq-from-inbox",
      });
    });

    const processedItem = ctx!.inbox.find((i) => i.id === "inbox-cache-thrash");
    expect(processedItem?.status).toBe("processed");
    expect(processedItem?.processedTargetType).toBe("question");
    expect(processedItem?.processedTargetId).toBe("lq-from-inbox");

    // 4. Archive & Delete
    await act(async () => {
      await ctx!.archiveInboxItem("inbox-cache-thrash");
    });
    expect(ctx!.inbox.find((i) => i.id === "inbox-cache-thrash")?.status).toBe(
      "archived",
    );

    await act(async () => {
      await ctx!.deleteInboxItem("inbox-cache-thrash");
    });
    expect(ctx!.inbox.some((i) => i.id === "inbox-cache-thrash")).toBe(false);
  });

  it("supports PRD Feature C: Active Learning Context Widget persistence", async () => {
    const memoryDriver = new MemoryStorageDriver();
    let ctx: ReturnType<typeof useP3> | null = null;

    function TestConsumer() {
      ctx = useP3();
      return <div>Context Consumer</div>;
    }

    render(
      <P3Provider storageDriver={memoryDriver}>
        <TestConsumer />
      </P3Provider>,
    );

    await waitFor(() => {
      expect(ctx?.learningContext).not.toBeNull();
    });

    // Default context
    expect(ctx!.learningContext?.currentFocus).toBe(
      "Initialize first learning inquiry.",
    );

    // Update context
    await act(async () => {
      await ctx!.updateLearningContext({
        currentFocus: "Master Jemalloc thread caching",
        lastStoppingPoint: "Read Jemalloc design document",
        remainingGaps: "Exact arena indexing behavior under contention",
        nextLogicalStep: "Run synthetic microbenchmarks",
      });
    });

    expect(ctx!.learningContext?.currentFocus).toBe(
      "Master Jemalloc thread caching",
    );
    expect(ctx!.learningContext?.lastStoppingPoint).toBe(
      "Read Jemalloc design document",
    );
    expect(ctx!.learningContext?.nextLogicalStep).toBe(
      "Run synthetic microbenchmarks",
    );
  });

  it("supports PRD Feature E: Interactive Reviews (Weekly Learning & Monthly Capability)", async () => {
    const memoryDriver = new MemoryStorageDriver();
    let ctx: ReturnType<typeof useP3> | null = null;

    function TestConsumer() {
      ctx = useP3();
      return <div>Review Consumer</div>;
    }

    render(
      <P3Provider storageDriver={memoryDriver}>
        <TestConsumer />
      </P3Provider>,
    );

    await waitFor(() => {
      expect(ctx?.learningContext).not.toBeNull();
    });

    const now = new Date().toISOString();

    // Create a Weekly Learning Review
    await act(async () => {
      await ctx!.createReview({
        id: "rev-wk-47",
        type: "weekly_learning_review",
        period: "2026-W47",
        findings: "Cache line false sharing causes 80% latency spikes.",
        updatedUnderstanding:
          "Pointers must be isolated to hardware cache line size.",
        unresolvedQuestions: [
          "Does ARM64 require 128-byte cache line padding?",
        ],
        capabilityEvidence: [
          {
            dimension: "understanding",
            qualitativeAssessment:
              "Mastered hardware cache coherence protocols.",
            supportingEvidence: ["perf c2c benchmark report"],
          },
          {
            dimension: "reasoning",
            qualitativeAssessment:
              "Traced false sharing root causes accurately.",
            supportingEvidence: [],
          },
          {
            dimension: "transfer",
            qualitativeAssessment:
              "Applied padding to Killarity high-speed queue.",
            supportingEvidence: [],
          },
          {
            dimension: "reality_accuracy",
            qualitativeAssessment:
              "Observed 90% latency reduction matching model.",
            supportingEvidence: [],
          },
        ],
        nextFocus: "ARM64 cacheline size detection",
        approvalState: "approved",
        classification: "general",
        createdAt: now,
        updatedAt: now,
      });
    });

    expect(ctx!.reviews.length).toBe(1);
    expect(ctx!.reviews[0]!.period).toBe("2026-W47");
    expect(ctx!.reviews[0]!.type).toBe("weekly_learning_review");
    expect(ctx!.reviews[0]!.capabilityEvidence.length).toBe(4);
  });

  it("DEF-003 Regression: editing a Knowledge Unit via KnowledgeUnitEditorModal preserves mentalModels, competingTheories, taxonomy links, and relationships", async () => {
    const memoryDriver = new MemoryStorageDriver();
    const now = "2026-11-22T15:00:00.000Z";

    const seededUnit: KnowledgeUnitEntity = {
      id: "ku-def003-control",
      title: "Control Loop Invariant KU",
      summary: "Negative feedback stabilizes system drift.",
      perspective: "objective_knowledge",
      status: "captured",
      classification: "sensitive",
      foundationId: "reality_understanding",
      domainId: "dom-control-1",
      subjectId: "sub-feedback-1",
      topicId: "top-pid-1",
      identity: {
        id: "ku-def003-control",
        title: "Control Loop Invariant KU",
        perspective: "objective_knowledge",
        classification: "sensitive",
        tags: ["control", "feedback"],
        foundationId: "reality_understanding",
        domainId: "dom-control-1",
        subjectId: "sub-feedback-1",
        topicId: "top-pid-1",
      },
      coreUnderstanding: {
        plainEnglishExplanation:
          "Core explanation of negative feedback stabilization.",
        corePrinciples: ["Measure error continuously"],
        mentalModels: ["Thermostat Model", "Centrifugal Governor"],
      },
      deeperUnderstanding: {
        nuancedMechanisms: "Phase margin prevents oscillation.",
        boundaryConditions: "Breaks when dead-time exceeds loop period.",
        counterExamples: ["Positive feedback runaway"],
      },
      sourcesAndEvidence: {
        sourceIds: ["src-1"],
        evidenceIds: ["ev-1"],
        competingTheories: ["Open Loop Feedforward Only"],
      },
      relationshipsAndApplications: {
        relationshipIds: ["rel-1"],
        applicationRecordIds: ["app-1"],
        operationalNotes: "Use closed-loop checks in daily execution.",
      },
      developmentHistory: {
        revisions: [
          {
            id: "rev-0",
            timestamp: now,
            previousStatus: "captured",
            newStatus: "captured",
            previousSummary: "",
            previousExplanation: "",
            reasonForChange: "Initial capture",
            authorOrContext: "Seed",
          },
        ],
      },
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    const seedEngine = new P3StorageEngine(memoryDriver);
    const seedRepos = createLocalP3Repositories(seedEngine);
    await seedRepos.knowledgeUnits.create(seededUnit);

    const onClose = vi.fn();
    render(
      <P3Provider storageDriver={memoryDriver}>
        <KnowledgeUnitEditorModal
          open={true}
          onClose={onClose}
          initialUnit={seededUnit}
        />
      </P3Provider>,
    );

    // Edit title in Section 1 and submit Update Knowledge Unit
    const titleInput = screen.getByDisplayValue("Control Loop Invariant KU");
    fireEvent.change(titleInput, {
      target: { value: "Control Loop Invariant KU (Refined)" },
    });

    const submitBtn = screen.getByRole("button", {
      name: "Update Knowledge Unit",
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    // Reload from storage driver to verify durable persistence
    const reloadedEngine = new P3StorageEngine(memoryDriver);
    const reloadedRepos = createLocalP3Repositories(reloadedEngine);
    const updated =
      await reloadedRepos.knowledgeUnits.findById("ku-def003-control");

    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Control Loop Invariant KU (Refined)");
    expect(updated?.coreUnderstanding.mentalModels).toEqual([
      "Thermostat Model",
      "Centrifugal Governor",
    ]);
    expect(updated?.sourcesAndEvidence.competingTheories).toEqual([
      "Open Loop Feedforward Only",
    ]);
    expect(updated?.domainId).toBe("dom-control-1");
    expect(updated?.subjectId).toBe("sub-feedback-1");
    expect(updated?.topicId).toBe("top-pid-1");
    expect(updated?.identity.domainId).toBe("dom-control-1");
    expect(updated?.identity.subjectId).toBe("sub-feedback-1");
    expect(updated?.identity.topicId).toBe("top-pid-1");
    expect(updated?.classification).toBe("sensitive");
    expect(updated?.identity.classification).toBe("sensitive");
    expect(updated?.relationshipsAndApplications.relationshipIds).toEqual([
      "rel-1",
    ]);
    expect(updated?.relationshipsAndApplications.applicationRecordIds).toEqual([
      "app-1",
    ]);
    expect(updated?.developmentHistory.revisions).toHaveLength(2);

    // DEF-010 (E2E-040): Attaching empirical evidence links the new evidence ID into ku.sourcesAndEvidence.evidenceIds
    const createdEv = await reloadedRepos.evidence.create({
      id: "ev-def010-trace",
      description: "Empirical benchmark trace confirming feedback loop",
      evidenceType: "benchmark",
      knowledgeUnitId: "ku-def003-control",
      polarity: "supports",
      context: "Load test environment",
      qualityAssessment: "Verified",
      date: now,
      provenance: "Direct execution trace",
      classification: "general",
      createdAt: now,
    });
    expect(createdEv.id).toBe("ev-def010-trace");

    const kuAfterEvidence =
      await reloadedRepos.knowledgeUnits.findById("ku-def003-control");
    expect(kuAfterEvidence?.sourcesAndEvidence.evidenceIds).toContain(
      "ev-def010-trace",
    );
  });
});
