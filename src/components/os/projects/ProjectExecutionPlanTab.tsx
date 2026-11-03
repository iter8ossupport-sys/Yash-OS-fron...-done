import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  History,
  Lock,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Badge, Button, Input, Label, Textarea } from "@/components/os/ui";
import type { PlanOutcomeItem, Project } from "@/lib/os/types";
import { cn } from "@/lib/utils";
import {
  approvePlanRevision,
  evaluateDailyOutcome,
} from "@/lib/os/projects/logic";

export interface ProjectExecutionPlanTabProps {
  draft: Project;
  onChange: (updated: Project) => void;
}

export function ProjectExecutionPlanTab({
  draft,
  onChange,
}: ProjectExecutionPlanTabProps) {
  const execPlan = draft.executionPlan;

  // New Outcome Inline Creation State
  const [addingHorizon, setAddingHorizon] = useState<
    "monthly" | "weekly" | "daily" | null
  >(null);
  const [outcomeText, setOutcomeText] = useState("");
  const [outcomeCriteria, setOutcomeCriteria] = useState("");

  // Daily Outcome Evaluation Dialog State
  const [evaluatingOutcome, setEvaluatingOutcome] =
    useState<PlanOutcomeItem | null>(null);
  const [evalStatus, setEvalStatus] = useState<
    "pending" | "achieved" | "missed"
  >("achieved");
  const [evalEvidence, setEvalEvidence] = useState("");
  const [evalNotes, setEvalNotes] = useState("");

  if (!execPlan) {
    return (
      <div className="rounded-2xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground">
        No execution plan found for this project. Save the project to initialize
        an authoritative Structured Execution Plan.
      </div>
    );
  }

  const { originalBaseline, currentApproved, proposedRevisions } = execPlan;

  const handleAddOutcome = (horizon: "monthly" | "weekly" | "daily") => {
    if (!outcomeText.trim()) return;
    const newItem: PlanOutcomeItem = {
      id: `out-${horizon.slice(0, 1)}-${Date.now().toString(36)}`,
      text: outcomeText.trim(),
      successCriteria: outcomeCriteria.trim(),
      status: "pending",
    };

    const currentOutcomes = currentApproved.outcomes[horizon] ?? [];
    const updatedApproved = {
      ...currentApproved,
      outcomes: {
        ...currentApproved.outcomes,
        [horizon]: [...currentOutcomes, newItem],
      },
    };

    onChange({
      ...draft,
      executionPlan: {
        ...execPlan,
        currentApproved: updatedApproved,
      },
    });

    setOutcomeText("");
    setOutcomeCriteria("");
    setAddingHorizon(null);
  };

  const handleSaveEvaluation = () => {
    if (!evaluatingOutcome) return;
    const { project } = evaluateDailyOutcome(draft, evaluatingOutcome.id, {
      status: evalStatus,
      actualEvidenceSummary: evalEvidence.trim() || "Evaluated by founder",
      linkedTaskOutputs: [],
      founderNotes: evalNotes.trim(),
    });
    onChange(project);
    setEvaluatingOutcome(null);
    setEvalEvidence("");
    setEvalNotes("");
  };

  const handleApproveRevision = (revId: string) => {
    const updated = approvePlanRevision(draft, revId, "Founder");
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. ORIGINAL BASELINE (Immutable Benchmark) */}
      <div className="rounded-xl border border-glass-border/60 bg-secondary/20 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Original Plan
            Baseline
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Locked on {originalBaseline.setAt?.slice(0, 10)}
          </span>
        </div>
        <p className="text-xs text-foreground/90 font-medium">
          Goal:{" "}
          {originalBaseline.goalSnapshotText ||
            draft.objective ||
            "Initial plan"}
        </p>
        <div className="text-[11px] text-muted-foreground">
          Milestones at Baseline:{" "}
          {originalBaseline.milestoneTitles.join(", ") || "Initial Milestone"}
        </div>
      </div>

      {/* 2. CURRENT APPROVED PLAN (Authoritative Operational Driver) */}
      <div className="rounded-2xl border border-glass-border/80 bg-secondary/20 p-4 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/50 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">
              Current Approved Plan (Version {currentApproved.version})
            </h3>
            <Badge className="bg-cyan/20 text-cyan text-[10px] border-cyan/40">
              Active Driver
            </Badge>
          </div>
        </div>

        {/* 3 Outcome Horizons */}
        <div className="space-y-4">
          {/* Monthly Outcomes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                Monthly Outcomes ({currentApproved.outcomes.monthly.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setAddingHorizon("monthly")}
              >
                <Plus className="h-3 w-3" /> Add Monthly Target
              </Button>
            </div>

            {addingHorizon === "monthly" && (
              <div className="rounded-xl border border-cyan/40 bg-cyan/5 p-3 space-y-2">
                <Input
                  className="text-xs"
                  placeholder="Monthly outcome text (e.g. 10 paid customer trials active)"
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                />
                <Input
                  className="text-xs"
                  placeholder="Success criteria (e.g. 10 active Stripe subscription IDs)"
                  value={outcomeCriteria}
                  onChange={(e) => setOutcomeCriteria(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAddingHorizon(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddOutcome("monthly")}
                  >
                    Save Target
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {currentApproved.outcomes.monthly.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-glass-border/60 bg-secondary/40 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {m.text}
                    </span>
                    {m.successCriteria && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Criteria: {m.successCriteria}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-semibold capitalize",
                      m.status === "achieved"
                        ? "bg-success/20 text-success"
                        : m.status === "missed"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-cyan/15 text-cyan",
                    )}
                  >
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Outcomes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                Weekly Outcomes ({currentApproved.outcomes.weekly.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setAddingHorizon("weekly")}
              >
                <Plus className="h-3 w-3" /> Add Weekly Target
              </Button>
            </div>

            {addingHorizon === "weekly" && (
              <div className="rounded-xl border border-cyan/40 bg-cyan/5 p-3 space-y-2">
                <Input
                  className="text-xs"
                  placeholder="Weekly outcome text"
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                />
                <Input
                  className="text-xs"
                  placeholder="Success criteria"
                  value={outcomeCriteria}
                  onChange={(e) => setOutcomeCriteria(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAddingHorizon(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddOutcome("weekly")}
                  >
                    Save Target
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {currentApproved.outcomes.weekly.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg border border-glass-border/60 bg-secondary/40 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {w.text}
                    </span>
                    {w.successCriteria && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Criteria: {w.successCriteria}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-semibold capitalize",
                      w.status === "achieved"
                        ? "bg-success/20 text-success"
                        : w.status === "missed"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-cyan/15 text-cyan",
                    )}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Outcomes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                Daily Outcomes ({currentApproved.outcomes.daily.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setAddingHorizon("daily")}
              >
                <Plus className="h-3 w-3" /> Add Daily Target
              </Button>
            </div>

            {addingHorizon === "daily" && (
              <div className="rounded-xl border border-cyan/40 bg-cyan/5 p-3 space-y-2">
                <Input
                  className="text-xs"
                  placeholder="Daily outcome text (feeds daily plan recommendations)"
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                />
                <Input
                  className="text-xs"
                  placeholder="Success criteria (how do you prove this was done?)"
                  value={outcomeCriteria}
                  onChange={(e) => setOutcomeCriteria(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAddingHorizon(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddOutcome("daily")}
                  >
                    Save Target
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {currentApproved.outcomes.daily.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-glass-border/60 bg-secondary/40 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-foreground">
                        {d.text}
                      </span>
                      {d.successCriteria && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          <strong>Criteria:</strong> {d.successCriteria}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-semibold capitalize",
                          d.status === "achieved"
                            ? "bg-success/20 text-success"
                            : d.status === "missed"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-cyan/15 text-cyan",
                        )}
                      >
                        {d.status}
                      </span>
                      <Button
                        size="sm"
                        variant="glass"
                        className="h-6 text-[10px] px-2"
                        onClick={() => {
                          setEvaluatingOutcome(d);
                          setEvalStatus(d.status);
                          setEvalEvidence(d.evidenceNotes || "");
                        }}
                      >
                        Evaluate
                      </Button>
                    </div>
                  </div>

                  {d.evidenceNotes && (
                    <p className="text-[11px] text-success/90">
                      <strong>Evidence:</strong> {d.evidenceNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROPOSED REVISIONS QUEUE */}
      {proposedRevisions.length > 0 && (
        <div className="rounded-xl border border-glass-border bg-secondary/20 p-4 space-y-3">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-cyan" /> Proposed Plan
            Revisions ({proposedRevisions.length})
          </span>
          <div className="space-y-2">
            {proposedRevisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center justify-between rounded-lg border border-glass-border/60 bg-secondary/40 p-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-foreground">
                    Revision v{rev.version}: {rev.reason}
                  </span>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Proposed on {rev.proposedAt?.slice(0, 10)} by{" "}
                    {rev.proposedBy} · Status: {rev.status}
                  </div>
                </div>

                {rev.status === "proposed" && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="h-7 text-xs"
                    onClick={() => handleApproveRevision(rev.id)}
                  >
                    Approve Revision
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Outcome Evaluation Modal */}
      {evaluatingOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-glass-border bg-background p-5 shadow-2xl space-y-4">
            <h4 className="font-semibold text-sm text-foreground">
              Evaluate Daily Outcome: {evaluatingOutcome.text}
            </h4>

            {evaluatingOutcome.successCriteria && (
              <div className="rounded-lg bg-secondary/40 p-2.5 text-xs text-muted-foreground">
                <strong>Success Criteria:</strong>{" "}
                {evaluatingOutcome.successCriteria}
              </div>
            )}

            <div>
              <Label>Outcome Status Decision</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEvalStatus("achieved")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold",
                    evalStatus === "achieved"
                      ? "border-success bg-success/20 text-success"
                      : "border-glass-border bg-secondary/30 text-muted-foreground",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Achieved
                </button>

                <button
                  type="button"
                  onClick={() => setEvalStatus("pending")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold",
                    evalStatus === "pending"
                      ? "border-cyan bg-cyan/20 text-cyan"
                      : "border-glass-border bg-secondary/30 text-muted-foreground",
                  )}
                >
                  <Clock className="h-3.5 w-3.5" /> Pending
                </button>

                <button
                  type="button"
                  onClick={() => setEvalStatus("missed")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold",
                    evalStatus === "missed"
                      ? "border-destructive bg-destructive/20 text-destructive"
                      : "border-glass-border bg-secondary/30 text-muted-foreground",
                  )}
                >
                  <XCircle className="h-3.5 w-3.5" /> Missed
                </button>
              </div>
            </div>

            <div>
              <Label>Actual Evidence Summary</Label>
              <Textarea
                rows={2}
                placeholder="What concrete evidence demonstrates this outcome was met?"
                value={evalEvidence}
                onChange={(e) => setEvalEvidence(e.target.value)}
              />
            </div>

            <div>
              <Label>Founder Notes</Label>
              <Input
                placeholder="Optional retrospective note..."
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-glass-border pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEvaluatingOutcome(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveEvaluation}
              >
                Save Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
