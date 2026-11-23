/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Modal: Attach Empirical Evidence to Knowledge Unit
 */

import React, { useEffect, useState } from "react";
import { Modal, Button } from "@/components/os/ui";
import { Sparkles, AlertCircle } from "lucide-react";
import type { EvidenceEntity } from "../../../domain/entities";
import type { EvidencePolarity } from "../../../domain/enums";
import { validateEvidence } from "../../../domain/validation";
import { useP3 } from "../../context/P3Context";

export interface CreateEvidenceModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly initialKnowledgeUnitId?: string | undefined;
}

export function CreateEvidenceModal({
  open,
  onClose,
  initialKnowledgeUnitId,
}: CreateEvidenceModalProps) {
  const { knowledgeUnits, createEvidence } = useP3();

  const [knowledgeUnitId, setKnowledgeUnitId] = useState<string>(
    initialKnowledgeUnitId ?? (knowledgeUnits[0]?.id || ""),
  );
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("benchmark");
  const [polarity, setPolarity] = useState<EvidencePolarity>("supports");
  const [context, setContext] = useState("");
  const [qualityAssessment, setQualityAssessment] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setKnowledgeUnitId(
        initialKnowledgeUnitId ?? (knowledgeUnits[0]?.id || ""),
      );
    }
  }, [open, initialKnowledgeUnitId, knowledgeUnits]);

  const resetForm = () => {
    setKnowledgeUnitId(initialKnowledgeUnitId ?? (knowledgeUnits[0]?.id || ""));
    setDescription("");
    setEvidenceType("benchmark");
    setPolarity("supports");
    setContext("");
    setQualityAssessment("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const now = new Date().toISOString();
    const entity: EvidenceEntity = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      description: description.trim(),
      evidenceType: evidenceType.trim(),
      knowledgeUnitId,
      polarity,
      context: context.trim(),
      qualityAssessment:
        qualityAssessment.trim() || "Empirically verified in test environment",
      date: now,
      provenance: "Direct execution trace",
      classification: "general",
      createdAt: now,
    };

    const val = validateEvidence(entity);
    if (!val.valid) {
      setErrorMsg(val.errors.join("; "));
      return;
    }

    try {
      setIsSubmitting(true);
      await createEvidence(entity);
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
      title="Attach Empirical Evidence"
      wide
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Target Knowledge Unit <span className="text-destructive">*</span>
          </label>
          <select
            value={knowledgeUnitId}
            onChange={(e) => setKnowledgeUnitId(e.target.value)}
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
          >
            {knowledgeUnits.map((ku) => (
              <option key={ku.id} value={ku.id}>
                {ku.title} ({ku.perspective})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet" />
              Evidence Polarity <span className="text-destructive">*</span>
            </label>
            <select
              value={polarity}
              onChange={(e) => setPolarity(e.target.value as EvidencePolarity)}
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="supports">Supports Hypothesis / Model</option>
              <option value="challenges">Challenges / Disconfirms Model</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Evidence Type
            </label>
            <input
              type="text"
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              placeholder="e.g. latency benchmark, load trace, user feedback"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Evidence Description <span className="text-destructive">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What specific empirical measurement or observation was gathered?"
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Test Context & Methodology
          </label>
          <textarea
            rows={2}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Under what conditions, hardware, concurrency, or environment was this observed?"
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
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
            disabled={isSubmitting || !description.trim() || !knowledgeUnitId}
          >
            {isSubmitting ? "Attaching..." : "Attach Evidence"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
