/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Authoritative Shared Guided Learning Engine (Flows A, B, and C)
 *
 * Core Interaction Model: ONE SCREEN → ONE GOAL → ONE DECISION → NEXT SCREEN
 *
 * Implements:
 * - Flow A: Human Understanding (A1 Field → A2 Subject → A3 Topic → A4 Question → A5 Approach → A6 Session → A7 Review → A8 KU → A9 Continuity)
 * - Flow B: Reality Understanding (B1 Field → B2 Subject → B3 Topic → B4 Question → B5 Approach → B6 Session → B7 Review → B8 KU → B9 Continuity)
 * - Flow C: Custom Learning (C1 Intention → C2 Purpose/Approach → C3 Scope → C4 Uncertainty → C5 Question → C6 Approach → C7 Session → C8 Review → C9 Continuity → C10 Resume)
 *
 * Strict Architectural Rules:
 * - Real P3 records: Questions, Sessions, and KUs are distinct entities in isolated repositories.
 * - Previous sessions are never overwritten.
 * - Pause and resume persisted to durable storage.
 * - Strict black/near-black visual DNA with restrained white accent.
 */

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Pause,
  PlayCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
} from "lucide-react";
import { useP3 } from "../../context/P3Context";
import type { LearningFoundationType } from "../creation/CreateLearningProjectModal";
import type {
  QuestionOrigin,
  QuestionPriority,
  KnowledgePerspective,
} from "../../../domain/enums";
import type {
  LearningQuestionEntity,
  LearningSessionEntity,
  KnowledgeUnitEntity,
} from "../../../domain/entities";
import type { Project } from "@/lib/os/types";
import { uid, today } from "@/lib/os/seed";

export interface GuidedLearningEngineProps {
  readonly project?: Project | undefined;
  readonly foundation: LearningFoundationType;
  readonly onOpenSystemHub?: () => void;
  readonly initialQuestionId?: string | undefined;
}

// Approved Human Understanding Fields
const HUMAN_FIELDS = [
  {
    id: "bio_phys",
    name: "Biology & Physiology",
    desc: "Human organism, cellular mechanics, energy systems, and somatic reality.",
  },
  {
    id: "neuro",
    name: "Neuroscience",
    desc: "Brain structures, neural pathways, neurotransmitters, and cognitive circuitry.",
  },
  {
    id: "psych_behav",
    name: "Psychology & Behaviour",
    desc: "Cognitive biases, motivation, habit formation, emotional regulation, and decision making.",
  },
  {
    id: "comm_social",
    name: "Communication & Social Dynamics",
    desc: "Linguistic precision, persuasion, status games, organizational psychology, and trust.",
  },
];

// Approved Reality Understanding Fields
const REALITY_FIELDS = [
  {
    id: "physics",
    name: "Physics",
    desc: "Mechanics, thermodynamics, electromagnetism, and physical constraints.",
  },
  {
    id: "math",
    name: "Mathematics",
    desc: "Abstract formal structures, calculus, linear algebra, probability, and statistics.",
  },
  {
    id: "logic",
    name: "Logic",
    desc: "Propositional calculus, epistemology, deduction, induction, and sound reasoning.",
  },
  {
    id: "eng",
    name: "Engineering",
    desc: "Systems design, structural integrity, tolerances, trade-offs, and physical build.",
  },
  {
    id: "comp",
    name: "Computing",
    desc: "Computation theory, complexity, state machines, and algorithmic efficiency.",
  },
  {
    id: "soft",
    name: "Software",
    desc: "Architecture, design patterns, clean interfaces, concurrency, and persistence.",
  },
  {
    id: "hard",
    name: "Hardware",
    desc: "Silicon, CPU architectures, memory hierarchy, sensors, and circuit design.",
  },
  {
    id: "ai",
    name: "AI & Machine Learning",
    desc: "Neural architectures, optimization, transformers, inference, and synthetic cognition.",
  },
];

// Configurable Custom Approaches (C2)
const CUSTOM_APPROACHES = [
  {
    id: "research",
    name: "Research-led",
    desc: "Literature review, source triangulation, and rigorous conceptual synthesis.",
  },
  {
    id: "experiment",
    name: "Experiment-led",
    desc: "Hypothesis testing, rapid prototyping, direct reality contact, and feedback.",
  },
  {
    id: "guided",
    name: "Guided Exploration",
    desc: "Following expert curriculum, canonical textbooks, and disciplined tutorials.",
  },
  {
    id: "deep",
    name: "Deep Investigation",
    desc: "First-principles deconstruction of a single complex problem or obstacle.",
  },
  {
    id: "adaptive",
    name: "Adaptive / Mixed",
    desc: "Fluid combination of reading, code, hands-on trials, and iterative reflection.",
  },
];

