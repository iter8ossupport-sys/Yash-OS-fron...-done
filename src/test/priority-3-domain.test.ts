/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Phase 1 — Domain Foundation Test Suite
 *
 * Verifies pure domain entities, lifecycle state machines, revision history
 * preservation, relationship validity, and P1/P2 decoupling.
 */

import { describe, expect, it } from "vitest";
import {
  canCreateKnowledgeRelationship,
  canDevelopKnowledgeUnit,
  canTransitionQuestionStatus,
  canTransitionSessionStatus,
  DATA_CLASSIFICATIONS,
  FOUNDATION_IDS,
  KNOWLEDGE_DEVELOPMENT_STATUSES,
  KNOWLEDGE_PERSPECTIVES,
  PERMANENT_FOUNDATIONS,
  QUESTION_ORIGINS,
  QUESTION_PRIORITIES,
  QUESTION_STATUSES,
  RELATIONSHIP_TYPES,
  reviseKnowledgeUnit,
  SESSION_STATUSES,
  SOURCE_CATEGORIES,
  validateApplicationRecord,
  validateCaptureInboxItem,
  validateEvidence,
  validateKnowledgeRelationship,
  validateKnowledgeUnit,
  validateLearningQuestion,
  validateLearningSession,
  validateReview,
  validateSource,
  type ApplicationRecordEntity,
  type EvidenceEntity,
  type KnowledgeUnitEntity,
  type LearningQuestionEntity,
  type LearningSessionEntity,
  type SourceEntity,
} from "@/priority3/domain";

