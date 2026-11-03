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
  Link as LinkIcon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { Badge, Button, Modal } from "@/components/os/ui";
import { cn } from "@/lib/utils";
import type {
  ApplicationRecord,
  CapabilityArea,
  KnowledgeArtifact,
  LearningJourney,
  LearningJourneyStatus,
  LearningObjective,
  LearningObjectiveStatus,
  LearningResource,
  LearningReview,
  LearningSession,
  OSState,
} from "@/lib/os/types";
import {
  deleteApplicationRecord,
  deleteLearningObjective,
  deleteLearningSession,
  ensureLearningSystem,
  saveApplicationRecord,
  saveCapabilityArea,
  saveKnowledgeArtifact,
  saveLearningJourney,
  saveLearningObjective,
  saveLearningResource,
  saveLearningReview,
  saveLearningSession,
} from "@/lib/os/learning/state";
import { CreateResourceModal } from "./CreateResourceModal";
import { RecordSessionModal } from "./RecordSessionModal";
import { RecordApplicationModal } from "./RecordApplicationModal";
import { CaptureKnowledgeModal } from "./CaptureKnowledgeModal";
import { AssessCapabilityModal } from "./AssessCapabilityModal";
import { RecordLearningReviewModal } from "./RecordLearningReviewModal";

export interface JourneyWorkspaceModalProps {
  open: boolean;
  journeyId: string;
  onClose: () => void;
  state: OSState;
  onUpdateState: (fn: (prev: OSState) => OSState) => void;
}

export type JourneyWorkspaceTab =
  | "overview"
  | "objectives"
  | "resources"
  | "sessions"
  | "application"
  | "knowledge"
  | "reviews";

