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
// CRITICAL ARCHITECTURAL SAFEGUARD: Priority 3 MUST ALWAYS use Priority3LearningWorkspaceModal from @/components/os/learning. Never replace with obsolete mocks.
import { Priority3LearningWorkspaceModal } from "@/components/os/learning";
import { ensureLearningSystem } from "@/lib/os/learning/state";

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

  const [selectedLearningJourneyId, setSelectedLearningJourneyId] = useState<
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

  const handleOpenLearningWorkspace = (journeyOrProjectId?: string) => {
    if (journeyOrProjectId) {
      const sys = ensureLearningSystem(state);
      const proj = state.projects.find((p) => p.id === journeyOrProjectId);
      const matched = sys.journeys.find(
        (j) =>
          j.id === journeyOrProjectId ||
          j.id === `journey-${journeyOrProjectId}` ||
          (proj && j.title.toLowerCase() === proj.name.toLowerCase()),
      );
      if (!matched && proj) {
        const journeyId = `journey-${proj.id}`;
        const newJourney = {
          id: journeyId,
          title: proj.name,
          description:
            proj.objective ||
            proj.hypothesis ||
            "Priority 3 Learning & Capability Journey",
          type: "skill_development" as const,
          status:
            proj.status === "completed"
              ? ("completed" as const)
              : proj.status === "paused"
                ? ("paused" as const)
                : ("active" as const),
          purposeAndOutcome:
            proj.objective ||
            "Build demonstrated capability through execution.",
          targetOutcomes: proj.metrics
            ? [proj.metrics]
            : ["Demonstrate independent operational capability."],
          currentMilestone: proj.milestone || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          objectives: [
            {
              id: `obj-${proj.id}-1`,
              journeyId,
              title:
                proj.milestone ||
                `Execute foundation milestone for ${proj.name}`,
              status: "active" as const,
              evidenceSummary:
                "Tracked in Learning & Capability Core Workspace.",
              createdAt: new Date().toISOString(),
            },
          ],
        };
        update((s) => ({
          ...s,
          learningSystem: {
            ...sys,
            journeys: [...sys.journeys, newJourney],
          },
        }));
        setSelectedLearningJourneyId(journeyId);
      } else if (matched) {
        setSelectedLearningJourneyId(matched.id);
      } else {
        setSelectedLearningJourneyId(null);
      }
    } else {
      setSelectedLearningJourneyId(null);
    }
    setIsLearningModalOpen(true);
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
        onOpenLearningWorkspace={handleOpenLearningWorkspace}
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
          onOpenLearningWorkspace={(pId?: string) => {
            setActiveDetailsProjectId(null);
            handleOpenLearningWorkspace(pId);
          }}
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

      {/* 6. Priority 3 Learning & Capability Workspace Modal (Authoritative 6-view & 7-journey system) */}
      {isLearningModalOpen && (
        <Priority3LearningWorkspaceModal
          open={isLearningModalOpen}
          onClose={() => {
            setIsLearningModalOpen(false);
            setSelectedLearningJourneyId(null);
          }}
          state={state}
          onUpdateState={(fn) => update(fn)}
          initialJourneyId={selectedLearningJourneyId}
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
