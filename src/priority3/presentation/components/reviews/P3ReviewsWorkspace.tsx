/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Period Reviews & Metacognitive Knowledge Audits
 *
 * Grounded in empirical evidence and the 4 capability dimensions.
 * Does NOT duplicate OS state.history.
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import {
  Layers,
  Calendar,
  CheckCircle2,
  BookOpen,
  Lightbulb,
  PlayCircle,
  Clock,
  Sparkles,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useP3 } from "../../context/P3Context";
import { ConductReviewModal } from "./ConductReviewModal";
import type { ReviewType } from "../../../domain/enums";

export function P3ReviewsWorkspace() {
  const { reviews, sessions, knowledgeUnits, applications } = useP3();
  const [activeReviewModalType, setActiveReviewModalType] =
    useState<ReviewType | null>(null);

  // Metrics for current review cycle
  const recentSessions = sessions.slice(0, 5);
  const recentUnits = knowledgeUnits.slice(0, 5);
  const recentApps = applications.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header & Review Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-5 rounded-2xl border border-p3-border bg-p3-surface">
        <div>
          <h3 className="text-sm font-semibold text-p3-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-p3-accent" />
            Learning & Knowledge Intelligence Reviews ({reviews.length})
          </h3>
          <p className="text-xs text-p3-text-secondary mt-0.5">
            Periodic qualitative audits. Grounded in empirical proof and
            execution trials across 4 capability dimensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveReviewModalType("weekly_learning_review")}
            className="flex items-center gap-1.5 rounded-md border border-p3-border bg-p3-surface px-3.5 py-1.5 text-xs font-semibold text-p3-text-secondary hover:text-p3-text-primary transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Conduct Weekly Review</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveReviewModalType("monthly_capability_review")
            }
            className="flex items-center gap-1.5 rounded-md bg-p3-accent px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-colors shadow-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Conduct Monthly Review</span>
          </button>
        </div>
      </div>

      {/* Audit Pipeline Stats */}
      <div className="grid grid-cols-2 rounded-xl border border-p3-border bg-p3-surface divide-y sm:divide-y-0 sm:divide-x divide-p3-border sm:grid-cols-4">
        <div className="p-3.5">
          <span className="text-[10px] font-semibold text-p3-text-secondary uppercase tracking-wider block">
            Completed Sessions
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-p3-text-primary">
              {sessions.length}
            </span>
            <span className="text-xs text-p3-text-secondary">logged</span>
          </div>
        </div>

        <div className="p-3.5">
          <span className="text-[10px] font-semibold text-p3-text-secondary uppercase tracking-wider block">
            Knowledge Units
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-p3-text-primary">
              {knowledgeUnits.length}
            </span>
            <span className="text-xs text-p3-text-secondary">units</span>
          </div>
        </div>

        <div className="p-3.5">
          <span className="text-[10px] font-semibold text-p3-text-secondary uppercase tracking-wider block">
            Execution Trials
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-p3-text-primary">
              {applications.length}
            </span>
            <span className="text-xs text-p3-text-secondary">trials</span>
          </div>
        </div>

        <div className="p-3.5">
          <span className="text-[10px] font-semibold text-p3-text-secondary uppercase tracking-wider block">
            Validated Invariants
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-p3-text-primary">
              {knowledgeUnits.filter((k) => k.status === "validated").length}
            </span>
            <span className="text-xs text-p3-text-secondary">verified</span>
          </div>
        </div>
      </div>

      {/* Past Completed Reviews Feed */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-p3-text-secondary">
          Completed Structured Reviews ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-p3-border p-8 text-center text-xs text-p3-text-secondary">
            No reviews conducted yet. Click &quot;Conduct Weekly Review&quot; or
            &quot;Conduct Monthly Review&quot; above to log structured
            reflections.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-p3-border bg-p3-surface space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-p3-text-primary">
                      {rev.type === "weekly_learning_review"
                        ? "Weekly Learning Review"
                        : "Monthly Capability Review"}
                    </span>
                    <span className="font-mono text-[11px] text-p3-text-secondary before:content-['•'] before:mr-1.5 before:text-p3-border">
                      {rev.period}
                    </span>
                  </div>
                  <span className="text-[10px] text-p3-text-secondary">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="border-l-2 border-p3-border pl-3 py-0.5">
                    <span className="text-[10px] uppercase font-semibold text-p3-text-secondary tracking-wider block mb-1">
                      Key Findings & Discoveries
                    </span>
                    <p className="text-p3-text-primary leading-relaxed">
                      {rev.findings}
                    </p>
                  </div>

                  <div className="border-l-2 border-p3-accent-border pl-3 py-0.5">
                    <span className="text-[10px] uppercase font-semibold text-p3-text-secondary tracking-wider block mb-1">
                      Updated Understanding
                    </span>
                    <p className="text-p3-text-primary leading-relaxed">
                      {rev.updatedUnderstanding}
                    </p>
                  </div>
                </div>

                {rev.capabilityEvidence.length > 0 && (
                  <div className="pt-2 border-t border-p3-border-subtle">
                    <span className="text-[10px] uppercase font-semibold text-p3-text-secondary tracking-wider block mb-2">
                      Capability Evidence Calibration (4 Dimensions)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                      {rev.capabilityEvidence.map((ce) => (
                        <div
                          key={ce.dimension}
                          className="flex items-start gap-1.5"
                        >
                          <span className="font-semibold text-p3-text-primary capitalize whitespace-nowrap">
                            {ce.dimension.replace("_", " ")}:
                          </span>
                          <span className="text-p3-text-secondary">
                            {ce.qualitativeAssessment}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-p3-border text-p3-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-p3-text-primary">
                      Next Focus:
                    </span>
                    <span>{rev.nextFocus}</span>
                  </div>
                  {rev.unresolvedQuestions.length > 0 && (
                    <span className="text-[11px]">
                      {rev.unresolvedQuestions.length} unresolved questions
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {activeReviewModalType && (
        <ConductReviewModal
          open={Boolean(activeReviewModalType)}
          type={activeReviewModalType}
          onClose={() => setActiveReviewModalType(null)}
        />
      )}
    </div>
  );
}
