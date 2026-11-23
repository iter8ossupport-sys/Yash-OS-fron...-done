/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Authoritative Guided Inquiry Flow Modal
 *
 * Implements the approved step-by-step investigation flows:
 * - Flow A: Human Understanding (Screens A2–A12)
 * - Flow B: Reality Understanding (Screens B2–B12)
 * - Flow C: Custom Learning (Screens C2–C12)
 *
 * Strict Architectural Rules:
 * - Connected directly to P3 repository interfaces and reactive context.
 * - Sessions represent investigation activity; KUs represent validated models.
 * - Previous sessions are never overwritten; questions remain Open until explicitly resolved.
 * - Strict black/near-black visual DNA with restrained white accent.
 */

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PlayCircle,
  RotateCcw,
  Sparkles,
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
import { uid, today } from "@/lib/os/seed";

export interface GuidedInquiryFlowModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly foundation: LearningFoundationType;
  readonly initialQuestionId?: string | undefined;
}

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

type FlowStep =
  | "field_selection" // A2, B2, or C2
  | "subject_topic" // A3-A4, B3-B4, or C3
  | "define_question" // A5, B5, C4-C5
  | "choose_approach" // A6, B6, C6
  | "active_session" // A7, B7, C7
  | "session_review" // A8, B8, C8
  | "knowledge_decision" // A9, B9, C8
  | "continuity_overview"; // A10-A12, B10-B12, C9-C12

