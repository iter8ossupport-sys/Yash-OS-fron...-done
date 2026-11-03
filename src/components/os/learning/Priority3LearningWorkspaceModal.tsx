import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Layers,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { Badge, Button, Modal } from "@/components/os/ui";
import { cn } from "@/lib/utils";
import type {
  CapabilityArea,
  CapabilityAssessmentState,
  KnowledgeArtifact,
  KnowledgeArtifactCategory,
  LearningJourney,
  LearningJourneyStatus,
  LearningJourneyType,
  LearningResource,
  LearningResourceStatus,
  LearningResourceType,
  LearningReview,
  LearningSession,
  OSState,
} from "@/lib/os/types";
import {
  deleteLearningResource,
  ensureLearningSystem,
  saveCapabilityArea,
  saveKnowledgeArtifact,
  saveLearningJourney,
  saveLearningResource,
  saveLearningReview,
  saveLearningSession,
} from "@/lib/os/learning/state";
import { CreateJourneyModal } from "./CreateJourneyModal";
import { CreateResourceModal } from "./CreateResourceModal";
import { RecordSessionModal } from "./RecordSessionModal";
import { CaptureKnowledgeModal } from "./CaptureKnowledgeModal";
import { AssessCapabilityModal } from "./AssessCapabilityModal";
import { RecordLearningReviewModal } from "./RecordLearningReviewModal";
import { JourneyWorkspaceModal } from "./JourneyWorkspaceModal";

export interface Priority3LearningWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
  state: OSState;
  onUpdateState: (fn: (prev: OSState) => OSState) => void;
  initialJourneyId?: string | null;
}

export type MainLearningTab =
  | "overview"
  | "journeys"
  | "resources"
  | "knowledge"
  | "capabilities"
  | "reviews";

