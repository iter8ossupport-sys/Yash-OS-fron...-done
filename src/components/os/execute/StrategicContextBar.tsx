import { useState } from "react";
import { ChevronDown, Star, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Glass } from "@/components/os/ui";
import type { Goals, Priority } from "@/lib/os/types";
import { useOS } from "@/lib/os/store";

export interface StrategicContextBarProps {
  goals: Goals;
  priorities: Priority[];
  onOpenGoals: () => void;
}

export function StrategicContextBar({
  goals,
  priorities,
  onOpenGoals,
}: StrategicContextBarProps) {
  const [ctxOpen, setCtxOpen] = useState(false);
  const { state } = useOS();

  const activeP1 = state.projects.find(
    (p) =>
      p.priorityId === 1 &&
      (p.id === priorities.find((pr) => pr.id === 1)?.activeProjectId ||
        p.status === "active"),
  );

  const primaryMilestone =
    (activeP1?.milestones ?? []).find(
      (m) => m.isPrimaryActive && m.status === "active",
    ) ?? (activeP1?.milestones ?? []).find((m) => m.status === "active");

  const activeGoal =
    (activeP1?.goals ?? []).find(
      (g) => g.id === activeP1?.activeGoalId && g.status === "active",
    ) ?? (activeP1?.goals ?? []).find((g) => g.status === "active");

  return (
    <Glass className="p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setCtxOpen(!ctxOpen)}
        aria-expanded={ctxOpen}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <span>
            <span className="text-muted-foreground">Level A:</span>{" "}
            {goals.periodMonths}-month goal
          </span>
          <span>
            <span className="text-muted-foreground">Level B:</span> Nearest
            milestone ({goals.levelB.days}d)
          </span>
          <span>
            <span className="text-muted-foreground">P1 Focus:</span>{" "}
            <span className="font-semibold text-cyan">
              {activeP1 ? activeP1.name : "Founder Capability"}
            </span>
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            ctxOpen && "rotate-180",
          )}
        />
      </button>

      {ctxOpen && (
        <div className="mt-4 grid gap-3 animate-in fade-in md:grid-cols-3">
          {/* Level A Goal */}
          <div className="rounded-2xl bg-secondary/40 p-3.5 text-xs leading-relaxed text-foreground/90 space-y-1">
            <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider block">
              Level A: {goals.periodMonths}-Month Horizon
            </span>
            <p>{goals.levelA.text}</p>
          </div>

          {/* Priority 1 Active Project & Milestone Context */}
          <div className="rounded-2xl bg-secondary/40 p-3.5 text-xs leading-relaxed text-foreground/90 space-y-1.5 border border-cyan/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] text-cyan uppercase tracking-wider block">
                Priority 1 Active Project
              </span>
              {activeP1?.lifecyclePhase && (
                <span className="rounded bg-cyan/15 px-1.5 py-0.2 text-[10px] text-cyan capitalize">
                  {activeP1.lifecyclePhase.replace("_", " ")}
                </span>
              )}
            </div>

            <div className="font-medium text-foreground">
              {activeP1?.name || "No active project assigned"}
            </div>

            {activeGoal && (
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                <strong>Goal:</strong> {activeGoal.text}
              </p>
            )}

            {primaryMilestone && (
              <div className="flex items-center gap-1.5 text-[11px] text-cyan font-medium">
                <Star className="h-3 w-3 fill-cyan" />
                <span>Milestone: {primaryMilestone.title}</span>
              </div>
            )}
          </div>

          {/* Priorities Level C Goals */}
          <div className="flex flex-col justify-center gap-2.5 rounded-2xl bg-secondary/40 p-3.5 text-xs">
            {priorities.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-2 leading-relaxed"
              >
                <span
                  className={cn(
                    "font-semibold shrink-0",
                    p.id === 1
                      ? "text-p1"
                      : p.id === 2
                        ? "text-cyan"
                        : "text-violet",
                  )}
                >
                  {p.id}:
                </span>
                <span className="text-foreground/90">
                  {goals.levelC[p.id].target}
                </span>
              </div>
            ))}
          </div>

          <Button
            size="sm"
            className="md:col-span-3 md:w-fit"
            onClick={onOpenGoals}
          >
            <Target className="h-3.5 w-3.5" />
            View Goals & Milestones
          </Button>
        </div>
      )}
    </Glass>
  );
}
