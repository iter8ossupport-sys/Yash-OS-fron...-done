import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
        <div>
          <div className="text-sm font-medium">{t.title}</div>
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
        <div className="mt-3 grid gap-2 text-xs animate-in fade-in slide-in-from-top-1 sm:grid-cols-2">
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
