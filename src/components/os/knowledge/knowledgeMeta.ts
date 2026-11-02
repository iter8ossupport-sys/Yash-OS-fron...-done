import React from "react";
import { Compass, Workflow, Layers, FileText } from "lucide-react";
import type { KnowledgeFormat, KnowledgeType } from "@/lib/os/types";

export const KNOWLEDGE_TYPES: KnowledgeType[] = [
  "Note",
  "Research",
  "Learning",
  "Documentation",
  "Book/Resource",
  "User Feedback",
  "Market Insight",
  "Lesson",
  "Decision",
  "Document",
];

export const FORMAT_ICONS: Record<
  KnowledgeFormat,
  React.ComponentType<{ className?: string }>
> = {
  principle: Compass,
  method: Workflow,
  framework: Layers,
  custom: FileText,
};