export function Priority3LearningWorkspaceModal({
  open,
  onClose,
  state,
  onUpdateState,
  initialJourneyId = null,
}: Priority3LearningWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<MainLearningTab>("overview");

  // Selected Journey Workspace Modal
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(
    initialJourneyId,
  );

  // Sub-modal states
  const [isCreateJourneyOpen, setIsCreateJourneyOpen] = useState(false);
  const [isCreateResourceOpen, setIsCreateResourceOpen] = useState(false);
  const [editingResource, setEditingResource] =
    useState<LearningResource | null>(null);
  const [isRecordSessionOpen, setIsRecordSessionOpen] = useState(false);
  const [sessionJourneyTarget, setSessionJourneyTarget] =
    useState<LearningJourney | null>(null);
  const [isCaptureKnowledgeOpen, setIsCaptureKnowledgeOpen] = useState(false);
  const [isAssessCapabilityOpen, setIsAssessCapabilityOpen] = useState(false);
  const [editingCapability, setEditingCapability] =
    useState<CapabilityArea | null>(null);
  const [isRecordReviewOpen, setIsRecordReviewOpen] = useState(false);
  const [reviewJourneyTarget, setReviewJourneyTarget] =
    useState<LearningJourney | null>(null);

  // Filters
  const [journeyTypeFilter, setJourneyTypeFilter] = useState<
    "all" | LearningJourneyType
  >("all");
  const [journeyStatusFilter, setJourneyStatusFilter] = useState<
    "all" | LearningJourneyStatus
  >("all");
  const [journeySearchQuery, setJourneySearchQuery] = useState("");

  const [resourceTypeFilter, setResourceTypeFilter] = useState<
    "all" | LearningResourceType
  >("all");
  const [resourceStatusFilter, setResourceStatusFilter] = useState<
    "all" | LearningResourceStatus
  >("all");
  const [resourceSearchQuery, setResourceSearchQuery] = useState("");

  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState<
    "all" | KnowledgeArtifactCategory
  >("all");
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState("");

  const [capabilityStateFilter, setCapabilityStateFilter] = useState<
    "all" | CapabilityAssessmentState
  >("all");

  const system = ensureLearningSystem(state);

  // Computed metrics
  const activeJourneys = system.journeys.filter((j) => j.status === "active");
  const skillJourneysCount = system.journeys.filter(
    (j) => j.type === "skill_development",
  ).length;
  const explorationJourneysCount = system.journeys.filter(
    (j) => j.type === "subject_exploration",
  ).length;
  const demonstratedCapabilitiesCount = system.capabilities.filter(
    (c) =>
      c.currentState === "demonstrated_independently" ||
      c.currentState === "demonstrated_with_support",
  ).length;

  // Filtered lists
  const filteredJourneys = system.journeys.filter((j) => {
    if (journeyTypeFilter !== "all" && j.type !== journeyTypeFilter)
      return false;
    if (journeyStatusFilter !== "all" && j.status !== journeyStatusFilter)
      return false;
    if (
      journeySearchQuery &&
      !j.title.toLowerCase().includes(journeySearchQuery.toLowerCase()) &&
      !j.description?.toLowerCase().includes(journeySearchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredResources = system.resources.filter((r) => {
    if (resourceTypeFilter !== "all" && r.type !== resourceTypeFilter)
      return false;
    if (resourceStatusFilter !== "all" && r.status !== resourceStatusFilter)
      return false;
    if (
      resourceSearchQuery &&
      !r.title.toLowerCase().includes(resourceSearchQuery.toLowerCase()) &&
      !r.authorOrSource
        ?.toLowerCase()
        .includes(resourceSearchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredKnowledge = system.knowledgeArtifacts.filter((k) => {
    if (
      knowledgeCategoryFilter !== "all" &&
      k.category !== knowledgeCategoryFilter
    )
      return false;
    if (
      knowledgeSearchQuery &&
      !k.title.toLowerCase().includes(knowledgeSearchQuery.toLowerCase()) &&
      !k.content.toLowerCase().includes(knowledgeSearchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredCapabilities = system.capabilities.filter((c) => {
    if (
      capabilityStateFilter !== "all" &&
      c.currentState !== capabilityStateFilter
    )
      return false;
    return true;
  });

  // Handlers for quick triggers
  const handleStartSession = (j?: LearningJourney) => {
    setSessionJourneyTarget(j || system.journeys[0] || null);
    setIsRecordSessionOpen(true);
  };

  const handleStartReview = (j?: LearningJourney) => {
    setReviewJourneyTarget(j || system.journeys[0] || null);
    setIsRecordReviewOpen(true);
  };

  // 8-stage execution loop definitions for the Overview
  const loopStages = [
    {
      num: 1,
      title: "PRE-THINK",
      subtitle: "Hypothesis & Bottleneck Scoping",
      content:
        "Before consuming any material, identify the exact bottleneck blocking execution today. Formulate a crisp hypothesis: 'If I learn X, I can unblock bottleneck Y inside Project Z.'",
    },
    {
      num: 2,
      title: "LEARN",
      subtitle: "Targeted High-Leverage Input",
      content:
        "Study the minimal fundamental required to test the hypothesis. Sources: RFC specifications, documentation, academic papers, books, or direct expert guidance. Strictly avoid passive tutorial bingeing.",
    },
    {
      num: 3,
      title: "UNDERSTAND",
      subtitle: "Mental Model Synthesis",
      content:
        "Articulate the concept in plain English without consulting the source. If you cannot explain the mechanism simply, your understanding is incomplete.",
    },
    {
      num: 4,
      title: "APPLY",
      subtitle: "Real Task Trial",
      content:
        "Immediately deploy the understanding inside an active task or experiment in Priority 1 (Venture) or Priority 2 (Cashflow). Knowledge untested by execution evaporates. (Optional for Subject Exploration).",
    },
    {
      num: 5,
      title: "REALITY",
      subtitle: "System & Market Feedback",
      content:
        "Observe what actually happened: Did the build succeed? Did the server hydrate cleanly? Did the order fill as modeled? Did the user convert?",
    },
    {
      num: 6,
      title: "ANALYZE",
      subtitle: "Evidence vs. Hypothesis",
      content:
        "Compare reality against your pre-think expectations. Isolate surprises, failure points, and edge cases.",
    },
    {
      num: 7,
      title: "IMPROVE",
      subtitle: "Distill & Standardize",
      content:
        "Extract the invariant truth. Save it to Yash OS Knowledge as a Principle, Method, or Framework so future execution cycles are permanently faster.",
    },
    {
      num: 8,
      title: "REPEAT",
      subtitle: "Compound & Reinvest",
      content:
        "Re-enter the loop at a higher baseline. Compound capability gains across Priority 1 (Venture) and Priority 2 (Cashflow) iteratively.",
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Priority 3: Learning & Capability Development System"
        wide
        className="max-w-6xl"
      >
        <div className="space-y-4">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-glass-border/70 pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === "overview"
                  ? "bg-violet/15 text-violet border border-violet/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <Brain className="h-3.5 w-3.5" /> 1. Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("journeys")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === "journeys"
                  ? "bg-violet/15 text-violet border border-violet/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <Target className="h-3.5 w-3.5" /> 2. Learning Journeys (
              {system.journeys.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("resources")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === "resources"
                  ? "bg-violet/15 text-violet border border-violet/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <BookOpen className="h-3.5 w-3.5" /> 3. Canonical Resources (
              {system.resources.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("knowledge")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === "knowledge"
                  ? "bg-violet/15 text-violet border border-violet/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <Lightbulb className="h-3.5 w-3.5" /> 4. Knowledge (
              {system.knowledgeArtifacts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("capabilities")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === "capabilities"
                  ? "bg-violet/15 text-violet border border-violet/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <Sparkles className="h-3.5 w-3.5" /> 5. Capability Matrix (
              {system.capabilities.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === "reviews"
                  ? "bg-violet/15 text-violet border border-violet/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <Layers className="h-3.5 w-3.5" /> 6. Reviews (
              {system.reviews.length})
            </button>
          </div>

          {/* VIEW 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* High-Level Philosophy Callout */}
              <div className="flex items-start gap-3 rounded-2xl border border-violet/40 bg-violet/10 p-4 text-xs text-violet-foreground">
                <Brain className="h-5 w-5 shrink-0 text-violet mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-violet block text-sm">
                    FOUNDER CAPABILITY OPERATING SYSTEM
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Learning in Yash OS exists for execution. It supports both
                    practical <strong>Skill Development</strong> (deliberate
                    practice, project application, and verified evidence) and{" "}
                    <strong>Subject Exploration</strong> (understanding,
                    synthesis, and knowledge retention without forced
                    application).
                  </p>
                </div>
              </div>

              {/* System Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Active Journeys
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono text-lg font-bold text-foreground">
                      {activeJourneys.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({skillJourneysCount} Skill / {explorationJourneysCount}{" "}
                      Exp)
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Canonical Resources
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono text-lg font-bold text-foreground">
                      {system.resources.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      shared
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Study Sessions
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono text-lg font-bold text-foreground">
                      {system.sessions.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      logged
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Demonstrated Capabilities
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono text-lg font-bold text-emerald-400">
                      {demonstratedCapabilitiesCount}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      / {system.capabilities.length}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Knowledge Artifacts
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono text-lg font-bold text-violet">
                      {system.knowledgeArtifacts.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      distilled
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-3">
                <span className="text-xs font-semibold text-foreground px-1">
                  Actions:
                </span>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsCreateJourneyOpen(true)}
                  className="h-7 text-xs"
                >
                  <Target className="mr-1 h-3 w-3 text-violet" /> New Journey
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setEditingResource(null);
                    setIsCreateResourceOpen(true);
                  }}
                  className="h-7 text-xs"
                >
                  <BookOpen className="mr-1 h-3 w-3 text-emerald-400" /> Add
                  Resource
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handleStartSession()}
                  className="h-7 text-xs"
                >
                  <Clock className="mr-1 h-3 w-3 text-cyan" /> Record Session
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsCaptureKnowledgeOpen(true)}
                  className="h-7 text-xs"
                >
                  <Lightbulb className="mr-1 h-3 w-3 text-amber-300" /> Capture
                  Knowledge
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setEditingCapability(null);
                    setIsAssessCapabilityOpen(true);
                  }}
                  className="h-7 text-xs"
                >
                  <Sparkles className="mr-1 h-3 w-3 text-pink-400" /> Assess
                  Capability
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handleStartReview()}
                  className="h-7 text-xs"
                >
                  <Layers className="mr-1 h-3 w-3 text-sky-400" /> Conduct
                  Review
                </Button>
              </div>

              {/* Active Journeys Quick Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Active Learning Journeys ({activeJourneys.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-violet"
                    onClick={() => setActiveTab("journeys")}
                  >
                    View All Journeys →
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {activeJourneys.map((j) => {
                    const completedObjs = (j.objectives || []).filter(
                      (o) => o.status === "completed",
                    ).length;
                    const totalObjs = (j.objectives || []).length;
                    const linkedResCount = system.resources.filter((r) =>
                      r.journeyIds.includes(j.id),
                    ).length;

                    return (
                      <div
                        key={j.id}
                        className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/20 p-4 transition-all hover:border-violet/40 hover:bg-secondary/30"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                j.type === "skill_development"
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                  : "border-sky-500/30 bg-sky-500/10 text-sky-300",
                              )}
                            >
                              {j.type === "skill_development"
                                ? "Skill Development"
                                : "Subject Exploration"}
                            </span>

                            <span className="font-mono text-[10px] text-muted-foreground">
                              {totalObjs > 0
                                ? `${completedObjs}/${totalObjs} objectives`
                                : "No objectives"}
                            </span>
                          </div>

                          <h4 className="font-display text-sm font-bold text-foreground">
                            {j.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {j.purpose || j.description}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-glass-border/50 pt-2.5">
                          <span className="text-[11px] text-muted-foreground">
                            {linkedResCount} resource(s) linked
                          </span>
                          <Button
                            variant="glass"
                            size="sm"
                            className="h-7 text-xs text-violet hover:text-foreground"
                            onClick={() => setSelectedJourneyId(j.id)}
                          >
                            Open Journey Workspace →
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* The 8-Stage Execution Loop */}
              <div className="space-y-3 border-t border-glass-border/60 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  The 8-Stage Execution Loop
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {loopStages.map((st) => (
                    <div
                      key={st.num}
                      className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-violet/40 bg-violet/15 font-mono text-[10px] font-bold text-violet">
                          {st.num}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {st.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                        {st.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: LEARNING JOURNEYS */}
          {activeTab === "journeys" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Learning Journeys ({filteredJourneys.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Active and archived capability acquisition & subject
                    exploration tracks.
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsCreateJourneyOpen(true)}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Create Journey
                </Button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-2.5">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={journeySearchQuery}
                    onChange={(e) => setJourneySearchQuery(e.target.value)}
                    placeholder="Search journeys..."
                    className="w-full rounded-lg border border-glass-border bg-secondary/50 pl-8 pr-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">
                    Type:
                  </span>
                  <select
                    value={journeyTypeFilter}
                    onChange={(e) =>
                      setJourneyTypeFilter(
                        e.target.value as "all" | LearningJourneyType,
                      )
                    }
                    className="h-7 rounded-lg border border-glass-border bg-secondary/50 px-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="skill_development">Skill Development</option>
                    <option value="subject_exploration">
                      Subject Exploration
                    </option>
                  </select>

                  <span className="text-[11px] text-muted-foreground ml-2">
                    Status:
                  </span>
                  <select
                    value={journeyStatusFilter}
                    onChange={(e) =>
                      setJourneyStatusFilter(
                        e.target.value as "all" | LearningJourneyStatus,
                      )
                    }
                    className="h-7 rounded-lg border border-glass-border bg-secondary/50 px-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Journeys Grid */}
              {filteredJourneys.length === 0 ? (
                <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground space-y-2">
                  <Target className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p>No learning journeys matching filters.</p>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setIsCreateJourneyOpen(true)}
                  >
                    Create a new journey
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredJourneys.map((j) => {
                    const completedObjs = (j.objectives || []).filter(
                      (o) => o.status === "completed",
                    ).length;
                    const totalObjs = (j.objectives || []).length;
                    const linkedRes = system.resources.filter((r) =>
                      r.journeyIds.includes(j.id),
                    );
                    const linkedSessions = system.sessions.filter(
                      (s) => s.journeyId === j.id,
                    );
                    const linkedApps = system.applications.filter(
                      (a) => a.journeyId === j.id,
                    );

                    return (
                      <div
                        key={j.id}
                        className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/20 p-4 transition-all hover:border-violet/40 hover:bg-secondary/30"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span
                              className={cn(
                                "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                j.type === "skill_development"
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                  : "border-sky-500/30 bg-sky-500/10 text-sky-300",
                              )}
                            >
                              {j.type === "skill_development"
                                ? "Skill Development"
                                : "Subject Exploration"}
                            </span>

                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize",
                                j.status === "active"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : j.status === "paused"
                                    ? "bg-amber-500/15 text-amber-300"
                                    : j.status === "completed"
                                      ? "bg-violet/15 text-violet"
                                      : "bg-muted/30 text-muted-foreground",
                              )}
                            >
                              {j.status}
                            </span>
                          </div>

                          <h4 className="font-display text-base font-bold text-foreground">
                            {j.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {j.purpose || j.description}
                          </p>

                          {/* Stats mini bar */}
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                            <span>
                              {totalObjs} objectives ({completedObjs} done)
                            </span>
                            <span>•</span>
                            <span>{linkedRes.length} resources</span>
                            <span>•</span>
                            <span>{linkedSessions.length} sessions</span>
                            <span>•</span>
                            <span>{linkedApps.length} trials</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-glass-border/50 pt-3">
                          <Button
                            variant="glass"
                            size="sm"
                            className="w-full text-xs text-violet hover:text-foreground"
                            onClick={() => setSelectedJourneyId(j.id)}
                          >
                            Open Journey Workspace →
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: CANONICAL RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Canonical Resource Library ({filteredResources.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Centralized books, documentation, and papers. Shared across
                    journeys without duplicating records.
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setEditingResource(null);
                    setIsCreateResourceOpen(true);
                  }}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Resource
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-2.5">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    placeholder="Search by title, author..."
                    className="w-full rounded-lg border border-glass-border bg-secondary/50 pl-8 pr-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">
                    Type:
                  </span>
                  <select
                    value={resourceTypeFilter}
                    onChange={(e) =>
                      setResourceTypeFilter(
                        e.target.value as "all" | LearningResourceType,
                      )
                    }
                    className="h-7 rounded-lg border border-glass-border bg-secondary/50 px-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="book">Book</option>
                    <option value="documentation">Documentation</option>
                    <option value="paper">Academic Paper</option>
                    <option value="course">Course</option>
                    <option value="article">Article</option>
                    <option value="expert_session">Expert Session</option>
                  </select>

                  <span className="text-[11px] text-muted-foreground ml-2">
                    Status:
                  </span>
                  <select
                    value={resourceStatusFilter}
                    onChange={(e) =>
                      setResourceStatusFilter(
                        e.target.value as "all" | LearningResourceStatus,
                      )
                    }
                    className="h-7 rounded-lg border border-glass-border bg-secondary/50 px-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="to_study">To Study</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="reference">Reference</option>
                  </select>
                </div>
              </div>

              {/* Resources List */}
              {filteredResources.length === 0 ? (
                <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground space-y-2">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p>No resources found.</p>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => {
                      setEditingResource(null);
                      setIsCreateResourceOpen(true);
                    }}
                  >
                    Add first resource
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredResources.map((res) => {
                    const linkedJourneys = system.journeys.filter((j) =>
                      res.journeyIds.includes(j.id),
                    );

                    return (
                      <div
                        key={res.id}
                        className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/20 p-4 transition-all hover:border-violet/40 hover:bg-secondary/30"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="rounded bg-violet/15 px-1.5 py-0.5 text-[10px] font-bold text-violet uppercase">
                                {res.type}
                              </span>
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize",
                                  res.status === "completed"
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : res.status === "in_progress"
                                      ? "bg-amber-500/15 text-amber-300"
                                      : "bg-muted/30 text-muted-foreground",
                                )}
                              >
                                {res.status.replace(/_/g, " ")}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingResource(res);
                                  setIsCreateResourceOpen(true);
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground px-1"
                                title="Edit resource"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateState((s) =>
                                    deleteLearningResource(s, res.id),
                                  )
                                }
                                className="text-muted-foreground hover:text-rose-400 p-1"
                                title="Delete resource"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-display text-sm font-bold text-foreground">
                            {res.title}
                          </h4>
                          {res.authorOrSource && (
                            <p className="text-[11px] text-muted-foreground font-medium">
                              by {res.authorOrSource}
                            </p>
                          )}

                          {res.whyStudying && (
                            <div className="rounded-lg border border-glass-border/60 bg-secondary/30 p-2 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground block text-[11px]">
                                Why studying:
                              </span>
                              {res.whyStudying}
                            </div>
                          )}

                          {/* Multi-journey tags */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Linked Journeys ({linkedJourneys.length}):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {linkedJourneys.map((j) => (
                                <button
                                  key={j.id}
                                  type="button"
                                  onClick={() => setSelectedJourneyId(j.id)}
                                  className="rounded bg-violet/10 px-1.5 py-0.5 text-[10px] text-violet hover:bg-violet/20"
                                  title="Open journey"
                                >
                                  {j.title}
                                </button>
                              ))}
                              {linkedJourneys.length === 0 && (
                                <span className="text-[11px] text-muted-foreground italic">
                                  Not linked to any journey
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {res.urlOrLocation && (
                          <div className="mt-3 border-t border-glass-border/40 pt-2 text-[11px]">
                            <a
                              href={res.urlOrLocation}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-violet hover:underline"
                            >
                              Open External Source{" "}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: KNOWLEDGE */}
          {activeTab === "knowledge" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Distilled Knowledge Artifacts ({filteredKnowledge.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Principles, frameworks, and mental models preserving
                    provenance back to study sessions and canonical resources.
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsCaptureKnowledgeOpen(true)}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Capture Knowledge
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-2.5">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={knowledgeSearchQuery}
                    onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                    placeholder="Search knowledge..."
                    className="w-full rounded-lg border border-glass-border bg-secondary/50 pl-8 pr-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">
                    Category:
                  </span>
                  <select
                    value={knowledgeCategoryFilter}
                    onChange={(e) =>
                      setKnowledgeCategoryFilter(
                        e.target.value as "all" | KnowledgeArtifactCategory,
                      )
                    }
                    className="h-7 rounded-lg border border-glass-border bg-secondary/50 px-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="principle">Principle</option>
                    <option value="framework">Framework</option>
                    <option value="method">Method</option>
                    <option value="mental_model">Mental Model</option>
                    <option value="note">Note</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredKnowledge.length === 0 ? (
                <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground space-y-2">
                  <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p>No knowledge artifacts matching filters.</p>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setIsCaptureKnowledgeOpen(true)}
                  >
                    Capture first artifact
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredKnowledge.map((art) => (
                    <div
                      key={art.id}
                      className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-violet/15 px-1.5 py-0.5 text-[10px] font-bold text-violet uppercase">
                            {art.category.replace(/_/g, " ")}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {art.createdAt.split("T")[0]}
                          </span>
                        </div>

                        <h4 className="font-display text-sm font-bold text-foreground">
                          {art.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {art.content}
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-glass-border/50 pt-2 text-[10px] text-muted-foreground">
                        {art.sourceProvenance?.journeyTitle && (
                          <div>
                            Provenance:{" "}
                            <span className="text-foreground">
                              {art.sourceProvenance.journeyTitle}
                            </span>
                            {art.sourceProvenance.resourceTitle && (
                              <span>
                                {" "}
                                ({art.sourceProvenance.resourceTitle})
                              </span>
                            )}
                          </div>
                        )}
                        {art.tags && art.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {art.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-secondary/60 px-1.5 py-0.2 text-[10px] text-muted-foreground"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: CAPABILITY MATRIX */}
          {activeTab === "capabilities" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Founder Capability Matrix ({filteredCapabilities.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Verified capabilities demonstrated in execution. No vanity
                    levels—demonstrated status strictly requires verified proof.
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setEditingCapability(null);
                    setIsAssessCapabilityOpen(true);
                  }}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Assess Capability
                </Button>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-2.5">
                <span className="text-[11px] text-muted-foreground">
                  State:
                </span>
                <select
                  value={capabilityStateFilter}
                  onChange={(e) =>
                    setCapabilityStateFilter(
                      e.target.value as "all" | CapabilityAssessmentState,
                    )
                  }
                  className="h-7 rounded-lg border border-glass-border bg-secondary/50 px-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="all">All States</option>
                  <option value="demonstrated_independently">
                    Demonstrated Independently
                  </option>
                  <option value="demonstrated_with_support">
                    Demonstrated With Support
                  </option>
                  <option value="developing">Developing</option>
                  <option value="not_assessed">Not Assessed</option>
                </select>
              </div>

              {/* Grid */}
              {filteredCapabilities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground">
                  No capabilities match this filter.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredCapabilities.map((cap) => (
                    <div
                      key={cap.id}
                      className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display text-sm font-bold text-foreground">
                            {cap.name}
                          </h4>
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap capitalize",
                              cap.currentState === "demonstrated_independently"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : cap.currentState ===
                                    "demonstrated_with_support"
                                  ? "bg-cyan/15 text-cyan border border-cyan/30"
                                  : cap.currentState === "developing"
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                    : "bg-muted/20 text-muted-foreground border border-glass-border",
                            )}
                          >
                            {cap.currentState.replace(/_/g, " ")}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {cap.description}
                        </p>

                        {cap.evidence ? (
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs">
                            <span className="font-semibold text-emerald-300 block text-[10px]">
                              Demonstrated Evidence:
                            </span>
                            <p className="text-foreground/90 text-[11px] leading-relaxed">
                              {cap.evidence}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted-foreground italic">
                            No evidence logged yet.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-glass-border/50 pt-2 text-[11px] text-muted-foreground">
                        <span>
                          {cap.reviewDate
                            ? `Last assessed: ${cap.reviewDate.split("T")[0]}`
                            : "Not reviewed"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCapability(cap);
                            setIsAssessCapabilityOpen(true);
                          }}
                          className="h-6 text-[11px] text-violet"
                        >
                          Update Assessment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 6: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Learning & Capability Reviews ({system.reviews.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Evaluating intended vs actual understanding, execution
                    feedback, and next capability increments.
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handleStartReview()}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Conduct Review
                </Button>
              </div>

              {system.reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground space-y-2">
                  <Layers className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p>No learning reviews recorded yet.</p>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => handleStartReview()}
                  >
                    Conduct first review
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {system.reviews.map((rev) => {
                    const journeyTarget = system.journeys.find(
                      (j) => j.id === rev.journeyId,
                    );

                    return (
                      <div
                        key={rev.id}
                        className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {rev.date}
                            </span>
                            {journeyTarget && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedJourneyId(journeyTarget.id)
                                }
                                className="rounded bg-violet/15 px-2 py-0.5 text-xs font-semibold text-violet hover:underline"
                              >
                                {journeyTarget.title}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3 text-xs sm:grid-cols-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              Intended Learning
                            </span>
                            <p className="rounded-lg border border-glass-border/50 bg-secondary/30 p-2 text-foreground">
                              {rev.intendedLearning}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              Actual Understanding
                            </span>
                            <p className="rounded-lg border border-glass-border/50 bg-secondary/30 p-2 text-foreground">
                              {rev.actualUnderstanding}
                            </p>
                          </div>
                        </div>

                        {rev.practicalApplication && (
                          <div className="text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              Practical Application
                            </span>
                            <p className="text-muted-foreground mt-0.5">
                              {rev.practicalApplication}
                            </p>
                          </div>
                        )}

                        {rev.evidence && (
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs">
                            <span className="font-semibold text-emerald-300 block text-[11px]">
                              Verified Evidence:
                            </span>
                            <p className="text-foreground/90 text-[11px] leading-relaxed">
                              {rev.evidence}
                            </p>
                          </div>
                        )}

                        <div className="grid gap-3 text-xs sm:grid-cols-2">
                          {rev.remainingGaps && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                                Remaining Gaps
                              </span>
                              <p className="text-muted-foreground">
                                {rev.remainingGaps}
                              </p>
                            </div>
                          )}
                          {rev.nextImprovement && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-violet block">
                                Next Improvement Action
                              </span>
                              <p className="text-foreground">
                                {rev.nextImprovement}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Sub-modals mounted at root of workspace */}
      {isCreateJourneyOpen && (
        <CreateJourneyModal
          open={isCreateJourneyOpen}
          onClose={() => setIsCreateJourneyOpen(false)}
          capabilities={system.capabilities}
          availableResources={system.resources}
          onSave={(j) => {
            onUpdateState((s) => saveLearningJourney(s, j));
            setIsCreateJourneyOpen(false);
          }}
        />
      )}

      {isCreateResourceOpen && (
        <CreateResourceModal
          open={isCreateResourceOpen}
          onClose={() => {
            setIsCreateResourceOpen(false);
            setEditingResource(null);
          }}
          initialResource={editingResource}
          journeys={system.journeys}
          onSave={(r) => {
            onUpdateState((s) => saveLearningResource(s, r));
            setIsCreateResourceOpen(false);
            setEditingResource(null);
          }}
        />
      )}

      {isRecordSessionOpen && sessionJourneyTarget && (
        <RecordSessionModal
          open={isRecordSessionOpen}
          onClose={() => setIsRecordSessionOpen(false)}
          journeyId={sessionJourneyTarget.id}
          journeyTitle={sessionJourneyTarget.title}
          availableResources={system.resources}
          onSave={(sess) => {
            onUpdateState((s) => saveLearningSession(s, sess));
            setIsRecordSessionOpen(false);
          }}
        />
      )}

      {isCaptureKnowledgeOpen && (
        <CaptureKnowledgeModal
          open={isCaptureKnowledgeOpen}
          onClose={() => setIsCaptureKnowledgeOpen(false)}
          onSave={(art) => {
            onUpdateState((s) => saveKnowledgeArtifact(s, art));
            setIsCaptureKnowledgeOpen(false);
          }}
        />
      )}

      {isAssessCapabilityOpen && (
        <AssessCapabilityModal
          open={isAssessCapabilityOpen}
          onClose={() => {
            setIsAssessCapabilityOpen(false);
            setEditingCapability(null);
          }}
          journeys={system.journeys}
          initialCapability={editingCapability}
          onSave={(cap) => {
            onUpdateState((s) => saveCapabilityArea(s, cap));
            setIsAssessCapabilityOpen(false);
            setEditingCapability(null);
          }}
        />
      )}

      {isRecordReviewOpen && reviewJourneyTarget && (
        <RecordLearningReviewModal
          open={isRecordReviewOpen}
          onClose={() => setIsRecordReviewOpen(false)}
          journeyId={reviewJourneyTarget.id}
          journeyTitle={reviewJourneyTarget.title}
          isExploration={reviewJourneyTarget.type === "subject_exploration"}
          onSave={(rev) => {
            onUpdateState((s) => saveLearningReview(s, rev));
            setIsRecordReviewOpen(false);
          }}
        />
      )}

      {/* Selected Journey Workspace Modal */}
      {selectedJourneyId && (
        <JourneyWorkspaceModal
          open={Boolean(selectedJourneyId)}
          journeyId={selectedJourneyId}
          onClose={() => setSelectedJourneyId(null)}
          state={state}
          onUpdateState={onUpdateState}
        />
      )}
    </>
  );
}
