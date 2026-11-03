import { RefreshCw, Sparkles } from "lucide-react";
import { Button, PriorityIcon } from "@/components/os/ui";
import type { Plan, Priority, PriorityId, Task } from "@/lib/os/types";
import { useOS } from "@/lib/os/store";
import { TEMPLATES, uid } from "@/lib/os/seed";
import { generateEvidenceAwareTaskRecommendations } from "@/lib/os/projects/recommendations";
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
  const { state } = useOS();

  const handleRegenerate = () => {
    const activeP1 = state.projects.find(
      (p) =>
        p.priorityId === 1 &&
        (p.id === priorities.find((pr) => pr.id === 1)?.activeProjectId ||
          p.status === "active"),
    );

    const generatedTasks: Task[] = priorities.flatMap((p) => {
      if (p.id === 1 && activeP1) {
        const evidenceRecs = generateEvidenceAwareTaskRecommendations({
          project: activeP1,
          priorityBottleneck: p.bottleneck,
          reviewBottlenecks: state.bottlenecks?.map((b) => b.title),
          availableHours: draft.allocation[1],
          energy: draft.context.energy,
        });

        if (evidenceRecs.length > 0) {
          return evidenceRecs.map((rec, i): Task => ({
            id: uid(),
            priorityId: 1,
            projectId: rec.projectId,
            milestoneId: rec.milestoneId,
            planOutcomeId: rec.planOutcomeId,
            scope: rec.scope,
            title: rec.title,
            duration: rec.duration,
            timeBlock: "",
            expectedOutput: rec.expectedOutput,
            successCriteria: rec.successCriteria,
            what: rec.what,
            how: rec.how,
            where: rec.where,
            kind: rec.kind,
            selected: i < 2,
            status: "pending",
            elapsedMs: 0,
          }));
        }
      }

      // Default template tasks for P2, P3, or P1 fallback
      return TEMPLATES[p.id].map((t, i): Task => ({
        ...t,
        title:
          i === 0 && p.id === 1
            ? p.project
              ? `Ship one improvement to ${p.project}`
              : "Ship one improvement to active product"
            : t.title,
        id: uid(),
        priorityId: p.id,
        projectId: p.activeProjectId,
        selected: i < 2,
        status: "pending" as const,
        elapsedMs: 0,
      }));
    });

    onChangeDraft((d) => ({
      ...d,
      tasks: generatedTasks,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Evidence-aware recommendations grounded in active project milestones
          and bottlenecks.
        </p>
        <Button size="sm" onClick={handleRegenerate}>
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate Evidence Tasks
        </Button>
      </div>

      {priorities.map((p) => {
        const pTasks = draft.tasks.filter((t) => t.priorityId === p.id);
        return (
          <div key={p.id}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <PriorityIcon id={p.id} className="h-7 w-7" />#{p.id} {p.name}
              </div>
              {p.id === 1 && (
                <span className="text-[11px] text-cyan font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Evidence-Aware Mode
                </span>
              )}
            </div>
            <div className="space-y-2">
              {pTasks.length > 0 ? (
                pTasks.map((t) => <TaskCard key={t.id} t={t} />)
              ) : (
                <div className="rounded-xl border border-dashed border-glass-border/60 p-4 text-center text-xs text-muted-foreground">
                  No proposed tasks for this priority. Click Regenerate to build
                  recommendations.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
