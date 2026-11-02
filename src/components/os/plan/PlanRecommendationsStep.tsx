import { RefreshCw } from "lucide-react";
import { Button, PriorityIcon } from "@/components/os/ui";
import type { Plan, Priority } from "@/lib/os/types";
import { recommendTasks } from "@/lib/os/seed";
import { TaskCard } from "./TaskCard";

export interface PlanRecommendationsStepProps {
  draft: Plan;
  priorities: Priority[];
  onChangeDraft: (fn: (d: Plan) => Plan) => void;
}

export function PlanRecommendationsStep({
  draft,
  priorities,
  onChangeDraft,
}: PlanRecommendationsStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Three proposed tasks per priority (template suggestions — AI-ready).
        </p>
        <Button
          size="sm"
          onClick={() =>
            onChangeDraft((d) => ({
              ...d,
              tasks: recommendTasks(priorities),
            }))
          }
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </Button>
      </div>
      {priorities.map((p) => (
        <div key={p.id}>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <PriorityIcon id={p.id} className="h-7 w-7" />#{p.id} {p.name}
          </div>
          <div className="space-y-2">
            {draft.tasks
              .filter((t) => t.priorityId === p.id)
              .map((t) => (
                <TaskCard key={t.id} t={t} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
