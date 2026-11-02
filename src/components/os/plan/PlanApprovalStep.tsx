import { ArrowDown, ArrowUp } from "lucide-react";
import { fmtMin } from "@/lib/os/store";
import { Badge, Button, Input, Label, PriorityIcon } from "@/components/os/ui";
import { DurationInput } from "@/components/os/DurationInput";
import type { Plan, Priority, PriorityId, Task } from "@/lib/os/types";

export interface PlanApprovalStepProps {
  draft: Plan;
  priorities: Priority[];
  sel: Task[];
  selMin: number;
  onChangeOutcome: (priorityId: PriorityId, outcome: string) => void;
  onChangeTask: (id: string, patch: Partial<Task>) => void;
  onMoveSelectedTask: (id: string, dir: -1 | 1) => void;
}

export function PlanApprovalStep({
  draft,
  priorities,
  sel,
  selMin,
  onChangeOutcome,
  onChangeTask,
  onMoveSelectedTask,
}: PlanApprovalStepProps) {
  const ctx = draft.context;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Date", ctx.date],
          ["Total Tasks", `${sel.length} selected`],
          ["Planned Duration", fmtMin(selMin)],
          ["Remaining Time", fmtMin(Math.max(0, ctx.hours * 60 - selMin))],
        ].map(([label, val]) => (
          <div
            key={label}
            className="rounded-2xl border border-glass-border bg-secondary/40 p-4"
          >
            <div className="font-display text-xl font-semibold text-foreground">
              {val}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Workload Grouped by Priority
        </h3>

        {priorities.map((p) => {
          const pTasks = sel.filter((t) => t.priorityId === p.id);
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-glass-border bg-secondary/40 p-5"
            >
              {/* Priority number, name & active project */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <PriorityIcon id={p.id} className="h-8 w-8" />
                  <div>
                    <div className="font-display font-semibold">
                      #{p.id} {p.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active Project:{" "}
                      <span className="font-medium text-foreground">
                        {p.project || "None"}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge>{pTasks.length} tasks</Badge>
              </div>

              {/* Today's outcome, editable before approval */}
              <div className="mt-3">
                <Label className="mb-1 text-[11px]">
                  Today's Outcome (editable before approval)
                </Label>
                <Input
                  value={draft.outcomes[p.id]}
                  aria-label={`Outcome for ${p.name}`}
                  onChange={(e) => onChangeOutcome(p.id, e.target.value)}
                  className="h-9 bg-background/60"
                />
              </div>

              {/* Selected tasks in execution order */}
              <div className="mt-3 space-y-2">
                {pTasks.map((t) => {
                  const globalIndex = sel.findIndex((x) => x.id === t.id);
                  return (
                    <div
                      key={t.id}
                      className="flex flex-col gap-2 rounded-xl border border-glass-border bg-background/40 p-3 sm:flex-row sm:items-center"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary/80 text-xs font-semibold text-muted-foreground">
                        {globalIndex + 1}
                      </span>
                      <div className="flex-1 min-w-[200px]">
                        <Input
                          value={t.title}
                          aria-label={`Task title`}
                          onChange={(e) =>
                            onChangeTask(t.id, { title: e.target.value })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="w-full sm:w-44 shrink-0">
                        <DurationInput
                          value={t.duration}
                          onChange={(min) =>
                            onChangeTask(t.id, { duration: min })
                          }
                          ariaLabel={`Duration for ${t.title}`}
                        />
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Move task up in execution order"
                          disabled={globalIndex === 0}
                          onClick={() => onMoveSelectedTask(t.id, -1)}
                          className="h-8 w-8"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Move task down in execution order"
                          disabled={globalIndex === sel.length - 1}
                          onClick={() => onMoveSelectedTask(t.id, 1)}
                          className="h-8 w-8"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Approving saves the plan. It will not start any task automatically.
      </p>
    </div>
  );
}
