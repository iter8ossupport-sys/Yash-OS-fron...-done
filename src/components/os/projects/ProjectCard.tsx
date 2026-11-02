import { ChevronRight } from "lucide-react";
import type { Project } from "@/lib/os/types";
import { Glass } from "@/components/os/ui";

export interface ProjectCardProps {
  project: Project;
  onOpenDetails: () => void;
}

export function ProjectCard({ project, onOpenDetails }: ProjectCardProps) {
  const docCount = project.docs?.length ?? 0;

  return (
    <Glass
      className="group cursor-pointer p-4 transition-all duration-200 hover:border-glass-border/90 hover:bg-card/50 hover:shadow-md"
      onClick={onOpenDetails}
    >
      <div className="flex items-center justify-between gap-3 select-none">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* 1. Project Name + Small A/B Identifier for Priority 2 */}
          <div className="flex items-center gap-2">
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
          </div>

          {/* 2. Current Milestone */}
          <div className="truncate text-xs text-muted-foreground">
            {project.milestone ? (
              <span>
                <span className="text-muted-foreground/70">Milestone: </span>
                <span className="font-medium text-foreground/90">
                  {project.milestone}
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
              Docs {docCount}/5
            </span>
          </div>
        </div>

        {/* 5. One Clear Disclosure Arrow */}
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
