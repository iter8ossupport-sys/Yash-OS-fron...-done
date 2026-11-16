/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Storage Engine: Atomic Persistence, Snapshot Recovery & Integrity Validation
 *
 * Strict Architectural Rule: Storage driver abstraction supports LocalStorage,
 * Memory (for tests/SSR), and future IndexedDB without rewriting repositories.
 */

import { PERMANENT_FOUNDATIONS } from "../../domain/rules";
import {
  P3_EXPORT_FORMAT,
  P3_SCHEMA_VERSION,
  P3_STORAGE_KEY,
  type OrphanAuditResult,
  type OrphanReport,
  type P3BackupSnapshot,
  type P3ExportPayload,
  type P3StorageSchema,
} from "./types";

export interface IStorageDriver {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** In-memory driver for Vitest suites, SSR, and zero-side-effect test harnesses */
export class MemoryStorageDriver implements IStorageDriver {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

/** Browser LocalStorage driver with fallback safety */
export class BrowserLocalStorageDriver implements IStorageDriver {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (err) {
      console.error("[P3 Storage] Failed to write to localStorage:", err);
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  }
}

/**
 * Returns an empty baseline P3StorageSchema.
 */
export function createDefaultP3Storage(): P3StorageSchema {
  const now = new Date().toISOString();
  return {
    schemaVersion: P3_SCHEMA_VERSION,
    updatedAt: now,
    foundations: [
      PERMANENT_FOUNDATIONS.human_understanding,
      PERMANENT_FOUNDATIONS.reality_understanding,
    ],
    domains: [],
    subjects: [],
    topics: [],
    questions: [],
    sessions: [],
    knowledgeUnits: [],
    sources: [],
    evidence: [],
    relationships: [],
    applications: [],
    reviews: [],
    inbox: [],
    context: {
      id: "ctx-default",
      currentQuestionId: undefined,
      activeSessionId: undefined,
      currentFocus: "Initialize first learning inquiry.",
      lastStoppingPoint: "Priority 3 architecture initialized.",
      remainingGaps: "No active gaps logged.",
      nextLogicalStep: "Capture a learning question or foundational concept.",
      lastActivityAt: now,
      updatedAt: now,
    },
    backupSnapshots: [],
  };
}

export class P3StorageEngine {
  private cache: P3StorageSchema | null = null;
  private readonly driver: IStorageDriver;
  private readonly storageKey: string;
  private readonly maxSnapshots = 10;

  constructor(driver?: IStorageDriver, storageKey: string = P3_STORAGE_KEY) {
    this.driver =
      driver ??
      (typeof window !== "undefined" && window.localStorage
        ? new BrowserLocalStorageDriver()
        : new MemoryStorageDriver());
    this.storageKey = storageKey;
  }

  /**
   * Loads current state from storage driver, initializing default if absent.
   */
  public load(): P3StorageSchema {
    if (this.cache) return this.cache;

    try {
      const raw = this.driver.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === "object" &&
          parsed.schemaVersion === P3_SCHEMA_VERSION
        ) {
          this.cache = this.normalizeSchema(parsed);
          return this.cache;
        }
      }
    } catch (err) {
      console.warn(
        "[P3 StorageEngine] Parse failed, initializing default:",
        err,
      );
    }

    const defaultState = createDefaultP3Storage();
    this.cache = defaultState;
    this.persist(defaultState);
    return defaultState;
  }

  /**
   * Updates state atomically and writes to storage.
   */
  public save(
    updater: (state: P3StorageSchema) => P3StorageSchema,
  ): P3StorageSchema {
    const current = this.load();
    const updated = updater(current);
    const normalized: P3StorageSchema = {
      ...updated,
      schemaVersion: P3_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    };
    this.cache = normalized;
    this.persist(normalized);
    return normalized;
  }