// Investigation Approaches (A5, B5, C6)
const INVESTIGATION_APPROACHES = [
  {
    id: "fundamentals",
    name: "Understand Fundamentals",
    desc: "First principles, basic definitions, and core axiomatic constraints.",
  },
  {
    id: "existing_knowledge",
    name: "Investigate Existing Knowledge",
    desc: "Review canonical models, empirical papers, and established solutions.",
  },
  {
    id: "research",
    name: "Direct Research",
    desc: "Triangulate primary sources and cross-examine conflicting evidence.",
  },
  {
    id: "experiment",
    name: "Experiment or Apply",
    desc: "Execute a concrete trial in code or real-world practice to test assumptions.",
  },
  {
    id: "custom_approach",
    name: "Custom Approach",
    desc: "Tailored exploratory method matching the specific inquiry at hand.",
  },
];

export type InquiryStep =
  | "field_selection" // A1, B1, C1
  | "subject_topic" // A2-A3, B2-B3, C2-C3
  | "define_question" // A4, B4, C4-C5
  | "choose_approach" // A5, B5, C6
  | "active_session" // A6, B6, C7
  | "session_review" // A7, B7, C8
  | "knowledge_detail" // A8, B8, C8
  | "continuity" // A9, B9, C9-C10
  | "paused"; // State when user paused

const INQUIRY_STORAGE_KEY_PREFIX = "yash-os-p3-active-inquiry-";

