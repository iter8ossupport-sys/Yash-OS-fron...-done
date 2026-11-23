/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Authoritative P3 Workspace Shell
 *
 * Core Interaction Model:
 * 1. Primary Focused Mode: Guided Learning Engine (1 Screen → 1 Goal → 1 Decision)
 * 2. System Library Mode: 5 Comprehensive Workspaces (Overview, Inquiries, Knowledge Hub, Trials, Reviews)
 *
 * Strict Architectural Rule:
 * - Subtle 3-6% opacity background watermark according to active foundation.
 * - Reactive to typed repository actions.
 */

import React, { useState } from "react";
import {
  Brain,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Layers,
  Sparkles,
  Compass,
} from "lucide-react";
import humanBrainImg from "@/assets/human-understanding.png";
import realityGearsImg from "@/assets/reality-understanding.png";
import type { Project } from "@/lib/os/types";
import type { LearningFoundationType } from "./creation/CreateLearningProjectModal";
import { useP3, type P3WorkspaceTab } from "../context/P3Context";
import { P3OverviewWorkspace } from "./overview/P3OverviewWorkspace";
import { LearningQuestionsList } from "./learning/LearningQuestionsList";
import { KnowledgeUnitList } from "./knowledge/KnowledgeUnitList";
import { ApplicationRecordList } from "./applications/ApplicationRecordList";
import { P3ReviewsWorkspace } from "./reviews/P3ReviewsWorkspace";
import { GuidedLearningEngine } from "./inquiry/GuidedLearningEngine";
import { GuidedInquiryFlowModal } from "./inquiry/GuidedInquiryFlowModal";

export type P3WorkspaceMode = "guided_learning" | "system_hub";

export interface P3WorkspaceShellProps {
  readonly project?: Project | undefined;
  readonly foundation?: LearningFoundationType | undefined;
  readonly initialMode?: P3WorkspaceMode | undefined;
}

export function P3WorkspaceShell({
  project,
  foundation: propFoundation,
  initialMode,
}: P3WorkspaceShellProps) {
  const {
    activeTab,
    setActiveTab,
    questions,
    knowledgeUnits,
    applications,
    reviews,
  } = useP3();

  // Mode state: defaults to guided_learning if project provided, otherwise system_hub
  const [workspaceMode, setWorkspaceMode] = useState<P3WorkspaceMode>(
    initialMode || (project ? "guided_learning" : "system_hub"),
  );

  // Fixed Project Foundation Identity (Strictly immutable inside created projects)
  const activeFoundation: LearningFoundationType =
    project?.learningFoundation || propFoundation || "human_understanding";

  // Standalone Guided Inquiry Modal state (if launched from System Hub)
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const tabs: {
    id: P3WorkspaceTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: "overview", label: "Overview", icon: Brain },
    {
      id: "learning",
      label: "Learning",
      icon: HelpCircle,
      badge: questions.length,
    },
    {
      id: "knowledge",
      label: "Knowledge",
      icon: Lightbulb,
      badge: knowledgeUnits.length,
    },
    {
      id: "applications",
      label: "Applications",
      icon: PlayCircle,
      badge: applications.length,
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: Layers,
      badge: reviews.length,
    },
  ];

  return (
    <div className="relative min-h-[560px] space-y-4">
      {/* Subtle 3-6% Background Identity Watermark */}
      {activeFoundation === "human_understanding" && (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-contain bg-center bg-no-repeat opacity-[0.04]"
          style={{ backgroundImage: `url(${humanBrainImg})` }}
          aria-hidden="true"
        />
      )}
      {activeFoundation === "reality_understanding" && (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-contain bg-center bg-no-repeat opacity-[0.04]"
          style={{ backgroundImage: `url(${realityGearsImg})` }}
          aria-hidden="true"
        />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 space-y-4">
        {/* Top Control Header: Mode Switcher & Fixed Foundation Identity */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-p3-border pb-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setWorkspaceMode("guided_learning")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                workspaceMode === "guided_learning"
                  ? "bg-p3-accent-muted text-p3-accent font-medium"
                  : "text-p3-text-secondary hover:text-p3-text-primary"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Guided Learning</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode("system_hub")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                workspaceMode === "system_hub"
                  ? "bg-p3-accent-muted text-p3-accent font-medium"
                  : "text-p3-text-secondary hover:text-p3-text-primary"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>System Library</span>
            </button>
          </div>

          {/* Right Controls: Immutable Foundation Identity (No A/B/C switching inside project) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-p3-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-p3-accent" />
              <span className="font-medium text-p3-text-primary">
                {activeFoundation === "human_understanding"
                  ? "Human Understanding"
                  : activeFoundation === "reality_understanding"
                    ? "Reality Understanding"
                    : "Custom Learning"}
              </span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MODE 1: GUIDED LEARNING EXPERIENCE (1 SCREEN → 1 GOAL)
        ───────────────────────────────────────────────────────────── */}
        {workspaceMode === "guided_learning" ? (
          <div className="py-2">
            <GuidedLearningEngine
              project={project}
              foundation={activeFoundation}
              onOpenSystemHub={() => setWorkspaceMode("system_hub")}
            />
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              MODE 2: SYSTEM LIBRARY (5 AUTHORITATIVE WORKSPACES)
          ───────────────────────────────────────────────────────────── */
          <div className="space-y-4">
            {/* Quick banner to return to guided learning */}
            <div className="flex items-center justify-between gap-3 border-b border-p3-border pb-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-p3-accent" />
                <span className="font-medium text-p3-text-primary">
                  Active Learning Investigation Ready
                </span>
                <span className="text-p3-text-secondary">
                  • Follow step-by-step inquiry
                </span>
              </div>
              <button
                type="button"
                onClick={() => setWorkspaceMode("guided_learning")}
                className="flex items-center gap-1.5 rounded-md bg-p3-accent px-3 py-1.5 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-colors shadow-xs"
              >
                <span>Open Guided Learning</span>
                <Compass className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 5 Top Navigation Workspaces Bar */}
            <div className="flex items-center gap-1 overflow-x-auto border-b border-p3-border pb-2 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-p3-accent-muted text-p3-accent font-medium"
                        : "text-p3-text-secondary hover:text-p3-text-primary font-normal"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    {typeof tab.badge === "number" && tab.badge > 0 && (
                      <span className="rounded-full bg-black/5 dark:bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-p3-text-secondary">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Workspace View */}
            <div className="animate-in fade-in duration-150">
              {activeTab === "overview" && (
                <P3OverviewWorkspace
                  project={project}
                  foundation={activeFoundation}
                  onContinueLearning={() => setWorkspaceMode("guided_learning")}
                />
              )}
              {activeTab === "learning" && <LearningQuestionsList />}
              {activeTab === "knowledge" && <KnowledgeUnitList />}
              {activeTab === "applications" && <ApplicationRecordList />}
              {activeTab === "reviews" && <P3ReviewsWorkspace />}
            </div>
          </div>
        )}
      </div>

      {/* Standalone Guided Inquiry Modal (if needed) */}
      {isInquiryModalOpen && (
        <GuidedInquiryFlowModal
          open={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          foundation={activeFoundation}
        />
      )}
    </div>
  );
}
