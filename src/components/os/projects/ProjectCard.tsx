import { ChevronRight, Star } from "lucide-react";
import type { Project } from "@/lib/os/types";
import { Badge, Glass } from "@/components/os/ui";
import { LIFECYCLE_PHASES } from "./projectsMeta";

export interface ProjectCardProps {
  project: Project;
  onOpenDetails: () => void;
}

export function ProjectCard({ project, onOpenDetails }: ProjectCardProps) {
  const docCount = project.docs?.length ?? 0;

  const primaryMilestone =
    (project.milestones ?? []).find(
      (m) => m.isPrimaryActive && m.status === "active",
    ) ?? (project.milestones ?? []).find((m) => m.status === "active");

  const displayMilestone = primaryMilestone?.title || project.milestone || "";

  const lifecycleMeta = LIFECYCLE_PHASES.find(
    (p) => p.id === project.lifecyclePhase,
  );
  const displayLifecycle = lifecycleMeta?.label || "4. Build & Delivery";

  return (
    <Glass
      className="group cursor-pointer p-4 transition-all duration-200 hover:border-glass-border/90 hover:bg-card/50 hover:shadow-md"
      onClick={onOpenDetails}
    >
      <div className="flex items-center justify-between gap-3 select-none">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* 1. Project Name + Small A/B Identifier + Lifecycle Phase Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-sm text-foreground group-hover:text-cyan transition-colors">
              {project.name}
            </h3>

            {project.priorityId === 2 && project.workstream && (
              <span
                className="inline-flex shrink-0 items-center rounded border border-cyan/40 bg-cyan/15 px-1.5 py-0.2 text-[10px] font-bold tracking-wider text-cyan"
                title={
                  project.workstream === "A"
                    ? "Workstream A: Cashflow Generation"
                    : "Workstream B: Fintech Product Capability"
                }
              >
                {project.workstream}
              </span>
            )}

            <span className="rounded bg-secondary/60 px-2 py-0.2 text-[10px] text-muted-foreground font-medium">
              {displayLifecycle}
            </span>
          </div>

          {/* 2. Current Milestone */}
          <div className="truncate text-xs text-muted-foreground">
            {displayMilestone ? (
              <span className="flex items-center gap-1.5 truncate">
                {primaryMilestone?.isPrimaryActive && (
                  <Star className="h-2.5 w-2.5 fill-cyan text-cyan shrink-0" />
                )}
                <span className="text-muted-foreground/70">Milestone: </span>
                <span className="font-medium text-foreground/90 truncate">
                  {displayMilestone}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground/50">No milestone set</span>
            )}
          </div>

          {/* 3. Nearest Deadline & 4. Document Count */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <div className="truncate">
              {project.deadline ? (
                <span>
                  <span className="text-muted-foreground/70">Deadline: </span>
                  <span className="font-medium text-foreground/90">
                    {project.deadline}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground/50">
                  No deadline set
                </span>
              )}
            </div>
            <span className="shrink-0 font-medium text-muted-foreground/80">
              Docs {Math.min(5, docCount)}/5
            </span>
          </div>
        </div>

        {/* 5. Disclosure Arrow */}
        <button
          type="button"
          aria-label="Open project details"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground group-hover:text-foreground group-hover:translate-x-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </Glass>
  );
}

// Backward-compatible alias
export const CollapsedProjectCard = ProjectCard;
export type CollapsedProjectCardProps = ProjectCardProps;
