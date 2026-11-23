import type { PriorityId } from "./core";

export type KnowledgeType =
  | "Note"
  | "Research"
  | "Learning"
  | "Documentation"
  | "Book/Resource"
  | "User Feedback"
  | "Market Insight"
  | "Lesson"
  | "Decision"
  | "Document";

export type KnowledgeFormat = "principle" | "method" | "framework" | "custom";

export type KnowledgeConfidence = "experimental" | "supported" | "established";

export type KnowledgeSourceSystem =
  "priority1" | "priority2" | "priority3" | "reviews" | "os_core" | "knowledge";

/** Stable cross-system pointer to an authoritative operational record */
export interface KnowledgeSourceReference {
  readonly system: KnowledgeSourceSystem;
  readonly entityType: string;
  readonly entityId: string;
  readonly secondaryId?: string | undefined;
  readonly humanReadablePath: string;
}

export interface PrincipleData {
  corePrinciple: string;
  whyItMatters?: string | undefined;
  whenToApply?: string | undefined;
  exceptions?: string | undefined;
}

export interface MethodData {
  purpose?: string | undefined;
  steps: string[];
  whenToUse?: string | undefined;
  expectedResult?: string | undefined;
}

export interface FrameworkData {
  purpose?: string | undefined;
  whenToUse?: string | undefined;
  components: string[];
  howItWorks?: string | undefined;
  expectedOutput?: string | undefined;
  example?: string | undefined;
}

export interface CustomData {
  formatName?: string | undefined;
  content: string;
}

export interface KnowledgeFormatData {
  principle?: PrincipleData | undefined;
  method?: MethodData | undefined;
  framework?: FrameworkData | undefined;
  custom?: CustomData | undefined;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  type: KnowledgeType;
  body: string;
  priorityId?: PriorityId | undefined;
  projectId?: string | undefined;
  tags: string;
  createdAt: string;
  demo?: boolean | undefined;
  knowledgeFormat?: KnowledgeFormat | undefined;
  formatData?: KnowledgeFormatData | undefined;
  schemaVersion?: number | undefined;

  // Phase 1 Global Knowledge Extensions (Optional, 100% backward-compatible)
  sourceReferences?: KnowledgeSourceReference[] | undefined;
  promotedFromReviewId?: string | undefined;
  confidence?: KnowledgeConfidence | undefined;
  updatedAt?: string | undefined;
}

/**
 * Validates the optional Global Knowledge extension fields on a KnowledgeItem.
 */
export function validateKnowledgeItemExtensions(item: Partial<KnowledgeItem>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (
    item.confidence &&
    !["experimental", "supported", "established"].includes(item.confidence)
  ) {
    errors.push(
      `Invalid confidence level: '${item.confidence}'. Must be 'experimental', 'supported', or 'established'.`,
    );
  }

  if (item.sourceReferences !== undefined) {
    if (!Array.isArray(item.sourceReferences)) {
      errors.push("sourceReferences must be an array.");
    } else {
      item.sourceReferences.forEach((ref, idx) => {
        if (!ref || typeof ref !== "object") {
          errors.push(`sourceReferences[${idx}] must be a valid object.`);
          return;
        }
        if (
          !ref.system ||
          ![
            "priority1",
            "priority2",
            "priority3",
            "reviews",
            "os_core",
            "knowledge",
          ].includes(ref.system)
        ) {
          errors.push(`sourceReferences[${idx}].system is invalid or missing.`);
        }
        if (!ref.entityType || typeof ref.entityType !== "string") {
          errors.push(
            `sourceReferences[${idx}].entityType is required and must be a string.`,
          );
        }
        if (!ref.entityId || typeof ref.entityId !== "string") {
          errors.push(
            `sourceReferences[${idx}].entityId is required and must be a string.`,
          );
        }
        if (
          ref.humanReadablePath !== undefined &&
          typeof ref.humanReadablePath !== "string"
        ) {
          errors.push(
            `sourceReferences[${idx}].humanReadablePath must be a string.`,
          );
        }
      });
    }
  }

  if (
    item.promotedFromReviewId !== undefined &&
    typeof item.promotedFromReviewId !== "string"
  ) {
    errors.push("promotedFromReviewId must be a string.");
  }

  if (item.updatedAt !== undefined && typeof item.updatedAt !== "string") {
    errors.push("updatedAt must be an ISO date string.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
