export type LearningWorkflowType =
  | "capability_acquisition" // Targeted skill acquisition to unblock an immediate execution bottleneck
  | "discovery_synthesis"; // Distilling frameworks/lessons from actual execution evidence

export interface CapabilityAcquisitionRecord {
  id: string;
  targetSkill: string; // e.g. "TanStack Start SSR Hydration", "Futures Orderflow Profiling"
  unblocksPriorityId: 1 | 2;
  unblocksProjectId?: string | undefined;
  bottleneckReferenceId?: string | undefined; // Linked ReviewBottleneck.id
  resourcesStudied: string[];
  appliedExperiment: string; // Real task where knowledge was put to trial
  outcomeAchieved: boolean;
  promotedKnowledgeIds: string[]; // Foreign keys to KnowledgeItem.id
  createdAt: string;
  completedAt?: string | undefined;
}

export interface KnowledgeDiscoveryRecord {
  id: string;
  synthesisTitle: string;
  observedContext: string; // What happened during execution
  distilledTakeaway: string; // The fundamental truth or method discovered
  resultingKnowledgeId?: string | undefined; // Promoted KnowledgeItem.id
  createdAt: string;
}

export interface LearningCoreDocument {
  title: string; // "Learning & Knowledge Operating System"
  markdownContent: string;
  lastUpdated: string;
}

/** Root Learning & Knowledge Operating System (Priority 3) */
export interface LearningKnowledgeSystem {
  id: string;
  coreDocument: LearningCoreDocument;
  activeWorkflow: LearningWorkflowType;
  acquisitions: CapabilityAcquisitionRecord[];
  discoveries: KnowledgeDiscoveryRecord[];
}
