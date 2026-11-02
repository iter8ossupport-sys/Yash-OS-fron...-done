import { useState } from "react";
import { ChevronDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Glass } from "@/components/os/ui";
import type { Goals, Priority } from "@/lib/os/types";

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
            <span className="text-muted-foreground">Level C:</span> 3 priority
            milestones
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
          <div className="rounded-2xl bg-secondary/40 p-3.5 text-xs leading-relaxed text-foreground/90">
            {goals.levelA.text}
          </div>
          <div className="rounded-2xl bg-secondary/40 p-3.5 text-xs leading-relaxed text-foreground/90">
            {goals.levelB.text}
          </div>
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
