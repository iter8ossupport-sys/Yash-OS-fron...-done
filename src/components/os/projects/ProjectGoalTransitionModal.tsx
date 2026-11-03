import { useState } from "react";
import { Award, Ban, Check, History, Plus, RefreshCw, X } from "lucide-react";
import { Button, Input, Label, Modal, Textarea } from "@/components/os/ui";
import type { Metric, ProjectGoal } from "@/lib/os/types";
import { cn } from "@/lib/utils";

export interface ProjectGoalTransitionModalProps {
  open: boolean;
  activeGoal?: ProjectGoal | undefined;
  onClose: () => void;
  onTransition: (decision: {
    type: "achieved" | "superseded" | "abandoned";
    evidence?: string | undefined;
    reason?: string | undefined;
    newGoalText?: string | undefined;
    newGoalMetrics?: Metric[] | undefined;
    newGoalDeadline?: string | undefined;
  }) => void;
}

export function ProjectGoalTransitionModal({
  open,
  activeGoal,
  onClose,
  onTransition,
}: ProjectGoalTransitionModalProps) {
  const [decisionType, setDecisionType] = useState<
    "achieved" | "superseded" | "abandoned"
  >("achieved");
  const [evidence, setEvidence] = useState("");
  const [reason, setReason] = useState("");
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricLabel, setMetricLabel] = useState("");
  const [metricTarget, setMetricTarget] = useState("");

  if (!open) return null;

  const handleAddMetric = () => {
    if (!metricLabel.trim() || !metricTarget.trim()) return;
    setMetrics([
      ...metrics,
      { label: metricLabel.trim(), target: metricTarget.trim(), current: "0" },
    ]);
    setMetricLabel("");
    setMetricTarget("");
  };

  const handleRemoveMetric = (idx: number) => {
    setMetrics(metrics.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    onTransition({
      type: decisionType,
      evidence: decisionType === "achieved" ? evidence : undefined,
      reason: decisionType !== "achieved" ? reason : undefined,
      newGoalText: newGoalText.trim() || undefined,
      newGoalMetrics: metrics.length > 0 ? metrics : undefined,
      newGoalDeadline: newGoalDeadline.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Resolve Active Major Goal" wide>
      <div className="space-y-5">
        {/* Current Active Goal Banner */}
        {activeGoal && (
          <div className="rounded-xl border border-glass-border/70 bg-secondary/40 p-3.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Current Active Goal
            </span>
            <p className="mt-1 text-sm font-medium text-foreground">
              {activeGoal.text}
            </p>
            {activeGoal.metrics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {activeGoal.metrics.map((m, i) => (
                  <span
                    key={i}
                    className="rounded bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {m.label}: {m.target} (current: {m.current || "0"})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transition Decision Selector */}
        <div>
          <Label>Resolution Decision</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setDecisionType("achieved")}
              className={cn(
                "flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                decisionType === "achieved"
                  ? "border-success bg-success/15 ring-1 ring-success text-foreground"
                  : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-sm text-success">
                <Award className="h-4 w-4" /> Goal Achieved
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                Target metrics reached with verified market evidence.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDecisionType("superseded")}
              className={cn(
                "flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                decisionType === "superseded"
                  ? "border-cyan bg-cyan/15 ring-1 ring-cyan text-foreground"
                  : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-sm text-cyan">
                <RefreshCw className="h-4 w-4" /> Goal Superseded
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                Strategic pivot or replaced by higher-leverage objective.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDecisionType("abandoned")}
              className={cn(
                "flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                decisionType === "abandoned"
                  ? "border-destructive bg-destructive/15 ring-1 ring-destructive text-foreground"
                  : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-sm text-destructive">
                <Ban className="h-4 w-4" /> Goal Abandoned
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                Premise invalidated or dropped from active priorities.
              </span>
            </button>
          </div>
        </div>

        {/* Evidence or Reason Inputs */}
        {decisionType === "achieved" ? (
          <div>
            <Label>Achievement Evidence (Required)</Label>
            <Textarea
              rows={3}
              placeholder="Cite customer quotes, verified transaction URLs, or actual metrics achieved..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <Label>Transition Rationale (Required)</Label>
            <Textarea
              rows={3}
              placeholder="Why is this goal being superseded or abandoned? Document the strategic rationale..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        {/* Next Goal Creation (Optional if superseded/achieved) */}
        <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-cyan" />
            <span className="text-sm font-semibold text-foreground">
              Define Next Major Goal (Optional)
            </span>
          </div>
          <div>
            <Label>New Goal Statement</Label>
            <Input
              placeholder="e.g. Secure 5 paid pilot customer contracts..."
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Target Deadline</Label>
              <Input
                placeholder="e.g. 2026-12-31"
                value={newGoalDeadline}
                onChange={(e) => setNewGoalDeadline(e.target.value)}
              />
            </div>
            <div>
              <Label>Target Metrics</Label>
              <div className="flex gap-2">
                <Input
                  className="text-xs"
                  placeholder="Metric (e.g. MRR)"
                  value={metricLabel}
                  onChange={(e) => setMetricLabel(e.target.value)}
                />
                <Input
                  className="text-xs"
                  placeholder="Target (e.g. $1000)"
                  value={metricTarget}
                  onChange={(e) => setMetricTarget(e.target.value)}
                />
                <Button size="sm" variant="glass" onClick={handleAddMetric}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          {metrics.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {metrics.map((m, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-glass-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground"
                >
                  {m.label}: {m.target}
                  <button
                    type="button"
                    onClick={() => handleRemoveMetric(idx)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-2 border-t border-glass-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <Check className="h-4 w-4" /> Save Resolution
          </Button>
        </div>
      </div>
    </Modal>
  );
}
