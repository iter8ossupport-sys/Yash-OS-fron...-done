import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { useOS } from "@/lib/os/store";
import {
  saveProject,
  deleteProject,
  setActiveProject,
  recordTradingSession,
} from "@/lib/os/logic";
import type {
  PriorityId,
  Project,
  ProjectDoc,
  ProjectDocument,
} from "@/lib/os/types";
import { Button, Glass, PageHeader, PriorityIcon } from "@/components/os/ui";
import { cn } from "@/lib/utils";
import {
  PRIORITIES_META,
  ProjectCard,
  ProjectDetailsModal,
  CreateProjectModal,
  ProjectDocumentEditorModal,
  Priority2CashflowSection,
  Priority3LearningSection,
  LearningWorkspaceModal,
  LegalComplianceEditorModal,
  PortfolioHierarchyTree,
} from "@/components/os/projects";
import {
  TradingOperationModal,
  RecordTradingSessionModal,
} from "@/components/os/trading";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Yash OS" },
      {
        name: "description",
        content: "Manage projects under your three permanent priorities.",
      },
      { property: "og:title", content: "Projects — Yash OS" },
      {
        property: "og:description",
        content: "Projects, milestones, evidence and decisions.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { state, update } = useOS();
  const [creatingPriority, setCreatingPriority] = useState<PriorityId | null>(
    null,
  );
  const [creatingWorkstream, setCreatingWorkstream] = useState<
    "A" | "B" | null
  >(null);
  const [isCreating, setIsCreating] = useState(false);

  // Exactly one project's details open at a time in the wide centered layout
  const [activeDetailsProjectId, setActiveDetailsProjectId] = useState<
    string | null
  >(null);

  // Active document editor modal state
  const [docModal, setDocModal] = useState<{
    project: Project;
    doc: ProjectDoc | ProjectDocument | null;
  } | null>(null);

  const [isTradingModalOpen, setIsTradingModalOpen] = useState(false);
  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false);
  const [isRecordSessionOpen, setIsRecordSessionOpen] = useState(false);
  const [complianceProject, setComplianceProject] = useState<Project | null>(
    null,
  );

  const activeProject = activeDetailsProjectId
    ? (state.projects.find((p) => p.id === activeDetailsProjectId) ?? null)
    : null;

  const handleSaveProject = (p: Project) => {
    update((s) => saveProject(s, p));
    toast.success("Project saved");
  };

  const handleDeleteProject = (id: string) => {
    if (activeDetailsProjectId === id) {
      setActiveDetailsProjectId(null);
    }
    update((s) => deleteProject(s, id));
    toast.success("Project deleted");
  };

  const handleSetActive = (
    priorityId: PriorityId,
    projectId: string | null,
  ) => {
    update((s) => setActiveProject(s, priorityId, projectId));
    toast.success(
      projectId
        ? `Set as active for Priority #${priorityId}`
        : `Unset active for Priority #${priorityId}`,
    );
  };

  const openCreateModal = (priorityId?: PriorityId, workstream?: "A" | "B") => {
    setCreatingPriority(priorityId ?? null);
    setCreatingWorkstream(workstream ?? null);
    setIsCreating(true);
  };

  return (
    <div className="w-full">
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        subtitle="Every project lives under one permanent priority."
        actions={
          <Button variant="primary" onClick={() => openCreateModal()}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      {/* 1. PORTFOLIO HIERARCHY TREE LAYOUT */}
      <PortfolioHierarchyTree
        projects={state.projects}
        tradingOperation={state.tradingOperation ?? null}
        onOpenProjectDetails={(id) => setActiveDetailsProjectId(id)}
        onOpenCreateProject={(priorityId, workstream) =>
          openCreateModal(priorityId, workstream)
        }
        onOpenTradingWorkspace={() => setIsTradingModalOpen(true)}
        onOpenRecordSession={() => setIsRecordSessionOpen(true)}
        onOpenLearningWorkspace={() => setIsLearningModalOpen(true)}
      />

      {/* 2. PROJECT DETAILS — WIDE CENTERED LAYOUT (Only 1 project open at a time) */}
      {activeProject && (
        <ProjectDetailsModal
          project={activeProject}
          isActive={state.priorities.some(
            (pr) =>
              pr.id === activeProject.priorityId &&
              pr.activeProjectId === activeProject.id,
          )}
          onClose={() => setActiveDetailsProjectId(null)}
          onSave={(updated) => {
            handleSaveProject(updated);
            setActiveDetailsProjectId(null);
          }}
          onDelete={() => handleDeleteProject(activeProject.id)}
          onSetActive={(active) =>
            handleSetActive(
              activeProject.priorityId,
              active ? activeProject.id : null,
            )
          }
          onOpenDocEditor={(doc) =>
            setDocModal({ project: activeProject, doc })
          }
        />
      )}

      {/* 7. New Project Modal */}
      {isCreating && (
        <CreateProjectModal
          defaultPriority={creatingPriority}
          onClose={() => setIsCreating(false)}
          onCreate={(newProj) => {
            handleSaveProject(newProj);
            setIsCreating(false);
          }}
        />
      )}

      {/* 6. Document Viewer / Editor Modal */}
      {docModal && (
        <ProjectDocumentEditorModal
          project={docModal.project}
          doc={docModal.doc}
          onClose={() => setDocModal(null)}
          onSave={(savedDoc) => {
            const currentDocs = docModal.project.docs ?? [];
            const exists = currentDocs.some((d) => d.id === savedDoc.id);
            const updatedDocs = exists
              ? currentDocs.map((d) => (d.id === savedDoc.id ? savedDoc : d))
              : [...currentDocs, savedDoc];
            handleSaveProject({ ...docModal.project, docs: updatedDocs });
            setDocModal(null);
          }}
          onDelete={(docId) => {
            const currentDocs = docModal.project.docs ?? [];
            const updatedDocs = currentDocs.filter((d) => d.id !== docId);
            handleSaveProject({ ...docModal.project, docs: updatedDocs });
            setDocModal(null);
            toast.success("Document deleted");
          }}
        />
      )}

      {/* Trading Operation Modal */}
      {isTradingModalOpen && (
        <TradingOperationModal
          open={isTradingModalOpen}
          onClose={() => setIsTradingModalOpen(false)}
        />
      )}

      {/* Fast Record Daily Session Modal */}
      {isRecordSessionOpen && state.tradingOperation && (
        <RecordTradingSessionModal
          tradingOperation={state.tradingOperation ?? null}
          onClose={() => setIsRecordSessionOpen(false)}
          onSave={(rec) => {
            update((s) => recordTradingSession(s, rec));
            setIsRecordSessionOpen(false);
          }}
        />
      )}

      {/* Priority 3 Learning Workspace Modal */}
      {isLearningModalOpen && (
        <LearningWorkspaceModal
          open={isLearningModalOpen}
          onClose={() => setIsLearningModalOpen(false)}
        />
      )}

      {/* Standalone Legal & Compliance Editor Modal */}
      {complianceProject && (
        <LegalComplianceEditorModal
          open={Boolean(complianceProject)}
          project={complianceProject}
          onClose={() => setComplianceProject(null)}
          onSave={(updated) => {
            handleSaveProject(updated);
            setComplianceProject(null);
          }}
        />
      )}
    </div>
  );
}
