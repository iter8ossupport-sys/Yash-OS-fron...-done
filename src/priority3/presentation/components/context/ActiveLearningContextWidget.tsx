/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Active Learning Context Widget & Workflow Continuity
 *
 * Displays:
 * - Current Focus
 * - Last Stopping Point
 * - Remaining Gaps
 * - Next Logical Step
 * - "Continue Learning" workflow action button
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import {
  Compass,
  Play,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { useP3 } from "../../context/P3Context";

export function ActiveLearningContextWidget() {
  const { learningContext, updateLearningContext, setActiveTab, questions } =
    useP3();

  const [isEditing, setIsEditing] = useState(false);
  const [currentFocus, setCurrentFocus] = useState(
    learningContext?.currentFocus || "",
  );
  const [lastStoppingPoint, setLastStoppingPoint] = useState(
    learningContext?.lastStoppingPoint || "",
  );
  const [remainingGaps, setRemainingGaps] = useState(
    learningContext?.remainingGaps || "",
  );
  const [nextLogicalStep, setNextLogicalStep] = useState(
    learningContext?.nextLogicalStep || "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const activeQuestion = questions.find(
    (q) => q.id === learningContext?.currentQuestionId,
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateLearningContext({
        currentFocus: currentFocus.trim(),
        lastStoppingPoint: lastStoppingPoint.trim(),
        remainingGaps: remainingGaps.trim(),
        nextLogicalStep: nextLogicalStep.trim(),
        lastActivityAt: new Date().toISOString(),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinueLearning = () => {
    // Navigates directly to Learning Inquiries tab to proceed with the active question
    setActiveTab("learning");
  };

  return (
    <div className="rounded-xl border border-glass-border bg-gradient-to-br from-card/80 to-secondary/30 p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-glass-border">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Active Learning Context & Focus
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Live State
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Preserves workflow continuity across operational sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                size="sm"
                variant="glass"
                onClick={() => {
                  setCurrentFocus(learningContext?.currentFocus || "");
                  setLastStoppingPoint(
                    learningContext?.lastStoppingPoint || "",
                  );
                  setRemainingGaps(learningContext?.remainingGaps || "");
                  setNextLogicalStep(learningContext?.nextLogicalStep || "");
                  setIsEditing(true);
                }}
                className="h-8 text-xs flex items-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Update Context
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleContinueLearning}
                className="h-8 text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Continue Learning
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Current Focus
              </label>
              <input
                type="text"
                value={currentFocus}
                onChange={(e) => setCurrentFocus(e.target.value)}
                placeholder="Active bottleneck or question..."
                className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Last Stopping Point
              </label>
              <input
                type="text"
                value={lastStoppingPoint}
                onChange={(e) => setLastStoppingPoint(e.target.value)}
                placeholder="What was completed or established in last session..."
                className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Remaining Gaps & Friction
              </label>
              <input
                type="text"
                value={remainingGaps}
                onChange={(e) => setRemainingGaps(e.target.value)}
                placeholder="What remains unclear or untested..."
                className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Next Logical Step
              </label>
              <input
                type="text"
                value={nextLogicalStep}
                onChange={(e) => setNextLogicalStep(e.target.value)}
                placeholder="Immediate next experimental action..."
                className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Context"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 rounded-xl border border-p3-border bg-p3-surface divide-y md:divide-y-0 md:divide-x divide-p3-border">
          <div className="p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              1. Current Focus
            </span>
            <p className="text-xs text-foreground font-medium line-clamp-3">
              {learningContext?.currentFocus || "No active learning focus set."}
            </p>
          </div>

          <div className="p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              2. Last Stopping Point
            </span>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {learningContext?.lastStoppingPoint ||
                "No stopping point recorded."}
            </p>
          </div>

          <div className="p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              3. Remaining Gaps
            </span>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {learningContext?.remainingGaps || "No active gaps logged."}
            </p>
          </div>

          <div className="p-3 bg-p3-accent-muted">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-p3-accent block mb-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              4. Next Logical Step
            </span>
            <p className="text-xs text-foreground font-medium line-clamp-3">
              {learningContext?.nextLogicalStep ||
                "Formulate next inquiry or test hypothesis."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