export function GuidedInquiryFlowModal({
  open,
  onClose,
  foundation,
  initialQuestionId,
}: GuidedInquiryFlowModalProps) {
  const {
    createQuestion,
    createSession,
    createKnowledgeUnit,
    repositories,
    refreshData,
    questions,
  } = useP3();

  // Find initial question if provided
  const existingQuestion = initialQuestionId
    ? questions.find((q) => q.id === initialQuestionId)
    : undefined;

  // Step management
  const [currentStep, setCurrentStep] = useState<FlowStep>(
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
  const [customPurpose, setCustomPurpose] = useState<string>("");
  const [customApproach, setCustomApproach] = useState<string>(
    CUSTOM_APPROACHES[0]!.name,
  );
  const [customScope, setCustomScope] = useState<string>("");

  // Question State
  const [questionTitle, setQuestionTitle] = useState<string>(
    existingQuestion ? existingQuestion.question : "",
  );
  const [questionDescription, setQuestionDescription] = useState<string>(
    existingQuestion ? existingQuestion.description || "" : "",
  );
  const [questionOrigin, setQuestionOrigin] = useState<QuestionOrigin>(
    existingQuestion ? existingQuestion.origin : "foundation",
  );
  const [questionPriority, setQuestionPriority] = useState<QuestionPriority>(
    existingQuestion ? existingQuestion.priority : "important",
  );
  const [createdQuestion, setCreatedQuestion] = useState<
    LearningQuestionEntity | undefined
  >(existingQuestion);

  // Session State
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
  const [createdSession, setCreatedSession] = useState<
    LearningSessionEntity | undefined
  >(undefined);

  // Knowledge Unit State
  const [kuTitle, setKuTitle] = useState<string>("");
  const [kuPerspective, setKuPerspective] = useState<KnowledgePerspective>(
    "personal_understanding",
  );
  const [kuCoreUnderstanding, setKuCoreUnderstanding] = useState<string>("");
  const [createdKu, setCreatedKu] = useState<KnowledgeUnitEntity | undefined>(
    undefined,
  );

  // Validation Error
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  // Question Submission (Step A5/B5/C5)
  const handleCreateQuestion = async () => {
    if (!questionTitle.trim()) {
      setError("Please define a clear learning question title.");
      return;
    }
    setError(null);

    const question: LearningQuestionEntity = {
      id: uid(),
      question: questionTitle.trim(),
      description: questionDescription.trim() || "",
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
    setCreatedQuestion(question);
    setCurrentStep("choose_approach");
  };

  // Session Submission (Step A7/B7/C7)
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
      linkedQuestionIds: createdQuestion ? [createdQuestion.id] : [],
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

    // Update active learning context automatically
    if (nextStoppingPoint.trim() || remainingGaps.trim()) {
      await repositories.context.update({
        currentFocus: session.title,
        lastStoppingPoint: nextStoppingPoint.trim() || session.title,
        remainingGaps: remainingGaps.trim() || "Deepen verification",
        nextLogicalStep:
          nextStoppingPoint.trim() || "Continue next investigation session",
        lastActivityAt: today(),
      });
    }

    await refreshData();
    setCreatedSession(session);
    setKuTitle(createdQuestion?.question || session.title);
    setKuCoreUnderstanding(currentUnderstanding.trim());
    setCurrentStep("session_review");
  };

  // Knowledge Unit Submission (Step A9/B9)
  const handleCreateKnowledgeUnit = async () => {
    if (!kuTitle.trim() || !kuCoreUnderstanding.trim()) {
      setError("Please provide a title and core understanding for the model.");
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
    setCurrentStep("continuity_overview");
  };

  // Subsequent Session Trigger
  const handleStartSubsequentSession = () => {
    setSessionFocus("");
    setSessionGoal("");
    setCurrentUnderstanding("");
    setSessionInsight("");
    setRemainingGaps("");
    setSourcesUsed("");
    setNextStoppingPoint("");
    setCreatedSession(undefined);
    setCreatedKu(undefined);
    setCurrentStep("choose_approach");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-p3-modal-backdrop p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-inquiry-heading"
        className="relative w-full max-w-3xl rounded-2xl border border-p3-border bg-p3-modal-bg p-6 shadow-2xl text-p3-text-primary sm:p-8 overflow-y-auto max-h-[92vh]"
      >
        {/* Navigation Header */}
        <div className="mb-5 flex items-center justify-between border-b border-p3-border pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-1.5 text-xs text-p3-text-secondary hover:text-p3-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Close</span>
            </button>
            <span className="text-p3-text-muted">/</span>
            <span className="text-xs font-semibold text-p3-text-primary capitalize">
              {foundation.replace("_", " ")} Inquiry
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-p3-text-secondary font-mono">
            <span>Step:</span>
            <span className="rounded bg-p3-surface-elevated border border-p3-border px-2 py-0.5 text-p3-text-secondary font-sans">
              {currentStep.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* =========================================================================
            SCREEN A2 / B2 / C2: FIELD & DOMAIN SELECTION
        ========================================================================= */}
        {currentStep === "field_selection" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2
                id="guided-inquiry-heading"
                className="text-xl font-bold tracking-tight text-p3-text-primary sm:text-2xl"
              >
                {foundation === "custom"
                  ? "Define Purpose & Learning Approach"
                  : "Choose Investigation Domain / Field"}
              </h2>
              <p className="mt-1 text-xs text-p3-text-secondary leading-relaxed">
                {foundation === "custom"
                  ? "Clarify what you want to understand, why it matters, and your preferred learning modality."
                  : "Select the permanent ontological domain under which this inquiry belongs."}
              </p>
            </div>

            {foundation === "custom" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-p3-text-primary mb-1">
                    What do you want to learn or explore?
                  </label>
                  <input
                    type="text"
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    placeholder="e.g. Distributed consensus algorithms, French conversation, Options hedging"
                    className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2.5 text-sm text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
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
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        isSel
                          ? "border-p3-accent bg-p3-accent-muted ring-1 ring-p3-accent/50"
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
                      <p className="mt-1 text-[11px] text-p3-text-secondary leading-snug">
                        {f.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep("subject_topic")}
                className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Continue to Subject & Scope</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN A3-A4 / B3-B4 / C3: SUBJECT & TOPIC / SCOPE
        ========================================================================= */}
        {currentStep === "subject_topic" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-p3-text-primary">
                {foundation === "custom"
                  ? "Define Scope & Boundaries"
                  : "Specify Subject & Topic"}
              </h2>
              <p className="mt-1 text-xs text-p3-text-secondary">
                {foundation === "custom"
                  ? "Set boundaries and meaningful milestones for this custom exploration."
                  : `Situate your inquiry inside the '${selectedField}' branch.`}
              </p>
            </div>

            {foundation === "custom" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-p3-text-primary mb-1">
                    Investigation Scope & Boundaries
                  </label>
                  <textarea
                    rows={3}
                    value={customScope}
                    onChange={(e) => setCustomScope(e.target.value)}
                    placeholder="What is strictly in scope? What is explicitly out of scope for now?"
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

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep("field_selection")}
                className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep("define_question")}
                className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Define Learning Question</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN A5 / B5 / C4-C5: DEFINE LEARNING QUESTION
        ========================================================================= */}
        {currentStep === "define_question" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-p3-text-primary">
                Define the Learning Question
              </h2>
              <p className="mt-1 text-xs text-p3-text-secondary">
                Formulate an explicit, testable uncertainty. The question will
                remain Open until verified through real evidence.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Question Title *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={questionTitle}
                  onChange={(e) => {
                    setQuestionTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. How does tonic vs phasic dopamine affect prefrontal executive control?"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2.5 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
                {error && (
                  <p className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-medium">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Detailed Context / Hypothesis (Optional)
                </label>
                <textarea
                  rows={2}
                  value={questionDescription}
                  onChange={(e) => setQuestionDescription(e.target.value)}
                  placeholder="What prompted this question? What is your current starting hypothesis?"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3.5 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
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
                      Permanent Foundation Investigation
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
                    <option value="immediate">
                      Immediate (Active Blocker)
                    </option>
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

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep("subject_topic")}
                className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreateQuestion}
                className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Confirm & Begin Investigation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN A6 / B6 / C6: CHOOSE INVESTIGATION APPROACH
        ========================================================================= */}
        {currentStep === "choose_approach" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-p3-surface-elevated border border-p3-border px-2 py-0.5 text-[10px] font-semibold uppercase text-p3-text-secondary">
                  Question
                </span>
                <span className="text-xs text-p3-text-secondary truncate">
                  {createdQuestion?.question}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-p3-text-primary">
                Choose Session Investigation Approach
              </h2>
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

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep("define_question")}
                className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep("active_session")}
                className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Launch Active Session</span>
                <PlayCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN A7 / B7 / C7: ACTIVE LEARNING SESSION
        ========================================================================= */}
        {currentStep === "active_session" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-p3-text-primary">
                Active Learning Session
              </h2>
              <p className="mt-0.5 text-xs text-p3-text-secondary">
                Inquiry:{" "}
                <span className="text-p3-text-primary font-medium">
                  {createdQuestion?.question}
                </span>{" "}
                • Mode: {investigationApproach}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Session Focus *
                </label>
                <input
                  type="text"
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
                rows={3}
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
                  Core Insight / Realization
                </label>
                <input
                  type="text"
                  value={sessionInsight}
                  onChange={(e) => setSessionInsight(e.target.value)}
                  placeholder="Key takeaway that shifted your perspective"
                  className="w-full rounded-xl border border-p3-input-border bg-p3-input-bg px-3 py-2 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:border-p3-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Remaining Gaps / Unresolved Points
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

            <div className="flex items-center justify-between pt-2">
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
                className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Conclude & Review Session</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN A8 / B8 / C8: SESSION REVIEW & KNOWLEDGE DECISION
        ========================================================================= */}
        {currentStep === "session_review" && createdSession && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-p3-text-primary">
                Session Review & Knowledge Decision
              </h2>
              <p className="mt-0.5 text-xs text-p3-text-secondary">
                Session recorded cleanly with identity ID #
                {createdSession.id.slice(0, 8)}. Decide the next epistemological
                step.
              </p>
            </div>

            {/* Session Summary Card */}
            <div className="rounded-xl border border-p3-border bg-p3-surface p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-p3-text-secondary">
                <span>
                  Date: <span className="text-p3-text-primary">{today()}</span>
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
                  {createdSession.title}
                </span>
              </div>
              <div>
                <span className="text-p3-text-secondary font-medium">
                  Understanding:
                </span>
                <p className="mt-0.5 text-p3-text-primary leading-relaxed bg-p3-surface-elevated p-2.5 rounded-lg border border-p3-border-subtle">
                  {createdSession.explanationInOwnWords}
                </p>
              </div>
              {createdSession.nextLogicalStep && (
                <div>
                  <span className="text-p3-text-secondary font-medium">
                    Next stopping point:
                  </span>{" "}
                  <span className="text-p3-accent font-medium">
                    {createdSession.nextLogicalStep}
                  </span>
                </div>
              )}
            </div>

            {/* Three Explicit Epistemological Choices */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-p3-text-secondary">
                Select Knowledge Action
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Decision 1: Keep Session Only */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentStep("continuity_overview")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setCurrentStep("continuity_overview");
                  }}
                  className="cursor-pointer rounded-xl border border-p3-border bg-p3-surface p-3.5 hover:border-p3-accent-border hover:bg-p3-surface-elevated transition-all flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-p3-text-primary">
                      1. Keep as Session Only
                    </h4>
                    <p className="mt-1 text-[11px] text-p3-text-secondary leading-snug">
                      Preserve this session in history without fabricating a
                      formal Knowledge Unit yet.
                    </p>
                  </div>
                  <span className="mt-3 text-[10px] text-p3-text-muted font-medium">
                    Recommended for early exploratory reading
                  </span>
                </div>

                {/* Decision 2: Create Draft Knowledge Unit */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentStep("knowledge_decision")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setCurrentStep("knowledge_decision");
                  }}
                  className="cursor-pointer rounded-xl border border-p3-accent bg-p3-accent-muted p-3.5 ring-1 ring-p3-accent/50 hover:bg-p3-accent-muted/80 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-p3-text-primary">
                      <Sparkles className="h-3.5 w-3.5 text-p3-accent" />
                      <span>2. Create Knowledge Unit</span>
                    </div>
                    <p className="mt-1 text-[11px] text-p3-text-primary leading-snug">
                      Extract and formalize understanding into a permanent,
                      reusable mental model.
                    </p>
                  </div>
                  <span className="mt-3 text-[10px] text-p3-accent font-medium">
                    When actual understanding exists
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
                  className="cursor-pointer rounded-xl border border-p3-border bg-p3-surface p-3.5 hover:border-p3-accent-border hover:bg-p3-surface-elevated transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-p3-text-primary">
                      <RotateCcw className="h-3.5 w-3.5 text-p3-text-secondary" />
                      <span>3. Continue Investigating</span>
                    </div>
                    <p className="mt-1 text-[11px] text-p3-text-secondary leading-snug">
                      Immediately launch a second session to resolve the
                      identified remaining gaps.
                    </p>
                  </div>
                  <span className="mt-3 text-[10px] text-p3-text-muted font-medium">
                    Carries forward stopping point
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN A9 / B9: KNOWLEDGE UNIT DETAIL & FORMALIZATION
        ========================================================================= */}
        {currentStep === "knowledge_decision" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-p3-text-primary">
                Formalize Knowledge Unit
              </h2>
              <p className="mt-0.5 text-xs text-p3-text-secondary">
                Preserve canonical model across the 6 approved sections and 3
                epistemological perspectives.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-p3-text-primary mb-1">
                  Knowledge Unit Title *
                </label>
                <input
                  type="text"
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
                  Epistemological Perspective
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

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep("session_review")}
                className="text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreateKnowledgeUnit}
                className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Save Knowledge Unit</span>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN A10-A12 / B10-B12 / C9-C12: CONTINUITY & RESUMPTION
        ========================================================================= */}
        {currentStep === "continuity_overview" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 text-xs font-semibold">
                <Check className="h-4 w-4" />
                <span>Investigation Step Preserved</span>
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-p3-text-primary">
                Investigation Continuity Anchor
              </h2>
              <p className="mt-0.5 text-xs text-p3-text-secondary">
                All records, sessions, and insights are persisted. You can
                safely pause or continue.
              </p>
            </div>

            <div className="rounded-xl border border-p3-border bg-p3-surface p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-p3-text-secondary">
                  Learning Question:
                </span>
                <span className="font-semibold text-p3-text-primary">
                  {createdQuestion?.question}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-p3-border pt-2">
                <span className="text-p3-text-secondary">Status:</span>
                <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-medium uppercase text-[10px]">
                  {createdQuestion?.status || "open"}
                </span>
              </div>
              {createdKu && (
                <div className="flex items-center justify-between border-t border-p3-border pt-2">
                  <span className="text-p3-text-secondary">
                    Knowledge Unit:
                  </span>
                  <span className="text-p3-text-primary font-medium">
                    {createdKu.title} ({createdKu.status})
                  </span>
                </div>
              )}
              {createdSession?.nextLogicalStep && (
                <div className="border-t border-p3-border pt-2">
                  <span className="text-p3-text-secondary block mb-1">
                    Last Stopping Point / Resumption Anchor:
                  </span>
                  <span className="text-p3-accent bg-p3-accent-muted px-2.5 py-1 rounded-lg border border-p3-accent/20 block">
                    {createdSession.nextLogicalStep}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={handleStartSubsequentSession}
                className="flex items-center gap-1.5 rounded-xl border border-p3-border bg-transparent px-4 py-2 text-xs font-medium text-p3-text-secondary hover:text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Start Subsequent Session</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-p3-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-opacity shadow-sm"
              >
                Done / Return to Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
