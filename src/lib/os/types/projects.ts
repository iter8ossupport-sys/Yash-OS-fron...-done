import type { PriorityId } from "./core";

export interface ProjectDoc {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export interface Project {
  id: string;
  name: string;
  objective: string;
  priorityId: PriorityId;
  status: ProjectStatus;
  hypothesis: string;
  milestone: string;
  metrics: string;
  bottlenecks: string;
  evidence: string;
  decisions: string;
  learning: string;
  documents: string;
  createdAt: string;
  demo?: boolean | undefined;
  deadline?: string | undefined;
  workstream?: "A" | "B" | undefined;
  learningCategories?: string[] | undefined;
  docs?: ProjectDoc[] | undefined;
}

export interface ProjectPerformanceSummary {
  projectId: string;
  totalActualHours: number;
  totalPlannedHours: number;
  tasksPlannedTotal: number;
  tasksDoneTotal: number;
  taskCompletionRate: number; // 0 to 100
  outputsCount: number;
  outputs: {
    date: string;
    title: string;
    text: string;
    workstream?: string | undefined;
  }[];
  activeDaysCount: number;
  firstActiveDate?: string | undefined;
  lastActiveDate?: string | undefined;
}
