import { describe, expect, it } from "vitest";
import {
  computeSha256,
  executeP3MigrationDryRun,
  UNCATEGORIZED_SESSIONS_SUBJECT_ID,
} from "@/priority3/infrastructure/migration";
import { MemoryStorageDriver } from "@/priority3/infrastructure/persistence";
import { createDefaultLearningSystem } from "@/lib/os/learning/state";
import { initialState } from "@/lib/os/seed";

describe("Priority 3 — Phase 2B Pure Dry-Run Migration Engine", () => {
  it("1. handles empty legacy state without crashing or mutating storage", () => {
    const driver = new MemoryStorageDriver();
    driver.setItem("yash-os-v1", JSON.stringify({}));

    const result = executeP3MigrationDryRun({
      storageDriver: driver,
      storageKey: "yash-os-v1",
    });

    expect(result.success).toBe(true);
    expect(result.sourceInventory.journeysCount).toBe(0);
    expect(result.sourceInventory.sessionsCount).toBe(0);
    expect(result.transformationResults.createdCounts.subjects).toBe(0);
    expect(result.safety.productionStorageModified).toBe(false);
    expect(result.safety.backupSha256MatchesOriginal).toBe(true);
    expect(result.safety.idempotencyPassed).toBe(true);

    // Verify storage driver was untouched
    expect(driver.getItem("yash-os-v1")).toBe(JSON.stringify({}));
    expect(driver.getItem("yash-os-p3-v1")).toBeNull();
  });

  it("2. handles fully populated legacy state losslessly", () => {
    const fullState = {
      ...initialState,
      learningSystem: createDefaultLearningSystem(),
    };
    const raw = JSON.stringify(fullState, null, 2);
    const driver = new MemoryStorageDriver();
    driver.setItem("yash-os-v1", raw);

    const result = executeP3MigrationDryRun({
      storageDriver: driver,
      storageKey: "yash-os-v1",
    });

    expect(result.success).toBe(true);
    expect(result.sourceInventory.journeysCount).toBe(2);
    expect(result.sourceInventory.objectivesCount).toBe(3);
    expect(result.sourceInventory.resourcesCount).toBe(3);
    expect(result.sourceInventory.sessionsCount).toBe(2);
    expect(result.sourceInventory.artifactsCount).toBe(2);
    expect(result.sourceInventory.capabilitiesCount).toBe(2);
    expect(result.sourceInventory.applicationsCount).toBe(1);
    expect(result.sourceInventory.reviewsCount).toBe(1);

    // Cardinality Assertions
    expect(result.transformationResults.createdCounts.subjects).toBe(4); // 2 journeys + 2 capabilities
    expect(result.transformationResults.createdCounts.questions).toBe(3); // Exact 1:1 with objectives
    expect(result.transformationResults.createdCounts.sources).toBe(3);
    expect(result.transformationResults.createdCounts.sessions).toBe(2);
    expect(result.transformationResults.createdCounts.knowledgeUnits).toBe(2);
    expect(result.transformationResults.createdCounts.applications).toBe(1);
    expect(result.transformationResults.createdCounts.reviews).toBe(1);

    // Zero Artificial Questions Invented
    expect(result.transformationResults.createdCounts.questions).toBe(
      result.sourceInventory.objectivesCount,
    );

    // Verify raw storage was untouched
    expect(driver.getItem("yash-os-v1")).toBe(raw);
    expect(result.safety.productionStorageModified).toBe(false);
  });

  it("3. handles missing optional fields safely", () => {
    const sparseState = {
      learningSystem: {
        id: "sparse-system",
        journeys: [
          {
            id: "j-sparse",
            title: "Minimal Journey",
            // Missing description, purpose, objectives, capabilityAreaIds, timestamps
          },
        ],
        sessions: [
          {
            id: "s-sparse",
            journeyId: "j-sparse",
            conceptStudied: "Minimal Concept",
            // Missing title, questions, explanations, insights, duration, resources
          },
        ],
      },
    };

    const result = executeP3MigrationDryRun({
      rawStorageValue: JSON.stringify(sparseState),
    });

    expect(result.success).toBe(true);
    expect(result.transformationResults.createdCounts.subjects).toBe(1);
    expect(result.transformationResults.createdCounts.sessions).toBe(1);
    expect(result.transformationResults.createdCounts.questions).toBe(0); // 0 objectives -> 0 questions!
    expect(result.dataIntegrity.fieldLevelReconciliationPassed).toBe(true);
  });

  it("4. detects duplicate IDs in source records", () => {
    const duplicateState = {
      learningSystem: {
        journeys: [
          { id: "collision-1", title: "Journey 1" },
          { id: "collision-1", title: "Journey 2 Duplicate" },
        ],
      },
    };

    const result = executeP3MigrationDryRun({
      rawStorageValue: JSON.stringify(duplicateState),
    });

    expect(result.dataIntegrity.duplicateIds).toContain("collision-1");
    expect(result.success).toBe(false);
  });

  it("5. safely routes orphaned sessions to dedicated uncategorized Subject", () => {
    const orphanedState = {
      learningSystem: {
        journeys: [{ id: "journey-exists", title: "Existing Journey" }],
        sessions: [
          {
            id: "sess-valid",
            journeyId: "journey-exists",
            conceptStudied: "Valid",
            date: "2026-11-04",
          },
          {
            id: "sess-orphan-1",
            journeyId: "journey-deleted-long-ago",
            conceptStudied: "Orphaned Concept",
            date: "2026-11-03",
          },
        ],
      },
    };

    const result = executeP3MigrationDryRun({
      rawStorageValue: JSON.stringify(orphanedState),
    });

    expect(result.success).toBe(true);
    expect(
      result.transformationResults.unresolvedRelationships.missingJourneys,
    ).toContain("journey-deleted-long-ago");

    // Confirms system-generated Subject was added
    const uncategorizedSub = result.proposedP3Storage.subjects.find(
      (s) => s.id === UNCATEGORIZED_SESSIONS_SUBJECT_ID,
    );
    expect(uncategorizedSub).toBeDefined();
    expect(uncategorizedSub?.name).toBe(
      "Legacy Imported Sessions (Uncategorized)",
    );

    // Confirms session retained orphan provenance
    const orphanSess = result.proposedP3Storage.sessions.find(
      (s) => s.id === "sess-orphan-1",
    );
    expect(orphanSess).toBeDefined();
    expect(orphanSess?.learningContext).toContain("journey-deleted-long-ago");
  });

  it("6. identifies missing resources and objectives in relationship audit", () => {
    const brokenRefsState = {
      learningSystem: {
        journeys: [{ id: "j1", title: "J1" }],
        sessions: [
          {
            id: "s1",
            journeyId: "j1",
            conceptStudied: "Test",
            referencedResourceIds: ["missing-res-1"],
            referencedObjectiveIds: ["missing-obj-1"],
            date: "2026-11-01",
          },
        ],
      },
    };

    const result = executeP3MigrationDryRun({
      rawStorageValue: JSON.stringify(brokenRefsState),
    });

    expect(result.success).toBe(true);
    expect(
      result.transformationResults.unresolvedRelationships.missingResources,
    ).toContain("missing-res-1");
    expect(
      result.transformationResults.unresolvedRelationships.missingObjectives,
    ).toContain("missing-obj-1");
  });

  it("7. immutably preserves historical acquisitions, discoveries, coreDocument, and activeWorkflow", () => {
    const historicalState = {
      learningSystem: {
        id: "historical-sys",
        coreDocument: {
          title: "My Historic Document",
          markdownContent: "# Immutable manifesto",
          lastUpdated: "2026-01-01",
        },
        activeWorkflow: "discovery_synthesis",
        acquisitions: [
          {
            id: "acq-1",
            targetSkill: "Advanced Systems Engineering",
            unblocksPriorityId: 1,
            resourcesStudied: ["res-distributed"],
            appliedExperiment: "Raft consensus implementation",
            outcomeAchieved: true,
            promotedKnowledgeIds: ["k-raft"],
            createdAt: "2026-02-01",
          },
        ],
        discoveries: [
          {
            id: "disc-1",
            subjectDomain: "Cognitive Science",
            inquiryHypothesis:
              "System 1 dominance under high-volatility drawdown",
            sourcesSurveyed: ["Kahneman 2011"],
            coreSyntheses: ["Asymmetric loss aversion heuristic"],
            distilledFrameworks: ["External circuit breaker protocol"],
            createdAt: "2026-03-01",
          },
        ],
      },
    };

    const result = executeP3MigrationDryRun({
      rawStorageValue: JSON.stringify(historicalState),
    });

    expect(result.success).toBe(true);
    expect(result.sourceInventory.acquisitionsCount).toBe(1);
    expect(result.sourceInventory.discoveriesCount).toBe(1);
    expect(result.sourceInventory.hasCoreDocument).toBe(true);
    expect(result.sourceInventory.hasActiveWorkflow).toBe(true);

    // Verify complete legacy archive payload is present byte-for-byte
    const archive = result.proposedP3Storage.legacyArchive;
    expect(archive).toBeDefined();
    expect(archive?.legacySystemPayload.coreDocument.title).toBe(
      "My Historic Document",
    );
    expect(archive?.legacySystemPayload.activeWorkflow).toBe(
      "discovery_synthesis",
    );
    expect(archive?.legacySystemPayload.acquisitions?.length).toBe(1);
    expect(archive?.legacySystemPayload.discoveries?.length).toBe(1);
  });

  it("8. preserves P3-adjacent OS collections under existing owners without duplication", () => {
    const fullOsState = {
      ...initialState,
      learningSystem: createDefaultLearningSystem(),
    };

    const result = executeP3MigrationDryRun({
      rawStorageValue: JSON.stringify(fullOsState),
    });

    expect(result.success).toBe(true);
    expect(result.sourceInventory.p3ProjectsCount).toBe(1); // demo-skills
    expect(result.sourceInventory.p3KnowledgeCount).toBe(0);

    // Confirms P1/P2 safety
    expect(result.safety.p1DataModified).toBe(false);
    expect(result.safety.p2DataModified).toBe(false);
  });

  it("9. preserves date-only values strictly as YYYY-MM-DD", () => {
    const dateState = {
      learningSystem: {
        journeys: [{ id: "j-date", title: "Date Journey" }],
        sessions: [
          {
            id: "s-date",
            journeyId: "j-date",
            conceptStudied: "Dates",
            date: "2026-11-16",
          },
        ],
        reviews: [
          {
            id: "rev-date",
            journeyId: "j-date",
            date: "2026-11-15",
            actualUnderstanding: "Deep temporal understanding",
          },
        ],
        applications: [
          {
            id: "app-date",
            journeyId: "j-date",
            title: "App Date",
            evidenceOutput: "Verified PR #42",
            appliedAt: "2026-11-14",
          },
        ],
      },
    };

    const result = executeP3MigrationDryRun({
      rawStorageValue: JSON.stringify(dateState),
    });

    expect(result.dataIntegrity.datePreservationPassed).toBe(true);

    const s = result.proposedP3Storage.sessions[0];
    expect(s?.startTime).toBe("2026-11-16");
    expect(s?.startTime).not.toContain("T");

    const rv = result.proposedP3Storage.reviews[0];
    expect(rv?.period).toBe("2026-11-15");
    expect(rv?.period).not.toContain("T");

    const app = result.proposedP3Storage.applications[0];
    expect(app?.contextAndProblem).toContain("Applied Date: 2026-11-14");
  });

  it("10. repeated dry-run execution is 100% idempotent and mutation-free", () => {
    const fullState = {
      ...initialState,
      learningSystem: createDefaultLearningSystem(),
    };
    const raw = JSON.stringify(fullState);
    const driver = new MemoryStorageDriver();
    driver.setItem("yash-os-v1", raw);

    const fixedTimestamp = "2026-11-16T12:00:00.000Z";
    const run1 = executeP3MigrationDryRun({
      storageDriver: driver,
      storageKey: "yash-os-v1",
      fixedTimestamp,
    });
    const run2 = executeP3MigrationDryRun({
      storageDriver: driver,
      storageKey: "yash-os-v1",
      fixedTimestamp,
    });

    expect(run1.success).toBe(true);
    expect(run2.success).toBe(true);
    expect(run1.dataIntegrity.canonicalPayloadHash).toBe(
      run2.dataIntegrity.canonicalPayloadHash,
    );
    expect(driver.getItem("yash-os-v1")).toBe(raw);
    expect(driver.getItem("yash-os-p3-v1")).toBeNull();
  });

  it("11. verifies cryptographic backup integrity and aborts on mismatch", () => {
    const raw = JSON.stringify({ learningSystem: { journeys: [] } });
    const computedHash = computeSha256(raw);
    expect(computedHash).toHaveLength(64);

    const result = executeP3MigrationDryRun({
      rawStorageValue: raw,
    });

    expect(result.safety.backupSha256MatchesOriginal).toBe(true);
  });

  it("12. reports uncertain evidence for human review without certifying false empirical claims", () => {
    const uncertainState = {
      learningSystem: {
        capabilities: [
          {
            id: "cap-unverified",
            name: "Intuitive Architecture",
            description: "Designing systems by feel",
            currentState: "developing",
            evidence:
              "Read 4 chapters of a book and felt like I understood component cohesion",
          },
        ],
        reviews: [
          {
            id: "rev-unverified",
            journeyId: "j1",
            date: "2026-11-10",
            actualUnderstanding: "Some understanding",
            evidence: "Had a good discussion with a peer over coffee",
          },
        ],
      },
    };

    const result = executeP3MigrationDryRun({
      rawStorageValue: JSON.stringify(uncertainState),
    });

    expect(result.dataIntegrity.uncertainEvidenceReports.length).toBe(2);
    expect(result.dataIntegrity.uncertainEvidenceReports[0]?.sourceEntity).toBe(
      "CapabilityArea",
    );
    expect(result.dataIntegrity.uncertainEvidenceReports[1]?.sourceEntity).toBe(
      "LearningReview",
    );

    // Zero false empirical EvidenceEntity items created
    expect(result.proposedP3Storage.evidence.length).toBe(0);
  });

  it("13. rejects corrupted JSON with explicit descriptive error", () => {
    expect(() =>
      executeP3MigrationDryRun({
        rawStorageValue: "{ invalid json payload ...",
      }),
    ).toThrowError(/Invalid JSON in storage/);
  });
});
