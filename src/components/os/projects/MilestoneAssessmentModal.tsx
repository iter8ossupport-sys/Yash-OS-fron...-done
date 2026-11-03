import { useState } from "react";
import {
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button, Input, Label, Modal, Textarea } from "@/components/os/ui";
import type { Metric, Milestone } from "@/lib/os/types";
import { cn } from "@/lib/utils";

export interface MilestoneAssessmentModalProps {
  open: boolean;
  milestone: Milestone;
  onClose: () => void;
  onSaveAssessment: (assessment: {
    status: "completed" | "blocked" | "abandoned" | "active";
    actualMetrics: Metric[];
    actualResultsSummary: string;
    evidenceReferences: string[];
    founderNotes: string;
    systemRecommendation?:
      "recommended_completed" | "recommended_blocked" | "needs_review";
  }) => void;
}

export function MilestoneAssessmentModal({
  open,
  milestone,
  onClose,
  onSaveAssessment,
}: MilestoneAssessmentModalProps) {
  const [status, setStatus] = useState<
    "completed" | "blocked" | "abandoned" | "active"
  >(milestone.status === "completed" ? "completed" : "completed");

  const [actualResults, setActualResults] = useState(
    milestone.currentAssessment?.actualResultsSummary || "",
  );
  const [evidenceText, setEvidenceText] = useState(
    milestone.currentAssessment?.evidenceReferences.join("\n") || "",
  );
  const [founderNotes, setFounderNotes] = useState(
    milestone.currentAssessment?.founderNotes || "",
  );

  const [metricValues, setMetricValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      (milestone.metrics ?? []).forEach((m) => {
        initial[m.label] = m.current || "";
      });
      return initial;
    },
  );

  if (!open) return null;

  const handleSave = () => {
    const updatedMetrics: Metric[] = (milestone.metrics ?? []).map((m) => ({
      ...m,
      current: metricValues[m.label] || m.current || "",
    }));

    const evidenceRefs = evidenceText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    onSaveAssessment({
      status,
      actualMetrics: updatedMetrics,
      actualResultsSummary: actualResults.trim(),
      evidenceReferences: evidenceRefs,
      founderNotes: founderNotes.trim(),
      systemRecommendation: "needs_review",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Formal Milestone Assessment — ${milestone.title}`}
      wide
    >
      <div className="space-y-5">
        {/* Milestone Context Summary */}
        <div className="rounded-xl border border-glass-border bg-secondary/30 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Target Objective & Deadline
          </span>
          <p className="text-sm font-medium text-foreground">
            {milestone.objective || milestone.title}
          </p>
          {milestone.deadline && (
            <span className="inline-block text-xs text-muted-foreground">
              Target Deadline: {milestone.deadline}
            </span>
          )}
        </div>

        {/* Milestone Assessment Status Selector */}
        <div>
          <Label>Assessment Decision</Label>
          <div className="grid gap-2.5 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setStatus("completed")}
              className={cn(
                "flex flex-col items-start rounded-xl border p-2.5 text-left transition-all",
                status === "completed"
                  ? "border-success bg-success/15 ring-1 ring-success text-foreground"
                  : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
              </div>
              <span className="mt-1 text-[11px] text-muted-foreground leading-tight">
                Objective achieved with verified deliverables.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatus("active")}
              className={cn(
                "flex flex-col items-start rounded-xl border p-2.5 text-left transition-all",
                status === "active"
                  ? "border-cyan bg-cyan/15 ring-1 ring-cyan text-foreground"
                  : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-cyan">
                <Clock className="h-3.5 w-3.5" /> Keep Active
              </div>
              <span className="mt-1 text-[11px] text-muted-foreground leading-tight">
                Execution ongoing; milestone not yet met.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatus("blocked")}
              className={cn(
                "flex flex-col items-start rounded-xl border p-2.5 text-left transition-all",
                status === "blocked"
                  ? "border-warning bg-warning/15 ring-1 ring-warning text-foreground"
                  : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-warning">
                <AlertTriangle className="h-3.5 w-3.5" /> Blocked
              </div>
              <span className="mt-1 text-[11px] text-muted-foreground leading-tight">
                Stalled by external blocker or dependency.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatus("abandoned")}
              className={cn(
                "flex flex-col items-start rounded-xl border p-2.5 text-left transition-all",
                status === "abandoned"
                  ? "border-destructive bg-destructive/15 ring-1 ring-destructive text-foreground"
                  : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-destructive">
                <XCircle className="h-3.5 w-3.5" /> Abandoned
              </div>
              <span className="mt-1 text-[11px] text-muted-foreground leading-tight">
                Milestone cancelled or deprioritized.
              </span>
            </button>
          </div>
        </div>

        {/* Metric Comparison */}
        {milestone.metrics && milestone.metrics.length > 0 && (
          <div className="rounded-xl border border-glass-border bg-secondary/20 p-3.5 space-y-2">
            <Label className="text-xs font-semibold mb-0">
              Metric Progress (Target vs Actual)
            </Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {milestone.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-glass-border/60 bg-secondary/40 p-2 text-xs"
                >
                  <div className="flex justify-between font-medium">
                    <span>{m.label}</span>
                    <span className="text-muted-foreground">
                      Target: {m.target}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px]">
                      Actual:
                    </span>
                    <Input
                      className="h-7 text-xs"
                      placeholder="Actual value"
                      value={metricValues[m.label] ?? ""}
                      onChange={(e) =>
                        setMetricValues({
                          ...metricValues,
                          [m.label]: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Narrative Results & Evidence Inputs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Actual Deliverables & Results</Label>
            <Textarea
              rows={3}
              placeholder="What tangible deliverables or code were shipped? Summarize the concrete outcome..."
              value={actualResults}
              onChange={(e) => setActualResults(e.target.value)}
            />
          </div>

          <div>
            <Label>Evidence References (URLs, Data logs)</Label>
            <Textarea
              rows={3}
              placeholder="Links to PRs, customer recordings, analytics dashboards (one per line)..."
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Founder Assessment & Retrospective Notes</Label>
          <Textarea
            rows={2}
            placeholder="Qualitative review: What went well? What caused friction? Lessons for the next milestone..."
            value={founderNotes}
            onChange={(e) => setFounderNotes(e.target.value)}
          />
        </div>

        {/* Modal Controls */}
        <div className="flex justify-end gap-2 border-t border-glass-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Check className="h-4 w-4" /> Save Milestone Assessment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
