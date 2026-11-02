import { cn } from "@/lib/utils";
import { PriorityIcon } from "@/components/os/ui";
import type { Plan, Priority } from "@/lib/os/types";
import { IDS } from "./planConstants";

export interface PlanAllocationStepProps {
  draft: Plan;
  priorities: Priority[];
  onChangeDraft: (fn: (d: Plan) => Plan) => void;
}

export function PlanAllocationStep({
  draft,
  priorities,
  onChangeDraft,
}: PlanAllocationStepProps) {
  const ctx = draft.context;
  const allocated = IDS.reduce((s, i) => s + draft.allocation[i], 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ["Available", ctx.hours],
          ["Allocated", allocated],
          ["Remaining", +(ctx.hours - allocated).toFixed(1)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-secondary/40 p-4">
            <div
              className={cn(
                "font-display text-2xl font-semibold",
                l === "Remaining" &&
                  v !== undefined &&
                  +v < 0 &&
                  "text-destructive",
              )}
            >
              {v}h
            </div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      {priorities.map((p) => (
        <div key={p.id} className="flex items-center gap-4">
          <PriorityIcon id={p.id} />
          <div className="flex-1">
            <div className="flex justify-between text-sm">
              <span>{p.name}</span>
              <span className="font-semibold">{draft.allocation[p.id]}h</span>
            </div>
            <input
              type="range"
              min={0}
              max={ctx.hours}
              step={0.5}
              value={draft.allocation[p.id]}
              aria-label={`${p.name} hours`}
              className="w-full"
              onChange={(e) =>
                onChangeDraft((d) => ({
                  ...d,
                  allocation: {
                    ...d.allocation,
                    [p.id]: +e.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      ))}
      {allocated > ctx.hours && (
        <p className="text-sm text-destructive">
          You've allocated more than your available hours.
        </p>
      )}
    </div>
  );
}