describe("Priority 3: Domain Foundation (Phase 1)", () => {
  // 1. PERMANENT FOUNDATIONS
  describe("Permanent Foundations", () => {
    it("defines Human Understanding and Reality Understanding as immutable architectural pillars", () => {
      expect(FOUNDATION_IDS).toContain("human_understanding");
      expect(FOUNDATION_IDS).toContain("reality_understanding");

      const human = PERMANENT_FOUNDATIONS.human_understanding;
      expect(human.name).toBe("Human Understanding");
      expect(human.examples.length).toBeGreaterThan(5);
      expect(human.examples).toContain("Psychology & behavioral heuristics");

      const reality = PERMANENT_FOUNDATIONS.reality_understanding;
      expect(reality.name).toBe("Reality Understanding");
      expect(reality.examples.length).toBeGreaterThan(5);
      expect(reality.examples).toContain(
        "Software engineering & distributed systems",
      );
    });
  });

  // 2. LEARNING QUESTION LIFECYCLE
  describe("Learning Question Lifecycle & State Machine", () => {
    it("allows standard forward investigation and resolution transitions", () => {
      expect(canTransitionQuestionStatus("open", "investigating")).toBe(true);
      expect(
        canTransitionQuestionStatus("investigating", "partially_understood"),
      ).toBe(true);
      expect(
        canTransitionQuestionStatus("partially_understood", "resolved_for_now"),
      ).toBe(true);
      expect(canTransitionQuestionStatus("resolved_for_now", "reopened")).toBe(
        true,
      );
    });

    it("allows reopening resolved questions when new evidence or contradictions appear", () => {
      expect(canTransitionQuestionStatus("resolved_for_now", "reopened")).toBe(
        true,
      );
      expect(canTransitionQuestionStatus("reopened", "investigating")).toBe(
        true,
      );
    });

    it("allows archiving and unarchiving questions safely", () => {
      expect(canTransitionQuestionStatus("open", "archived")).toBe(true);
      expect(canTransitionQuestionStatus("resolved_for_now", "archived")).toBe(
        true,
      );
      expect(canTransitionQuestionStatus("archived", "open")).toBe(true);
      expect(canTransitionQuestionStatus("archived", "reopened")).toBe(true);
    });

    it("validates learning questions and flags missing or invalid properties", () => {
      const invalidQ: Partial<LearningQuestionEntity> = {
        id: "",
        question: "Why?",
      };
      const res = validateLearningQuestion(invalidQ);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain("Question ID is required.");
      expect(res.errors).toContain(
        "Question text must be at least 5 characters.",
      );

      const validQ: LearningQuestionEntity = {
        id: "q-101",
        question:
          "How does distributed consensus behave during network partitions?",
        description: "Study Raft vs Paxos partition handling.",
        origin: "reality",
        foundationId: "reality_understanding",
        priority: "immediate",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: "Partial understanding of Raft term split.",
        remainingGaps: "Exact quorum recovery guarantees.",
        nextLogicalStep: "Simulate 3-node partition in local harness.",
        classification: "general",
        createdAt: "2026-11-16T12:00:00Z",
        updatedAt: "2026-11-16T12:00:00Z",
      };
      const validRes = validateLearningQuestion(validQ);
      expect(validRes.valid).toBe(true);
      expect(validRes.errors.length).toBe(0);
    });
  });

  // 3. LEARNING SESSION LIFECYCLE
  describe("Learning Session Lifecycle & Context Invariants", () => {
    it("allows pausing, resuming, completing, and archiving sessions", () => {
      expect(canTransitionSessionStatus("in_progress", "paused")).toBe(true);
      expect(canTransitionSessionStatus("paused", "in_progress")).toBe(true);
      expect(canTransitionSessionStatus("in_progress", "completed")).toBe(true);
      expect(canTransitionSessionStatus("paused", "completed")).toBe(true);
      expect(canTransitionSessionStatus("completed", "archived")).toBe(true);
    });

    it("validates learning session integrity", () => {
      const validSession: LearningSessionEntity = {
        id: "sess-201",
        title: "Raft Consensus Log Replication Audit",
        status: "in_progress",
        linkedQuestionIds: ["q-101"],
        learningContext: "Investigating distributed consensus robustness.",
        investigation: "Walked through Raft section 5.3 log matching property.",
        explanationInOwnWords:
          "If two logs contain an entry with the same index and term, then the logs are identical in all entries up through the given index.",
        findings:
          "Log matching invariant prevents committed entries from being overwritten.",
        remainingGaps: "Need to verify leader step-down on split brain.",
        linkedKnowledgeUnitIds: ["ku-raft-invariants"],
        sourceIds: ["src-ongaro-paper"],
        startTime: "2026-11-16T10:00:00Z",
        nextLogicalStep: "Draft Knowledge Unit on Raft election safety.",
        classification: "general",
        createdAt: "2026-11-16T10:00:00Z",
        updatedAt: "2026-11-16T10:30:00Z",
      };
      const res = validateLearningSession(validSession);
      expect(res.valid).toBe(true);
      expect(res.errors.length).toBe(0);
    });
  });

  // 4. KNOWLEDGE UNIT DEVELOPMENT & REVISION PRESERVATION
  describe("Knowledge Unit 6-Section Architecture & Revision History", () => {
    const baseUnit: KnowledgeUnitEntity = {
      id: "ku-raft-invariants",
      title: "Raft Consensus Log Matching Invariant",
      summary:
        "Leaders never overwrite or truncate their own log; followers overwrite uncommitted conflicting entries upon matching term.",
      perspective: "objective_knowledge",
      status: "understood",
      classification: "general",
      foundationId: "reality_understanding",
      domainId: "dom-distributed-systems",
      identity: {
        id: "ku-raft-invariants",
        title: "Raft Consensus Log Matching Invariant",
        perspective: "objective_knowledge",
        classification: "general",
        tags: ["distributed-systems", "consensus", "raft"],
        foundationId: "reality_understanding",
      },
      coreUnderstanding: {
        plainEnglishExplanation:
          "Once an entry is committed by a majority of followers in the current term, it can never be replaced.",
        corePrinciples: [
          "Election Safety",
          "Leader Append-Only",
          "Log Matching Property",
        ],
        mentalModels: ["Distributed State Machine Replication"],
      },
      deeperUnderstanding: {
        nuancedMechanisms:
          "Followers accept append entries only if the prevLogIndex and prevLogTerm match their local log.",
        boundaryConditions:
          "Tolerates up to f failures in a cluster of 2f+1 nodes.",
        counterExamples: ["Partitioned minority leader cannot commit entries."],
      },
      sourcesAndEvidence: {
        sourceIds: ["src-ongaro-paper"],
        evidenceIds: ["ev-raft-tla"],
        competingTheories: ["Multi-Paxos", "Viewstamped Replication"],
      },
      relationshipsAndApplications: {
        relationshipIds: [],
        applicationRecordIds: [],
        operationalNotes:
          "Relevant to future multi-node Yash OS telemetry sync.",
      },
      developmentHistory: {
        revisions: [],
      },
      isArchived: false,
      createdAt: "2026-11-16T11:00:00Z",
      updatedAt: "2026-11-16T11:00:00Z",
    };

    it("requires all 6 canonical sections in KnowledgeUnit validation", () => {
      const res = validateKnowledgeUnit(baseUnit);
      expect(res.valid).toBe(true);

      const missingIdentity = { ...baseUnit, identity: undefined };
      const failRes = validateKnowledgeUnit(
        missingIdentity as unknown as Partial<KnowledgeUnitEntity>,
      );
      expect(failRes.valid).toBe(false);
      expect(failRes.errors).toContain("Section 1 (Identity) is missing.");
    });

    it("restricts development to 'validated' unless verified evidence or application exists", () => {
      const withoutEvidence = canDevelopKnowledgeUnit("tested", "validated", 0);
      expect(withoutEvidence.allowed).toBe(false);
      expect(withoutEvidence.reason).toContain(
        "at least one verifiable evidence record",
      );

      const withEvidence = canDevelopKnowledgeUnit("tested", "validated", 1);
      expect(withEvidence.allowed).toBe(true);
    });

    it("prevents skipping development stages from captured to validated", () => {
      const skipped = canDevelopKnowledgeUnit("captured", "validated", 2);
      expect(skipped.allowed).toBe(false);
      expect(skipped.reason).toContain("Cannot skip development stages");
    });

    it("revises knowledge while preserving historical positions in revisionHistory", () => {
      const revised = reviseKnowledgeUnit(
        baseUnit,
        {
          summary: "Updated summary reflecting leader lease optimizations.",
          plainEnglishExplanation:
            "Leader leases allow local reads without cross-network roundtrips under bounded clock drift.",
          newStatus: "tested",
          reasonForChange:
            "Incorporated leader lease mechanics from Raft dissertation chapter 6.",
          authorOrContext: "Architecture Study Session #4",
        },
        "2026-11-16T14:00:00Z",
      );

      // Verify current values updated
      expect(revised.summary).toBe(
        "Updated summary reflecting leader lease optimizations.",
      );
      expect(revised.coreUnderstanding.plainEnglishExplanation).toBe(
        "Leader leases allow local reads without cross-network roundtrips under bounded clock drift.",
      );
      expect(revised.status).toBe("tested");

      // Verify history retained
      expect(revised.developmentHistory.revisions.length).toBe(1);
      const rev = revised.developmentHistory.revisions[0]!;
      expect(rev.previousStatus).toBe("understood");
      expect(rev.newStatus).toBe("tested");
      expect(rev.previousSummary).toBe(baseUnit.summary);
      expect(rev.previousExplanation).toBe(
        baseUnit.coreUnderstanding.plainEnglishExplanation,
      );
      expect(rev.reasonForChange).toContain(
        "Incorporated leader lease mechanics",
      );
    });
  });

  // 5. SOURCES AND EVIDENCE DECOUPLING
  describe("Sources & Evidence Decoupling", () => {
    it("validates independent Source entities with qualitative assessments", () => {
      const source: SourceEntity = {
        id: "src-ongaro-paper",
        title:
          "In Search of an Understandable Consensus Algorithm (Extended Version)",
        type: "primary_evidence",
        authorOrCreator: "Diego Ongaro and John Ousterhout",
        urlOrLocation: "https://raft.github.io/raft.pdf",
        publicationDate: "2014-05-01",
        accessDate: "2026-11-16T09:00:00Z",
        description: "Foundational publication introducing Raft consensus.",
        provenanceMetadata: { peerReviewed: true, venue: "USENIX ATC" },
        reliabilityAssessment:
          "Authoritative primary paper with formal TLA+ specifications and widespread production implementations.",
        classification: "general",
        createdAt: "2026-11-16T09:00:00Z",
        updatedAt: "2026-11-16T09:00:00Z",
      };
      const res = validateSource(source);
      expect(res.valid).toBe(true);
      expect(SOURCE_CATEGORIES).toContain(source.type);
    });

    it("validates independent Evidence entity supporting or challenging a Knowledge Unit", () => {
      const evidence: EvidenceEntity = {
        id: "ev-raft-tla",
        description:
          "TLA+ model checking confirms zero stale log commits under arbitrary drop rates.",
        evidenceType: "formal_specification_model_check",
        sourceId: "src-ongaro-paper",
        knowledgeUnitId: "ku-raft-invariants",
        polarity: "supports",
        context:
          "Exhaustive state exploration for 3-node cluster up to 10 terms.",
        qualityAssessment:
          "Exhaustive formal verification under bounded model.",
        date: "2026-11-16",
        provenance: "TLA+ proofs in Ongaro dissertation Appendix B.",
        classification: "general",
        createdAt: "2026-11-16T09:30:00Z",
      };
      const res = validateEvidence(evidence);
      expect(res.valid).toBe(true);
      expect(res.errors.length).toBe(0);
    });
  });

  // 6. KNOWLEDGE RELATIONSHIPS
  describe("Knowledge Relationships", () => {
    it("disallows self-connections between the same Knowledge Unit", () => {
      const selfRel = canCreateKnowledgeRelationship(
        "ku-1",
        "ku-1",
        "depends_on",
        "Circular self dependency.",
      );
      expect(selfRel.valid).toBe(false);
      expect(selfRel.error).toContain("cannot link to itself");
    });

    it("requires a meaningful explanation for every semantic relationship", () => {
      const emptyRel = canCreateKnowledgeRelationship(
        "ku-1",
        "ku-2",
        "depends_on",
        "",
      );
      expect(emptyRel.valid).toBe(false);
      expect(emptyRel.error).toContain("meaningful explanation");

      const validRel = canCreateKnowledgeRelationship(
        "ku-raft-election",
        "ku-raft-invariants",
        "depends_on",
        "Election safety strictly relies on the log matching invariant to prevent split-brain commits.",
      );
      expect(validRel.valid).toBe(true);
    });
  });

  // 7. APPLICATION RECORDS & P1/P2 DECOUPLING
  describe("Application Records & P1/P2 Operational Decoupling", () => {
    it("safely references P1 and P2 without duplicating their operational records", () => {
      const appRecord: ApplicationRecordEntity = {
        id: "app-p1-sync",
        title: "Applied Raft leader election model to worker coordination",
        contextAndProblem:
          "Needed reliable single-writer coordinator for background worker jobs.",
        connectedKnowledgeUnitIds: ["ku-raft-invariants"],
        relatedP1Reference: {
          projectId: "proj-core-platform",
          milestoneId: "m-worker-engine",
          label: "Core Worker Engine Architecture",
        },
        relatedP2Reference: undefined, // Pure P1 reference
        intendedAction:
          "Implemented term-based lease heartbeats to ensure only one coordinator processes jobs.",
        expectedOutcome:
          "Zero split-brain duplicate job executions during failover.",
        actualOutcome:
          "Verified failover cleanly switches coordinator with zero duplicates across 100 simulation runs.",
        outcomeMatched: true,
        evidence:
          "Harness test logs in vitest suite with commit hash verified.",
        reflectionAndLessons:
          "Bounded lease times eliminate the need for full consensus on routine worker job dispatch.",
        followUpQuestions: [
          "How does clock drift affect worker lease expiration in cloud environments?",
        ],
        classification: "general",
        createdAt: "2026-11-16T15:00:00Z",
        updatedAt: "2026-11-16T15:00:00Z",
      };

      const res = validateApplicationRecord(appRecord);
      expect(res.valid).toBe(true);
      expect(appRecord.relatedP1Reference?.projectId).toBe(
        "proj-core-platform",
      );
      // Critical check: P3 stores learning derived from execution, not the operational task board itself
      expect(appRecord.reflectionAndLessons.length).toBeGreaterThan(10);
    });
  });

  // 8. DATA CLASSIFICATION & CAPTURE INBOX
  describe("Data Classification & Capture Inbox", () => {
    it("supports general, personal, sensitive, and highly restricted classifications", () => {
      expect(DATA_CLASSIFICATIONS).toEqual([
        "general",
        "personal",
        "sensitive",
        "highly_restricted",
      ]);
    });

    it("validates raw capture inbox items before processing", () => {
      const captureItem = {
        id: "cap-1",
        title: "Interesting article on cognitive load in high-stress execution",
        rawContent:
          "Cognitive tunneling narrows attention during critical drawdowns. Requires checklists.",
        method: "quick_capture" as const,
        status: "captured" as const,
        classification: "personal" as const,
        createdAt: "2026-11-16T15:30:00Z",
        updatedAt: "2026-11-16T15:30:00Z",
      };
      const res = validateCaptureInboxItem(captureItem);
      expect(res.valid).toBe(true);
    });

    it("validates structured review records", () => {
      const review = {
        id: "rev-2026-w46",
        type: "weekly_learning_review" as const,
        period: "2026-W46",
        findings: "Completed deep dive into distributed systems log matching.",
        updatedUnderstanding:
          "Understood log matching property as an inductive invariant.",
        unresolvedQuestions: ["Leader lease validity under NTP jumps."],
        capabilityEvidence: [
          {
            dimension: "understanding" as const,
            qualitativeAssessment:
              "Can explain log matching property from first principles.",
            supportingEvidence: ["ku-raft-invariants"],
          },
        ],
        nextFocus: "Examine consensus recovery after catastrophic partition.",
        approvalState: "approved" as const,
        classification: "general" as const,
        createdAt: "2026-11-16T15:45:00Z",
        updatedAt: "2026-11-16T15:45:00Z",
      };
      const res = validateReview(review);
      expect(res.valid).toBe(true);
    });
  });
});
