import { BookOpen, Check, Pause, Play, Plus } from "lucide-react";
import { Badge, Button, Glass, Label } from "@/components/os/ui";
import { fmtMin, fmtTime } from "@/lib/os/store";
import { elapsed } from "@/lib/os/logic";
import type { KnowledgeItem, Plan, Priority, Task } from "@/lib/os/types";

export interface ActiveTaskCardProps {
  current: Task;
  plan: Plan;
  priorities: Priority[];
  knowledge: KnowledgeItem[];
  timerEnabled: boolean;
  now: number;
  onPauseTask: (id: string) => void;
  onStartTask: (id: string) => void;
  onFinishTask: (task: Task) => void;
  onViewKnowledge: (items: KnowledgeItem[]) => void;
  onLinkKnowledge: (taskId: string) => void;
}

export function ActiveTaskCard({
  current,
  plan,
  priorities,
  knowledge,
  timerEnabled,
  now,
  onPauseTask,
  onStartTask,
  onFinishTask,
  onViewKnowledge,
  onLinkKnowledge,
}: ActiveTaskCardProps) {
  const activePriority = priorities[current.priorityId - 1];
  const activeProjectId = activePriority?.activeProjectId;

  const relevantKnowledge = knowledge.filter((k) => {
    if ((current.knowledgeIds || []).includes(k.id)) return true;
    if ((plan.outcomeKnowledgeIds?.[current.priorityId] || []).includes(k.id))
      return true;
    if (activeProjectId && k.projectId === activeProjectId) return true;
    return false;
  });

  return (
    <Glass strong className="relative overflow-hidden p-6 md:p-8">
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              #{current.priorityId} {activePriority?.name}
            </Badge>
            <Badge>{activePriority?.project || "No active project"}</Badge>
            <Badge
              className={
                current.status === "active"
                  ? "text-success border-success/30 font-semibold"
                  : current.status === "paused"
                    ? "text-warning border-warning/30"
                    : current.status === "done"
                      ? "text-muted-foreground"
                      : ""
              }
            >
              {current.status === "active"
                ? "In progress"
                : current.status === "paused"
                  ? "Paused"
                  : current.status === "done"
                    ? "Completed"
                    : "Up next"}
            </Badge>
          </div>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            {current.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">
              Today's Outcome:
            </span>{" "}
            {plan.outcomes[current.priorityId]}
          </p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-glass-border bg-secondary/30 p-3">
              <Label className="mb-1 text-[11px]">Expected output</Label>
              <div className="text-xs text-foreground/90">
                {current.expectedOutput}
              </div>
            </div>
            <div className="rounded-xl border border-glass-border bg-secondary/30 p-3">
              <Label className="mb-1 text-[11px]">Success criteria</Label>
              <div className="text-xs text-foreground/90">
                {current.successCriteria}
              </div>
            </div>
          </div>

          {/* Optional Focused Knowledge Reference */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {relevantKnowledge.length > 0 && (
              <Button
                size="sm"
                variant="glass"
                onClick={() => onViewKnowledge(relevantKnowledge)}
                className="h-8 text-xs border-cyan/40 text-cyan hover:bg-cyan/15 glow"
                title="View linked principles, methods, and frameworks"
              >
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                Reference Knowledge ({relevantKnowledge.length})
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onLinkKnowledge(current.id)}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              title="Link principles, methods, or frameworks to this active task"
            >
              <Plus className="h-3 w-3 mr-1" />
              {relevantKnowledge.length > 0
                ? "Link More"
                : "Reference Knowledge"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {timerEnabled && (
            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-primary/60 glow">
              <div className="font-display text-3xl font-semibold tabular-nums">
                {fmtTime(elapsed(current, now))}
              </div>
              <div className="text-xs text-muted-foreground">
                of {fmtMin(current.duration)}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {current.status === "active" ? (
              <Button onClick={() => onPauseTask(current.id)}>
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={current.status === "done"}
                onClick={() => onStartTask(current.id)}
              >
                <Play className="h-4 w-4" />
                {current.status === "paused" ? "Resume" : "Start"}
              </Button>
            )}
            <Button variant="success" onClick={() => onFinishTask(current)}>
              <Check className="h-4 w-4" />
              Finish
            </Button>
          </div>
        </div>
      </div>
    </Glass>
  );
}
