/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Migration Engine Types & Dry-Run Reconciliation Contracts
 *
 * Strict Architectural Rule: Pure TypeScript; zero UI dependencies.
 */

import type { P3StorageSchema, OrphanReport } from "../persistence/types";

export interface MigrationSourceInventory {
  readonly rawByteCount: number;
  readonly rawSha256: string;
  readonly journeysCount: number;
  readonly objectivesCount: number;
  readonly sessionsCount: number;
  readonly resourcesCount: number;
  readonly applicationsCount: number;
  readonly capabilitiesCount: number;
  readonly artifactsCount: number;
  readonly reviewsCount: number;
  readonly acquisitionsCount: number;
  readonly discoveriesCount: number;
  readonly hasCoreDocument: boolean;
  readonly hasActiveWorkflow: boolean;
  readonly p3ProjectsCount: number;
  readonly p3KnowledgeCount: number;
  readonly recordIds: {
    readonly journeys: readonly string[];
    readonly objectives: readonly string[];
    readonly sessions: readonly string[];
    readonly resources: readonly string[];
    readonly applications: readonly string[];
    readonly capabilities: readonly string[];
    readonly artifacts: readonly string[];
    readonly reviews: readonly string[];
    readonly acquisitions: readonly string[];
    readonly discoveries: readonly string[];
  };
  readonly fieldInventory: Record<string, readonly string[]>;
}

export interface MigrationTransformationResults {
  readonly createdCounts: {
    readonly subjects: number;
    readonly questions: number;
    readonly sessions: number;
    readonly knowledgeUnits: number;
    readonly sources: number;
    readonly evidence: number;
    readonly applications: number;
    readonly reviews: number;
  };
  readonly preservedOriginalIds: readonly string[];
  readonly generatedIds: readonly string[];
  readonly preservedRelationships: {
    readonly sessionToJourney: number;
    readonly resourceToJourney: number;
    readonly sessionToResource: number;
    readonly sessionToObjective: number;
    readonly capabilityToJourney: number;
    readonly applicationToJourney: number;
    readonly applicationToObjective: number;
    readonly applicationToProject: number;
    readonly applicationToTask: number;
    readonly artifactProvenance: number;
  };
  readonly unresolvedRelationships: {
    readonly missingJourneys: readonly string[];
    readonly missingObjectives: readonly string[];
    readonly missingResources: readonly string[];
    readonly missingProjects: readonly string[];
    readonly missingTasks: readonly string[];
  };
}

export interface UncertainEvidenceItem {
  readonly sourceEntity: string;
  readonly sourceId: string;
  readonly rawEvidenceText: string;
  readonly reason: string;
}

export interface MigrationDataIntegrityReport {
  readonly fieldLevelReconciliationPassed: boolean;
  readonly canonicalPayloadHash: string;
  readonly duplicateIds: readonly string[];
  readonly idCollisions: readonly string[];
  readonly orphanReports: readonly OrphanReport[];
  readonly unmappedFields: readonly {
    readonly entityName: string;
    readonly fieldName: string;
    readonly sampleValue: unknown;
  }[];
  readonly invalidReferences: readonly string[];
  readonly datePreservationPassed: boolean;
  readonly uncertainEvidenceReports: readonly UncertainEvidenceItem[];
}

export interface MigrationSafetyReport {
  readonly backupSha256MatchesOriginal: boolean;
  readonly productionStorageModified: boolean;
  readonly p1DataModified: boolean;
  readonly p2DataModified: boolean;
  readonly idempotencyPassed: boolean;
}

export interface MigrationDryRunResult {
  readonly success: boolean;
  readonly timestamp: string;
  readonly sourceInventory: MigrationSourceInventory;
  readonly transformationResults: MigrationTransformationResults;
  readonly dataIntegrity: MigrationDataIntegrityReport;
  readonly safety: MigrationSafetyReport;
  readonly proposedP3Storage: P3StorageSchema;
}
