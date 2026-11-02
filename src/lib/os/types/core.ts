export type PriorityId = 1 | 2 | 3;
export type DayType =
  "College Day" | "Non-College Day" | "Weekend/Holiday" | "Custom";
export type Energy = "Low" | "Medium" | "High";
export type TaskKind = "simple" | "measurable" | "validation";
export type TaskStatus = "pending" | "active" | "paused" | "done";
export type Theme = "dark" | "light" | "system";

export interface Priority {
  id: PriorityId;
  name: string;
  purpose: string;
  project: string;
  milestone: string;
  status: string;
  bottleneck: string;
  activeProjectId?: string | undefined;
}

export interface DayContext {
  date: string;
  dayType: DayType;
  hours: number;
  commitments: string;
  energy: Energy;
}

export interface Task {
  id: string;
  priorityId: PriorityId;
  title: string;
  duration: number; // minutes
  timeBlock: string;
  expectedOutput: string;
  successCriteria: string;
  what: string;
  how: string;
  where: string;
  kind: TaskKind;
  selected: boolean;
  status: TaskStatus;
  elapsedMs: number;
  startedAt?: number | undefined;
  output?: Record<string, string> | undefined;
  outcomeAchieved?: boolean | undefined;
  knowledgeIds?: string[] | undefined;
}

export interface Plan {
  context: DayContext;
  allocation: Record<PriorityId, number>;
  outcomes: Record<PriorityId, string>;
  tasks: Task[];
  approvedAt?: string | undefined;
  outcomeKnowledgeIds?: Partial<Record<PriorityId, string[]>> | undefined;
}

export interface Metric {
  label: string;
  target: string;
  current: string;
}

export interface Goals {
  periodMonths: number;
  levelA: { text: string; metrics: Metric[]; approved: boolean };
  levelB: { text: string; days: number; metrics: Metric[]; approved: boolean };
  levelC: Record<
    PriorityId,
    { target: string; deadline: string; evidence: string; progress: number }
  >;
}

import type { Project } from "./projects";
import type { KnowledgeItem } from "./knowledge";
import type {
  DayRecord,
  ForecastSnapshot,
  PeriodReviewRecord,
  ReportShareConfig,
  ReviewAIInsight,
  ReviewAlert,
  ReviewBottleneck,
  ReviewImprovement,
  ReviewSettings,
} from "./reviews";

export interface OSState {
  schemaVersion?: number | undefined;
  theme: Theme;
  userName: string;
  userAvatar?: string | null | undefined;
  foundation: {
    northStar: string;
    northStarLong: string;
    mission: string;
    trajectory: string;
    phases: string[];
  };
  priorities: Priority[];
  goals: Goals;
  draft: Plan | null;
  draftStage: number;
  plan: Plan | null;
  activeTaskId: string | null;
  interruptedTaskId: string | null;
  projects: Project[];
  knowledge: KnowledgeItem[];
  history: DayRecord[];
  prefs: {
    timer: boolean;
    notifications: boolean;
    defaultView: string;
    dayTypeHours: Record<DayType, number>;
    constraints: string;
  };

  // Reviews Data Foundation additions
  bottlenecks?: ReviewBottleneck[] | undefined;
  improvements?: ReviewImprovement[] | undefined;
  periodReviews?: PeriodReviewRecord[] | undefined;
  aiInsights?: ReviewAIInsight[] | undefined;
  reviewAlerts?: ReviewAlert[] | undefined;
  reviewSettings?: ReviewSettings | undefined;
  forecastHistory?: ForecastSnapshot[] | undefined;
  sharedReports?: ReportShareConfig[] | undefined;
}
