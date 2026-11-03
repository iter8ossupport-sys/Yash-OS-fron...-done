import { useState } from "react";
import { Button, Modal } from "@/components/os/ui";
import type { LearningJourney, LearningReview } from "@/lib/os/types";
import { today, uid } from "@/lib/os/seed";

export interface RecordLearningReviewModalProps {
  open: boolean;
  journey?: LearningJourney;
  journeyId?: string;
  journeyTitle?: string;
  isExploration?: boolean;
  onClose: () => void;
  onSave: (review: LearningReview) => void;
}

export function RecordLearningReviewModal({
  open,
  journey,
  journeyId: propJourneyId,
  journeyTitle: propJourneyTitle,
  isExploration,
  onClose,
  onSave,
}: RecordLearningReviewModalProps) {
  const effectiveJId = journey?.id || propJourneyId || "";
  const [date, setDate] = useState(today());
  const [intendedLearning, setIntendedLearning] = useState(
    journey?.purposeAndOutcome || "",
  );
  const [actualUnderstanding, setActualUnderstanding] = useState("");
  const [practicalApplication, setPracticalApplication] = useState("");
  const [evidence, setEvidence] = useState("");
  const [remainingGaps, setRemainingGaps] = useState("");
  const [nextImprovement, setNextImprovement] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!actualUnderstanding.trim()) {
      setError("Please articulate the actual understanding gained.");
      return;
    }

    const now = new Date().toISOString();
    const review: LearningReview = {
      id: `rev-${uid()}`,
      journeyId: effectiveJId,
      date,
      intendedLearning: intendedLearning.trim(),
      actualUnderstanding: actualUnderstanding.trim(),
      practicalApplication: practicalApplication.trim() || undefined,
      evidence: evidence.trim(),
      remainingGaps: remainingGaps.trim(),
      nextImprovement: nextImprovement.trim(),
      createdAt: now,
    };

    onSave(review);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Learning & Capability Review"
      wide
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* 1. Journey Context & Date */}
        <div className="flex items-center justify-between rounded-xl border border-glass-border/60 bg-secondary/25 p-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-violet">
              Journey Review
            </span>
            <h4 className="font-semibold text-foreground text-sm">
              {journey?.title || propJourneyTitle || "General Learning Review"}
            </h4>
          </div>
          <div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-glass-border/80 bg-secondary/40 px-2 py-1 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* 2. Intended Learning vs Actual Understanding */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Intended Learning (Hypothesis / Target)
            </label>
            <input
              type="text"
              value={intendedLearning}
              onChange={(e) => setIntendedLearning(e.target.value)}
              placeholder="What did you originally set out to understand or achieve?"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Actual Understanding Gained <span className="text-violet">*</span>
            </label>
            <textarea
              value={actualUnderstanding}
              onChange={(e) => {
                setActualUnderstanding(e.target.value);
                if (error) setError(null);
              }}
              rows={2}
              placeholder="What mental model or truth did you actually internalize?"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>
        </div>

        {/* 3. Practical Application (Optional for Exploration) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-foreground">
              Practical Application / Conceptual Synthesis
            </label>
            {(journey?.type === "subject_exploration" || isExploration) && (
              <span className="text-[10px] text-cyan uppercase font-mono">
                Optional for Subject Exploration
              </span>
            )}
          </div>
          <textarea
            value={practicalApplication}
            onChange={(e) => setPracticalApplication(e.target.value)}
            rows={2}
            placeholder={
              journey?.type === "skill_development" || !isExploration
                ? "How was this deployed into code, trading systems, or product tasks?"
                : "Summarize conceptual synthesis or state N/A if pure theoretical study."
            }
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 4. Concrete Evidence */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Evidence of Capability Improvement
          </label>
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            rows={2}
            placeholder="Links to git commits, passing test suites, interview notes, or operational records."
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 5. Remaining Gaps & Next Improvement */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Remaining Knowledge / Skill Gaps
            </label>
            <textarea
              value={remainingGaps}
              onChange={(e) => setRemainingGaps(e.target.value)}
              rows={2}
              placeholder="What is still missing or unmastered?"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Next Improvement Action
            </label>
            <textarea
              value={nextImprovement}
              onChange={(e) => setNextImprovement(e.target.value)}
              rows={2}
              placeholder="What will you read, build, or test in the next cycle?"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-glass-border/60 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Review
          </Button>
        </div>
      </div>
    </Modal>
  );
}
