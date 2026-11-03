import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useOS } from "@/lib/os/store";
import {
  saveProject,
  deleteProject,
  setActiveProject,
  recordTradingSession,
} from "@/lib/os/logic";
import type { PriorityId, Project } from "@/lib/os/types";
import { Button, PageHeader } from "@/components/os/ui";
import {
  ProjectDetailsModal,
  CreateProjectModal,
  LegalComplianceEditorModal,
  PortfolioHierarchyTree,
} from "@/components/os/projects";
import {
  TradingOperationModal,
  RecordTradingSessionModal,
} from "@/components/os/trading";
import { Priority3LearningWorkspaceModal } from "@/components/os/learning";

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
        />
      )}

      {/* 3. New Project Modal */}
      {isCreating && (
        <CreateProjectModal
          defaultPriority={creatingPriority}
          onClose={() => setIsCreating(false)}
          onCreate={(newProj) => {
            const projectWithWorkstream: Project = {
              ...newProj,
              workstream: creatingWorkstream ?? newProj.workstream,
            };
            handleSaveProject(projectWithWorkstream);
            setIsCreating(false);
          }}
        />
      )}

      {/* 4. Trading Operation Modal */}
      {isTradingModalOpen && (
        <TradingOperationModal
          open={isTradingModalOpen}
          onClose={() => setIsTradingModalOpen(false)}
        />
      )}

      {/* 5. Fast Record Daily Session Modal */}
      {isRecordSessionOpen && state.tradingOperation && (
        <RecordTradingSessionModal
          tradingOperation={state.tradingOperation}
          onClose={() => setIsRecordSessionOpen(false)}
          onSave={(rec) => {
            update((s) => recordTradingSession(s, rec));
            setIsRecordSessionOpen(false);
          }}
        />
      )}

      {/* 6. Priority 3 Learning Workspace Modal */}
      {isLearningModalOpen && (
        <Priority3LearningWorkspaceModal
          open={isLearningModalOpen}
          onClose={() => setIsLearningModalOpen(false)}
          state={state}
          onUpdateState={(fn) => update(fn)}
        />
      )}

      {/* 7. Standalone Legal & Compliance Editor Modal */}
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
