/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Authoritative Create Learning Project Modal
 *
 * Strict Visual Match to Authoritative Design Reference (media_1795333105416_404f77de.jpg):
 * - Two permanent foundations: A (Human Understanding), B (Reality Understanding)
 * - Flexible entry point: C (Custom Learning)
 * - Minimal, high-contrast, black/near-black theme with restrained white accent.
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import humanBrainImg from "@/assets/human-understanding.png";
import realityGearsImg from "@/assets/reality-understanding.png";
import type { Project } from "@/lib/os/types";
import { uid, today } from "@/lib/os/seed";

export type LearningFoundationType =
  "human_understanding" | "reality_understanding" | "custom";

export interface CreateLearningProjectModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreate: (project: Project) => void;
  readonly initialFoundation?: LearningFoundationType | undefined;
}

export function CreateLearningProjectModal({
  open,
  onClose,
  onCreate,
  initialFoundation = "human_understanding",
}: CreateLearningProjectModalProps) {
  const [selectedFoundation, setSelectedFoundation] =
    useState<LearningFoundationType>(initialFoundation);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Lock background scroll and preserve/restore scroll position
  useEffect(() => {
    if (
      !open ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    )
      return;

    const scrollY = window.scrollY;
    const origOverflow = document.body.style.overflow;
    const origPosition = document.body.style.position;
    const origTop = document.body.style.top;
    const origWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.position = origPosition;
      document.body.style.top = origTop;
      document.body.style.width = origWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = projectName.trim();
    if (!trimmed) {
      setError("Please enter a valid project name to continue.");
      return;
    }

    const defaultObjective =
      selectedFoundation === "human_understanding"
        ? "Human Understanding: Biology, neuroscience, psychology, behavior, communication and social dynamics."
        : selectedFoundation === "reality_understanding"
          ? "Reality Understanding: Physics, mathematics, logic, engineering, computing, software, hardware and AI."
          : "Custom Learning Project: Flexible investigation, skill development, and experiments.";

    const newProject: Project = {
      id: uid(),
      name: trimmed,
      objective: defaultObjective,
      priorityId: 3,
      status: "active",
      hypothesis: "",
      milestone: "",
      metrics: "",
      bottlenecks: "",
      evidence: "",
      decisions: "",
      learning: "",
      documents: "",
      createdAt: today(),
      learningFoundation: selectedFoundation,
      learningCategories: [selectedFoundation],
      docs: [],
    };

    onCreate(newProject);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-p3-modal-backdrop p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-learning-project-heading"
        className="relative w-full max-w-4xl rounded-2xl border border-p3-border bg-p3-modal-bg p-6 shadow-2xl text-p3-text-primary sm:p-8 overflow-y-auto max-h-[90vh]"
      >
        {/* Top Navigation Back Action */}
        <button
          type="button"
          onClick={onClose}
          className="group mb-5 flex items-center gap-2 text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Priority 3</span>
        </button>

        {/* Heading & Subtitle */}
        <div className="mb-6 space-y-1.5">
          <h1
            id="create-learning-project-heading"
            className="text-2xl font-bold tracking-tight text-p3-text-primary sm:text-3xl"
          >
            Create a Learning Project
          </h1>
          <p className="text-xs text-p3-text-secondary sm:text-sm">
            Choose a foundation for your learning project. This sets the context
            and structure for your investigation.
          </p>
        </div>

        {/* Section: Two permanent foundations */}
        <div className="mb-3 flex items-center justify-between gap-4 border-b border-p3-border pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-p3-text-primary">
            Two permanent foundations
          </span>
          <span className="text-[11px] text-p3-text-secondary">
            Select one option to continue
          </span>
        </div>

        {/* Foundations Grid: A & B */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card A — Human Understanding */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedFoundation("human_understanding");
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedFoundation("human_understanding");
                setError(null);
              }
            }}
            className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
              selectedFoundation === "human_understanding"
                ? "border-p3-accent bg-p3-accent-muted ring-1 ring-p3-accent/50 shadow-sm"
                : "border-p3-border bg-p3-surface hover:border-p3-accent-border hover:bg-p3-surface-elevated"
            }`}
          >
            {/* Brain Image on Left */}
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-p3-surface-elevated flex items-center justify-center p-1 border border-p3-border-subtle">
              <img
                src={humanBrainImg}
                alt="Human Understanding synaptic brain illustration"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Content & Metadata */}
            <div className="flex-1 pr-6 space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-p3-text-secondary">
                  A
                </span>
                <h3 className="text-sm font-semibold text-p3-text-primary">
                  Human Understanding
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-p3-text-secondary">
                Biology, neuroscience, psychology, behavior, communication and
                social dynamics.
              </p>
              <div className="pt-1">
                <span className="inline-block rounded-full border border-p3-border bg-p3-surface-elevated px-2.5 py-0.5 text-[10px] font-medium text-p3-text-secondary">
                  Permanent foundation
                </span>
              </div>
            </div>

            {/* Selection Radio / Checkmark */}
            <div className="absolute top-4 right-4">
              {selectedFoundation === "human_understanding" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-p3-accent text-white dark:text-[#071426] shadow-sm">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border border-p3-border group-hover:border-p3-text-secondary" />
              )}
            </div>
          </div>

          {/* Card B — Reality Understanding */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedFoundation("reality_understanding");
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedFoundation("reality_understanding");
                setError(null);
              }
            }}
            className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
              selectedFoundation === "reality_understanding"
                ? "border-p3-accent bg-p3-accent-muted ring-1 ring-p3-accent/50 shadow-sm"
                : "border-p3-border bg-p3-surface hover:border-p3-accent-border hover:bg-p3-surface-elevated"
            }`}
          >
            {/* Reality Gears Image on Left */}
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-p3-surface-elevated flex items-center justify-center p-1 border border-p3-border-subtle">
              <img
                src={realityGearsImg}
                alt="Reality Understanding cybernetic gears illustration"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Content & Metadata */}
            <div className="flex-1 pr-6 space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-p3-text-secondary">
                  B
                </span>
                <h3 className="text-sm font-semibold text-p3-text-primary">
                  Reality Understanding
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-p3-text-secondary">
                Physics, mathematics, logic, engineering, computing, software,
                hardware and AI.
              </p>
              <div className="pt-1">
                <span className="inline-block rounded-full border border-p3-border bg-p3-surface-elevated px-2.5 py-0.5 text-[10px] font-medium text-p3-text-secondary">
                  Permanent foundation
                </span>
              </div>
            </div>

            {/* Selection Radio / Checkmark */}
            <div className="absolute top-4 right-4">
              {selectedFoundation === "reality_understanding" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-p3-accent text-white dark:text-[#071426] shadow-sm">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border border-p3-border group-hover:border-p3-text-secondary" />
              )}
            </div>
          </div>
        </div>

        {/* Card C — Custom (Below A & B) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedFoundation("custom");
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setSelectedFoundation("custom");
              setError(null);
            }
          }}
          className={`group relative mb-6 flex cursor-pointer items-center justify-between rounded-xl border p-4.5 transition-all ${
            selectedFoundation === "custom"
              ? "border-p3-accent bg-p3-accent-muted ring-1 ring-p3-accent/50 shadow-sm"
              : "border-p3-border bg-p3-surface hover:border-p3-accent-border hover:bg-p3-surface-elevated"
          }`}
        >
          <div className="pr-6 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-p3-text-secondary">
                C
              </span>
              <h3 className="text-sm font-semibold text-p3-text-primary">
                Custom
              </h3>
            </div>
            <p className="text-xs text-p3-text-secondary">
              Create a flexible learning project for any skill, question,
              experiment, personal goal or life phase.
            </p>
          </div>

          {/* Selection Radio / Checkmark */}
          <div className="shrink-0">
            {selectedFoundation === "custom" ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-p3-accent text-white dark:text-[#071426] shadow-sm">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-p3-border group-hover:border-p3-text-secondary" />
            )}
          </div>
        </div>

        {/* Project Details Section */}
        <div className="border-t border-p3-border pt-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-p3-text-primary">
            Project details
          </h2>
          <div>
            <label
              htmlFor="p3-project-name-input"
              className="block text-xs font-medium text-p3-text-secondary mb-1.5"
            >
              Project name
            </label>
            <input
              id="p3-project-name-input"
              type="text"
              autoFocus
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder="e.g. Neuroscience, AI Systems, Decision Making"
              className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2.5 text-sm text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:ring-1 focus:ring-p3-accent focus:outline-none transition-colors"
            />
            {error && (
              <p className="mt-1.5 text-xs text-neutral-400 font-medium">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-p3-border bg-transparent px-4 py-2 text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Create Project</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
