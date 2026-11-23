/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Modal: Formulate New Learning Question
 */

import React, { useState } from "react";
import { Modal, Button } from "@/components/os/ui";
import { HelpCircle, AlertCircle } from "lucide-react";
import type { LearningQuestionEntity } from "../../../domain/entities";
import type {
  FoundationId,
  QuestionOrigin,
  QuestionPriority,
} from "../../../domain/enums";
import { validateLearningQuestion } from "../../../domain/validation";
import { useP3 } from "../../context/P3Context";

export interface CreateQuestionModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly initialFoundationId?: FoundationId | undefined;
}

export function CreateQuestionModal({
  open,
  onClose,
  initialFoundationId,
}: CreateQuestionModalProps) {
  const { createQuestion } = useP3();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState<QuestionOrigin>("execution");
  const [priority, setPriority] = useState<QuestionPriority>("important");
  const [foundationId, setFoundationId] = useState<FoundationId | "none">(
    initialFoundationId ?? "none",
  );
  const [currentUnderstanding, setCurrentUnderstanding] = useState("");
  const [remainingGaps, setRemainingGaps] = useState("");
  const [nextLogicalStep, setNextLogicalStep] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setQuestion("");
    setDescription("");
    setOrigin("execution");
    setPriority("important");
    setFoundationId(initialFoundationId ?? "none");
    setCurrentUnderstanding("");
    setRemainingGaps("");
    setNextLogicalStep("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const now = new Date().toISOString();
    const entity: LearningQuestionEntity = {
      id: `lq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      question: question.trim(),
      description: description.trim(),
      origin,
      priority,
      status: "open",
      foundationId: foundationId === "none" ? undefined : foundationId,
      linkedSessionIds: [],
      linkedKnowledgeUnitIds: [],
      currentUnderstanding: currentUnderstanding.trim(),
      remainingGaps: remainingGaps.trim(),
      nextLogicalStep: nextLogicalStep.trim(),
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    const val = validateLearningQuestion(entity);
    if (!val.valid) {
      setErrorMsg(val.errors.join("; "));
      return;
    }

    try {
      setIsSubmitting(true);
      await createQuestion(entity);
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
      title="Formulate Learning Question"
      wide
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-violet" />
            Core Question <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How do memory allocators in high-throughput systems avoid cache contention?"
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Question Origin
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value as QuestionOrigin)}
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="execution">Execution (Task / Bottleneck)</option>
              <option value="reality">
                Reality (Market / Tech Observation)
              </option>
              <option value="foundation">
                Foundation (Human / System Principle)
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Strategic Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as QuestionPriority)}
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="immediate">Immediate (Blocks active work)</option>
              <option value="important">Important (Core capability)</option>
              <option value="exploratory">
                Exploratory (Curiosity / Radar)
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Foundation
            </label>
            <select
              value={foundationId}
              onChange={(e) =>
                setFoundationId(e.target.value as FoundationId | "none")
              }
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="none">None / Independent</option>
              <option value="human_understanding">Human Understanding</option>
              <option value="reality_understanding">
                Reality Understanding
              </option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Description & Context
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why does this question matter? What operational or mental bottleneck does it unblock?"
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Current Working Hypothesis / Understanding
            </label>
            <textarea
              rows={2}
              value={currentUnderstanding}
              onChange={(e) => setCurrentUnderstanding(e.target.value)}
              placeholder="What do we currently believe or intuit before deep investigation?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Remaining Knowledge Gaps
            </label>
            <textarea
              rows={2}
              value={remainingGaps}
              onChange={(e) => setRemainingGaps(e.target.value)}
              placeholder="What specific mechanisms, proofs, or boundaries are missing?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Next Logical Step
          </label>
          <input
            type="text"
            value={nextLogicalStep}
            onChange={(e) => setNextLogicalStep(e.target.value)}
            placeholder="e.g. Read jemalloc documentation on per-thread arenas; run trace benchmark."
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
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
            disabled={isSubmitting || question.trim().length < 5}
          >
            {isSubmitting ? "Creating..." : "Save Learning Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
