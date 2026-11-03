import { useState } from "react";
import { ChevronDown, Compass, Target } from "lucide-react";
import { fmtMin } from "@/lib/os/store";
import type { Task } from "@/lib/os/types";
import { cn } from "@/lib/utils";

export interface TaskCardProps {
  t: Task;
}

export function TaskCard({ t }: TaskCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-glass-border bg-secondary/40 p-3">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {t.title}
            </span>
            {t.scope === "project_scoping" && (
              <span className="inline-flex items-center gap-1 rounded bg-secondary/70 border border-glass-border px-1.5 py-0.2 text-[10px] text-muted-foreground font-medium">
                <Compass className="h-2.5 w-2.5 text-cyan" /> Scoping Task
              </span>
            )}
            {t.milestoneId && (
              <span className="inline-flex items-center gap-1 rounded bg-cyan/15 border border-cyan/30 px-1.5 py-0.2 text-[10px] text-cyan font-medium">
                <Target className="h-2.5 w-2.5" /> Milestone Linked
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {fmtMin(t.duration)} · Output: {t.expectedOutput}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="mt-3 grid gap-2 text-xs animate-in fade-in slide-in-from-top-1 sm:grid-cols-2 border-t border-glass-border/40 pt-2.5">
          <div>
            <b>Success criteria:</b> {t.successCriteria}
          </div>
          <div>
            <b>What:</b> {t.what}
          </div>
          <div>
            <b>How:</b> {t.how}
          </div>
          <div>
            <b>Where:</b> {t.where}
          </div>
        </div>
      )}
    </div>
  );
}
