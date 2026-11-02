import type { DayType, Energy, PriorityId } from "@/lib/os/types";

export const STAGES = [
  ["Daily Context", "Understand your day"],
  ["Priority Context", "3 permanent priorities"],
  ["Time Allocation", "Distribute work hours"],
  ["Daily Outcomes", "One outcome per priority"],
  ["Task Recommendations", "3 tasks per priority"],
  ["Planned Workload", "Select & organise tasks"],
  ["Final Approval", "Confirm and save plan"],
] as const;

export const DAY_TYPES: readonly DayType[] = [
  "College Day",
  "Non-College Day",
  "Weekend/Holiday",
  "Custom",
] as const;

export const ENERGY: readonly Energy[] = ["Low", "Medium", "High"] as const;

export const IDS: PriorityId[] = [1, 2, 3];