export function JourneyWorkspaceModal({
  open,
  journeyId,
  onClose,
  state,
  onUpdateState,
}: JourneyWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<JourneyWorkspaceTab>("overview");

  // Sub-modal states
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] =
    useState<LearningResource | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isCapabilityModalOpen, setIsCapabilityModalOpen] = useState(false);
  const [editingCapability, setEditingCapability] =
    useState<CapabilityArea | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Quick inline objective adder state
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [newObjTitle, setNewObjTitle] = useState("");
  const [newObjDesc, setNewObjDesc] = useState("");
  const [newObjAppReq, setNewObjAppReq] = useState("");

  const system = ensureLearningSystem(state);
  const journey = system.journeys.find((j) => j.id === journeyId);

  if (!journey) {
    return null;
  }

  const isExploration = journey.type === "subject_exploration";

  // Filter linked items
  const journeyObjectives = journey.objectives || [];
  const journeyResources = system.resources.filter((r) =>
    r.journeyIds.includes(journey.id),
  );
  const availableUnlinkedResources = system.resources.filter(
    (r) => !r.journeyIds.includes(journey.id),
  );
  const journeySessions = system.sessions.filter(
    (s) => s.journeyId === journey.id,
  );
  const journeyApplications = system.applications.filter(
    (a) => a.journeyId === journey.id,
  );
  const journeyCapabilities = system.capabilities.filter(
    (c) =>
      journey.targetCapabilityAreaIds?.includes(c.id) ||
      c.journeyIds?.includes(journey.id),
  );
  const journeyKnowledge = system.knowledgeArtifacts.filter(
    (k) =>
      k.sourceProvenance?.journeyId === journey.id ||
      k.tags?.includes(journey.id),
  );
  const journeyReviews = system.reviews.filter(
    (r) => r.journeyId === journey.id,
  );

  const completedObjectivesCount = journeyObjectives.filter(
    (o) => o.status === "completed",
  ).length;

  // Lifecycle status transitions
  const handleSetStatus = (newStatus: LearningJourneyStatus) => {
    const updated: LearningJourney = {
      ...journey,
      status: newStatus,
      completedAt:
        newStatus === "completed"
          ? new Date().toISOString()
          : journey.completedAt,
    };
    onUpdateState((s) => saveLearningJourney(s, updated));
  };

  // Objective quick actions
  const handleToggleObjective = (obj: LearningObjective) => {
    const nextStatus: LearningObjectiveStatus =
      obj.status === "completed" ? "in_progress" : "completed";
    const updated: LearningObjective = {
      ...obj,
      status: nextStatus,
      completionEvidence:
        nextStatus === "completed"
          ? obj.completionEvidence || "Completed in journey execution."
          : obj.completionEvidence,
    };
    onUpdateState((s) => saveLearningObjective(s, updated));
  };

  const handleCreateObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjTitle.trim()) return;

    const newObj: LearningObjective = {
      id: `obj-${Date.now()}`,
      journeyId: journey.id,
      title: newObjTitle.trim(),
      description: newObjDesc.trim(),
      status: "in_progress",
      practicalApplicationRequirement: newObjAppReq.trim(),
    };

    onUpdateState((s) => saveLearningObjective(s, newObj));
    setNewObjTitle("");
    setNewObjDesc("");
    setNewObjAppReq("");
    setIsAddingObjective(false);
  };

  const handleDeleteObjective = (objId: string) => {
    onUpdateState((s) => deleteLearningObjective(s, journey.id, objId));
  };

  // Resource linkage actions
  const handleLinkExistingResource = (resId: string) => {
    const target = system.resources.find((r) => r.id === resId);
    if (!target) return;
    const updated: LearningResource = {
      ...target,
      journeyIds: [...target.journeyIds, journey.id],
    };
    onUpdateState((s) => saveLearningResource(s, updated));
  };

  const handleUnlinkResource = (resId: string) => {
    const target = system.resources.find((r) => r.id === resId);
    if (!target) return;
    const updated: LearningResource = {
      ...target,
      journeyIds: target.journeyIds.filter((id) => id !== journey.id),
    };
    onUpdateState((s) => saveLearningResource(s, updated));
  };

  return (
    <Modal open={open} onClose={onClose} title="" wide className="max-w-5xl">
      <div className="space-y-4">
        {/* Journey Header Banner */}
        <div className="rounded-2xl border border-glass-border/80 bg-secondary/30 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    journey.type === "skill_development"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      : "border-sky-500/30 bg-sky-500/10 text-sky-300",
                  )}
                >
                  {journey.type === "skill_development"
                    ? "Skill Development"
                    : "Subject Exploration"}
                </span>

                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize",
                    journey.status === "active"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : journey.status === "paused"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : journey.status === "completed"
                          ? "border-violet/30 bg-violet/10 text-violet"
                          : "border-muted/30 bg-muted/10 text-muted-foreground",
                  )}
                >
                  {journey.status}
                </span>

                {isExploration && (
                  <span className="text-[11px] text-muted-foreground italic">
                    (Practical application optional)
                  </span>
                )}
              </div>

              <h2 className="font-display text-xl font-bold text-foreground">
                {journey.title}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                {journey.purpose || journey.description}
              </p>
            </div>

            {/* Status Transition Actions */}
            <div className="flex flex-wrap items-center gap-1.5 sm:self-start">
              {journey.status === "active" ? (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handleSetStatus("paused")}
                  title="Pause learning journey"
                  className="h-8 text-xs text-amber-300 hover:text-amber-200"
                >
                  <Pause className="mr-1 h-3.5 w-3.5" /> Pause
                </Button>
              ) : journey.status === "paused" ? (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handleSetStatus("active")}
                  title="Resume learning journey"
                  className="h-8 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  <Play className="mr-1 h-3.5 w-3.5" /> Resume
                </Button>
              ) : null}

              {journey.status !== "completed" ? (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handleSetStatus("completed")}
                  title="Mark journey as completed"
                  className="h-8 text-xs text-violet hover:text-violet/90"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                </Button>
              ) : (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handleSetStatus("active")}
                  title="Reopen journey"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reopen
                </Button>
              )}

              {journey.status !== "archived" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetStatus("archived")}
                  title="Archive journey"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Archive
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetStatus("active")}
                  title="Unarchive journey"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Unarchive
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 7 Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-glass-border/70 pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "overview"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Brain className="h-3.5 w-3.5" /> Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("objectives")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "objectives"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Target className="h-3.5 w-3.5" /> Objectives (
            {journeyObjectives.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "resources"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <BookOpen className="h-3.5 w-3.5" /> Resources (
            {journeyResources.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "sessions"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Clock className="h-3.5 w-3.5" /> Sessions ({journeySessions.length}
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("application")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "application"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Wrench className="h-3.5 w-3.5" /> Application (
            {journeyApplications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("knowledge")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "knowledge"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Lightbulb className="h-3.5 w-3.5" /> Knowledge (
            {journeyKnowledge.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "reviews"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" /> Capability & Reviews (
            {journeyReviews.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Objectives
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-lg font-bold text-foreground">
                    {completedObjectivesCount}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    / {journeyObjectives.length} completed
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Active Resources
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-lg font-bold text-foreground">
                    {journeyResources.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    in library
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Study Sessions
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-lg font-bold text-foreground">
                    {journeySessions.length}
                  </span>
                  <span className="text-xs text-muted-foreground">logged</span>
                </div>
              </div>

              <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Practical Trials
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-lg font-bold text-foreground">
                    {journeyApplications.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isExploration ? "optional" : "executed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-2.5">
              <span className="text-[11px] font-semibold text-muted-foreground px-1">
                Quick Actions:
              </span>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsSessionModalOpen(true)}
                className="h-7 text-xs"
              >
                <Clock className="mr-1 h-3 w-3 text-cyan" /> Record Session
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => {
                  setEditingResource(null);
                  setIsResourceModalOpen(true);
                }}
                className="h-7 text-xs"
              >
                <BookOpen className="mr-1 h-3 w-3 text-emerald-400" /> Add
                Resource
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsApplicationModalOpen(true)}
                className="h-7 text-xs"
              >
                <Wrench className="mr-1 h-3 w-3 text-amber-300" /> Record
                Application
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsKnowledgeModalOpen(true)}
                className="h-7 text-xs"
              >
                <Lightbulb className="mr-1 h-3 w-3 text-violet" /> Capture
                Knowledge
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
                className="h-7 text-xs"
              >
                <Sparkles className="mr-1 h-3 w-3 text-pink-400" /> Conduct
                Review
              </Button>
            </div>

            {/* Targeted Capability Areas */}
            {journeyCapabilities.length > 0 && (
              <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Targeted Capabilities
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-violet"
                    onClick={() => {
                      setEditingCapability(null);
                      setIsCapabilityModalOpen(true);
                    }}
                  >
                    + Assess Capability
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {journeyCapabilities.map((cap) => (
                    <div
                      key={cap.id}
                      className="rounded-lg border border-glass-border/60 bg-secondary/30 p-2.5 text-xs flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">
                          {cap.name}
                        </span>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {cap.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap capitalize",
                          cap.currentState === "demonstrated_independently"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : cap.currentState === "demonstrated_with_support"
                              ? "bg-cyan/15 text-cyan border border-cyan/30"
                              : cap.currentState === "developing"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-muted/20 text-muted-foreground border border-glass-border",
                        )}
                      >
                        {cap.currentState.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Objectives Progress List */}
            <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Objectives ({completedObjectivesCount}/
                  {journeyObjectives.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] text-foreground"
                  onClick={() => setIsAddingObjective(!isAddingObjective)}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Objective
                </Button>
              </div>

              {isAddingObjective && (
                <form
                  onSubmit={handleCreateObjective}
                  className="rounded-lg border border-violet/30 bg-violet/5 p-3 space-y-2.5"
                >
                  <input
                    type="text"
                    value={newObjTitle}
                    onChange={(e) => setNewObjTitle(e.target.value)}
                    placeholder="Objective title (e.g. Master CSS grid subgrid alignment)"
                    className="w-full rounded-md border border-glass-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                    required
                  />
                  <input
                    type="text"
                    value={newObjDesc}
                    onChange={(e) => setNewObjDesc(e.target.value)}
                    placeholder="Brief description or measurable goal"
                    className="w-full rounded-md border border-glass-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setIsAddingObjective(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="glass"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      Save Objective
                    </Button>
                  </div>
                </form>
              )}

              {journeyObjectives.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No objectives added yet. Click &quot;Add Objective&quot; to
                  define clear learning milestones.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {journeyObjectives.map((obj) => (
                    <div
                      key={obj.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-glass-border/50 bg-secondary/25 px-3 py-2 text-xs transition-colors hover:border-violet/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleObjective(obj)}
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            obj.status === "completed"
                              ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                              : "border-glass-border bg-secondary/40 text-transparent hover:border-violet",
                          )}
                          title="Toggle objective completion"
                        >
                          <CheckCircle2 className="h-3 w-3 fill-current" />
                        </button>
                        <div>
                          <span
                            className={cn(
                              "font-medium block",
                              obj.status === "completed"
                                ? "text-muted-foreground line-through"
                                : "text-foreground",
                            )}
                          >
                            {obj.title}
                          </span>
                          {obj.description && (
                            <span className="text-[11px] text-muted-foreground block">
                              {obj.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase",
                            obj.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-muted/30 text-muted-foreground",
                          )}
                        >
                          {obj.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteObjective(obj.id)}
                          className="text-muted-foreground hover:text-rose-400 p-1"
                          title="Delete objective"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: OBJECTIVES */}
        {activeTab === "objectives" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Learning Objectives ({journeyObjectives.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Specific milestones and capability criteria to master.
                </p>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsAddingObjective(!isAddingObjective)}
                className="h-8 text-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Objective
              </Button>
            </div>

            {isAddingObjective && (
              <form
                onSubmit={handleCreateObjective}
                className="rounded-xl border border-violet/30 bg-violet/5 p-4 space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Objective Title *
                  </label>
                  <input
                    type="text"
                    value={newObjTitle}
                    onChange={(e) => setNewObjTitle(e.target.value)}
                    placeholder="e.g. Master CSS grid subgrid alignment"
                    className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newObjDesc}
                    onChange={(e) => setNewObjDesc(e.target.value)}
                    placeholder="Measurable understanding or behavioral proof"
                    className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                  />
                </div>
                {!isExploration && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Practical Application Requirement (Skill Development)
                    </label>
                    <input
                      type="text"
                      value={newObjAppReq}
                      onChange={(e) => setNewObjAppReq(e.target.value)}
                      placeholder="e.g. Deploy responsive component tree in Yash OS and pass test suite"
                      className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                    />
                  </div>
                )}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsAddingObjective(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="glass"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Save Objective
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {journeyObjectives.length === 0 ? (
                <div className="rounded-xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
                  No learning objectives specified for this journey yet.
                </div>
              ) : (
                journeyObjectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3.5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleObjective(obj)}
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            obj.status === "completed"
                              ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                              : "border-glass-border bg-secondary/40 text-transparent hover:border-violet",
                          )}
                          title="Toggle completion"
                        >
                          <CheckCircle2 className="h-3 w-3 fill-current" />
                        </button>
                        <div>
                          <h4
                            className={cn(
                              "text-xs font-bold",
                              obj.status === "completed"
                                ? "text-muted-foreground line-through"
                                : "text-foreground",
                            )}
                          >
                            {obj.title}
                          </h4>
                          {obj.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                              {obj.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
                            obj.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-muted/30 text-muted-foreground border border-glass-border",
                          )}
                        >
                          {obj.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteObjective(obj.id)}
                          className="text-muted-foreground hover:text-rose-400 p-1"
                          title="Delete objective"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {obj.practicalApplicationRequirement && (
                      <div className="ml-6 rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-[11px] text-amber-200/90">
                        <span className="font-semibold text-amber-300">
                          Application Req:
                        </span>{" "}
                        {obj.practicalApplicationRequirement}
                      </div>
                    )}

                    {obj.completionEvidence && (
                      <div className="ml-6 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-[11px] text-emerald-200/90">
                        <span className="font-semibold text-emerald-300">
                          Verified Evidence:
                        </span>{" "}
                        {obj.completionEvidence}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RESOURCES */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Linked Canonical Resources ({journeyResources.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  High-leverage books, papers, and specs. Resources can be
                  shared across journeys without duplication.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {availableUnlinkedResources.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleLinkExistingResource(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="h-8 rounded-lg border border-glass-border bg-secondary/50 px-2 text-xs text-foreground focus:outline-none focus:border-violet"
                  >
                    <option value="" disabled>
                      + Link from Library ({availableUnlinkedResources.length}{" "}
                      available)
                    </option>
                    {availableUnlinkedResources.map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.title} ({res.type})
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setEditingResource(null);
                    setIsResourceModalOpen(true);
                  }}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> New Resource
                </Button>
              </div>
            </div>

            {journeyResources.length === 0 ? (
              <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground space-y-2">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p>No resources linked to this journey yet.</p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setEditingResource(null);
                    setIsResourceModalOpen(true);
                  }}
                >
                  Add first resource
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {journeyResources.map((res) => (
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
                              setIsResourceModalOpen(true);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground px-1"
                            title="Edit resource"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUnlinkResource(res.id)}
                            className="text-xs text-muted-foreground hover:text-rose-400 px-1"
                            title="Unlink from this journey"
                          >
                            <X className="h-3.5 w-3.5" />
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

                      {res.distilledTakeaways &&
                        res.distilledTakeaways.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Distilled Takeaways (
                              {res.distilledTakeaways.length})
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-muted-foreground">
                              {res.distilledTakeaways
                                .slice(0, 2)
                                .map((takeaway, idx) => (
                                  <li key={idx} className="line-clamp-2">
                                    {takeaway}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-glass-border/40 pt-2 text-[11px] text-muted-foreground">
                      <span>Shared in {res.journeyIds.length} journey(s)</span>
                      {res.urlOrLocation && (
                        <a
                          href={res.urlOrLocation}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-violet hover:underline"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SESSIONS */}
        {activeTab === "sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Deliberate Learning Sessions ({journeySessions.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Active study records capturing concepts, uncertainties,
                  plain-English synthesis, and insights.
                </p>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsSessionModalOpen(true)}
                className="h-8 text-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Record Session
              </Button>
            </div>

            {journeySessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground space-y-2">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p>No study sessions recorded for this journey yet.</p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsSessionModalOpen(true)}
                >
                  Record first session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {journeySessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3 transition-colors hover:border-violet/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-violet">
                          {sess.date}
                        </span>
                        {sess.durationMinutes && (
                          <span className="rounded bg-secondary/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {sess.durationMinutes} min
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-foreground">
                          {sess.conceptStudied}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateState((s) =>
                            deleteLearningSession(s, sess.id),
                          )
                        }
                        className="text-muted-foreground hover:text-rose-400 p-1"
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid gap-3 text-xs sm:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Plain-English Explanation (Mental Model)
                        </span>
                        <p className="rounded-lg border border-glass-border/50 bg-secondary/30 p-2 text-foreground leading-relaxed">
                          {sess.plainEnglishExplanation}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Uncertainty & Questions Tackled
                        </span>
                        <p className="rounded-lg border border-glass-border/50 bg-secondary/30 p-2 text-muted-foreground leading-relaxed">
                          {sess.uncertaintyOrQuestions || "None documented."}
                        </p>
                      </div>
                    </div>

                    {sess.newInsights && (
                      <div className="rounded-lg border border-violet/20 bg-violet/5 p-2.5 text-xs">
                        <span className="font-semibold text-violet block text-[11px]">
                          Key Insights Discovered:
                        </span>
                        <p className="text-foreground/90 mt-0.5 leading-relaxed">
                          {sess.newInsights}
                        </p>
                      </div>
                    )}

                    {sess.nextAction && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ArrowRight className="h-3 w-3 text-violet shrink-0" />
                        <span>
                          Next Action:{" "}
                          <strong className="text-foreground">
                            {sess.nextAction}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: APPLICATION */}
        {activeTab === "application" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Practical Application Records ({journeyApplications.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Testing understanding against reality through project tasks,
                  experiments, and concrete output.
                </p>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsApplicationModalOpen(true)}
                className="h-8 text-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Record Application
              </Button>
            </div>

            {/* Clear Callout For Exploration vs Skill */}
            {isExploration ? (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-200">
                <span className="font-semibold block text-sky-300">
                  Subject Exploration Note:
                </span>
                Practical execution is optional for exploration journeys. Mental
                models, conceptual synthesis, and frameworks can be captured in
                Knowledge Artifacts without requiring an active project trial.
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <span className="font-semibold block text-amber-300">
                  Skill Development Rule:
                </span>
                Practical application is required. Skill capability is only
                verified when tested in an active project task with observable
                evidence.
              </div>
            )}

            {journeyApplications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground space-y-2">
                <Wrench className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p>No practical application trials logged yet.</p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsApplicationModalOpen(true)}
                >
                  Record first application
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {journeyApplications.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/50 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                          {app.type.replace(/_/g, " ")}
                        </span>
                        <h4 className="text-xs font-bold text-foreground">
                          {app.title}
                        </h4>
                        {app.linkedProjectId && (
                          <span className="rounded bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            Project: {app.linkedProjectId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-[10px] font-semibold",
                            app.outcomeAchieved
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-rose-500/15 text-rose-300",
                          )}
                        >
                          {app.outcomeAchieved
                            ? "Success / Validated"
                            : "Iterate / Inconclusive"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateState((s) =>
                              deleteApplicationRecord(s, app.id),
                            )
                          }
                          className="text-muted-foreground hover:text-rose-400 p-1"
                          title="Delete application"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {app.description}
                    </p>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs">
                      <span className="font-semibold text-emerald-300 block text-[11px]">
                        Verifiable Evidence Output:
                      </span>
                      <p className="text-foreground/90 mt-0.5 leading-relaxed font-mono text-[11px]">
                        {app.evidenceOutput}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: KNOWLEDGE */}
        {activeTab === "knowledge" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Knowledge Artifacts ({journeyKnowledge.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Distilled principles, methods, and mental models preserving
                  provenance back to this journey.
                </p>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setIsKnowledgeModalOpen(true)}
                className="h-8 text-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Capture Knowledge
              </Button>
            </div>

            {journeyKnowledge.length === 0 ? (
              <div className="rounded-xl border border-dashed border-glass-border/70 p-8 text-center text-xs text-muted-foreground space-y-2">
                <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p>No knowledge artifacts distilled from this journey yet.</p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsKnowledgeModalOpen(true)}
                >
                  Capture first artifact
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {journeyKnowledge.map((art) => (
                  <div
                    key={art.id}
                    className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-2.5 flex flex-col justify-between"
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

                    <div className="space-y-2 border-t border-glass-border/50 pt-2">
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

                      {art.sourceProvenance?.resourceTitle && (
                        <div className="text-[10px] text-muted-foreground">
                          Derived from:{" "}
                          <strong className="text-foreground">
                            {art.sourceProvenance.resourceTitle}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: CAPABILITY & REVIEWS */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Capability Area Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Target Capability Areas ({journeyCapabilities.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Evidence-backed capability tracking. Demonstrated status
                    strictly requires verifiable proof.
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setEditingCapability(null);
                    setIsCapabilityModalOpen(true);
                  }}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Assess Capability
                </Button>
              </div>

              {journeyCapabilities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-glass-border/70 p-4 text-center text-xs text-muted-foreground">
                  No capability areas linked to this journey yet.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {journeyCapabilities.map((cap) => (
                    <div
                      key={cap.id}
                      className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-xs font-bold text-foreground">
                          {cap.name}
                        </h4>
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap capitalize",
                            cap.currentState === "demonstrated_independently"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : cap.currentState === "demonstrated_with_support"
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

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCapability(cap);
                            setIsCapabilityModalOpen(true);
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

            {/* Learning Reviews Section */}
            <div className="space-y-3 border-t border-glass-border/60 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Learning Reviews ({journeyReviews.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Periodic evaluation of intended learning vs actual
                    capability gains, gaps, and next actions.
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Conduct Review
                </Button>
              </div>

              {journeyReviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
                  No learning reviews conducted for this journey yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {journeyReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          Review Date: {rev.date}
                        </span>
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
                              Next Improvement
                            </span>
                            <p className="text-foreground">
                              {rev.nextImprovement}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sub-modals */}
      {isResourceModalOpen && (
        <CreateResourceModal
          open={isResourceModalOpen}
          onClose={() => {
            setIsResourceModalOpen(false);
            setEditingResource(null);
          }}
          initialResource={editingResource}
          journeys={system.journeys}
          defaultJourneyId={journey.id}
          onSave={(res) => {
            onUpdateState((s) => saveLearningResource(s, res));
            setIsResourceModalOpen(false);
            setEditingResource(null);
          }}
        />
      )}

      {isSessionModalOpen && (
        <RecordSessionModal
          open={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          journeyId={journey.id}
          journeyTitle={journey.title}
          availableResources={system.resources}
          onSave={(sess) => {
            onUpdateState((s) => saveLearningSession(s, sess));
            setIsSessionModalOpen(false);
          }}
        />
      )}

      {isApplicationModalOpen && (
        <RecordApplicationModal
          open={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          journeyId={journey.id}
          journeyTitle={journey.title}
          isExploration={isExploration}
          availableProjects={state.projects.map((p) => ({
            id: p.id,
            name: p.name,
          }))}
          onSave={(app) => {
            onUpdateState((s) => saveApplicationRecord(s, app));
            setIsApplicationModalOpen(false);
          }}
        />
      )}

      {isKnowledgeModalOpen && (
        <CaptureKnowledgeModal
          open={isKnowledgeModalOpen}
          onClose={() => setIsKnowledgeModalOpen(false)}
          journeyId={journey.id}
          journeyTitle={journey.title}
          onSave={(art) => {
            onUpdateState((s) => saveKnowledgeArtifact(s, art));
            setIsKnowledgeModalOpen(false);
          }}
        />
      )}

      {isCapabilityModalOpen && (
        <AssessCapabilityModal
          open={isCapabilityModalOpen}
          onClose={() => {
            setIsCapabilityModalOpen(false);
            setEditingCapability(null);
          }}
          journeys={system.journeys}
          defaultJourneyId={journey.id}
          initialCapability={editingCapability}
          onSave={(cap) => {
            onUpdateState((s) => saveCapabilityArea(s, cap));
            setIsCapabilityModalOpen(false);
            setEditingCapability(null);
          }}
        />
      )}

      {isReviewModalOpen && (
        <RecordLearningReviewModal
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          journeyId={journey.id}
          journeyTitle={journey.title}
          isExploration={isExploration}
          onSave={(rev) => {
            onUpdateState((s) => saveLearningReview(s, rev));
            setIsReviewModalOpen(false);
          }}
        />
      )}
    </Modal>
  );
}
