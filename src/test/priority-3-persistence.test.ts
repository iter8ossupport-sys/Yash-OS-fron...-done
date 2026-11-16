/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Phase 2A — Application & Persistence Foundation Test Suite
 *
 * Verifies typed repository contracts, local adapter CRUD, reload persistence,
 * relationship queries, atomic backups, safe export/import, and orphan detection.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  createInitialKnowledgeUnit,
  type LearningQuestionEntity,
} from "@/priority3/domain";
import {
  createLocalP3Repositories,
  MemoryStorageDriver,
  P3_SCHEMA_VERSION,
  P3StorageEngine,
  type P3Repositories,
} from "@/priority3/infrastructure/persistence";

describe("Priority 3: Persistence & Repositories (Phase 2A)", () => {
  let driver: MemoryStorageDriver;
  let engine: P3StorageEngine;
  let repos: P3Repositories;

  beforeEach(() => {
    driver = new MemoryStorageDriver();
    engine = new P3StorageEngine(driver);
    repos = createLocalP3Repositories(engine);
  });

  // 1. REPOSITORY CRUD & LIFECYCLE
  describe("Repository CRUD & Invariant Lifecycle", () => {
    it("creates, retrieves, updates, archives, and restores a Learning Question", async () => {
      const q: LearningQuestionEntity = {
        id: "q-dist-1",
        question: "How do vector clocks prevent causality violations?",
        description: "Study Lamport timestamps vs vector clocks.",
        origin: "reality",
        foundationId: "reality_understanding",
        priority: "immediate",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "Basic Lamport scalar clock understanding.",
        remainingGaps: "Concurrent event distinction.",
        nextLogicalStep: "Draw 3-process communication timeline.",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      };

      const created = await repos.questions.create(q);
      expect(created.id).toBe("q-dist-1");

      const fetched = await repos.questions.findById("q-dist-1");
      expect(fetched?.question).toBe(q.question);

      // Transition to investigating
      const updated = await repos.questions.update("q-dist-1", {
        status: "investigating",
        currentUnderstanding: "Understood pairwise clock comparison.",
      });
      expect(updated.status).toBe("investigating");
      expect(updated.currentUnderstanding).toContain("pairwise");

      // Soft archive
      const archived = await repos.questions.archive("q-dist-1");
      expect(archived.status).toBe("archived");
      expect(archived.archivedAt).toBeDefined();

      // By default list() excludes archived
      const activeList = await repos.questions.list();
      expect(activeList.some((item) => item.id === "q-dist-1")).toBe(false);

      // Restore
      const restored = await repos.questions.restore("q-dist-1");
      expect(restored.status).toBe("open");
      const listAfterRestore = await repos.questions.list();
      expect(listAfterRestore.some((item) => item.id === "q-dist-1")).toBe(
        true,
      );
    });

    it("rejects illegal question state transitions", async () => {
      const q: LearningQuestionEntity = {
        id: "q-illegal-1",
        question: "What causes memory fragmentation in V8?",
        description: "Garbage collection and slab allocation.",
        origin: "reality",
        priority: "important",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "",
        remainingGaps: "",
        nextLogicalStep: "",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      };
      await repos.questions.create(q);

      // open cannot jump directly to resolved_for_now without investigating
      await expect(
        repos.questions.update("q-illegal-1", { status: "resolved_for_now" }),
      ).rejects.toThrow(/Illegal status transition/);
    });

    it("creates progressively enrichable Knowledge Units with all 6 sections safely default-initialized", async () => {
      const ku = createInitialKnowledgeUnit({
        id: "ku-vector-clocks",
        title: "Vector Clocks Causality Principle",
        summary: "An array of logical clocks representing causal history.",
      });

      const created = await repos.knowledgeUnits.create(ku);
      expect(created.id).toBe("ku-vector-clocks");
      expect(created.identity.title).toBe("Vector Clocks Causality Principle");
      expect(created.coreUnderstanding.plainEnglishExplanation).toBe(
        "An array of logical clocks representing causal history.",
      );
      expect(created.deeperUnderstanding.boundaryConditions).toBe("");
      expect(created.sourcesAndEvidence.sourceIds.length).toBe(0);

      const found = await repos.knowledgeUnits.findById("ku-vector-clocks");
      expect(found).not.toBeNull();
      expect(found?.status).toBe("captured");
    });
  });

  // 2. RELOAD PERSISTENCE
  describe("Persistence Across Reloads", () => {
    it("preserves data intact when a new repository instance is constructed against the same storage", async () => {
      const q: LearningQuestionEntity = {
        id: "q-reload-1",
        question: "How do B-trees maintain O(log n) disk bounds?",
        description: "Page cache and node splitting.",
        origin: "reality",
        priority: "immediate",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "Balanced search tree with wide fanout.",
        remainingGaps: "Concurrent latching protocols.",
        nextLogicalStep: "Review B-link tree paper.",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      };
      await repos.questions.create(q);

      // Simulate browser reload: create brand-new engine and adapter pointing to the same driver
      const newEngine = new P3StorageEngine(driver);
      const newRepos = createLocalP3Repositories(newEngine);

      const retrieved = await newRepos.questions.findById("q-reload-1");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.question).toBe(q.question);
      expect(newEngine.load().schemaVersion).toBe(P3_SCHEMA_VERSION);
    });
  });

  // 3. RELATIONSHIPS & MANY-TO-MANY QUERIES
  describe("Many-to-Many Relationships & Cross-Entity Queries", () => {
    it("links and queries multiple questions to multiple sessions and Knowledge Units", async () => {
      // 1. Create two questions
      await repos.questions.create({
        id: "q-m1",
        question: "Question One on Consistency",
        description: "Consistency models",
        origin: "reality",
        priority: "immediate",
        status: "open",
        linkedSessionIds: ["sess-shared"],
        linkedKnowledgeUnitIds: ["ku-shared"],
        currentUnderstanding: "",
        remainingGaps: "",
        nextLogicalStep: "",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      });

      await repos.questions.create({
        id: "q-m2",
        question: "Question Two on Availability",
        description: "Availability under partitions",
        origin: "reality",
        priority: "important",
        status: "open",
        linkedSessionIds: ["sess-shared"],
        linkedKnowledgeUnitIds: ["ku-shared"],
        currentUnderstanding: "",
        remainingGaps: "",
        nextLogicalStep: "",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      });

      // 2. Create shared session
      await repos.sessions.create({
        id: "sess-shared",
        title: "Trade-offs in CAP Theorem",
        status: "completed",
        linkedQuestionIds: ["q-m1", "q-m2"],
        learningContext: "CAP Theorem formal proof.",
        investigation: "Investigated Brewer theorem and Gilbert & Lynch proof.",
        explanationInOwnWords:
          "In an asynchronous network with partitions, you cannot guarantee both atomic consistency and 100% availability.",
        findings:
          "Partitions force choosing between waiting or returning stale data.",
        remainingGaps: "PACELC model latency trade-offs.",
        linkedKnowledgeUnitIds: ["ku-shared"],
        sourceIds: [],
        startTime: "2026-11-16T10:00:00Z",
        nextLogicalStep: "Summarize PACELC.",
        classification: "general",
        createdAt: "2026-11-16T10:00:00Z",
        updatedAt: "2026-11-16T11:00:00Z",
      });

      // 3. Create shared Knowledge Unit
      await repos.knowledgeUnits.create(
        createInitialKnowledgeUnit({
          id: "ku-shared",
          title: "CAP Theorem Bounds",
          summary: "Consistency vs Availability in partitioned networks.",
        }),
      );

      // Verify cross-queries
      const questionsForSession =
        await repos.questions.findQuestionsForSession("sess-shared");
      expect(questionsForSession.length).toBe(2);
      expect(questionsForSession.map((q) => q.id)).toContain("q-m1");
      expect(questionsForSession.map((q) => q.id)).toContain("q-m2");

      const sessionsForQuestion =
        await repos.sessions.findSessionsForQuestion("q-m1");
      expect(sessionsForQuestion.length).toBe(1);
      expect(sessionsForQuestion[0]!.id).toBe("sess-shared");

      const questionsForKU =
        await repos.questions.findQuestionsForKnowledgeUnit("ku-shared");
      expect(questionsForKU.length).toBe(2);
    });

    it("creates explicit Knowledge Relationships with mandatory rationale and queries related units", async () => {
      const ku1 = createInitialKnowledgeUnit({
        id: "ku-cap",
        title: "CAP Theorem",
        summary: "Fundamental distributed trade-off.",
      });
      const ku2 = createInitialKnowledgeUnit({
        id: "ku-pacelc",
        title: "PACELC Model",
        summary: "Extends CAP to include latency when no partition exists.",
      });
      await repos.knowledgeUnits.create(ku1);
      await repos.knowledgeUnits.create(ku2);

      await repos.relationships.create({
        id: "rel-cap-pacelc",
        sourceKnowledgeUnitId: "ku-pacelc",
        targetKnowledgeUnitId: "ku-cap",
        type: "explains",
        explanation:
          "PACELC extends the CAP theorem by explaining latency trade-offs during normal operations.",
        createdAt: "2026-11-16T12:00:00Z",
      });

      const related =
        await repos.knowledgeUnits.findRelatedKnowledgeUnits("ku-cap");
      expect(related.length).toBe(1);
      expect(related[0]!.unit.id).toBe("ku-pacelc");
      expect(related[0]!.relationship.type).toBe("explains");
    });
  });

  // 4. BACKUP SNAPSHOTS & RESTORATION
  describe("Backup Snapshots & Atomic Restoration", () => {
    it("creates snapshots and restores prior state cleanly", async () => {
      await repos.questions.create({
        id: "q-snap-1",
        question: "Initial Question before snapshot",
        description: "Baseline",
        origin: "foundation",
        priority: "exploratory",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "",
        remainingGaps: "",
        nextLogicalStep: "",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      });

      const snapshot = engine.createSnapshot("Baseline Test Snapshot");
      expect(snapshot.snapshotId).toBeDefined();

      // Now create a 2nd question
      await repos.questions.create({
        id: "q-snap-2",
        question: "Secondary Question added after snapshot",
        description: "Will be rolled back",
        origin: "foundation",
        priority: "exploratory",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "",
        remainingGaps: "",
        nextLogicalStep: "",
        classification: "general",
        createdAt: "2026-11-16T13:00:00Z",
        updatedAt: "2026-11-16T13:00:00Z",
      });

      expect((await repos.questions.list()).length).toBe(2);

      // Restore snapshot
      const restored = engine.restoreSnapshot(snapshot.snapshotId);
      expect(restored).toBe(true);

      const listAfterRestore = await repos.questions.list();
      expect(listAfterRestore.length).toBe(1);
      expect(listAfterRestore[0]!.id).toBe("q-snap-1");
    });
  });

  // 5. EXPORT & SAFE IMPORT
  describe("Export & Safe Import Integrity", () => {
    it("exports valid portable payload with metadata and re-imports successfully", async () => {
      await repos.questions.create({
        id: "q-export-1",
        question: "Question to export",
        description: "Test export payload",
        origin: "execution",
        priority: "immediate",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "",
        remainingGaps: "",
        nextLogicalStep: "",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      });

      const exportPayload = engine.exportPayload();
      expect(exportPayload.format).toBe("yash-os-p3-export");
      expect(exportPayload.summary.questionsCount).toBe(1);

      // Create a fresh clean engine and import
      const freshDriver = new MemoryStorageDriver();
      const freshEngine = new P3StorageEngine(freshDriver);
      const freshRepos = createLocalP3Repositories(freshEngine);

      const importResult = freshEngine.importPayload(
        JSON.stringify(exportPayload),
      );
      expect(importResult.success).toBe(true);
      expect(importResult.backupId).toBeDefined();

      const importedQ = await freshRepos.questions.findById("q-export-1");
      expect(importedQ?.question).toBe("Question to export");
    });

    it("rejects invalid or corrupted import payloads without overwriting good data", async () => {
      await repos.questions.create({
        id: "q-protected",
        question: "Protected question that must never be corrupted",
        description: "Baseline",
        origin: "foundation",
        priority: "immediate",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "",
        remainingGaps: "",
        nextLogicalStep: "",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      });

      // Attempt importing corrupted payload (e.g. questions is a number, not an array)
      const corruptedJson = JSON.stringify({
        format: "yash-os-p3-export",
        version: 1,
        data: {
          schemaVersion: 1,
          questions: 12345, // INVALID!
        },
      });

      const res = engine.importPayload(corruptedJson);
      expect(res.success).toBe(false);
      expect(res.errors?.some((e) => e.includes("must be an array"))).toBe(
        true,
      );

      // Verify protected data was completely untouched
      const afterFailedImport = await repos.questions.findById("q-protected");
      expect(afterFailedImport?.question).toBe(
        "Protected question that must never be corrupted",
      );
    });
  });

  // 6. ORPHAN REFERENCE AUDITING
  describe("Orphan Reference Auditing", () => {
    it("detects broken references when linked IDs do not exist", async () => {
      // Create question referencing a non-existent session 'sess-ghost'
      await repos.questions.create({
        id: "q-with-ghost",
        question: "Question with ghost session link",
        description: "Orphan test",
        origin: "reality",
        priority: "exploratory",
        status: "open",
        linkedSessionIds: ["sess-ghost-999"],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "",
        remainingGaps: "",
        nextLogicalStep: "",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      });

      const audit = engine.auditOrphans();
      expect(audit.healthy).toBe(false);
      expect(audit.totalOrphans).toBeGreaterThanOrEqual(1);

      const match = audit.reports.find(
        (r) => r.missingReferenceId === "sess-ghost-999",
      );
      expect(match).toBeDefined();
      expect(match?.entityType).toBe("LearningQuestion");
      expect(match?.missingReferenceType).toBe("LearningSession");
    });
  });
});