export function GuidedLearningEngine({
  project,
  foundation,
  onOpenSystemHub,
  initialQuestionId,
}: GuidedLearningEngineProps) {
  const {
    createQuestion,
    createSession,
    createKnowledgeUnit,
    repositories,
    refreshData,
    questions,
    sessions,
  } = useP3();

  const storageKey = `${INQUIRY_STORAGE_KEY_PREFIX}${project?.id || foundation}`;

  // Find existing question if specified
  const existingQuestion = initialQuestionId
    ? questions.find((q) => q.id === initialQuestionId)
    : undefined;

  // Active step state
  const [currentStep, setCurrentStep] = useState<InquiryStep>(
    existingQuestion ? "choose_approach" : "field_selection",
  );

  // Field / Subject / Topic state
  const [selectedField, setSelectedField] = useState<string>(
    foundation === "human_understanding"
      ? HUMAN_FIELDS[0]!.name
      : foundation === "reality_understanding"
        ? REALITY_FIELDS[0]!.name
        : "General Inquiry",
  );
  const [subjectName, setSubjectName] = useState<string>("");
  const [topicName, setTopicName] = useState<string>("");

  // Custom Flow: Purpose & Scope
  const [customIntention, setCustomIntention] = useState<string>(
    project?.name || "",
  );
  const [customPurpose, setCustomPurpose] = useState<string>("");
  const [customApproach, setCustomApproach] = useState<string>(
    CUSTOM_APPROACHES[0]!.name,
  );
  const [customScope, setCustomScope] = useState<string>("");

  // Question state
  const [questionText, setQuestionText] = useState<string>(
    existingQuestion ? existingQuestion.question : "",
  );
  const [questionContext, setQuestionContext] = useState<string>(
    existingQuestion ? existingQuestion.description || "" : "",
  );
  const [questionOrigin, setQuestionOrigin] = useState<QuestionOrigin>(
    existingQuestion ? existingQuestion.origin : "foundation",
  );
  const [questionPriority, setQuestionPriority] = useState<QuestionPriority>(
    existingQuestion ? existingQuestion.priority : "important",
  );
  const [activeQuestion, setActiveQuestion] = useState<
    LearningQuestionEntity | undefined
  >(existingQuestion);

  // Session state
  const [investigationApproach, setInvestigationApproach] = useState<string>(
    INVESTIGATION_APPROACHES[0]!.name,
  );
  const [sessionFocus, setSessionFocus] = useState<string>("");
  const [sessionGoal, setSessionGoal] = useState<string>("");
  const [currentUnderstanding, setCurrentUnderstanding] = useState<string>("");
  const [sessionInsight, setSessionInsight] = useState<string>("");
  const [remainingGaps, setRemainingGaps] = useState<string>("");
  const [sourcesUsed, setSourcesUsed] = useState<string>("");
  const [nextStoppingPoint, setNextStoppingPoint] = useState<string>("");
  const [completedSession, setCompletedSession] = useState<
    LearningSessionEntity | undefined
  >(undefined);

  // Knowledge Unit state
  const [kuTitle, setKuTitle] = useState<string>("");
  const [kuPerspective, setKuPerspective] = useState<KnowledgePerspective>(
    "personal_understanding",
  );
  const [kuCoreUnderstanding, setKuCoreUnderstanding] = useState<string>("");
  const [createdKu, setCreatedKu] = useState<KnowledgeUnitEntity | undefined>(
    undefined,
  );

  const [error, setError] = useState<string | null>(null);
  const [pausedFromStep, setPausedFromStep] =
    useState<InquiryStep>("field_selection");

  // Load persisted draft state on mount if present
  useEffect(() => {
    try {
      const foundationKey = `${INQUIRY_STORAGE_KEY_PREFIX}${foundation}`;
      let raw = localStorage.getItem(storageKey);
      if (!raw && storageKey !== foundationKey) {
        raw = localStorage.getItem(foundationKey);
      }
      if (!raw) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(INQUIRY_STORAGE_KEY_PREFIX)) {
            const candidate = localStorage.getItem(k);
            if (candidate) {
              try {
                const candidateParsed = JSON.parse(candidate) as {
                  currentStep?: unknown;
                  isPaused?: unknown;
                } | null;
                if (
                  candidateParsed &&
                  (candidateParsed.currentStep === "paused" ||
                    candidateParsed.isPaused === true)
                ) {
                  raw = candidate;
                  break;
                }
              } catch {
                /* ignore malformed inquiry entry */
              }
            }
          }
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selectedField) setSelectedField(parsed.selectedField);
        if (parsed.subjectName) setSubjectName(parsed.subjectName);
        if (parsed.topicName) setTopicName(parsed.topicName);
        if (parsed.customIntention) setCustomIntention(parsed.customIntention);
        if (parsed.customPurpose) setCustomPurpose(parsed.customPurpose);
        if (parsed.customScope) setCustomScope(parsed.customScope);
        if (parsed.questionText) setQuestionText(parsed.questionText);
        if (parsed.questionContext) setQuestionContext(parsed.questionContext);
        if (parsed.sessionFocus) setSessionFocus(parsed.sessionFocus);
        if (parsed.currentUnderstanding)
          setCurrentUnderstanding(parsed.currentUnderstanding);
        if (parsed.investigationApproach)
          setInvestigationApproach(parsed.investigationApproach);
        if (parsed.activeQuestion) setActiveQuestion(parsed.activeQuestion);
        if (parsed.completedSession)
          setCompletedSession(parsed.completedSession);

        if (parsed.currentStep === "paused" || parsed.isPaused) {
          setPausedFromStep(parsed.pausedFromStep || "session_review");
          setCurrentStep("paused");
        } else if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch {
      // Ephemeral fallback
    }
  }, [storageKey, foundation]);

  // Persist draft changes
  const saveDraft = (
    step: InquiryStep,
    extra?: { isPaused?: boolean; pausedFrom?: InquiryStep },
  ) => {
    try {
      const payload = JSON.stringify({
        currentStep: step,
        isPaused: Boolean(extra?.isPaused || step === "paused"),
        pausedFromStep: extra?.pausedFrom ?? pausedFromStep,
        selectedField,
        subjectName,
        topicName,
        customIntention,
        customPurpose,
        customScope,
        questionText,
        questionContext,
        sessionFocus,
        currentUnderstanding,
        investigationApproach,
        activeQuestion,
        completedSession,
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem(storageKey, payload);
      localStorage.setItem(
        `${INQUIRY_STORAGE_KEY_PREFIX}${foundation}`,
        payload,
      );
    } catch {
      // Safe fallback
    }
  };

  // Explicit Pause Investigation action
  const handlePauseInvestigation = () => {
    const resumeTarget =
      currentStep === "paused" ? pausedFromStep : currentStep;
    setPausedFromStep(resumeTarget);
    setCurrentStep("paused");
    saveDraft("paused", { isPaused: true, pausedFrom: resumeTarget });
  };

  // Resume action
  const handleResumeInvestigation = () => {
    const target =
      pausedFromStep === "paused" ? "session_review" : pausedFromStep;
    setCurrentStep(target);
    saveDraft(target, { isPaused: false, pausedFrom: target });
  };

  // Discard draft and start fresh
  const handleDiscardDraft = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${INQUIRY_STORAGE_KEY_PREFIX}${foundation}`);
    setCurrentStep("field_selection");
    setQuestionText("");
    setSessionFocus("");
    setCurrentUnderstanding("");
    setActiveQuestion(undefined);
    setCompletedSession(undefined);
    setCreatedKu(undefined);
  };

  // Step A4 / B4 / C5: Confirm Learning Question
  const handleConfirmQuestion = async () => {
    if (!questionText.trim()) {
      setError("Please articulate your learning question clearly.");
      return;
    }
    setError(null);

    const question: LearningQuestionEntity = {
      id: uid(),
      question: questionText.trim(),
      description: questionContext.trim() || "",
      foundationId:
        foundation === "custom" ? "human_understanding" : foundation,
      subjectId: subjectName.trim() || selectedField,
      topicId: topicName.trim() || undefined,
      priority: questionPriority,
      status: "open",
      origin: questionOrigin,
      linkedSessionIds: [],
      linkedKnowledgeUnitIds: [],
      currentUnderstanding: "",
      remainingGaps: "",
      nextLogicalStep: "",
      classification: "general",
      createdAt: today(),
      updatedAt: today(),
    };

    await createQuestion(question);
    await refreshData();
    setActiveQuestion(question);
    setCurrentStep("choose_approach");
    saveDraft("choose_approach");
  };

  // Step A6 / B6 / C7: Save Active Session
  const handleSaveSession = async () => {
    if (!sessionFocus.trim() && !currentUnderstanding.trim()) {
      setError(
        "Please capture at least the session focus or your current understanding.",
      );
      return;
    }
    setError(null);

    const session: LearningSessionEntity = {
      id: uid(),
      title: sessionFocus.trim() || "Focused investigation session",
      status: "completed",
      linkedQuestionIds: activeQuestion ? [activeQuestion.id] : [],
      learningContext: investigationApproach,
      investigation: sessionGoal.trim() || investigationApproach,
      explanationInOwnWords: currentUnderstanding.trim(),
      findings: sessionInsight.trim() || "",
      remainingGaps: remainingGaps.trim() || "",
      linkedKnowledgeUnitIds: [],
      sourceIds: sourcesUsed.trim()
        ? sourcesUsed
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      startTime: today(),
      nextLogicalStep:
        nextStoppingPoint.trim() || "Continue next investigation session",
      classification: "general",
      createdAt: today(),
      updatedAt: today(),
    };

    await createSession(session);

    // Update active learning context for continuity
    await repositories.context.update({
      currentFocus: session.title,
      lastStoppingPoint: nextStoppingPoint.trim() || session.title,
      remainingGaps: remainingGaps.trim() || "Deepen verification",
      nextLogicalStep:
        nextStoppingPoint.trim() || "Continue next investigation session",
      lastActivityAt: today(),
    });

    await refreshData();
    setCompletedSession(session);
    setKuTitle(activeQuestion?.question || session.title);
    setKuCoreUnderstanding(currentUnderstanding.trim());
    setCurrentStep("session_review");
    saveDraft("session_review");
  };

  // Step A8 / B8 / C8: Create Knowledge Unit
  const handleSaveKnowledgeUnit = async () => {
    if (!kuTitle.trim() || !kuCoreUnderstanding.trim()) {
      setError(
        "Please provide a title and core understanding for the knowledge model.",
      );
      return;
    }
    setError(null);

    const kuId = uid();
    const ku: KnowledgeUnitEntity = {
      id: kuId,
      title: kuTitle.trim(),
      summary: kuCoreUnderstanding.trim(),
      perspective: kuPerspective,
      status: "understood",
      classification: "general",
      foundationId:
        foundation === "custom" ? "human_understanding" : foundation,
      subjectId: subjectName.trim() || selectedField,
      topicId: topicName.trim() || undefined,
      identity: {
        id: kuId,
        title: kuTitle.trim(),
        perspective: kuPerspective,
        classification: "general",
        tags: [foundation],
        foundationId:
          foundation === "custom" ? "human_understanding" : foundation,
        subjectId: subjectName.trim() || selectedField,
        topicId: topicName.trim() || undefined,
      },
      coreUnderstanding: {
        plainEnglishExplanation: kuCoreUnderstanding.trim(),
        corePrinciples: sessionInsight.trim() ? [sessionInsight.trim()] : [],
        mentalModels: [],
      },
      deeperUnderstanding: {
        nuancedMechanisms: currentUnderstanding.trim(),
        boundaryConditions: remainingGaps.trim() || "",
        counterExamples: [],
      },
      sourcesAndEvidence: {
        sourceIds: [],
        evidenceIds: [],
        competingTheories: [],
      },
      relationshipsAndApplications: {
        relationshipIds: [],
        applicationRecordIds: [],
      },
      developmentHistory: {
        revisions: [],
      },
      isArchived: false,
      createdAt: today(),
      updatedAt: today(),
    };

    await createKnowledgeUnit(ku);
    await refreshData();
    setCreatedKu(ku);
    setCurrentStep("continuity");
    saveDraft("continuity");
  };

  // Subsequent Session for existing question (Non-overwriting rule)
  const handleStartSubsequentSession = () => {
    setSessionFocus("");
    setSessionGoal("");
    setCurrentUnderstanding("");
    setSessionInsight("");
    setRemainingGaps("");
    setSourcesUsed("");
    setNextStoppingPoint("");
    setCompletedSession(undefined);
    setCreatedKu(undefined);
    setCurrentStep("choose_approach");
    saveDraft("choose_approach");
  };

  // Step Trail calculation
  const getStepNumber = (): { current: number; total: number } => {
    const stepsMap: Record<InquiryStep, number> = {
      field_selection: 1,
      subject_topic: 2,
      define_question: 3,
      choose_approach: 4,
      active_session: 5,
      session_review: 6,
      knowledge_detail: 7,
      continuity: 8,
      paused: 0,
    };
    return { current: stepsMap[currentStep] || 1, total: 8 };
  };

  const { current, total } = getStepNumber();

  return (
    <div className="w-full space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          PERSISTENT TOP CONTROL & ANCHOR BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-p3-border pb-3">
        {/* Left: Project & Step Position */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-accent">
            {foundation.replace("_", " ")}
          </span>
          <span className="text-p3-text-muted">•</span>
          <span className="text-xs text-p3-text-primary font-medium truncate max-w-xs">
            {project?.name || "Active Investigation"}
          </span>
          {currentStep !== "paused" && (
            <span className="text-[11px] text-p3-text-secondary font-mono">
              (Screen {current} of {total})
            </span>
          )}
        </div>

        {/* Right: Actions (Pause & System Hub) */}
        <div className="flex items-center gap-2">
          {currentStep !== "paused" && (
            <button
              type="button"
              onClick={handlePauseInvestigation}
              className="flex items-center gap-1.5 rounded-lg border border-p3-border bg-p3-surface px-3 py-1.5 text-xs font-medium text-p3-text-secondary hover:bg-p3-surface-elevated hover:text-p3-text-primary transition-colors"
            >
              <Pause className="h-3 w-3" />
              <span>Pause Investigation</span>
            </button>
          )}

          {onOpenSystemHub && (
            <button
              type="button"
              onClick={onOpenSystemHub}
              className="flex items-center gap-1.5 rounded-lg border border-p3-border bg-transparent px-3 py-1.5 text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>System Library</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SCREEN STATE: PAUSED
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "paused" && (
        <div className="rounded-2xl border border-p3-border bg-p3-surface p-8 text-center space-y-4 max-w-xl mx-auto animate-in fade-in duration-150">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-p3-border bg-p3-surface-elevated text-p3-accent">
            <Pause className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-p3-text-primary">
              Investigation Paused
            </h2>
            <p className="mt-1 text-xs text-p3-text-secondary leading-relaxed">
              Your inquiry state is safely bookmarked. You can explore existing
              knowledge or resume whenever ready.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded-xl border border-p3-border bg-transparent px-4 py-2 text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
            >
              Discard Draft
            </button>
            <button
              type="button"
              onClick={handleResumeInvestigation}
              className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-xs"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Resume Investigation</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 1 (A1 / B1 / C1): DOMAIN & FIELD SELECTION / INTENTION
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "field_selection" && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-text-muted">
              Screen 1 • Goal: Choose Ontological Scope
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-p3-text-primary">
              {foundation === "custom"
                ? "Define Learning Intention"
                : "Choose Domain Field"}
            </h1>
            <p className="mt-1 text-xs text-p3-text-secondary leading-relaxed">
              {foundation === "custom"
                ? "Specify what you want to learn, understand, investigate, or develop in this project."
                : `Select the branch of ${
                    foundation === "human_understanding" ? "Human" : "Reality"
                  } Understanding for this inquiry.`}
            </p>
          </div>

          {foundation === "custom" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1.5">
                  Learning Intention *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={customIntention}
                  onChange={(e) => setCustomIntention(e.target.value)}
                  placeholder="e.g. Distributed Consensus in Distributed Systems, French Language Mastery"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2.5 text-sm text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:ring-1 focus:ring-p3-accent focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(foundation === "human_understanding"
                ? HUMAN_FIELDS
                : REALITY_FIELDS
              ).map((f) => {
                const isSel = selectedField === f.name;
                return (
                  <div
                    key={f.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedField(f.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setSelectedField(f.name);
                    }}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSel
                        ? "border-p3-accent bg-p3-accent-muted ring-1 ring-p3-accent/50 shadow-sm"
                        : "border-p3-border bg-p3-surface hover:border-p3-accent-border hover:bg-p3-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-p3-text-primary">
                        {f.name}
                      </span>
                      {isSel && (
                        <Check className="h-3.5 w-3.5 text-p3-accent" />
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-p3-text-secondary leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-p3-border">
            <button
              type="button"
              onClick={() => {
                setCurrentStep("subject_topic");
                saveDraft("subject_topic");
              }}
              className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Continue to Subject & Scope</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 2 (A2-A3 / B2-B3 / C2-C3): SUBJECT & TOPIC / SCOPE
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "subject_topic" && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-text-muted">
              Screen 2 • Goal: Define Subject & Boundaries
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-p3-text-primary">
              {foundation === "custom"
                ? "Define Purpose, Approach & Scope"
                : "Specify Subject & Topic"}
            </h1>
            <p className="mt-1 text-xs text-p3-text-secondary leading-relaxed">
              {foundation === "custom"
                ? "Help clarify what you want to understand, why it matters, and your preferred approach."
                : `Narrow down your investigation inside '${selectedField}'.`}
            </p>
          </div>

          {foundation === "custom" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Central Purpose & Useful Outcomes
                </label>
                <textarea
                  rows={2}
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  placeholder="What do you want to understand? What concrete outcome would be useful?"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-2">
                  Preferred Learning Approach
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {CUSTOM_APPROACHES.map((app) => {
                    const isSel = customApproach === app.name;
                    return (
                      <div
                        key={app.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setCustomApproach(app.name)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setCustomApproach(app.name);
                        }}
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          isSel
                            ? "border-p3-accent bg-p3-accent-muted ring-1 ring-p3-accent/50"
                            : "border-p3-border bg-p3-surface hover:border-p3-accent-border hover:bg-p3-surface-elevated"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-p3-text-primary">
                            {app.name}
                          </span>
                          {isSel && (
                            <Check className="h-3.5 w-3.5 text-p3-accent" />
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-p3-text-secondary leading-snug">
                          {app.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Investigation Boundaries & Scope
                </label>
                <input
                  type="text"
                  value={customScope}
                  onChange={(e) => setCustomScope(e.target.value)}
                  placeholder="e.g. Focus on leader election and log replication; ignore cluster membership changes for now"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Subject Area *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder={`e.g. ${
                    foundation === "human_understanding"
                      ? "Dopaminergic Circuitry"
                      : "Quantum Electrodynamics"
                  }`}
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2.5 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Specific Topic (Optional)
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Reward prediction error"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2.5 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-p3-border">
            <button
              type="button"
              onClick={() => setCurrentStep("field_selection")}
              className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentStep("define_question");
                saveDraft("define_question");
              }}
              className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Define Learning Question</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 3 (A4 / B4 / C4-C5): DEFINE LEARNING QUESTION
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "define_question" && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-text-muted">
              Screen 3 • Goal: Articulate Core Uncertainty
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-p3-text-primary">
              Define the Learning Question
            </h1>
            <p className="mt-1 text-xs text-p3-text-secondary leading-relaxed">
              Formulate an explicit, testable uncertainty. The question will be
              created as <strong className="text-p3-accent">Open</strong> and
              will not be resolved until real evidence exists.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-p3-text-primary mb-1">
                Learning Question *
              </label>
              <input
                type="text"
                autoFocus
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. How does tonic vs phasic dopamine affect prefrontal executive control?"
                className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2.5 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:ring-1 focus:ring-p3-accent focus:outline-none"
              />
              {error && (
                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">
                  {error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-p3-text-primary mb-1">
                Context & Initial Hypothesis (Optional)
              </label>
              <textarea
                rows={2}
                value={questionContext}
                onChange={(e) => setQuestionContext(e.target.value)}
                placeholder="What prompted this question? What is your current starting hypothesis?"
                className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:ring-1 focus:ring-p3-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Origin of Question
                </label>
                <select
                  value={questionOrigin}
                  onChange={(e) =>
                    setQuestionOrigin(e.target.value as QuestionOrigin)
                  }
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text focus:border-p3-accent focus:outline-none"
                >
                  <option value="foundation">
                    Permanent Foundation Inquiry
                  </option>
                  <option value="reality">
                    Direct Reality Anomaly / Observation
                  </option>
                  <option value="execution">
                    Execution Bottleneck (Practical Obstacle)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Strategic Priority
                </label>
                <select
                  value={questionPriority}
                  onChange={(e) =>
                    setQuestionPriority(e.target.value as QuestionPriority)
                  }
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text focus:border-p3-accent focus:outline-none"
                >
                  <option value="immediate">Immediate (Active Blocker)</option>
                  <option value="important">
                    Important (Systemic Compounder)
                  </option>
                  <option value="exploratory">
                    Exploratory (Curiosity / Long-Horizon)
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-p3-border">
            <button
              type="button"
              onClick={() => setCurrentStep("subject_topic")}
              className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmQuestion}
              className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Confirm Question & Choose Approach</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 4 (A5 / B5 / C6): CHOOSE INVESTIGATION APPROACH
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "choose_approach" && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-text-muted">
              Screen 4 • Goal: Select Investigation Mode
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded bg-p3-surface-elevated border border-p3-border px-2 py-0.5 text-[10px] font-semibold uppercase text-p3-text-secondary">
                Question
              </span>
              <span className="text-xs text-p3-text-secondary truncate">
                {activeQuestion?.question || questionText}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-p3-text-primary">
              Choose Investigation Approach
            </h1>
            <p className="mt-1 text-xs text-p3-text-secondary">
              How will you examine this question during this specific learning
              session?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {INVESTIGATION_APPROACHES.map((app) => {
              const isSel = investigationApproach === app.name;
              return (
                <div
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setInvestigationApproach(app.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setInvestigationApproach(app.name);
                  }}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                    isSel
                      ? "border-p3-accent bg-p3-accent-muted ring-1 ring-p3-accent/50 shadow-sm"
                      : "border-p3-border bg-p3-surface hover:border-p3-accent-border hover:bg-p3-surface-elevated"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-p3-text-primary">
                      {app.name}
                    </span>
                    {isSel && <Check className="h-3.5 w-3.5 text-p3-accent" />}
                  </div>
                  <p className="mt-1 text-[11px] text-p3-text-secondary leading-snug">
                    {app.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-p3-border">
            <button
              type="button"
              onClick={() => setCurrentStep("define_question")}
              className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentStep("active_session");
                saveDraft("active_session");
              }}
              className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Launch Active Session</span>
              <PlayCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 5 (A6 / B6 / C7): ACTIVE LEARNING SESSION
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "active_session" && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-text-muted">
              Screen 5 • Goal: Capture Investigation Session
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-p3-text-primary">
              Active Learning Session
            </h1>
            <p className="mt-1 text-xs text-p3-text-secondary">
              Inquiry:{" "}
              <strong className="text-p3-text-primary">
                {activeQuestion?.question || questionText}
              </strong>{" "}
              • Mode: {investigationApproach}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Session Focus *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={sessionFocus}
                  onChange={(e) => {
                    setSessionFocus(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Read Huberman & Stanford notes on receptor saturation"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Session Goal (Optional)
                </label>
                <input
                  type="text"
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  placeholder="e.g. Clarify synaptic cleft clearance mechanics"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-p3-text-primary mb-1">
                Current Understanding (In your own words) *
              </label>
              <textarea
                rows={4}
                value={currentUnderstanding}
                onChange={(e) => {
                  setCurrentUnderstanding(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Explain the mechanism or concept as you understand it right now..."
                className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Core Insight / Shift in Perspective
                </label>
                <input
                  type="text"
                  value={sessionInsight}
                  onChange={(e) => setSessionInsight(e.target.value)}
                  placeholder="Key takeaway that shifted your model"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Remaining Gaps / What is Still Unclear
                </label>
                <input
                  type="text"
                  value={remainingGaps}
                  onChange={(e) => setRemainingGaps(e.target.value)}
                  placeholder="What is still confusing or untested?"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Sources Referenced (Comma separated)
                </label>
                <input
                  type="text"
                  value={sourcesUsed}
                  onChange={(e) => setSourcesUsed(e.target.value)}
                  placeholder="e.g. Huberman Lab Ep. 39, Nature 2021"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Next Stopping Point / Resumption Anchor
                </label>
                <input
                  type="text"
                  value={nextStoppingPoint}
                  onChange={(e) => setNextStoppingPoint(e.target.value)}
                  placeholder="Where to pick this investigation back up"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-p3-border">
            <button
              type="button"
              onClick={() => setCurrentStep("choose_approach")}
              className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSaveSession}
              className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Conclude & Review Session</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 6 (A7 / B7 / C8): SESSION REVIEW & KNOWLEDGE DECISION
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "session_review" &&
        (completedSession || sessions[0]) &&
        (() => {
          const reviewSession = completedSession ?? sessions[0]!;
          return (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-text-muted">
                  Screen 6 • Goal: Review Session & Make Knowledge Decision
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-p3-text-primary">
                  Session Review & Knowledge Decision
                </h1>
                <p className="mt-1 text-xs text-p3-text-secondary">
                  Session #{reviewSession.id.slice(0, 8)} recorded cleanly into
                  history. Decide how this investigation develops.
                </p>
              </div>

              {/* Session Summary Card */}
              <div className="rounded-xl border border-p3-border bg-p3-surface p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center text-p3-text-secondary">
                  <span>
                    Date:{" "}
                    <span className="text-p3-text-primary">{today()}</span>
                  </span>
                  <span>
                    Approach:{" "}
                    <span className="text-p3-text-primary">
                      {investigationApproach}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-p3-text-secondary font-medium">
                    Focus:
                  </span>{" "}
                  <span className="text-p3-text-primary">
                    {reviewSession.title}
                  </span>
                </div>
                <div>
                  <span className="text-p3-text-secondary font-medium">
                    Current Understanding:
                  </span>
                  <p className="mt-1 text-p3-text-primary leading-relaxed bg-p3-surface-elevated p-3 rounded-lg border border-p3-border-subtle">
                    {reviewSession.explanationInOwnWords}
                  </p>
                </div>
                {reviewSession.nextLogicalStep && (
                  <div>
                    <span className="text-p3-text-secondary font-medium">
                      Next stopping point:
                    </span>{" "}
                    <span className="text-p3-accent font-medium">
                      {reviewSession.nextLogicalStep}
                    </span>
                  </div>
                )}
              </div>

              {/* 3 Explicit Epistemological Choices */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-p3-text-secondary">
                  Select Epistemological Next Step
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Decision 1: Keep Session Only */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setCurrentStep("continuity");
                      saveDraft("continuity");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setCurrentStep("continuity");
                        saveDraft("continuity");
                      }
                    }}
                    className="cursor-pointer rounded-xl border border-p3-border bg-p3-surface p-4 hover:border-p3-accent-border hover:bg-p3-surface-elevated transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-p3-text-primary">
                        1. Keep as Session Only
                      </h4>
                      <p className="mt-1.5 text-[11px] text-p3-text-secondary leading-relaxed">
                        Preserve this session in history without fabricating a
                        formal Knowledge Unit yet.
                      </p>
                    </div>
                    <span className="mt-4 text-[10px] text-p3-text-muted font-medium">
                      Ideal for exploratory reading
                    </span>
                  </div>

                  {/* Decision 2: Create Knowledge Unit */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setCurrentStep("knowledge_detail");
                      saveDraft("knowledge_detail");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setCurrentStep("knowledge_detail");
                        saveDraft("knowledge_detail");
                      }
                    }}
                    className="cursor-pointer rounded-xl border border-p3-accent bg-p3-accent-muted p-4 ring-1 ring-p3-accent/50 hover:bg-p3-accent-muted/80 transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-p3-text-primary">
                        <Sparkles className="h-3.5 w-3.5 text-p3-accent" />
                        <span>2. Create Knowledge Unit</span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-p3-text-secondary leading-relaxed">
                        Extract and formalize your understanding into a
                        permanent, reusable mental model.
                      </p>
                    </div>
                    <span className="mt-4 text-[10px] text-p3-accent font-medium">
                      When real understanding exists
                    </span>
                  </div>

                  {/* Decision 3: Continue Investigating */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleStartSubsequentSession}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleStartSubsequentSession();
                    }}
                    className="cursor-pointer rounded-xl border border-p3-border bg-p3-surface p-4 hover:border-p3-accent-border hover:bg-p3-surface-elevated transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-p3-text-primary">
                        <RotateCcw className="h-3.5 w-3.5 text-p3-text-secondary" />
                        <span>3. Continue Investigating</span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-p3-text-secondary leading-relaxed">
                        Immediately launch a second session to resolve remaining
                        gaps.
                      </p>
                    </div>
                    <span className="mt-4 text-[10px] text-p3-text-muted font-medium">
                      Carries forward stopping point
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 7 (A8 / B8 / C8): KNOWLEDGE UNIT DETAIL & FORMALIZATION
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "knowledge_detail" && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-text-muted">
              Screen 7 • Goal: Formalize Reusable Mental Model
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-p3-text-primary">
              Formalize Knowledge Unit
            </h1>
            <p className="mt-1 text-xs text-p3-text-secondary">
              Preserve this understanding across the 6 approved sections and 3
              epistemological perspectives.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Knowledge Unit Title *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={kuTitle}
                  onChange={(e) => {
                    setKuTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text focus:border-p3-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Epistemological Perspective *
                </label>
                <select
                  value={kuPerspective}
                  onChange={(e) =>
                    setKuPerspective(e.target.value as KnowledgePerspective)
                  }
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text focus:border-p3-accent focus:outline-none"
                >
                  <option value="objective_knowledge">
                    Objective Knowledge (Empirically verified)
                  </option>
                  <option value="personal_understanding">
                    Personal Understanding (Mental model in user words)
                  </option>
                  <option value="hypothesis">
                    Interpretations / Hypotheses (Working assumption)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-p3-text-primary mb-1">
                Core Understanding *
              </label>
              <textarea
                rows={3}
                value={kuCoreUnderstanding}
                onChange={(e) => {
                  setKuCoreUnderstanding(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2 text-xs text-p3-input-text focus:border-p3-accent focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-p3-border">
            <button
              type="button"
              onClick={() => setCurrentStep("session_review")}
              className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSaveKnowledgeUnit}
              className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Save Knowledge Unit</span>
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 8 (A9 / B9 / C9-C10): CONTINUITY & RESUMPTION ANCHOR
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "continuity" && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-p3-text-muted">
              Screen 8 • Goal: Anchor Resumption & Continuity
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-p3-accent text-xs font-semibold">
              <Check className="h-4 w-4" />
              <span>Investigation Progress Safely Preserved</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-p3-text-primary">
              Investigation Continuity Anchor
            </h1>
            <p className="mt-1 text-xs text-p3-text-secondary">
              All investigation records, sessions, and knowledge links are
              durable. You can safely pause, resume, or expand scope.
            </p>
          </div>

          <div className="rounded-xl border border-p3-border bg-p3-surface p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-p3-text-secondary">Learning Question:</span>
              <span className="font-semibold text-p3-text-primary">
                {activeQuestion?.question || questionText}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-p3-border pt-2.5">
              <span className="text-p3-text-secondary">Lifecycle Status:</span>
              <span className="rounded-md border border-p3-border bg-p3-surface-elevated text-p3-text-secondary px-2 py-0.5 font-medium uppercase text-[10px]">
                {activeQuestion?.status || "open"}
              </span>
            </div>

            {createdKu && (
              <div className="flex items-center justify-between border-t border-p3-border pt-2.5">
                <span className="text-p3-text-secondary">Knowledge Unit:</span>
                <span className="text-p3-text-primary font-medium">
                  {createdKu.title} ({createdKu.status})
                </span>
              </div>
            )}

            {completedSession?.nextLogicalStep && (
              <div className="border-t border-p3-border pt-2.5">
                <span className="text-p3-text-secondary block mb-1">
                  Last Stopping Point / Resumption Anchor:
                </span>
                <span className="text-p3-accent bg-p3-accent-muted px-3 py-1.5 rounded-lg border border-p3-accent/30 block font-medium">
                  {completedSession.nextLogicalStep}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-p3-border">
            <button
              type="button"
              onClick={handleStartSubsequentSession}
              className="flex items-center gap-1.5 rounded-xl border border-p3-border bg-transparent px-4 py-2 text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Start Subsequent Session</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="rounded-xl border border-p3-border px-4 py-2 text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
              >
                New Question
              </button>
              {onOpenSystemHub && (
                <button
                  type="button"
                  onClick={onOpenSystemHub}
                  className="rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-xs"
                >
                  Return to System Library
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
