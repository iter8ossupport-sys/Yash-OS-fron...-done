/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Authoritative P3 Overview Workspace (Refined Visual DNA)
 *
 * Strict 5-Section Hierarchy (Prompt Section 6):
 * 1. Project Identity (Fixed foundation, name, objective, learning state — NO A/B/C switching)
 * 2. Current Learning Focus (Answers: What am I learning? Where did I stop? What should I do next?)
 *    -> ONE CLEAR PRIMARY ACTION: Continue Learning (or Start Learning)
 * 3. Learning Progress (Compact: Open questions, Knowledge Units, Sessions, Reviews)
 * 4. Recent Activity (Simple list of recent inquiries and knowledge units with neutral typography)
 * 5. Secondary Actions (Quiet contextual access to Quick Capture and creation modals)
 */

import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Clock,
  Inbox,
  Sparkles,
  Plus,
} from "lucide-react";
import type { Project } from "@/lib/os/types";
import type { LearningFoundationType } from "../creation/CreateLearningProjectModal";
import { useP3 } from "../../context/P3Context";
import { QuickCaptureModal } from "../inbox/QuickCaptureModal";
import { CreateQuestionModal } from "../learning/CreateQuestionModal";
import { RecordSessionModal } from "../learning/RecordSessionModal";
import { KnowledgeUnitEditorModal } from "../knowledge/KnowledgeUnitEditorModal";

export interface P3OverviewWorkspaceProps {
  readonly project?: Project | undefined;
  readonly foundation?: LearningFoundationType | undefined;
  readonly onContinueLearning?: () => void;
}

