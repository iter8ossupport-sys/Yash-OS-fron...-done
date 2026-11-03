import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Layers,
} from "lucide-react";
import { useOS } from "@/lib/os/store";
import type { Project } from "@/lib/os/types";
import { calculateProjectPerformance } from "@/lib/os/projects/logic";

export interface ProjectPerformanceTabProps {
  draft: Project;
}

export function ProjectPerformanceTab({ draft }: ProjectPerformanceTabProps) {
  const { state } = useOS();
  const perf = calculateProjectPerformance(draft, state.history);

  const milestonesWithAssessments = (draft.milestones ?? []).filter(
    (m) => (m.assessmentHistory ?? []).length > 0,
  );

  return (
    <div className="space-y-6">
      {/* 1. Multi-Dimensional Performance Metric Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-glass-border/70 bg-secondary/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-cyan" /> Actual Hours Logged
          </div>
          <div className="font-display text-xl font-bold text-foreground">
            {perf.totalActualHours}h
          </div>
          <span className="text-[11px] text-muted-foreground">
            Planned: {perf.totalPlannedHours}h
          </span>
        </div>

        <div className="rounded-xl border border-glass-border/70 bg-secondary/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Tasks
            Completed
          </div>
          <div className="font-display text-xl font-bold text-foreground">
            {perf.tasksDoneTotal} / {perf.tasksPlannedTotal}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {perf.taskCompletionRate}% task execution rate
          </span>
        </div>

        <div className="rounded-xl border border-glass-border/70 bg-secondary/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-violet" /> Active Execution
            Days
          </div>
          <div className="font-display text-xl font-bold text-foreground">
            {perf.activeDaysCount} days
          </div>
          <span className="text-[11px] text-muted-foreground">
            {perf.firstActiveDate
              ? `Since ${perf.firstActiveDate}`
              : "No days yet"}
          </span>
        </div>

        <div className="rounded-xl border border-glass-border/70 bg-secondary/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-warning" /> Deliverable Outputs
          </div>
          <div className="font-display text-xl font-bold text-foreground">
            {perf.outputsCount}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Recorded in Day Closeout
          </span>
        </div>
      </div>

      {/* 2. Formal Milestone Assessment History */}
      <div className="rounded-2xl border border-glass-border/80 bg-secondary/20 p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-glass-border/50 pb-3">
          <Layers className="h-4 w-4 text-cyan" />
          <h3 className="font-semibold text-sm text-foreground">
            Milestone Evaluation & Assessment Log
          </h3>
        </div>

        {milestonesWithAssessments.length > 0 ? (
          <div className="space-y-3">
            {milestonesWithAssessments.map((ms) => (
              <div key={ms.id} className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {ms.title}
                </span>
                {(ms.assessmentHistory ?? []).map((evalItem) => (
                  <div
                    key={evalItem.id}
                    className="rounded-xl border border-glass-border/60 bg-secondary/40 p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Status: {evalItem.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {evalItem.assessedAt?.slice(0, 10)}
                      </span>
                    </div>

                    <p className="text-[11px] text-foreground/90">
                      <strong>Deliverables:</strong>{" "}
                      {evalItem.actualResultsSummary}
                    </p>

                    {evalItem.founderNotes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        <strong>Founder Retrospective:</strong> "
                        {evalItem.founderNotes}"
                      </p>
                    )}

                    {evalItem.actualMetrics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {evalItem.actualMetrics.map((m, i) => (
                          <span
                            key={i}
                            className="rounded bg-secondary/60 px-2 py-0.5 text-[10px]"
                          >
                            {m.label}: {m.current} (target: {m.target})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
            No formal milestone evaluations logged yet. Conduct milestone
            assessments in the Goals & Milestones tab when checkpoints are
            reached.
          </div>
        )}
      </div>

      {/* 3. Task Deliverable Outputs History Feed */}
      <div className="rounded-2xl border border-glass-border/80 bg-secondary/20 p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-glass-border/50 pb-3">
          <History className="h-4 w-4 text-cyan" />
          <h3 className="font-semibold text-sm text-foreground">
            Task Deliverable Output History (Priority #{draft.priorityId})
          </h3>
        </div>

        {perf.outputs.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {perf.outputs.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-glass-border/60 bg-secondary/30 p-2.5 text-xs space-y-0.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {item.date}
                  </span>
                </div>
                <p className="text-muted-foreground leading-snug">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
            No recorded outputs for this priority yet. Outputs captured during
            Day Closeout will aggregate here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
