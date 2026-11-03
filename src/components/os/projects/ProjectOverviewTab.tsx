import { Check, X } from "lucide-react";
import { Button, Input, Label, Select, Textarea } from "@/components/os/ui";
import type {
  LifecyclePhase,
  PredefinedLifecyclePhase,
  PriorityId,
  Project,
  ProjectStatus,
} from "@/lib/os/types";
import { cn } from "@/lib/utils";
import {
  LIFECYCLE_PHASES,
  PRIORITIES_META,
  STATUSES,
  SUGGESTED_LEARNING_CATEGORIES,
} from "./projectsMeta";

export interface ProjectOverviewTabProps {
  draft: Project;
  onChange: (updated: Project) => void;
  customCatInput: string;
  setCustomCatInput: (v: string) => void;
  onAddCustomCategory: () => void;
  onToggleCategory: (cat: string) => void;
}

export function ProjectOverviewTab({
  draft,
  onChange,
  customCatInput,
  setCustomCatInput,
  onAddCustomCategory,
  onToggleCategory,
}: ProjectOverviewTabProps) {
  return (
    <div className="space-y-5">
      {/* Primary Row: Name, Priority, Status, Deadline */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Project Name</Label>
          <Input
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            placeholder="Project Name"
          />
        </div>

        <div>
          <Label>Assigned Priority</Label>
          <Select
            value={String(draft.priorityId)}
            onChange={(v) =>
              onChange({ ...draft, priorityId: +v as PriorityId })
            }
            options={PRIORITIES_META.map((pr) => ({
              value: String(pr.id),
              label: pr.fullName,
            }))}
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={draft.status}
            onChange={(v) => onChange({ ...draft, status: v as ProjectStatus })}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>

        <div>
          <Label>Nearest Deadline</Label>
          <Input
            placeholder="e.g. 2026-11-25 or Next Monday"
            value={draft.deadline ?? ""}
            onChange={(e) => onChange({ ...draft, deadline: e.target.value })}
          />
        </div>
      </div>

      {/* Six Predefined Lifecycle Phases Selector */}
      <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold mb-0">
            Founder Lifecycle Phase
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Current stage in the founder journey
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LIFECYCLE_PHASES.map((phase) => {
            const isSelected =
              draft.lifecyclePhase === phase.id ||
              (!draft.lifecyclePhase && phase.id === "build_delivery");
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...draft,
                    lifecyclePhase: phase.id as LifecyclePhase,
                  })
                }
                className={cn(
                  "flex flex-col items-start rounded-xl border p-2.5 text-left transition-all",
                  isSelected
                    ? "border-cyan bg-cyan/15 ring-1 ring-cyan text-foreground"
                    : "border-glass-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
                )}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                  {isSelected && <Check className="h-3.5 w-3.5 text-cyan" />}
                  {phase.label}
                </div>
                <span className="mt-1 text-[11px] text-muted-foreground leading-snug">
                  {phase.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority 2 Workstream Selector (if P2) */}
      {draft.priorityId === 2 && (
        <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-4 space-y-2">
          <Label className="text-cyan font-semibold mb-0">
            Required Workstream Classification
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={cn(
                "flex flex-col text-left p-3 rounded-xl border text-xs transition-all",
                draft.workstream === "A"
                  ? "border-cyan bg-cyan/15 text-foreground ring-1 ring-cyan"
                  : "border-glass-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60",
              )}
              onClick={() => onChange({ ...draft, workstream: "A" })}
            >
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                <span className="rounded bg-cyan/20 px-1.5 py-0.2 text-[10px] text-cyan">
                  A
                </span>
                Cashflow Generation
              </div>
              <span className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Generate short-term cash through trading systems (LBES) or
                service work.
              </span>
            </button>

            <button
              type="button"
              className={cn(
                "flex flex-col text-left p-3 rounded-xl border text-xs transition-all",
                draft.workstream === "B"
                  ? "border-cyan bg-cyan/15 text-foreground ring-1 ring-cyan"
                  : "border-glass-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60",
              )}
              onClick={() => onChange({ ...draft, workstream: "B" })}
            >
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                <span className="rounded bg-cyan/20 px-1.5 py-0.2 text-[10px] text-cyan">
                  B
                </span>
                Fintech Product Capability
              </div>
              <span className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Build LBES into a useful fintech product solving real user
                problems.
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Priority 3 Learning Categories (if P3) */}
      {draft.priorityId === 3 && (
        <div className="rounded-xl border border-violet/30 bg-violet/5 p-4 space-y-3">
          <Label className="text-violet font-semibold mb-0">
            Learning Categories (Multi-select)
          </Label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_LEARNING_CATEGORIES.map((cat) => {
              const selected = (draft.learningCategories ?? []).includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onToggleCategory(cat)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                    selected
                      ? "border-violet bg-violet/20 text-foreground ring-1 ring-violet/50"
                      : "border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70",
                  )}
                >
                  {selected && (
                    <Check className="mr-1.5 inline h-3.5 w-3.5 text-violet" />
                  )}
                  {cat}
                </button>
              );
            })}
            {(draft.learningCategories ?? [])
              .filter((cat) => !SUGGESTED_LEARNING_CATEGORIES.includes(cat))
              .map((customCat) => (
                <span
                  key={customCat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet/50 bg-violet/20 px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {customCat}
                  <button
                    type="button"
                    onClick={() => onToggleCategory(customCat)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
          </div>

          <div className="flex items-center gap-2 max-w-md pt-1">
            <Input
              className="h-9 text-xs"
              placeholder="Add custom learning category..."
              value={customCatInput}
              onChange={(e) => setCustomCatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddCustomCategory();
                }
              }}
            />
            <Button
              size="sm"
              variant="glass"
              className="h-9 shrink-0 text-xs"
              onClick={onAddCustomCategory}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Row 2: Objective & Core Hypothesis */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Project Objective</Label>
          <Textarea
            rows={3}
            value={draft.objective}
            onChange={(e) => onChange({ ...draft, objective: e.target.value })}
            placeholder="What is this project aiming to achieve for users and the business?"
          />
        </div>
        <div>
          <Label>Core Hypothesis</Label>
          <Textarea
            rows={3}
            value={draft.hypothesis}
            onChange={(e) => onChange({ ...draft, hypothesis: e.target.value })}
            placeholder="Core assumption being validated through execution..."
          />
        </div>
      </div>

      {/* Row 3: Bottlenecks & Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Current Bottlenecks & Friction</Label>
          <Textarea
            rows={3}
            value={draft.bottlenecks}
            onChange={(e) =>
              onChange({ ...draft, bottlenecks: e.target.value })
            }
            placeholder="What is slowing down progress right now? (Feeds recommendation engine)"
          />
        </div>
        <div>
          <Label>Target Metrics & Signals</Label>
          <Textarea
            rows={3}
            value={draft.metrics}
            onChange={(e) => onChange({ ...draft, metrics: e.target.value })}
            placeholder="Key numbers, target volumes, and quantifiable signals..."
          />
        </div>
      </div>
    </div>
  );
}
