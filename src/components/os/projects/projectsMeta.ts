import type { PredefinedLifecyclePhase, PriorityId } from "@/lib/os/types";

export const STATUSES = ["active", "paused", "completed", "archived"] as const;

export interface PriorityMeta {
  id: PriorityId;
  name: string;
  fullName: string;
  purpose: string;
  accentClass: string;
  badgeClass: string;
  borderClass: string;
  arrowClass: string;
}

export const PRIORITIES_META: PriorityMeta[] = [
  {
    id: 1,
    name: "Founder Capability",
    fullName: "1 — Founder Capability",
    purpose:
      "Build real capability through execution: find human pain, build solutions, validate them and achieve meaningful results.",
    accentClass: "text-p1",
    badgeClass: "bg-p1/15 text-p1 border-p1/30",
    borderClass: "border-t-p1",
    arrowClass: "border-p1/30 bg-p1/10 text-p1 shadow-p1/20",
  },
  {
    id: 2,
    name: "Cashflow Infrastructure",
    fullName: "2 — Cashflow Infrastructure",
    purpose:
      "Generate cash to fund the startup while building sustainable financial and fintech capabilities.",
    accentClass: "text-cyan",
    badgeClass: "bg-cyan/15 text-cyan border-cyan/30",
    borderClass: "border-t-cyan",
    arrowClass: "border-cyan/30 bg-cyan/10 text-cyan shadow-cyan/20",
  },
  {
    id: 3,
    name: "Learning for Execution",
    fullName: "3 — Learning for Execution",
    purpose:
      "Learn through research, fundamentals and practical experience to continuously improve execution capability.",
    accentClass: "text-violet",
    badgeClass: "bg-violet/15 text-violet border-violet/30",
    borderClass: "border-t-violet",
    arrowClass: "border-violet/30 bg-violet/10 text-violet shadow-violet/20",
  },
];

export const SUGGESTED_LEARNING_CATEGORIES = [
  "Research and research papers",
  "Books and podcasts",
  "Courses and documentation",
  "Practical execution and experiments",
  "Frameworks and methodologies",
  "Principles and fundamentals",
  "Skill development",
  "Learning from people and real-world experience",
];

export interface LifecyclePhaseMeta {
  id: PredefinedLifecyclePhase;
  label: string;
  desc: string;
}

export const LIFECYCLE_PHASES: LifecyclePhaseMeta[] = [
  {
    id: "idea_discovery",
    label: "1. Idea & Discovery",
    desc: "Problem space exploration & founder-market fit",
  },
  {
    id: "problem_validation",
    label: "2. Problem Validation",
    desc: "User interviews & acute pain discovery",
  },
  {
    id: "solution_validation",
    label: "3. Solution Validation",
    desc: "Prototypes, LOIs & early commitments",
  },
  {
    id: "build_delivery",
    label: "4. Build & Delivery",
    desc: "Active engineering, MVP release & iteration",
  },
  {
    id: "growth_scaling",
    label: "5. Growth & Scaling",
    desc: "Distribution channels, sales & retention",
  },
  {
    id: "fundraising_team",
    label: "6. Fundraising & Team",
    desc: "Capital allocation & team expansion",
  },
];
