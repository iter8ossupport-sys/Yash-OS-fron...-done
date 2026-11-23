/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Interactive Review Modal (Weekly Learning & Monthly Capability)
 *
 * Implements the 5 structured reflection prompts:
 * 1. Key Findings & Empirical Insights
 * 2. Updated Understanding & Revisions
 * 3. Unresolved Inquiries & Gaps
 * 4. 4-Dimension Qualitative Capability Evidence
 * 5. Next Focus & Action
 *
 * Architecture Rule: Never duplicates OS state.history. Stores pure learning/capability reflections.
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import { ClipboardCheck, Sparkles, Brain, Target } from "lucide-react";
import { getISOWeekRange } from "@/lib/os/reviews/analytics";
import { useP3 } from "../../context/P3Context";
import type { ReviewType, CapabilityDimension } from "../../../domain/enums";
import type { ReviewEntity } from "../../../domain/entities";

interface ConductReviewModalProps {
  readonly open: boolean;
  readonly type: ReviewType;
  readonly onClose: () => void;
}

export function ConductReviewModal({
  open,
  type,
  onClose,
}: ConductReviewModalProps) {
  const { createReview } = useP3();

  // Default period: e.g. 2026-W47 or 2026-M11
  const defaultPeriod =
    type === "weekly_learning_review"
      ? getISOWeekRange(new Date()).id
      : `${new Date().getFullYear()}-M${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const [period, setPeriod] = useState(defaultPeriod);
  const [findings, setFindings] = useState("");
  const [updatedUnderstanding, setUpdatedUnderstanding] = useState("");
  const [unresolvedQuestionsText, setUnresolvedQuestionsText] = useState("");
  const [nextFocus, setNextFocus] = useState("");

  // 4 Dimensions Qualitative Assessments
  const [understandingAssessment, setUnderstandingAssessment] = useState("");
  const [reasoningAssessment, setReasoningAssessment] = useState("");
  const [transferAssessment, setTransferAssessment] = useState("");
  const [realityAssessment, setRealityAssessment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const isWeekly = type === "weekly_learning_review";
  const title = isWeekly
    ? "Conduct Weekly Learning Review"
    : "Conduct Monthly Capability Review";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findings.trim() || !updatedUnderstanding.trim() || !nextFocus.trim()) {
      setError(
        "Findings, Updated Understanding, and Next Focus are all required.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const now = new Date().toISOString();
      const id = `rev-${type === "weekly_learning_review" ? "wk" : "mo"}-${Date.now()}`;

      const unresolvedQuestions = unresolvedQuestionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const review: ReviewEntity = {
        id,
        type,
        period: period.trim(),
        findings: findings.trim(),
        updatedUnderstanding: updatedUnderstanding.trim(),
        unresolvedQuestions,
        capabilityEvidence: [
          {
            dimension: "understanding",
            qualitativeAssessment:
              understandingAssessment.trim() ||
              "Grounded in verified principles and mechanisms.",
            supportingEvidence: [],
          },
          {
            dimension: "reasoning",
            qualitativeAssessment:
              reasoningAssessment.trim() ||
              "Demonstrated deductive debugging across bottlenecks.",
            supportingEvidence: [],
          },
          {
            dimension: "transfer",
            qualitativeAssessment:
              transferAssessment.trim() ||
              "Applied principles directly to P1/P2 execution trials.",
            supportingEvidence: [],
          },
          {
            dimension: "reality_accuracy",
            qualitativeAssessment:
              realityAssessment.trim() ||
              "Calibrated against empirical metrics without wishful thinking.",
            supportingEvidence: [],
          },
        ],
        nextFocus: nextFocus.trim(),
        approvalState: "approved",
        classification: "general",
        createdAt: now,
        updatedAt: now,
      };

      await createReview(review);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-p3-modal-backdrop backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-glass-border bg-card/95 p-6 shadow-2xl backdrop-blur-md my-8">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          {title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Deliberate reflection grounded in empirical evidence. Evaluates
          progress across the 4 founder capability dimensions.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Review Period *
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. 2026-W47 or 2026-M11"
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Prompt 1 */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1 flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                1
              </span>
              Key Findings & Discoveries *
            </label>
            <textarea
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="What non-obvious facts, mechanisms, or bottleneck causes did you discover through investigation and execution?"
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Prompt 2 */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1 flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              Updated Understanding & Revised Mental Models *
            </label>
            <textarea
              rows={3}
              value={updatedUnderstanding}
              onChange={(e) => setUpdatedUnderstanding(e.target.value)}
              placeholder="What mental model or invariant rule was updated or proven false? How has your internal map of reality shifted?"
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Prompt 3 */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1 flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              Unresolved Questions & Friction Points (one per line)
            </label>
            <textarea
              rows={2}
              value={unresolvedQuestionsText}
              onChange={(e) => setUnresolvedQuestionsText(e.target.value)}
              placeholder="What remains uncertain or conflicting with evidence? (Separate by line)"
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
            />
          </div>

          {/* Prompt 4: 4 Dimensions Qualitative Evidence */}
          <div className="rounded-lg border border-glass-border bg-secondary/20 p-3.5 space-y-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                4
              </span>
              Capability Evidence Calibration (4 Dimensions)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">
                  A. Understanding (Mechanisms & Invariants)
                </label>
                <input
                  type="text"
                  value={understandingAssessment}
                  onChange={(e) => setUnderstandingAssessment(e.target.value)}
                  placeholder="e.g. Mastered jemalloc arena hashing"
                  className="w-full rounded border border-glass-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">
                  B. Reasoning (Deductive Root-Cause Debugging)
                </label>
                <input
                  type="text"
                  value={reasoningAssessment}
                  onChange={(e) => setReasoningAssessment(e.target.value)}
                  placeholder="e.g. Traced cache invalidation via perf c2c"
                  className="w-full rounded border border-glass-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">
                  C. Transfer (Cross-Domain P1/P2 Application)
                </label>
                <input
                  type="text"
                  value={transferAssessment}
                  onChange={(e) => setTransferAssessment(e.target.value)}
                  placeholder="e.g. Applied concurrency model to Killarity feed"
                  className="w-full rounded border border-glass-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">
                  D. Reality Accuracy (Predictive Calibration)
                </label>
                <input
                  type="text"
                  value={realityAssessment}
                  onChange={(e) => setRealityAssessment(e.target.value)}
                  placeholder="e.g. Real latency matched predicted sub-millisecond envelope"
                  className="w-full rounded border border-glass-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Prompt 5 */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1 flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                5
              </span>
              Next Focus & Primary Invariant to Master *
            </label>
            <input
              type="text"
              value={nextFocus}
              onChange={(e) => setNextFocus(e.target.value)}
              placeholder="Immediate next bottleneck or foundational concept to deconstruct..."
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Review..." : "Complete & Save Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
