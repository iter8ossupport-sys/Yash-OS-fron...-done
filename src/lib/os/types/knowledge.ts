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
}
