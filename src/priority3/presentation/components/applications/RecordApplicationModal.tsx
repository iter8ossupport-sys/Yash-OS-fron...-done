/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Modal: Record Knowledge Application in Real Work
 *
 * Strict Architectural Rule: Bridges knowledge mental models to practical
 * execution trials inside P1 (Venture) or P2 (Cashflow/Trading).
 */

import React, { useState } from "react";
import { Modal, Button } from "@/components/os/ui";
import {
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { ApplicationRecordEntity } from "../../../domain/entities";
import { validateApplicationRecord } from "../../../domain/validation";
import { useP3 } from "../../context/P3Context";

export interface RecordApplicationModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly initialKnowledgeUnitId?: string | undefined;
}

export function RecordApplicationModal({
  open,
  onClose,
  initialKnowledgeUnitId,
}: RecordApplicationModalProps) {
  const { knowledgeUnits, createApplication } = useP3();

  const [title, setTitle] = useState("");
  const [selectedKuIds, setSelectedKuIds] = useState<string[]>(
    initialKnowledgeUnitId ? [initialKnowledgeUnitId] : [],
  );
  const [operationalArea, setOperationalArea] = useState<"p1" | "p2">("p1");
  const [refLabel, setRefLabel] = useState("");
  const [contextAndProblem, setContextAndProblem] = useState("");
  const [intendedAction, setIntendedAction] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [actualOutcome, setActualOutcome] = useState("");
  const [outcomeMatched, setOutcomeMatched] = useState<boolean>(true);
  const [evidence, setEvidence] = useState("");
  const [reflectionAndLessons, setReflectionAndLessons] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setSelectedKuIds(initialKnowledgeUnitId ? [initialKnowledgeUnitId] : []);
    setOperationalArea("p1");
    setRefLabel("");
    setContextAndProblem("");
    setIntendedAction("");
    setExpectedOutcome("");
    setActualOutcome("");
    setOutcomeMatched(true);
    setEvidence("");
    setReflectionAndLessons("");
    setErrorMsg(null);
  };

  const handleKuToggle = (kuId: string) => {
    setSelectedKuIds((prev) =>
      prev.includes(kuId) ? prev.filter((id) => id !== kuId) : [...prev, kuId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const now = new Date().toISOString();
    const entity: ApplicationRecordEntity = {
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      contextAndProblem: contextAndProblem.trim(),
      connectedKnowledgeUnitIds: selectedKuIds,
      relatedP1Reference:
        operationalArea === "p1"
          ? { label: refLabel.trim() || "P1 Venture Execution" }
          : undefined,
      relatedP2Reference:
        operationalArea === "p2"
          ? {
              workstream: "A",
              label: refLabel.trim() || "P2 Trading & Cashflow Execution",
            }
          : undefined,
      intendedAction: intendedAction.trim(),
      expectedOutcome: expectedOutcome.trim(),
      actualOutcome: actualOutcome.trim(),
      outcomeMatched,
      evidence: evidence.trim(),
      reflectionAndLessons: reflectionAndLessons.trim(),
      followUpQuestions: [],
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    const val = validateApplicationRecord(entity);
    if (!val.valid) {
      setErrorMsg(val.errors.join("; "));
      return;
    }

    try {
      setIsSubmitting(true);
      await createApplication(entity);
      resetForm();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Record Knowledge Application in Real Work"
      wide
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <PlayCircle className="h-3.5 w-3.5 text-violet" />
              Trial / Application Title{" "}
              <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Swapped Default Allocator to jemalloc in Feed Ingestion"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Operational Domain
            </label>
            <select
              value={operationalArea}
              onChange={(e) =>
                setOperationalArea(e.target.value as "p1" | "p2")
              }
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="p1">Priority 1 (Venture / Product)</option>
              <option value="p2">Priority 2 (Trading / Cashflow)</option>
            </select>
          </div>
        </div>

        {/* Multi-select connected Knowledge Units */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground block">
            Connected Knowledge Units ({selectedKuIds.length} linked)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl border border-glass-border/70 bg-secondary/20">
            {knowledgeUnits.map((ku) => {
              const isSelected = selectedKuIds.includes(ku.id);
              return (
                <button
                  key={ku.id}
                  type="button"
                  onClick={() => handleKuToggle(ku.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                    isSelected
                      ? "border border-violet/60 bg-violet/20 text-violet"
                      : "border border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ku.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Task Context & Problem
            </label>
            <textarea
              rows={2}
              value={contextAndProblem}
              onChange={(e) => setContextAndProblem(e.target.value)}
              placeholder="What concrete operational bottleneck or task needed solving?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Intended Action (Execution Trial)
            </label>
            <textarea
              rows={2}
              value={intendedAction}
              onChange={(e) => setIntendedAction(e.target.value)}
              placeholder="What specific implementation change or experiment was deployed?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Expected Outcome (Hypothesis)
            </label>
            <textarea
              rows={2}
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="What did your mental model predict would happen?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Actual Outcome (Reality Feedback)
            </label>
            <textarea
              rows={2}
              value={actualOutcome}
              onChange={(e) => setActualOutcome(e.target.value)}
              placeholder="What actually occurred when tested in reality?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
            />
          </div>
        </div>

        {/* Outcome Matched Toggle */}
        <div className="flex items-center gap-3 rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
          <span className="text-xs font-semibold text-foreground">
            Did Reality Match Expected Hypothesis?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOutcomeMatched(true)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                outcomeMatched
                  ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                  : "border border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Yes (Hypothesis
              Validated)
            </button>
            <button
              type="button"
              onClick={() => setOutcomeMatched(false)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                !outcomeMatched
                  ? "border border-amber-500/50 bg-amber-500/20 text-amber-300"
                  : "border border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> No (Surprise / Boundary
              Discovered)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Verifiable Evidence / Proof Output
            </label>
            <textarea
              rows={2}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Benchmark metric, latency delta, compiler log, or production telemetry"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Reflection & Architectural Lessons
            </label>
            <textarea
              rows={2}
              value={reflectionAndLessons}
              onChange={(e) => setReflectionAndLessons(e.target.value)}
              placeholder="What invariant rule or boundary should update our mental model?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-glass-border/70">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? "Saving Trial..." : "Save Application Record"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
