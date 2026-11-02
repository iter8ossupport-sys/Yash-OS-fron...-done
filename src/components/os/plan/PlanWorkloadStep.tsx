import { ArrowDown, ArrowUp, BookMarked, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtMin } from "@/lib/os/store";
import { Badge, Button, Input, Label, PriorityIcon } from "@/components/os/ui";
import { DurationInput } from "@/components/os/DurationInput";
import type {
  KnowledgeItem,
  Plan,
  Priority,
  PriorityId,
  Task,
} from "@/lib/os/types";
import { formatBadgeClass, getKnowledgeFormat } from "@/lib/os/knowledge";

export interface PlanWorkloadStepProps {
  draft: Plan;
  priorities: Priority[];
  knowledge: KnowledgeItem[];
  perPriorityOk: boolean;
  sel: Task[];
  selMin: number;
  onChangeTask: (id: string, patch: Partial<Task>) => void;
  onChangeOutcome: (priorityId: PriorityId, outcome: string) => void;
  onMovePriorityTask: (
    priorityId: PriorityId,
    fromIdx: number,
    toIdx: number,
  ) => void;
  onLinkTaskKnowledge: (taskId: string) => void;
  onViewKnowledge: (items: KnowledgeItem[]) => void;
}

export function PlanWorkloadStep({
  draft,
  priorities,
  knowledge,
  perPriorityOk,
  sel,
  selMin,
  onChangeTask,
  onChangeOutcome,
  onMovePriorityTask,
  onLinkTaskKnowledge,
  onViewKnowledge,
}: PlanWorkloadStepProps) {
  const ctx = draft.context;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Select 1–3 tasks per priority, edit task titles & durations, and
          arrange execution order.
        </p>
        <Badge
          className={
            perPriorityOk
              ? "border-success/30 text-success"
              : "border-destructive/30 text-destructive"
          }
        >
          {perPriorityOk
            ? "Selection rules satisfied"
            : "Select 1–3 tasks per priority"}
        </Badge>
      </div>

      <div className="space-y-6">
        {priorities.map((p) => {
          const pTasks = draft.tasks.filter((t) => t.priorityId === p.id);
          const pSelCount = pTasks.filter((t) => t.selected).length;
          const pSelMin = pTasks
            .filter((t) => t.selected)
            .reduce((sum, t) => sum + t.duration, 0);

          return (
            <div
              key={p.id}
              className={cn(
                "rounded-2xl border border-glass-border bg-secondary/30 p-5 shadow-sm",
                p.id === 1
                  ? "border-t-2 border-t-p1"
                  : p.id === 2
                    ? "border-t-2 border-t-p2"
                    : "border-t-2 border-t-p3",
              )}
            >
              {/* 1. Priority number and full priority name */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PriorityIcon id={p.id} className="h-9 w-9" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold">
                        #{p.id} {p.name}
                      </span>
                      <Badge
                        className={
                          pSelCount >= 1 && pSelCount <= 3
                            ? "text-success"
                            : "text-destructive"
                        }
                      >
                        {pSelCount} of {pTasks.length} selected (
                        {fmtMin(pSelMin)})
                      </Badge>
                    </div>
                    {/* 2 & 3. Active project & milestone */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium text-foreground/80">
                          Project:
                        </span>{" "}
                        {p.project || "No active project"}
                      </span>
                      <span>·</span>
                      <span>
                        <span className="font-medium text-foreground/80">
                          Milestone:
                        </span>{" "}
                        {p.milestone || "None set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Today's outcome in one clear, editable line */}
              <div className="mt-3">
                <Label className="mb-1 text-[11px]">Today's Outcome</Label>
                <Input
                  value={draft.outcomes[p.id] || ""}
                  onChange={(e) => onChangeOutcome(p.id, e.target.value)}
                  aria-label={`Today's outcome for ${p.name}`}
                  placeholder={`Define today's outcome for ${p.name}...`}
                  className="h-9 bg-background/60"
                />
              </div>

              {/* 5. Three numbered task recommendations */}
              <div className="mt-4 space-y-2">
                {pTasks.map((t, idx) => {
                  const taskKIds = t.knowledgeIds || [];
                  const taskKnowledge = knowledge.filter((k) =>
                    taskKIds.includes(k.id),
                  );

                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-xl border border-glass-border p-3 transition sm:flex-row sm:items-center",
                        t.selected
                          ? "bg-secondary/60 shadow-sm ring-1 ring-primary/20"
                          : "bg-secondary/20 opacity-60",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Selection checkbox */}
                        <input
                          type="checkbox"
                          checked={t.selected}
                          aria-label={`Select task: ${t.title}`}
                          onChange={(e) =>
                            onChangeTask(t.id, {
                              selected: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded accent-primary"
                        />
                        {/* Task number (1, 2, 3) */}
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary/80 text-xs font-semibold text-muted-foreground">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Editable task title and attached knowledge pills */}
                      <div className="flex-1 min-w-[200px]">
                        <Input
                          value={t.title}
                          aria-label={`Task ${idx + 1} title`}
                          onChange={(e) =>
                            onChangeTask(t.id, { title: e.target.value })
                          }
                          className="h-9"
                        />
                        {taskKnowledge.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {taskKnowledge.map((k) => {
                              const fmt = getKnowledgeFormat(k);
                              return (
                                <span
                                  key={k.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewKnowledge([k]);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-medium transition cursor-pointer hover:brightness-110",
                                    formatBadgeClass(fmt),
                                  )}
                                  title="Click to view full knowledge"
                                >
                                  <BookOpen className="h-2.5 w-2.5" />
                                  <span className="max-w-[140px] truncate">
                                    {k.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onChangeTask(t.id, {
                                        knowledgeIds: (
                                          t.knowledgeIds || []
                                        ).filter((id) => id !== k.id),
                                      });
                                    }}
                                    className="ml-0.5 hover:text-destructive"
                                    title="Unlink"
                                  >
                                    <X className="h-2 w-2" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* One simple editable duration/timeline input with automatic unit detection */}
                      <div className="w-full sm:w-48 shrink-0">
                        <DurationInput
                          value={t.duration}
                          onChange={(min) =>
                            onChangeTask(t.id, { duration: min })
                          }
                          ariaLabel={`Duration for ${t.title}`}
                        />
                      </div>

                      {/* Ascending / descending ordering controls & Link Knowledge */}
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Link knowledge"
                          onClick={() => onLinkTaskKnowledge(t.id)}
                          title="Link principles, methods, or frameworks to this task"
                          className={cn(
                            "h-8 w-8",
                            taskKnowledge.length > 0
                              ? "text-cyan"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <BookMarked className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Move task up"
                          disabled={idx === 0}
                          onClick={() => onMovePriorityTask(p.id, idx, idx - 1)}
                          className="h-8 w-8"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Move task down"
                          disabled={idx === pTasks.length - 1}
                          onClick={() => onMovePriorityTask(p.id, idx, idx + 1)}
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

      {/* Bottom Workload Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-glass-border bg-secondary/40 p-4 text-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-muted-foreground">Total Selected: </span>
            <span className="font-semibold">{sel.length} tasks</span>
          </div>
          <div>
            <span className="text-muted-foreground">Planned Workload: </span>
            <span className="font-semibold text-primary">{fmtMin(selMin)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Available Time: </span>
            <span className="font-semibold">{ctx.hours}h</span>
          </div>
          <div>
            <span className="text-muted-foreground">Remaining: </span>
            <span
              className={cn(
                "font-semibold",
                selMin > ctx.hours * 60 ? "text-destructive" : "text-success",
              )}
            >
              {fmtMin(Math.max(0, ctx.hours * 60 - selMin))}
            </span>
          </div>
        </div>
        {!perPriorityOk && (
          <span className="text-xs font-semibold text-destructive">
            Rule: Each of the 3 priorities requires between 1 and 3 selected
            tasks.
          </span>
        )}
      </div>
    </div>
  );
}