  /**
   * Creates an immutable backup snapshot of the current state.
   */
  public createSnapshot(reason: string): P3BackupSnapshot {
    const current = this.load();
    const now = new Date().toISOString();
    const snapshotId = `snap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const { backupSnapshots, ...cleanData } = current;
    const newSnapshot: P3BackupSnapshot = {
      snapshotId,
      createdAt: now,
      reason: reason.trim() || "Manual snapshot",
      data: cleanData,
    };

    const trimmedSnapshots = [
      newSnapshot,
      ...backupSnapshots.slice(0, this.maxSnapshots - 1),
    ];

    this.save((s) => ({
      ...s,
      backupSnapshots: trimmedSnapshots,
    }));

    return newSnapshot;
  }

  /**
   * Restores state from an existing snapshot.
   */
  public restoreSnapshot(snapshotId: string): boolean {
    const current = this.load();
    const match = current.backupSnapshots.find(
      (s) => s.snapshotId === snapshotId,
    );
    if (!match) return false;

    // Create a pre-restore safety snapshot first
    this.createSnapshot(`Pre-restore backup before restoring ${snapshotId}`);

    const restored: P3StorageSchema = {
      ...match.data,
      schemaVersion: P3_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      backupSnapshots: this.load().backupSnapshots,
    };

    this.cache = restored;
    this.persist(restored);
    return true;
  }

  /**
   * Lists all existing snapshots.
   */
  public listSnapshots(): readonly P3BackupSnapshot[] {
    return this.load().backupSnapshots;
  }

  /**
   * Generates a portable export payload with validation envelope.
   */
  public exportPayload(): P3ExportPayload {
    const state = this.load();
    const { backupSnapshots, ...cleanData } = state;
    return {
      format: P3_EXPORT_FORMAT,
      version: P3_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      summary: {
        questionsCount: state.questions.length,
        sessionsCount: state.sessions.length,
        knowledgeUnitsCount: state.knowledgeUnits.length,
        sourcesCount: state.sources.length,
        evidenceCount: state.evidence.length,
        applicationsCount: state.applications.length,
      },
      data: cleanData,
    };
  }

  /**
   * Validates and imports data from an export payload or raw JSON.
   * Safety Guarantee: Never overwrites valid stored data if import validation fails.
   */
  public importPayload(rawJson: string): {
    success: boolean;
    errors?: string[];
    backupId?: string;
  } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return { success: false, errors: ["Invalid JSON payload."] };
    }

    if (!parsed || typeof parsed !== "object") {
      return {
        success: false,
        errors: ["Import payload must be a JSON object."],
      };
    }

    const payloadObj = parsed as Record<string, unknown>;
    let targetData: unknown = payloadObj;

    // Support envelope format
    if (payloadObj["format"] === P3_EXPORT_FORMAT && payloadObj["data"]) {
      targetData = payloadObj["data"];
    }

    const validationErrors = this.validateImportData(targetData);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    // Safety: create pre-import snapshot
    const backup = this.createSnapshot("Pre-import automatic safety snapshot");

    const validData = targetData as Omit<P3StorageSchema, "backupSnapshots">;
    const mergedState: P3StorageSchema = {
      ...this.normalizeSchema(validData),
      backupSnapshots: this.load().backupSnapshots,
      updatedAt: new Date().toISOString(),
    };

    this.cache = mergedState;
    this.persist(mergedState);

    return { success: true, backupId: backup.snapshotId };
  }

  /**
   * Inspects all many-to-many and parent-child references across the P3 graph
   * and reports any dangling / orphaned identifiers.
   */
  public auditOrphans(): OrphanAuditResult {
    const s = this.load();
    const reports: OrphanReport[] = [];

    const questionIds = new Set(s.questions.map((q) => q.id));
    const sessionIds = new Set(s.sessions.map((sess) => sess.id));
    const kuIds = new Set(s.knowledgeUnits.map((ku) => ku.id));
    const sourceIds = new Set(s.sources.map((src) => src.id));
    const evidenceIds = new Set(s.evidence.map((ev) => ev.id));

    // Check Question references
    s.questions.forEach((q) => {
      q.linkedSessionIds.forEach((sessId) => {
        if (!sessionIds.has(sessId)) {
          reports.push({
            entityType: "LearningQuestion",
            entityId: q.id,
            entityTitle: q.question,
            missingReferenceType: "LearningSession",
            missingReferenceId: sessId,
            details: `Question references non-existent Session ID '${sessId}'.`,
          });
        }
      });
      q.linkedKnowledgeUnitIds.forEach((kId) => {
        if (!kuIds.has(kId)) {
          reports.push({
            entityType: "LearningQuestion",
            entityId: q.id,
            entityTitle: q.question,
            missingReferenceType: "KnowledgeUnit",
            missingReferenceId: kId,
            details: `Question references non-existent KnowledgeUnit ID '${kId}'.`,
          });
        }
      });
    });

    // Check Session references
    s.sessions.forEach((sess) => {
      sess.linkedQuestionIds.forEach((qId) => {
        if (!questionIds.has(qId)) {
          reports.push({
            entityType: "LearningSession",
            entityId: sess.id,
            entityTitle: sess.title,
            missingReferenceType: "LearningQuestion",
            missingReferenceId: qId,
            details: `Session references non-existent Question ID '${qId}'.`,
          });
        }
      });
      sess.linkedKnowledgeUnitIds.forEach((kId) => {
        if (!kuIds.has(kId)) {
          reports.push({
            entityType: "LearningSession",
            entityId: sess.id,
            entityTitle: sess.title,
            missingReferenceType: "KnowledgeUnit",
            missingReferenceId: kId,
            details: `Session references non-existent KnowledgeUnit ID '${kId}'.`,
          });
        }
      });
      sess.sourceIds.forEach((srcId) => {
        if (!sourceIds.has(srcId)) {
          reports.push({
            entityType: "LearningSession",
            entityId: sess.id,
            entityTitle: sess.title,
            missingReferenceType: "Source",
            missingReferenceId: srcId,
            details: `Session references non-existent Source ID '${srcId}'.`,
          });
        }
      });
    });

    // Check KnowledgeUnit references
    s.knowledgeUnits.forEach((ku) => {
      ku.sourcesAndEvidence.sourceIds.forEach((srcId) => {
        if (!sourceIds.has(srcId)) {
          reports.push({
            entityType: "KnowledgeUnit",
            entityId: ku.id,
            entityTitle: ku.title,
            missingReferenceType: "Source",
            missingReferenceId: srcId,
            details: `KnowledgeUnit references non-existent Source ID '${srcId}'.`,
          });
        }
      });
      ku.sourcesAndEvidence.evidenceIds.forEach((evId) => {
        if (!evidenceIds.has(evId)) {
          reports.push({
            entityType: "KnowledgeUnit",
            entityId: ku.id,
            entityTitle: ku.title,
            missingReferenceType: "Evidence",
            missingReferenceId: evId,
            details: `KnowledgeUnit references non-existent Evidence ID '${evId}'.`,
          });
        }
      });
    });

    // Check Relationships
    s.relationships.forEach((rel) => {
      if (!kuIds.has(rel.sourceKnowledgeUnitId)) {
        reports.push({
          entityType: "KnowledgeRelationship",
          entityId: rel.id,
          entityTitle: `Rel: ${rel.type}`,
          missingReferenceType: "SourceKnowledgeUnit",
          missingReferenceId: rel.sourceKnowledgeUnitId,
          details: `Relationship source KU '${rel.sourceKnowledgeUnitId}' does not exist.`,
        });
      }
      if (!kuIds.has(rel.targetKnowledgeUnitId)) {
        reports.push({
          entityType: "KnowledgeRelationship",
          entityId: rel.id,
          entityTitle: `Rel: ${rel.type}`,
          missingReferenceType: "TargetKnowledgeUnit",
          missingReferenceId: rel.targetKnowledgeUnitId,
          details: `Relationship target KU '${rel.targetKnowledgeUnitId}' does not exist.`,
        });
      }
    });

    return {
      healthy: reports.length === 0,
      totalOrphans: reports.length,
      reports,
    };
  }

  /**
   * Serializes state to storage driver.
   */
  private persist(state: P3StorageSchema): void {
    try {
      this.driver.setItem(this.storageKey, JSON.stringify(state));
    } catch (err) {
      console.error("[P3 StorageEngine] Write failed:", err);
      throw err;
    }
  }

  private validateImportData(data: unknown): string[] {
    const errors: string[] = [];
    if (!data || typeof data !== "object") {
      return ["Import data is not an object."];
    }
    const d = data as Record<string, unknown>;

    const schemaVersion = d["schemaVersion"];
    if (
      schemaVersion !== undefined &&
      typeof schemaVersion === "number" &&
      schemaVersion > P3_SCHEMA_VERSION
    ) {
      errors.push(
        `Import schema version ${schemaVersion} is newer than supported version ${P3_SCHEMA_VERSION}.`,
      );
    }

    if (d["questions"] !== undefined && !Array.isArray(d["questions"])) {
      errors.push("Invalid 'questions' field (must be an array).");
    }
    if (d["sessions"] !== undefined && !Array.isArray(d["sessions"])) {
      errors.push("Invalid 'sessions' field (must be an array).");
    }
    if (
      d["knowledgeUnits"] !== undefined &&
      !Array.isArray(d["knowledgeUnits"])
    ) {
      errors.push("Invalid 'knowledgeUnits' field (must be an array).");
    }
    if (d["sources"] !== undefined && !Array.isArray(d["sources"])) {
      errors.push("Invalid 'sources' field (must be an array).");
    }
    if (d["evidence"] !== undefined && !Array.isArray(d["evidence"])) {
      errors.push("Invalid 'evidence' field (must be an array).");
    }

    return errors;
  }

  private normalizeSchema(raw: unknown): P3StorageSchema {
    const defaultState = createDefaultP3Storage();
    if (!raw || typeof raw !== "object") return defaultState;
    const r = raw as Partial<P3StorageSchema>;

    return {
      schemaVersion: P3_SCHEMA_VERSION,
      updatedAt:
        typeof r.updatedAt === "string" ? r.updatedAt : defaultState.updatedAt,
      foundations:
        Array.isArray(r.foundations) && r.foundations.length > 0
          ? r.foundations
          : defaultState.foundations,
      domains: Array.isArray(r.domains) ? r.domains : [],
      subjects: Array.isArray(r.subjects) ? r.subjects : [],
      topics: Array.isArray(r.topics) ? r.topics : [],
      questions: Array.isArray(r.questions) ? r.questions : [],
      sessions: Array.isArray(r.sessions) ? r.sessions : [],
      knowledgeUnits: Array.isArray(r.knowledgeUnits) ? r.knowledgeUnits : [],
      sources: Array.isArray(r.sources) ? r.sources : [],
      evidence: Array.isArray(r.evidence) ? r.evidence : [],
      relationships: Array.isArray(r.relationships) ? r.relationships : [],
      applications: Array.isArray(r.applications) ? r.applications : [],
      reviews: Array.isArray(r.reviews) ? r.reviews : [],
      inbox: Array.isArray(r.inbox) ? r.inbox : [],
      context:
        r.context && typeof r.context === "object"
          ? r.context
          : defaultState.context,
      backupSnapshots: Array.isArray(r.backupSnapshots)
        ? r.backupSnapshots
        : [],
    };
  }
}
