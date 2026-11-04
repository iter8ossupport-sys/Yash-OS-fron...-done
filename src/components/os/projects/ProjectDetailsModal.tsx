import { useState } from "react";
import {
  Brain,
  Check,
  FileText,
  Layers,
  ListTree,
  Sliders,
  Star,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button, Modal } from "@/components/os/ui";
import type { Project, ProjectDoc, ProjectDocument } from "@/lib/os/types";
import { PRIORITIES_META } from "./projectsMeta";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import { ProjectGoalsMilestonesTab } from "./ProjectGoalsMilestonesTab";
import { ProjectDocumentsTab } from "./ProjectDocumentsTab";
import { ProjectExecutionPlanTab } from "./ProjectExecutionPlanTab";
import { ProjectPerformanceTab } from "./ProjectPerformanceTab";
import { LegalComplianceEditorModal } from "./LegalComplianceEditorModal";
import { ProjectDocumentEditorModal } from "./ProjectDocumentEditorModal";
import { ensureCanonicalProjectDocuments } from "@/lib/os/logic";

export interface ProjectDetailsModalProps {
  project: Project;
  isActive: boolean;
  onClose: () => void;
  onSave: (p: Project) => void;
  onDelete: () => void;
  onSetActive: (active: boolean) => void;
  onOpenDocEditor?: (doc: ProjectDoc | ProjectDocument | null) => void;
  onOpenLearningWorkspace?: (projectId?: string) => void;
}

export type ProjectDetailTabId =
  | "overview"
  | "goals_milestones"
  | "documents"
  | "execution_plan"
  | "performance";