export function P3OverviewWorkspace({
  project,
  foundation,
  onContinueLearning,
}: P3OverviewWorkspaceProps) {
  const {
    questions,
    sessions,
    knowledgeUnits,
    reviews,
    learningContext,
    setActiveTab,
  } = useP3();

  // Secondary sub-modal states
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isKuModalOpen, setIsKuModalOpen] = useState(false);

  // Active question calculation
  const activeQuestions = questions.filter(
    (q) => q.status === "open" || q.status === "investigating",
  );
  const currentQuestion =
    questions.find((q) => q.id === learningContext?.currentQuestionId) ||
    activeQuestions[0] ||
    questions[0];

  const hasActiveInquiry = Boolean(
    currentQuestion || learningContext?.currentFocus,
  );

  // Recent activity (most recent inquiries and knowledge units)
  const recentQuestions = questions.slice(0, 3);
  const recentKnowledge = knowledgeUnits.slice(0, 3);

  const foundationLabel =
    (project?.learningFoundation || foundation) === "reality_understanding"
      ? "Reality Understanding"
      : (project?.learningFoundation || foundation) === "custom"
        ? "Custom Learning"
        : "Human Understanding";

  return (
    <div className="space-y-6 text-p3-text-primary">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — PROJECT IDENTITY (Direct Page Header)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5 pb-1">
        <div className="flex items-center gap-2 text-xs text-p3-text-secondary">
          <span className="font-medium text-p3-text-primary">
            {foundationLabel}
          </span>
          <span className="text-p3-text-secondary/40">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-p3-accent" />
            {hasActiveInquiry ? "Active Investigation" : "Ready to Learn"}
          </span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-p3-text-primary">
          {project?.name || "Priority 3: Learning & Knowledge Intelligence"}
        </h2>
        <p className="text-xs text-p3-text-secondary max-w-2xl leading-relaxed">
          {project?.objective ||
            "Evidence-driven capability engine. Transform questions into verified mental models and empirical execution trials."}
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — CURRENT LEARNING FOCUS (Main Content Hero)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-p3-border bg-p3-surface p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4 border-b border-p3-border pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-accent">
              Current Learning Focus
            </span>
            <h3 className="font-display text-lg font-semibold text-p3-text-primary">
              {currentQuestion?.question ||
                learningContext?.currentFocus ||
                "No active investigation selected"}
            </h3>
            {currentQuestion?.description && (
              <p className="text-xs text-p3-text-secondary leading-relaxed max-w-2xl">
                {currentQuestion.description}
              </p>
            )}
          </div>

          {/* ONE Clear Primary Action Button */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onContinueLearning) {
                  onContinueLearning();
                } else {
                  setActiveTab("learning");
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-p3-accent px-4 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-colors shadow-xs"
            >
              <span>
                {hasActiveInquiry ? "Continue Learning" : "Start Learning"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* The 3 Core Answers: Learning, Stopping Point, Next Step (Clean Columns Without Nested Boxes) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
          {/* 1. What am I currently learning */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-p3-text-secondary">
              1. What am I learning?
            </span>
            <p className="text-xs text-p3-text-primary leading-relaxed">
              {learningContext?.currentFocus ||
                currentQuestion?.question ||
                "Formulating core operational inquiry."}
            </p>
          </div>

          {/* 2. Where did I stop */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-p3-text-secondary">
              2. Where did I stop?
            </span>
            <p className="text-xs text-p3-text-primary leading-relaxed">
              {learningContext?.lastStoppingPoint ||
                (sessions.length > 0
                  ? `Completed session: ${sessions[sessions.length - 1]?.title || "Study Session"}`
                  : "Ready for initial empirical study session.")}
            </p>
          </div>

          {/* 3. What should I do next */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-p3-text-secondary">
              3. What should I do next?
            </span>
            <p className="text-xs text-p3-text-primary leading-relaxed">
              {learningContext?.nextLogicalStep ||
                "Execute focused learning session and record empirical observations."}
            </p>
          </div>
        </div>

        {/* Remaining Gaps (Clean Accent Left-Border) */}
        {learningContext?.remainingGaps && (
          <div className="border-l-2 border-p3-accent-border pl-3 py-1 text-xs text-p3-text-secondary">
            <span className="font-medium text-p3-text-primary mr-1.5">
              Remaining Gaps:
            </span>
            {learningContext.remainingGaps}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — LEARNING PROGRESS (Unified Metric Row)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-p3-border bg-p3-surface divide-y sm:divide-y-0 sm:divide-x divide-p3-border">
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-p3-text-secondary">
            Open Questions
          </span>
          <div className="text-xl font-bold font-mono text-p3-text-primary">
            {activeQuestions.length}
          </div>
          <span className="text-[10px] text-p3-text-secondary">
            {questions.length} total inquiries
          </span>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-p3-text-secondary">
            Knowledge Units
          </span>
          <div className="text-xl font-bold font-mono text-p3-text-primary">
            {knowledgeUnits.length}
          </div>
          <span className="text-[10px] text-p3-text-secondary">
            Distilled mental models
          </span>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-p3-text-secondary">
            Learning Sessions
          </span>
          <div className="text-xl font-bold font-mono text-p3-text-primary">
            {sessions.length}
          </div>
          <span className="text-[10px] text-p3-text-secondary">
            Logged investigations
          </span>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-p3-text-secondary">
            Reviews & Audits
          </span>
          <div className="text-xl font-bold font-mono text-p3-text-primary">
            {reviews.length}
          </div>
          <span className="text-[10px] text-p3-text-secondary">
            Qualitative evaluations
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — RECENT ACTIVITY (Clean Lists Without Nested Cards)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-p3-border pb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-p3-text-primary">
              Recent Questions
            </h4>
            <button
              type="button"
              onClick={() => setActiveTab("learning")}
              className="text-xs text-p3-text-secondary hover:text-p3-accent transition-colors"
            >
              View all →
            </button>
          </div>

          {recentQuestions.length === 0 ? (
            <p className="text-xs text-p3-text-secondary py-2">
              No learning questions formulated yet.
            </p>
          ) : (
            <div className="divide-y divide-p3-border-subtle">
              {recentQuestions.map((q) => (
                <div
                  key={q.id}
                  className="py-2.5 space-y-0.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-p3-text-primary line-clamp-1">
                      {q.question}
                    </span>
                    <span className="text-[10px] font-mono text-p3-text-secondary shrink-0 uppercase">
                      {q.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  {q.description && (
                    <p className="text-[11px] text-p3-text-secondary line-clamp-1">
                      {q.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Knowledge Units */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-p3-border pb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-p3-text-primary">
              Distilled Knowledge
            </h4>
            <button
              type="button"
              onClick={() => setActiveTab("knowledge")}
              className="text-xs text-p3-text-secondary hover:text-p3-accent transition-colors"
            >
              View all →
            </button>
          </div>

          {recentKnowledge.length === 0 ? (
            <p className="text-xs text-p3-text-secondary py-2">
              No knowledge units distilled yet.
            </p>
          ) : (
            <div className="divide-y divide-p3-border-subtle">
              {recentKnowledge.map((ku) => (
                <div
                  key={ku.id}
                  className="py-2.5 space-y-0.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-p3-text-primary line-clamp-1">
                      {ku.title}
                    </span>
                    <span className="text-[10px] font-mono text-p3-text-secondary shrink-0 uppercase">
                      {ku.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-p3-text-secondary line-clamp-1">
                    {ku.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — SECONDARY ACTIONS (Quiet Contextual Bar)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-p3-border pt-4 text-xs text-p3-text-secondary">
        <div className="flex items-center gap-2">
          <span>Quick actions:</span>
          <button
            type="button"
            onClick={() => setIsQuickCaptureOpen(true)}
            className="rounded-md border border-p3-border bg-transparent px-3 py-1.5 text-xs text-p3-text-secondary hover:text-p3-text-primary hover:border-p3-accent-border transition-colors"
          >
            Quick Capture
          </button>
          <button
            type="button"
            onClick={() => setIsQuestionModalOpen(true)}
            className="rounded-md border border-p3-border bg-transparent px-3 py-1.5 text-xs text-p3-text-secondary hover:text-p3-text-primary hover:border-p3-accent-border transition-colors"
          >
            New Question
          </button>
          <button
            type="button"
            onClick={() => setIsSessionModalOpen(true)}
            className="rounded-md border border-p3-border bg-transparent px-3 py-1.5 text-xs text-p3-text-secondary hover:text-p3-text-primary hover:border-p3-accent-border transition-colors"
          >
            Record Session
          </button>
          <button
            type="button"
            onClick={() => setIsKuModalOpen(true)}
            className="rounded-md border border-p3-border bg-transparent px-3 py-1.5 text-xs text-p3-text-secondary hover:text-p3-text-primary hover:border-p3-accent-border transition-colors"
          >
            New Knowledge Unit
          </button>
        </div>
      </div>

      {/* Secondary Modals */}
      <QuickCaptureModal
        open={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
      />
      <CreateQuestionModal
        open={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
      />
      <RecordSessionModal
        open={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
      />
      <KnowledgeUnitEditorModal
        open={isKuModalOpen}
        onClose={() => setIsKuModalOpen(false)}
      />
    </div>
  );
}
