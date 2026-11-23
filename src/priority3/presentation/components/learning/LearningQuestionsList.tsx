/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Learning Questions List & Management
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Archive,
  BookOpen,
} from "lucide-react";
import type { LearningQuestionEntity } from "../../../domain/entities";
import type {
  QuestionOrigin,
  QuestionPriority,
  QuestionStatus,
} from "../../../domain/enums";
import { useP3 } from "../../context/P3Context";
import { CreateQuestionModal } from "./CreateQuestionModal";
import { RecordSessionModal } from "./RecordSessionModal";

export function LearningQuestionsList() {
  const { questions, sessions, knowledgeUnits, updateQuestion } = useP3();

  const [statusFilter, setStatusFilter] = useState<"all" | QuestionStatus>(
    "all",
  );
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | QuestionPriority
  >("all");
  const [originFilter, setOriginFilter] = useState<"all" | QuestionOrigin>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sessionQuestionTarget, setSessionQuestionTarget] = useState<
    string | undefined
  >(undefined);
  const [isRecordSessionOpen, setIsRecordSessionOpen] = useState(false);

  const filteredQuestions = questions.filter((q) => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (priorityFilter !== "all" && q.priority !== priorityFilter) return false;
    if (originFilter !== "all" && q.origin !== originFilter) return false;
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      const match =
        q.question.toLowerCase().includes(lower) ||
        q.description.toLowerCase().includes(lower) ||
        q.currentUnderstanding.toLowerCase().includes(lower) ||
        q.remainingGaps.toLowerCase().includes(lower);
      if (!match) return false;
    }
    return true;
  });

  const handleStatusChange = async (
    qId: string,
    nextStatus: QuestionStatus,
  ) => {
    try {
      await updateQuestion(qId, { status: nextStatus });
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleStartSession = (qId: string) => {
    setSessionQuestionTarget(qId);
    setIsRecordSessionOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Trigger */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-p3-text-primary flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-p3-accent" />
            Learning Questions ({filteredQuestions.length})
          </h3>
          <p className="text-xs text-p3-text-secondary">
            Inquiry-driven investigation backlog. Every question directs
            deliberate study toward verifiable capability.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Formulate Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-p3-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-p3-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learning questions, gaps, hypotheses..."
            className="w-full rounded-lg border border-p3-input-border bg-p3-input-bg pl-8 pr-3 py-1 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:outline-none focus:border-p3-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-p3-text-secondary">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | QuestionStatus)
            }
            className="h-7 rounded-lg border border-p3-input-border bg-p3-input-bg px-2 text-xs text-p3-input-text focus:outline-none focus:border-p3-accent"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="partially_understood">Partially Understood</option>
            <option value="resolved_for_now">Resolved For Now</option>
            <option value="postponed">Postponed</option>
            <option value="archived">Archived</option>
          </select>

          <span className="text-[11px] text-p3-text-secondary ml-1.5">
            Priority:
          </span>
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as "all" | QuestionPriority)
            }
            className="h-7 rounded-lg border border-p3-input-border bg-p3-input-bg px-2 text-xs text-p3-input-text focus:outline-none focus:border-p3-accent"
          >
            <option value="all">All Priorities</option>
            <option value="immediate">Immediate</option>
            <option value="important">Important</option>
            <option value="exploratory">Exploratory</option>
          </select>

          <span className="text-[11px] text-p3-text-secondary ml-1.5">
            Origin:
          </span>
          <select
            value={originFilter}
            onChange={(e) =>
              setOriginFilter(e.target.value as "all" | QuestionOrigin)
            }
            className="h-7 rounded-lg border border-p3-input-border bg-p3-input-bg px-2 text-xs text-p3-input-text focus:outline-none focus:border-p3-accent"
          >
            <option value="all">All Origins</option>
            <option value="execution">Execution</option>
            <option value="reality">Reality</option>
            <option value="foundation">Foundation</option>
          </select>
        </div>
      </div>

      {/* Questions Cards Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-p3-border p-8 text-center text-xs text-p3-text-secondary space-y-2">
          <HelpCircle className="mx-auto h-8 w-8 text-p3-text-secondary/30" />
          <p>No learning questions match the active criteria.</p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-lg border border-p3-border bg-p3-surface px-4 py-1.5 text-xs text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
          >
            Formulate your first learning question
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredQuestions.map((q) => {
            const linkedSessionsCount = q.linkedSessionIds.length;
            const linkedKUsCount = q.linkedKnowledgeUnitIds.length;

            return (
              <div
                key={q.id}
                className="flex flex-col justify-between rounded-xl border border-p3-border bg-p3-surface p-4 transition-all hover:border-p3-accent-border"
              >
                <div className="space-y-2.5">
                  {/* Badges bar */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-p3-text-secondary">
                      <span>{q.priority}</span>
                      <span className="text-p3-border">•</span>
                      <span>{q.origin}</span>
                    </div>

                    <select
                      value={q.status}
                      onChange={(e) =>
                        handleStatusChange(
                          q.id,
                          e.target.value as QuestionStatus,
                        )
                      }
                      className="h-6 rounded-md border border-p3-input-border bg-p3-input-bg text-[10px] font-medium text-p3-text-secondary px-1.5 focus:outline-none focus:border-p3-accent"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="partially_understood">
                        Partially Understood
                      </option>
                      <option value="resolved_for_now">Resolved For Now</option>
                      <option value="postponed">Postponed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <h4 className="font-display text-sm font-semibold text-p3-text-primary leading-snug">
                    {q.question}
                  </h4>

                  {q.description && (
                    <p className="text-xs text-p3-text-secondary line-clamp-2 leading-relaxed">
                      {q.description}
                    </p>
                  )}

                  {q.currentUnderstanding && (
                    <div className="border-l-2 border-p3-accent-border pl-2.5 py-0.5 text-[11px] text-p3-text-secondary">
                      <span className="font-semibold text-p3-text-primary block text-[10px] uppercase tracking-wider">
                        Current Understanding
                      </span>
                      <p className="line-clamp-2 mt-0.5 leading-relaxed text-p3-text-primary/90">
                        {q.currentUnderstanding}
                      </p>
                    </div>
                  )}

                  {q.remainingGaps && (
                    <div className="text-[11px] text-p3-text-secondary">
                      <span className="font-semibold text-[10px] uppercase block text-p3-text-primary">
                        Open Gaps:
                      </span>
                      <p className="line-clamp-1">{q.remainingGaps}</p>
                    </div>
                  )}
                </div>

                {/* Footer bar */}
                <div className="mt-3.5 flex items-center justify-between border-t border-p3-border pt-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-p3-text-secondary">
                    <span>{linkedSessionsCount} session(s)</span>
                    <span>•</span>
                    <span>{linkedKUsCount} KU(s)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartSession(q.id)}
                    className="flex items-center gap-1 rounded-lg border border-p3-border bg-p3-surface px-2.5 py-1 text-xs text-p3-text-secondary hover:text-p3-accent hover:border-p3-accent-border transition-colors"
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>Study Session</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-modals */}
      <CreateQuestionModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <RecordSessionModal
        open={isRecordSessionOpen}
        onClose={() => {
          setIsRecordSessionOpen(false);
          setSessionQuestionTarget(undefined);
        }}
        initialQuestionId={sessionQuestionTarget}
      />
    </div>
  );
}
