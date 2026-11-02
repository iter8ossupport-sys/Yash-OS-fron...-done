import { useState } from "react";
import { BookOpen, Check, ChevronDown, Clock, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtMin } from "@/lib/os/store";
import { elapsed } from "@/lib/os/logic";
import {
  Badge,
  Button,
  Glass,
  PriorityIcon,
  Progress,
  priorityTone,
} from "@/components/os/ui";
import { formatBadgeClass, getKnowledgeFormat } from "@/lib/os/knowledge";
import type { KnowledgeItem, Plan, Priority, Task } from "@/lib/os/types";

export interface ExecutionTaskListProps {
  plan: Plan;
  sel: Task[];
  currentId: string | undefined;
  priorities: Priority[];
  knowledge: KnowledgeItem[];
  now: number;
  onSelectTask: (id: string) => void;
  onStartTask: (id: string) => void;
  onPauseTask: (id: string) => void;
  onFinishTask: (task: Task) => void;
  onViewKnowledge: (items: KnowledgeItem[]) => void;
}

export function ExecutionTaskList({
  plan,
  sel,
  currentId,
  priorities,
  knowledge,
  now,
  onSelectTask,
  onStartTask,
  onPauseTask,
  onFinishTask,
  onViewKnowledge,
}: ExecutionTaskListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const toggleTaskExpanded = (id: string) => {
    setExpandedTaskId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Approved Daily Execution
        </h3>
        <span className="text-xs text-muted-foreground">
          Click any task to focus it in the execution workspace
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {priorities.map((p) => {
          const pTasks = sel.filter((t) => t.priorityId === p.id);
          const pDone = pTasks.filter((t) => t.status === "done").length;
          const pNameLabel =
            p.id === 1
              ? "1 — Founder Capability"
              : p.id === 2
                ? "2 — Cashflow Infrastructure"
                : "3 — Learning for Execution";

          return (
            <Glass
              key={p.id}
              className={cn(
                "flex flex-col p-5 shadow-sm transition",
                p.id === 1
                  ? "border-t-2 border-t-p1"
                  : p.id === 2
                    ? "border-t-2 border-t-p2"
                    : "border-t-2 border-t-p3",
              )}
            >
              {/* Priority Header */}
              <div className="mb-3 flex items-start gap-3">
                <PriorityIcon id={p.id} className="h-8 w-8" />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm font-semibold truncate">
                    {pNameLabel}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    Project:{" "}
                    <span className="font-medium text-foreground/80">
                      {p.project || "No active project"}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {pDone}/{pTasks.length}
                </span>
              </div>

              {/* Today's approved outcome */}
              <div className="mb-4 rounded-xl border border-glass-border bg-background/50 p-2.5 text-xs">
                <div className="font-semibold text-cyan">
                  Today's Approved Outcome:
                </div>
                <div className="mt-0.5 text-foreground/90 leading-snug line-clamp-2">
                  {plan.outcomes[p.id] || "No outcome specified."}
                </div>
              </div>

              <Progress
                value={pTasks.length ? (pDone / pTasks.length) * 100 : 0}
                tone={priorityTone(p.id)}
                className="mb-4"
              />

              {/* Tasks in their approved execution order */}
              <div className="space-y-2 flex-1">
                {pTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-glass-border p-4 text-center text-xs text-muted-foreground">
                    No tasks selected for this priority.
                  </div>
                ) : (
                  pTasks.map((t) => {
                    const globalOrder = sel.findIndex((x) => x.id === t.id) + 1;
                    const isSelected = t.id === currentId;
                    const isExpanded = expandedTaskId === t.id;

                    return (
                      <div
                        key={t.id}
                        onClick={() => onSelectTask(t.id)}
                        className={cn(
                          "cursor-pointer rounded-xl border transition-all duration-200 p-3",
                          isSelected
                            ? "border-primary/60 bg-primary/15 shadow-sm ring-1 ring-primary/40 glow"
                            : "border-glass-border bg-secondary/30 hover:border-primary/30 hover:bg-secondary/50",
                          t.status === "done" && "opacity-75",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Execution Order Number */}
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-secondary/80 text-[11px] font-semibold text-muted-foreground">
                            {globalOrder}
                          </span>

                          {/* Task Title & Meta */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "text-xs font-medium leading-snug truncate",
                                t.status === "done" &&
                                  "line-through text-muted-foreground",
                              )}
                            >
                              {t.title}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {fmtMin(t.duration)}
                              </span>
                              {t.elapsedMs > 0 && (
                                <span>
                                  · actual{" "}
                                  {fmtMin(Math.round(elapsed(t, now) / 60000))}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-1.5">
                            {t.status === "active" && (
                              <Badge className="text-success border-success/30 font-semibold text-[10px]">
                                Active
                              </Badge>
                            )}
                            {t.status === "paused" && (
                              <Badge className="text-warning border-warning/30 text-[10px]">
                                Paused
                              </Badge>
                            )}
                            {t.status === "done" && (
                              <Badge className="text-muted-foreground text-[10px]">
                                Done
                              </Badge>
                            )}

                            {/* Obvious Disclosure Arrow */}
                            <button
                              type="button"
                              aria-label="Toggle task details"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpanded(t.id);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition"
                            >
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform duration-200",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Task Details */}
                        {isExpanded && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3.5 border-t border-glass-border/70 pt-3.5 space-y-2.5 text-xs animate-in fade-in cursor-default"
                          >
                            {/* 1. Objective */}
                            <div className="rounded-xl border border-glass-border/60 bg-background/50 p-3">
                              <div className="text-[11px] font-semibold tracking-wide text-cyan mb-1">
                                1. Objective
                              </div>
                              <div className="text-xs text-foreground/90 leading-relaxed break-words">
                                {t.what || t.title}
                              </div>
                            </div>

                            {/* 2. Planned Duration */}
                            <div className="rounded-xl border border-glass-border/60 bg-background/50 p-3">
                              <div className="text-[11px] font-semibold tracking-wide text-muted-foreground/90 mb-1">
                                2. Planned Duration
                              </div>
                              <div className="text-xs font-medium text-foreground leading-relaxed break-words">
                                {fmtMin(t.duration)}
                              </div>
                            </div>

                            {/* 3. What to do */}
                            <div className="rounded-xl border border-glass-border/60 bg-background/50 p-3">
                              <div className="text-[11px] font-semibold tracking-wide text-muted-foreground/90 mb-1">
                                3. What to do
                              </div>
                              <div className="text-xs text-foreground/90 leading-relaxed break-words">
                                {t.what || t.title}
                              </div>
                            </div>

                            {/* 4. How to do it */}
                            <div className="rounded-xl border border-glass-border/60 bg-background/50 p-3">
                              <div className="text-[11px] font-semibold tracking-wide text-muted-foreground/90 mb-1">
                                4. How to do it
                              </div>
                              <div className="text-xs text-foreground/90 leading-relaxed break-words">
                                {t.how ||
                                  "Execute in focused block following standard operating procedure."}
                              </div>
                            </div>

                            {/* 5. Where */}
                            <div className="rounded-xl border border-glass-border/60 bg-background/50 p-3">
                              <div className="text-[11px] font-semibold tracking-wide text-muted-foreground/90 mb-1">
                                5. Where
                              </div>
                              <div className="text-xs text-foreground/90 leading-relaxed break-words">
                                {t.where || "Workspace"}
                              </div>
                            </div>

                            {/* 6. Expected Output */}
                            <div className="rounded-xl border border-glass-border/60 bg-background/50 p-3">
                              <div className="text-[11px] font-semibold tracking-wide text-muted-foreground/90 mb-1">
                                6. Expected Output
                              </div>
                              <div className="text-xs text-foreground/90 leading-relaxed break-words">
                                {t.expectedOutput ||
                                  "Task completed with documented result."}
                              </div>
                            </div>

                            {/* 7. Success Criteria */}
                            <div className="rounded-xl border border-glass-border/60 bg-background/50 p-3">
                              <div className="text-[11px] font-semibold tracking-wide text-muted-foreground/90 mb-1">
                                7. Success Criteria
                              </div>
                              <div className="text-xs text-foreground/90 leading-relaxed break-words">
                                {t.successCriteria ||
                                  "All stated output criteria met and verified."}
                              </div>
                            </div>

                            {/* Recorded Output (If Present) */}
                            {t.output && Object.keys(t.output).length > 0 && (
                              <div className="rounded-xl border border-success/30 bg-success/10 p-3 text-success">
                                <div className="font-semibold text-[11px] mb-1">
                                  Recorded Output:
                                </div>
                                <div className="text-xs leading-relaxed break-words">
                                  {Object.entries(t.output)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(" · ")}
                                </div>
                              </div>
                            )}

                            {/* Linked Knowledge for this task */}
                            {t.knowledgeIds && t.knowledgeIds.length > 0 && (
                              <div className="rounded-xl border border-glass-border/60 bg-background/50 p-3">
                                <div className="text-[11px] font-semibold tracking-wide text-muted-foreground/90 mb-1.5 flex items-center justify-between">
                                  <span>Linked Knowledge</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-[10px] text-cyan hover:bg-cyan/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const items = knowledge.filter((k) =>
                                        (t.knowledgeIds || []).includes(k.id),
                                      );
                                      onViewKnowledge(items);
                                    }}
                                  >
                                    <BookOpen className="h-3 w-3 mr-1" /> View
                                    Full
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {knowledge
                                    .filter((k) =>
                                      (t.knowledgeIds || []).includes(k.id),
                                    )
                                    .map((k) => (
                                      <span
                                        key={k.id}
                                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${formatBadgeClass(
                                          getKnowledgeFormat(k),
                                        )}`}
                                      >
                                        {k.title}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Start/Resume and Finish Controls */}
                            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-glass-border/60 pt-3">
                              <div>
                                {t.status !== "done" &&
                                  (t.status === "active" ? (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onPauseTask(t.id);
                                      }}
                                    >
                                      <Pause className="h-3.5 w-3.5" />
                                      Pause Task
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onStartTask(t.id);
                                      }}
                                    >
                                      <Play className="h-3.5 w-3.5" />
                                      {t.status === "paused"
                                        ? "Resume Task"
                                        : "Start Task"}
                                    </Button>
                                  ))}
                              </div>

                              {t.status !== "done" && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFinishTask(t);
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Finish Task
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Glass>
          );
        })}
      </div>
    </div>
  );
}
