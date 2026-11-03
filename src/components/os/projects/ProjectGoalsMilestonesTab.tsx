import { useState } from "react";
import {
  Award,
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  History,
  Plus,
  RefreshCw,
  Star,
  Target,
} from "lucide-react";
import { Badge, Button, Input, Label, Textarea } from "@/components/os/ui";
import type { Metric, Milestone, Project, ProjectGoal } from "@/lib/os/types";
import { cn } from "@/lib/utils";
import {
  addMilestone,
  setPrimaryActiveMilestone,
} from "@/lib/os/projects/logic";
import { ProjectGoalTransitionModal } from "./ProjectGoalTransitionModal";
import { MilestoneAssessmentModal } from "./MilestoneAssessmentModal";

export interface ProjectGoalsMilestonesTabProps {
  draft: Project;
  onChange: (updated: Project) => void;
}

export function ProjectGoalsMilestonesTab({
  draft,
  onChange,
}: ProjectGoalsMilestonesTabProps) {
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [assessmentModalMs, setAssessmentModalMs] = useState<Milestone | null>(
    null,
  );
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  // New Milestone Form State
  const [newMsTitle, setNewMsTitle] = useState("");
  const [newMsObjective, setNewMsObjective] = useState("");
  const [newMsDeadline, setNewMsDeadline] = useState("");

  const canonicalGoals = draft.goals ?? draft.goalsHistory ?? [];
  const activeGoal =
    canonicalGoals.find(
      (g) => g.id === draft.activeGoalId && g.status === "active",
    ) ?? canonicalGoals.find((g) => g.status === "active");

  const resolvedGoals = canonicalGoals.filter((g) => g.id !== activeGoal?.id);

  const milestones = draft.milestones ?? [];

  const handleCreateMilestone = () => {
    if (!newMsTitle.trim()) return;
    const { project } = addMilestone(draft, {
      title: newMsTitle.trim(),
      objective: newMsObjective.trim(),
      deadline: newMsDeadline.trim(),
    });
    onChange(project);
    setNewMsTitle("");
    setNewMsObjective("");
    setNewMsDeadline("");
    setIsAddingMilestone(false);
  };

  const handleMakePrimary = (msId: string) => {
    const updated = setPrimaryActiveMilestone(draft, msId);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. MAJOR GOAL SECTION */}
      <div className="rounded-2xl border border-glass-border/80 bg-secondary/20 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan" />
            <h3 className="font-semibold text-sm text-foreground">
              Major Goal (Exactly One Active)
            </h3>
          </div>

          <Button
            size="sm"
            variant="glass"
            className="h-8 text-xs"
            onClick={() => setTransitionModalOpen(true)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {activeGoal ? "Transition Goal" : "Set Active Goal"}
          </Button>
        </div>

        {activeGoal ? (
          <div className="rounded-xl border border-cyan/40 bg-cyan/10 p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-sm text-foreground">
                {activeGoal.text}
              </span>
              <Badge className="bg-cyan/20 text-cyan text-[11px] shrink-0 border-cyan/40">
                Active Goal
              </Badge>
            </div>

            {activeGoal.targetDeadline && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-cyan" />
                Target Deadline: {activeGoal.targetDeadline}
              </div>
            )}

            {activeGoal.metrics.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {activeGoal.metrics.map((m, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-cyan/30 bg-secondary/60 px-2 py-0.5 text-xs text-foreground"
                  >
                    {m.label}: {m.target} (Current: {m.current || "0"})
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
            No active goal set for this project. Click "Set Active Goal" to
            establish the overarching founder objective.
          </div>
        )}

        {/* Resolved Goals History */}
        {resolvedGoals.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Resolved Goals History (
              {resolvedGoals.length})
            </span>
            <div className="space-y-2">
              {resolvedGoals.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border border-glass-border/60 bg-secondary/30 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {g.text}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-semibold text-[10px] capitalize",
                        g.status === "achieved"
                          ? "bg-success/20 text-success"
                          : g.status === "superseded"
                            ? "bg-cyan/20 text-cyan"
                            : "bg-destructive/20 text-destructive",
                      )}
                    >
                      {g.status}
                    </span>
                  </div>

                  {g.achievementEvidence && (
                    <p className="text-[11px] text-success/90">
                      <strong>Evidence:</strong> {g.achievementEvidence}
                    </p>
                  )}

                  {g.transitionReason && (
                    <p className="text-[11px] text-muted-foreground">
                      <strong>Rationale:</strong> {g.transitionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. MILESTONES SECTION */}
      <div className="rounded-2xl border border-glass-border/80 bg-secondary/20 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan" />
            <h3 className="font-semibold text-sm text-foreground">
              Sequential Milestones ({milestones.length})
            </h3>
          </div>

          <Button
            size="sm"
            variant="glass"
            className="h-8 text-xs"
            onClick={() => setIsAddingMilestone(!isAddingMilestone)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Milestone
          </Button>
        </div>

        {/* Add Milestone Inline Form */}
        {isAddingMilestone && (
          <div className="rounded-xl border border-cyan/40 bg-cyan/5 p-3.5 space-y-3">
            <Label className="text-cyan font-semibold text-xs mb-0">
              New Sequential Milestone
            </Label>
            <Input
              placeholder="Milestone Title (e.g. Milestone 2: Private Beta release)"
              value={newMsTitle}
              onChange={(e) => setNewMsTitle(e.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Objective / Deliverable summary"
                value={newMsObjective}
                onChange={(e) => setNewMsObjective(e.target.value)}
              />
              <Input
                placeholder="Target Deadline (e.g. 2026-12-15)"
                value={newMsDeadline}
                onChange={(e) => setNewMsDeadline(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddingMilestone(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleCreateMilestone}
              >
                Create Milestone
              </Button>
            </div>
          </div>
        )}

        {/* Milestone Cards List */}
        {milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.map((ms) => {
              const isPrimary = ms.isPrimaryActive && ms.status === "active";
              return (
                <div
                  key={ms.id}
                  className={cn(
                    "rounded-xl border p-4 space-y-2.5 transition-all",
                    isPrimary
                      ? "border-cyan/50 bg-cyan/10 shadow-sm"
                      : "border-glass-border/60 bg-secondary/30",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground font-semibold">
                          #{ms.order}
                        </span>
                        <h4 className="font-semibold text-sm text-foreground">
                          {ms.title}
                        </h4>
                        {isPrimary && (
                          <Badge className="bg-cyan/20 text-cyan text-[10px] border-cyan/40">
                            <Star className="h-2.5 w-2.5 inline mr-1 fill-cyan" />
                            Primary Active
                          </Badge>
                        )}
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.2 text-[10px] font-semibold capitalize",
                            ms.status === "completed"
                              ? "bg-success/20 text-success"
                              : ms.status === "active"
                                ? "bg-cyan/20 text-cyan"
                                : ms.status === "blocked"
                                  ? "bg-warning/20 text-warning"
                                  : "bg-muted/40 text-muted-foreground",
                          )}
                        >
                          {ms.status}
                        </span>
                      </div>
                      {ms.objective && (
                        <p className="text-xs text-muted-foreground">
                          {ms.objective}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPrimary && ms.status === "active" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleMakePrimary(ms.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="glass"
                        className="h-7 text-xs"
                        onClick={() => setAssessmentModalMs(ms)}
                      >
                        Assess Milestone
                      </Button>
                    </div>
                  </div>

                  {/* Deadline & Metrics Chips */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {ms.deadline && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        Deadline: {ms.deadline}
                      </span>
                    )}

                    {ms.metrics && ms.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ms.metrics.map((m, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-secondary/50 px-1.5 py-0.5 text-[10px]"
                          >
                            {m.label}: {m.target} (Current: {m.current || "0"})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Latest Assessment Summary */}
                  {ms.currentAssessment && (
                    <div className="rounded-lg border border-glass-border/40 bg-secondary/20 p-2.5 text-xs text-muted-foreground space-y-1">
                      <span className="font-semibold text-foreground text-[11px]">
                        Latest Assessment ({ms.currentAssessment.status}):
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {ms.currentAssessment.actualResultsSummary}
                      </p>
                      {ms.currentAssessment.founderNotes && (
                        <p className="text-[11px] italic text-muted-foreground/90">
                          "{ms.currentAssessment.founderNotes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
            No milestones created yet. Click "+ Add Milestone" to define
            sequential execution checkpoints.
          </div>
        )}
      </div>

      {/* Explicit Goal Transition Modal */}
      {transitionModalOpen && (
        <ProjectGoalTransitionModal
          open={transitionModalOpen}
          activeGoal={activeGoal}
          onClose={() => setTransitionModalOpen(false)}
          onTransition={(decision) => {
            // Update goals in draft
            const goals = draft.goals ? [...draft.goals] : [];
            const activeIdx = goals.findIndex(
              (g) => g.id === draft.activeGoalId,
            );
            const now = new Date().toISOString();

            let newGoal: ProjectGoal | undefined;
            if (decision.newGoalText) {
              newGoal = {
                id: `goal-${Date.now().toString(36)}`,
                projectId: draft.id,
                text: decision.newGoalText,
                metrics: decision.newGoalMetrics ?? [],
                targetDeadline: decision.newGoalDeadline,
                status: "active",
                createdAt: now,
              };
            }

            if (activeIdx !== -1) {
              goals[activeIdx] = {
                ...goals[activeIdx]!,
                status: decision.type,
                resolvedAt: now,
                achievementEvidence: decision.evidence,
                transitionReason: decision.reason,
                supersededBy: newGoal?.id,
              };
            }

            if (newGoal) {
              goals.push(newGoal);
            }

            onChange({
              ...draft,
              goals,
              goalsHistory: goals,
              activeGoalId:
                newGoal?.id ??
                (decision.type === "achieved" ? undefined : draft.activeGoalId),
            });
          }}
        />
      )}

      {/* Formal Milestone Assessment Modal */}
      {assessmentModalMs && (
        <MilestoneAssessmentModal
          open={Boolean(assessmentModalMs)}
          milestone={assessmentModalMs}
          onClose={() => setAssessmentModalMs(null)}
          onSaveAssessment={(assessmentData) => {
            const updatedMilestones = (draft.milestones ?? []).map((m) => {
              if (m.id === assessmentModalMs.id) {
                const assessment = {
                  ...assessmentData,
                  id: `eval-${Date.now().toString(36)}`,
                  milestoneId: m.id,
                  assessedAt: new Date().toISOString(),
                  assessedBy: "founder" as const,
                };
                return {
                  ...m,
                  status: assessmentData.status,
                  completedAt:
                    assessmentData.status === "completed"
                      ? new Date().toISOString()
                      : undefined,
                  currentAssessment: assessment,
                  assessmentHistory: [
                    ...(m.assessmentHistory ?? []),
                    assessment,
                  ],
                  metrics: assessmentData.actualMetrics,
                };
              }
              return m;
            });

            onChange({
              ...draft,
              milestones: updatedMilestones,
            });
          }}
        />
      )}
    </div>
  );
}
