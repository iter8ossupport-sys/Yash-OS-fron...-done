/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Infrastructure Persistence Types & Storage Schema v1
 *
 * Strict Architectural Rule: Storage types are encapsulated in infrastructure.
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

export const P3_SCHEMA_VERSION = 1;
export const P3_STORAGE_KEY = "yash-os-p3-v1";
export const P3_EXPORT_FORMAT = "yash-os-p3-export";

/**
 * Complete, isolated Priority 3 Local Storage Schema v1.
 * Exclusively owns Priority 3 records. Does not touch or collide with P1/P2 storage.
 */
export interface P3StorageSchema {
  readonly schemaVersion: number;
  readonly updatedAt: string;
  readonly foundations: readonly FoundationEntity[];
  readonly domains: readonly DomainEntity[];
  readonly subjects: readonly SubjectEntity[];
  readonly topics: readonly TopicEntity[];
  readonly questions: readonly LearningQuestionEntity[];
  readonly sessions: readonly LearningSessionEntity[];
  readonly knowledgeUnits: readonly KnowledgeUnitEntity[];
  readonly sources: readonly SourceEntity[];
  readonly evidence: readonly EvidenceEntity[];
  readonly relationships: readonly KnowledgeRelationshipEntity[];
  readonly applications: readonly ApplicationRecordEntity[];
  readonly reviews: readonly ReviewEntity[];
  readonly inbox: readonly CaptureInboxItemEntity[];
  readonly context: LearningContextEntity;
  readonly backupSnapshots: readonly P3BackupSnapshot[];
}

/** Point-in-time recovery snapshot */
export interface P3BackupSnapshot {
  readonly snapshotId: string;
  readonly createdAt: string;
  readonly reason: string;
  readonly data: Omit<P3StorageSchema, "backupSnapshots">;
}

/** Portable export payload with validation envelope */
export interface P3ExportPayload {
  readonly format: typeof P3_EXPORT_FORMAT;
  readonly version: number;
  readonly exportedAt: string;
  readonly summary: {
    readonly questionsCount: number;
    readonly sessionsCount: number;
    readonly knowledgeUnitsCount: number;
    readonly sourcesCount: number;
    readonly evidenceCount: number;
    readonly applicationsCount: number;
  };
  readonly data: Omit<P3StorageSchema, "backupSnapshots">;
}

/** Orphan reference report */
export interface OrphanReport {
  readonly entityType: string;
  readonly entityId: string;
  readonly entityTitle: string;
  readonly missingReferenceType: string;
  readonly missingReferenceId: string;
  readonly details: string;
}

export interface OrphanAuditResult {
  readonly healthy: boolean;
  readonly totalOrphans: number;
  readonly reports: readonly OrphanReport[];
}