export function ProjectDetailsModal({
  project,
  isActive,
  onClose,
  onSave,
  onDelete,
  onSetActive,
  onOpenDocEditor,
  onOpenLearningWorkspace,
}: ProjectDetailsModalProps) {
  const [draft, setDraft] = useState<Project>(() =>
    ensureCanonicalProjectDocuments(project),
  );
  const [editingDoc, setEditingDoc] = useState<
    ProjectDoc | ProjectDocument | null
  >(null);
  const [activeTab, setActiveTab] = useState<ProjectDetailTabId>("overview");
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [customCatInput, setCustomCatInput] = useState("");

  const handleSaveDraft = () => {
    // Validate Priority 2 required workstream
    if (draft.priorityId === 2 && !draft.workstream) {
      toast.error(
        "Please select a required workstream (A or B) for Priority 2",
      );
      return;
    }
    onSave(draft);
    onClose();
  };

  const handleToggleCategory = (cat: string) => {
    const cats = draft.learningCategories ?? [];
    if (cats.includes(cat)) {
      setDraft({ ...draft, learningCategories: cats.filter((c) => c !== cat) });
    } else {
      setDraft({ ...draft, learningCategories: [...cats, cat] });
    }
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCatInput.trim();
    if (!trimmed) return;
    const cats = draft.learningCategories ?? [];
    if (!cats.includes(trimmed)) {
      setDraft({ ...draft, learningCategories: [...cats, trimmed] });
    }
    setCustomCatInput("");
  };

  const priorityMeta =
    PRIORITIES_META.find((m) => m.id === draft.priorityId) ??
    PRIORITIES_META[0]!;

  return (
    <Modal open onClose={onClose} title={draft.name || "Project Details"} wide>
      <div className="space-y-5">
        {/* Active Project Status Banner & Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/30 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 font-semibold text-[11px]",
                priorityMeta.badgeClass,
              )}
            >
              #{draft.priorityId} {priorityMeta.name}
            </span>

            {draft.priorityId === 2 && draft.workstream && (
              <span className="rounded-md border border-cyan/40 bg-cyan/15 px-2 py-0.5 text-[11px] font-semibold text-cyan">
                Workstream {draft.workstream}
              </span>
            )}

            {isActive ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-cyan ml-1">
                <Star className="h-3.5 w-3.5 fill-cyan text-cyan" />
                Active project for #{draft.priorityId}
              </span>
            ) : (
              <span className="text-muted-foreground ml-1">
                Not active for #{draft.priorityId}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant={isActive ? "ghost" : "primary"}
            className="h-8 text-xs"
            onClick={() => onSetActive(!isActive)}
          >
            {isActive ? (
              "Unset as active"
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Set as active
              </>
            )}
          </Button>
        </div>

        {/* Priority 3 Learning & Capability Core Banner */}
        {draft.priorityId === 3 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan/40 bg-cyan/10 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan/20 text-cyan">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  Priority 3 Learning & Capability Core Workspace
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  This project operates within the authoritative 6-view Learning
                  & Capability Development system.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="h-8 text-xs font-semibold"
              onClick={() => {
                onClose();
                onOpenLearningWorkspace?.(draft.id);
              }}
            >
              <Brain className="mr-1.5 h-3.5 w-3.5" /> Open Learning Workspace
            </Button>
          </div>
        )}

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-glass-border/70 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeTab === "overview"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Sliders className="h-3.5 w-3.5" /> Overview & Identity
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("goals_milestones")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeTab === "goals_milestones"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Target className="h-3.5 w-3.5" /> Goals & Milestones
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeTab === "documents"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <FileText className="h-3.5 w-3.5" />{" "}
            {draft.priorityId === 2 && draft.workstream === "B"
              ? "6 Documents"
              : "5 Documents"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("execution_plan")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeTab === "execution_plan"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <ListTree className="h-3.5 w-3.5" /> Execution Plan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("performance")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeTab === "performance"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Layers className="h-3.5 w-3.5" /> Performance & Evidence
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "overview" && (
          <ProjectOverviewTab
            draft={draft}
            onChange={setDraft}
            customCatInput={customCatInput}
            setCustomCatInput={setCustomCatInput}
            onAddCustomCategory={handleAddCustomCategory}
            onToggleCategory={handleToggleCategory}
          />
        )}

        {activeTab === "goals_milestones" && (
          <ProjectGoalsMilestonesTab draft={draft} onChange={setDraft} />
        )}

        {activeTab === "documents" && (
          <ProjectDocumentsTab
            draft={draft}
            onOpenDocEditor={(doc) => {
              setEditingDoc(doc);
              onOpenDocEditor?.(doc);
            }}
            onOpenStructuredPlan={() => setActiveTab("execution_plan")}
            onOpenComplianceEditor={() => setShowComplianceModal(true)}
          />
        )}

        {activeTab === "execution_plan" && (
          <ProjectExecutionPlanTab draft={draft} onChange={setDraft} />
        )}

        {activeTab === "performance" && <ProjectPerformanceTab draft={draft} />}

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-glass-border/60 pt-4">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  `Delete project "${draft.name}"? This will remove its active assignment if active.`,
                )
              ) {
                onDelete();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete project
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveDraft}>
              Save Project
            </Button>
          </div>
        </div>
      </div>
      {/* Standardized Project Document Editor Modal */}
      {editingDoc && (
        <ProjectDocumentEditorModal
          project={draft}
          doc={editingDoc}
          onClose={() => setEditingDoc(null)}
          onOpenStructuredPlan={() => {
            setEditingDoc(null);
            setActiveTab("execution_plan");
          }}
          onSave={(savedDoc) => {
            const currentDocs = (draft.docs ?? []) as (
              ProjectDoc | ProjectDocument
            )[];
            const exists = currentDocs.some((d) => d.id === savedDoc.id);
            const updatedDocs = exists
              ? currentDocs.map((d) => (d.id === savedDoc.id ? savedDoc : d))
              : [...currentDocs, savedDoc];

            const updatedDraft: Project = { ...draft, docs: updatedDocs };
            if ("type" in savedDoc) {
              if (savedDoc.type === "evidence_experiments") {
                updatedDraft.evidence = savedDoc.content;
              } else if (savedDoc.type === "decisions_history") {
                updatedDraft.decisions = savedDoc.content;
              } else if (savedDoc.type === "methods_knowledge") {
                updatedDraft.learning = savedDoc.content;
              }
            }

            setDraft(updatedDraft);
            onSave(updatedDraft);
            setEditingDoc(null);
          }}
          onDelete={(docId) => {
            const currentDocs = (draft.docs ?? []) as (
              ProjectDoc | ProjectDocument
            )[];
            const updatedDocs = currentDocs.filter((d) => d.id !== docId);
            const updatedDraft: Project = { ...draft, docs: updatedDocs };
            setDraft(updatedDraft);
            onSave(updatedDraft);
            setEditingDoc(null);
            toast.success("Document deleted");
          }}
        />
      )}

      {/* Legal & Compliance Editor Modal */}
      {showComplianceModal && (
        <LegalComplianceEditorModal
          open={showComplianceModal}
          project={draft}
          onClose={() => setShowComplianceModal(false)}
          onSave={(updated) => {
            setDraft(updated);
            setShowComplianceModal(false);
            onSave(updated);
          }}
        />
      )}
    </Modal>
  );
}
