/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Modal: Record Learning Session
 */

import React, { useState } from "react";
import { Modal, Button } from "@/components/os/ui";
import { Clock, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import type {
  KnowledgeUnitEntity,
  LearningSessionEntity,
} from "../../../domain/entities";
import { validateLearningSession } from "../../../domain/validation";
import { useP3 } from "../../context/P3Context";

export interface RecordSessionModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly initialQuestionId?: string | undefined;
  readonly onSynthesizeKnowledge?:
    ((session: LearningSessionEntity) => void) | undefined;
}

export function RecordSessionModal({
  open,
  onClose,
  initialQuestionId,
  onSynthesizeKnowledge,
}: RecordSessionModalProps) {
  const {
    questions,
    sources,
    createSession,
    updateQuestion,
    createKnowledgeUnit,
  } = useP3();

  const [title, setTitle] = useState("");
  const [questionId, setQuestionId] = useState<string>(
    initialQuestionId ?? (questions[0]?.id || "none"),
  );
  const [learningContext, setLearningContext] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [explanationInOwnWords, setExplanationInOwnWords] = useState("");
  const [findings, setFindings] = useState("");
  const [remainingGaps, setRemainingGaps] = useState("");
  const [nextLogicalStep, setNextLogicalStep] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [alsoPromoteToKU, setAlsoPromoteToKU] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setQuestionId(initialQuestionId ?? (questions[0]?.id || "none"));
    setLearningContext("");
    setInvestigation("");
    setExplanationInOwnWords("");
    setFindings("");
    setRemainingGaps("");
    setNextLogicalStep("");
    setDurationMinutes(45);
    setSelectedSourceIds([]);
    setAlsoPromoteToKU(false);
    setErrorMsg(null);
  };

  const handleSourceToggle = (srcId: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(srcId)
        ? prev.filter((id) => id !== srcId)
        : [...prev, srcId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const now = new Date().toISOString();
    const sessionId = `ls-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const linkedQ = questionId !== "none" ? [questionId] : [];

    const sessionEntity: LearningSessionEntity = {
      id: sessionId,
      title: title.trim(),
      status: "completed",
      linkedQuestionIds: linkedQ,
      learningContext: learningContext.trim(),
      investigation: investigation.trim(),
      explanationInOwnWords: explanationInOwnWords.trim(),
      findings: findings.trim(),
      remainingGaps: remainingGaps.trim(),
      nextLogicalStep: nextLogicalStep.trim(),
      linkedKnowledgeUnitIds: [],
      sourceIds: selectedSourceIds,
      durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
      startTime: now,
      completionTime: now,
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    const val = validateLearningSession(sessionEntity);
    if (!val.valid) {
      setErrorMsg(val.errors.join("; "));
      return;
    }

    try {
      setIsSubmitting(true);
      const createdSession = await createSession(sessionEntity);

      // Link session back to question if linked
      if (questionId && questionId !== "none") {
        const qObj = questions.find((q) => q.id === questionId);
        if (qObj) {
          const nextSessionIds = Array.from(
            new Set([...qObj.linkedSessionIds, sessionId]),
          );
          await updateQuestion(questionId, {
            linkedSessionIds: nextSessionIds,
            status: qObj.status === "open" ? "investigating" : qObj.status,
            currentUnderstanding:
              explanationInOwnWords.trim() || qObj.currentUnderstanding,
            remainingGaps: remainingGaps.trim() || qObj.remainingGaps,
          });
        }
      }

      // If user chose to synthesize directly into a Knowledge Unit
      if (alsoPromoteToKU) {
        const kuId = `ku-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const kuEntity: KnowledgeUnitEntity = {
          id: kuId,
          title: title.trim(),
          summary:
            findings.trim() || explanationInOwnWords.trim() || title.trim(),
          perspective: "personal_understanding",
          status: "captured",
          classification: "general",
          identity: {
            id: kuId,
            title: title.trim(),
            perspective: "personal_understanding",
            classification: "general",
            tags: ["session-synthesis"],
          },
          coreUnderstanding: {
            plainEnglishExplanation: explanationInOwnWords.trim(),
            corePrinciples: findings.trim() ? [findings.trim()] : [],
            mentalModels: [],
          },
          deeperUnderstanding: {
            nuancedMechanisms: investigation.trim(),
            boundaryConditions: "",
            counterExamples: [],
          },
          sourcesAndEvidence: {
            sourceIds: selectedSourceIds,
            evidenceIds: [],
            competingTheories: [],
          },
          relationshipsAndApplications: {
            relationshipIds: [],
            applicationRecordIds: [],
            operationalNotes: `Synthesized from Learning Session '${title.trim()}'.`,
          },
          developmentHistory: {
            revisions: [
              {
                id: `rev-${Date.now()}`,
                timestamp: now,
                previousStatus: "captured",
                newStatus: "captured",
                previousSummary: "",
                previousExplanation: "",
                reasonForChange: `Initial synthesis from session '${title.trim()}'.`,
                authorOrContext: "Learning Session Synthesis",
              },
            ],
          },
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        };

        await createKnowledgeUnit(kuEntity);
        if (onSynthesizeKnowledge) {
          onSynthesizeKnowledge(createdSession);
        }
      }

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
      title="Record Learning Session"
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
              <BookOpen className="h-3.5 w-3.5 text-violet" />
              Session Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Memory Contention Deep Dive & Profiling"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan" />
              Duration (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={720}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Linked Learning Question
            </label>
            <select
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="none">None / Independent Inquiry</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.question.length > 55
                    ? `${q.question.slice(0, 52)}...`
                    : q.question}{" "}
                  ({q.status})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Context / Project Reference
            </label>
            <input
              type="text"
              value={learningContext}
              onChange={(e) => setLearningContext(e.target.value)}
              placeholder="e.g. Priority 1 Venture Engine Architecture Bottleneck"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Investigation & Experiments Executed
          </label>
          <textarea
            rows={2}
            value={investigation}
            onChange={(e) => setInvestigation(e.target.value)}
            placeholder="What material was studied? What benchmarks, tests, code inspection, or traces were run?"
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Plain-English Explanation (Your own words)
          </label>
          <textarea
            rows={3}
            value={explanationInOwnWords}
            onChange={(e) => setExplanationInOwnWords(e.target.value)}
            placeholder="Explain what was understood simply, without jargon. If you cannot explain it simply, understanding is incomplete."
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Core Findings & Invariants
            </label>
            <textarea
              rows={2}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="What invariant rules or actionable truths were extracted?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Remaining Gaps & Uncertainties
            </label>
            <textarea
              rows={2}
              value={remainingGaps}
              onChange={(e) => setRemainingGaps(e.target.value)}
              placeholder="What questions remain unresolved or require testing in production?"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Source selection */}
        {sources.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground block">
              Consulted Sources ({selectedSourceIds.length} attached)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl border border-glass-border/70 bg-secondary/20">
              {sources.map((src) => {
                const isSelected = selectedSourceIds.includes(src.id);
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => handleSourceToggle(src.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                      isSelected
                        ? "border border-violet/50 bg-violet/20 text-violet"
                        : "border border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {src.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Promotion to Knowledge Unit checkbox */}
        <div className="flex items-center gap-2.5 rounded-xl border border-violet/30 bg-violet/10 p-3">
          <input
            type="checkbox"
            id="promoteToKU"
            checked={alsoPromoteToKU}
            onChange={(e) => setAlsoPromoteToKU(e.target.checked)}
            className="rounded border-glass-border text-violet focus:ring-violet"
          />
          <label
            htmlFor="promoteToKU"
            className="text-xs text-foreground font-medium cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet" />
            Synthesize directly into a new canonical Knowledge Unit
          </label>
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
            {isSubmitting ? "Saving Session..." : "Save Learning Session"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
