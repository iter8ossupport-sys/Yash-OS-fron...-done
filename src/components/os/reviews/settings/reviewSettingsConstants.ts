import type {
  DayRecord,
  ReviewBottleneck,
  ReviewImprovement,
  PeriodReviewRecord,
  ReviewSettings,
  ForecastSnapshot,
} from "@/lib/os/types";

export const ALL_CARDS = [
  { id: "kpi_ribbon", label: "Executive KPI Ribbon" },
  { id: "realism_chart", label: "Workload Realism vs. Actual Hours" },
  { id: "outcomes_ratio", label: "Priority Distribution Ratio Chart" },
  { id: "p2_split", label: "Priority 2 Workstream A / B Separation" },
  { id: "bottlenecks", label: "Persistent Bottleneck Registry" },
  { id: "improvements", label: "Improvement Intelligence Funnel" },
];

export interface ReviewsBackupPayload {
  schemaVersion?: string;
  timestamp?: string;
  history?: DayRecord[];
  bottlenecks?: ReviewBottleneck[];
  improvements?: ReviewImprovement[];
  periodReviews?: PeriodReviewRecord[];
  forecastHistory?: ForecastSnapshot[];
  reviewSettings?: ReviewSettings;
}
