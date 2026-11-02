import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { useOS } from "@/lib/os/store";
import { saveProject, deleteProject, setActiveProject } from "@/lib/os/logic";
import type { PriorityId, Project, ProjectDoc } from "@/lib/os/types";
import { Button, Glass, PageHeader, PriorityIcon } from "@/components/os/ui";
import { cn } from "@/lib/utils";
import {
  PRIORITIES_META,
  ProjectCard,
  ProjectDetailsModal,
  CreateProjectModal,
  ProjectDocumentEditorModal,
} from "@/components/os/projects";

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
  const [isCreating, setIsCreating] = useState(false);

  // Exactly one project's details open at a time in the wide centered layout
  const [activeDetailsProjectId, setActiveDetailsProjectId] = useState<
    string | null
  >(null);

  // Active document editor modal state
  const [docModal, setDocModal] = useState<{
    project: Project;
    doc: ProjectDoc | null;
  } | null>(null);

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

  const openCreateModal = (priorityId?: PriorityId) => {
    setCreatingPriority(priorityId ?? null);
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

      {/* 1. MAIN LAYOUT — THREE HORIZONTAL PRIORITIES */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {PRIORITIES_META.map((meta) => {
          const priorityProjects = state.projects.filter(
            (p) => p.priorityId === meta.id,
          );

          return (
            <div key={meta.id} className="flex min-w-0 flex-col gap-3">
              {/* Priority Header Card */}
              <Glass
                className={cn(
                  "relative border-t-2 p-5 transition-colors",
                  meta.borderClass,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PriorityIcon id={meta.id} />
                    <div>
                      <h2 className="font-display text-base font-semibold text-foreground tracking-tight">
                        {meta.fullName}
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {priorityProjects.length}{" "}
                        {priorityProjects.length === 1 ? "project" : "projects"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => openCreateModal(meta.id)}
                    aria-label={`Add project to ${meta.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>

                {/* Permanent Core Purpose */}
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground/90">
                  {meta.purpose}
                </p>
              </Glass>

              {/* 1. PRIORITY → PROJECT VISUAL CONNECTION */}
              {/* Subtle, premium directional arrow communicating the project belongs to this priority */}
              <div className="flex items-center justify-center py-0.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all hover:scale-105",
                    meta.arrowClass,
                  )}
                  title={`Projects belonging to Priority #${meta.id}`}
                  aria-hidden="true"
                >
                  <ArrowDown className="h-3.5 w-3.5 stroke-[2.2]" />
                </div>
              </div>

              {/* 2. COLLAPSED PROJECTS LIST UNDER THIS PRIORITY */}
              <div className="flex flex-col gap-3">
                {priorityProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
                    No projects under {meta.name} yet.
                    <div className="mt-2">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => openCreateModal(meta.id)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create first project
                      </Button>
                    </div>
                  </div>
                ) : (
                  priorityProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpenDetails={() =>
                        setActiveDetailsProjectId(project.id)
                      }
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
