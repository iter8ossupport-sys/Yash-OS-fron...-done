import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, CheckCircle2, Clock, Target, XCircle } from "lucide-react";
import { toast } from "sonner";
import { fmtMin, useOS } from "@/lib/os/store";
import {
  buildDayRecord,
  closeDay,
  type OutcomeEvaluationPayload,
} from "@/lib/os/logic";
import {
  Button,
  Input,
  Label,
  Modal,
  PriorityIcon,
  Textarea,
} from "@/components/os/ui";
import { cn } from "@/lib/utils";

export interface CloseoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CloseoutDialog({ open, onClose }: CloseoutDialogProps) {
  const { state, update } = useOS();
  const [learning, setLearning] = useState("");
  const nav = useNavigate();

  const activeP1 = state.projects.find(
    (p) => p.priorityId === 1 && p.status === "active",
  );

  const p1DailyOutcome =
    activeP1?.executionPlan?.currentApproved.outcomes.daily.find(
      (o) => o.status === "pending",
    );

  const [p1OutcomeStatus, setP1OutcomeStatus] = useState<
    "pending" | "achieved" | "missed"
  >("achieved");
  const [p1OutcomeEvidence, setP1OutcomeEvidence] = useState("");
  const [p1OutcomeNotes, setP1OutcomeNotes] = useState("");

  if (!open || !state.plan) return null;
  const rec = buildDayRecord(state.plan, learning);

  const handleCloseDay = () => {
    const evaluations: OutcomeEvaluationPayload[] = [];
    if (activeP1 && p1DailyOutcome) {
      evaluations.push({
        projectId: activeP1.id,
        outcomeId: p1DailyOutcome.id,
        status: p1OutcomeStatus,
        actualEvidenceSummary:
          p1OutcomeEvidence.trim() || "Evaluated during Day Closeout",
        founderNotes: p1OutcomeNotes.trim() || undefined,
      });
    }

    update((s) => closeDay(s, learning, Date.now(), evaluations));
    onClose();
    toast.success("Done for today. Saved to Reviews.");
    nav({ to: "/reviews" });
  };

  return (
    <Modal open onClose={onClose} title="Daily Closeout" wide>
      <div className="space-y-4">
        {/* Priority Planned vs Actual Grid */}
        <div className="grid gap-3 md:grid-cols-3">
          {state.priorities.map((p) => (
            <div key={p.id} className="rounded-2xl bg-secondary/40 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <PriorityIcon id={p.id} className="h-7 w-7" />
                {p.name}
              </div>
              <div>
                Planned {fmtMin(rec.plannedMin[p.id])} · Actual{" "}
                {fmtMin(rec.actualMin[p.id])}
              </div>
              <div
                className={
                  rec.outcomesAchieved.includes(p.id)
                    ? "text-success font-medium"
                    : "text-muted-foreground"
                }
              >
                Outcome{" "}
                {rec.outcomesAchieved.includes(p.id)
                  ? "achieved"
                  : "pending confirmation"}
              </div>
            </div>
          ))}
        </div>

        {/* Priority 1 Daily Outcome Assessment (Founder Evaluation) */}
        {activeP1 && p1DailyOutcome && (
          <div className="rounded-2xl border border-cyan/40 bg-cyan/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-cyan flex items-center gap-1.5 uppercase tracking-wide">
                <Target className="h-4 w-4 text-cyan" />
                Assess Daily Outcome: {activeP1.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Task output serves as evidence
              </span>
            </div>

            <div className="rounded-xl bg-background/50 p-3 space-y-1 text-xs">
              <span className="font-semibold text-foreground">
                {p1DailyOutcome.text}
              </span>
              {p1DailyOutcome.successCriteria && (
                <p className="text-[11px] text-muted-foreground">
                  <strong>Success Criteria:</strong>{" "}
                  {p1DailyOutcome.successCriteria}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs mb-0">
                Outcome Evaluation Decision
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setP1OutcomeStatus("achieved")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all",
                    p1OutcomeStatus === "achieved"
                      ? "border-success bg-success/20 text-success ring-1 ring-success"
                      : "border-glass-border bg-secondary/30 text-muted-foreground",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Achieved
                </button>

                <button
                  type="button"
                  onClick={() => setP1OutcomeStatus("pending")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all",
                    p1OutcomeStatus === "pending"
                      ? "border-cyan bg-cyan/20 text-cyan ring-1 ring-cyan"
                      : "border-glass-border bg-secondary/30 text-muted-foreground",
                  )}
                >
                  <Clock className="h-3.5 w-3.5" /> Pending
                </button>

                <button
                  type="button"
                  onClick={() => setP1OutcomeStatus("missed")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all",
                    p1OutcomeStatus === "missed"
                      ? "border-destructive bg-destructive/20 text-destructive ring-1 ring-destructive"
                      : "border-glass-border bg-secondary/30 text-muted-foreground",
                  )}
                >
                  <XCircle className="h-3.5 w-3.5" /> Missed
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                className="text-xs"
                placeholder="Evidence notes (e.g. PR merged, customer quotes)..."
                value={p1OutcomeEvidence}
                onChange={(e) => setP1OutcomeEvidence(e.target.value)}
              />
              <Input
                className="text-xs"
                placeholder="Optional founder retrospective notes..."
                value={p1OutcomeNotes}
                onChange={(e) => setP1OutcomeNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Task Outputs & Unfinished */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Outputs Captured ({rec.outputs.length})</Label>
            <ul className="space-y-1.5 text-sm">
              {rec.outputs.length ? (
                rec.outputs.map((o, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-foreground/80">
                      #{o.priorityId} {o.title}:
                    </span>
                    {o.workstream && (
                      <span className="rounded bg-cyan/15 px-1.5 py-0.2 text-[10px] font-medium text-cyan">
                        {o.workstream}
                      </span>
                    )}
                    <span className="text-muted-foreground">{o.text}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">No outputs recorded.</li>
              )}
            </ul>
          </div>
          <div>
            <Label>Unfinished Tasks ({rec.unfinished.length})</Label>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {rec.unfinished.length ? (
                rec.unfinished.map((u) => <li key={u}>{u}</li>)
              ) : (
                <li>All planned tasks completed!</li>
              )}
            </ul>
          </div>
        </div>

        {/* Learning */}
        <div>
          <Label>Most important learning today</Label>
          <Textarea
            placeholder="What is the single most valuable learning or operational insight from today's execution?"
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
          />
        </div>

        {/* Closeout Buttons */}
        <div className="mt-5 flex justify-end gap-2 border-t border-glass-border/60 pt-4">
          <Button onClick={onClose}>Not yet</Button>
          <Button variant="primary" onClick={handleCloseDay}>
            <Check className="h-4 w-4" />
            Done for Today
          </Button>
        </div>
      </div>
    </Modal>
  );
}
