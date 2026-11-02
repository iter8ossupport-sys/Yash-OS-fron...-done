import { AlertTriangle, Flag, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Label, PriorityIcon } from "@/components/os/ui";
import type { Priority, PriorityId, Project } from "@/lib/os/types";

export interface PlanPrioritiesStepProps {
  priorities: Priority[];
  projects: Project[];
  onSetActiveProject: (
    priorityId: PriorityId,
    projectId: string | null,
  ) => void;
}

export function PlanPrioritiesStep({
  priorities,
  projects,
  onSetActiveProject,
}: PlanPrioritiesStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review and verify your active projects, milestones, and bottlenecks
        under the three permanent priorities.
      </p>
      {priorities.map((p) => {
        const eligibleProjects = projects.filter(
          (proj) => proj.priorityId === p.id,
        );
        return (
          <div
            key={p.id}
            className={cn(
              "rounded-2xl border border-glass-border bg-secondary/40 p-5 shadow-sm transition hover:border-primary/40",
              p.id === 1
                ? "border-l-4 border-l-p1"
                : p.id === 2
                  ? "border-l-4 border-l-p2"
                  : "border-l-4 border-l-p3",
            )}
          >
            {/* Priority Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <PriorityIcon id={p.id} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Priority {p.id}
                    </span>
                    <h3 className="font-display text-base font-semibold">
                      {p.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.purpose}</p>
                </div>
              </div>
              <Badge>{p.status}</Badge>
            </div>

            {/* Active Project Highlight & Polished Selection Control */}
            <div className="mt-4 rounded-xl border border-glass-border bg-background/50 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-cyan" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Project:
                  </span>
                  <span className="font-medium text-foreground">
                    {p.project || "No active project"}
                  </span>
                </div>
                {eligibleProjects.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="mb-0 text-[11px]">Switch project:</Label>
                    <select
                      value={p.activeProjectId || ""}
                      aria-label={`Select active project for ${p.name}`}
                      onChange={(e) =>
                        onSetActiveProject(p.id, e.target.value || null)
                      }
                      className="h-8 rounded-lg border border-input bg-secondary/80 px-2 text-xs font-medium text-foreground outline-none transition focus:border-ring"
                    >
                      {eligibleProjects.map((proj) => (
                        <option
                          key={proj.id}
                          value={proj.id}
                          className="bg-popover text-foreground"
                        >
                          {proj.name} ({proj.status})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Visually Separated Milestone and Bottleneck */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-glass-border bg-secondary/30 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-cyan">
                  <Flag className="h-3.5 w-3.5" />
                  <span>Current Milestone</span>
                </div>
                <div className="text-xs text-foreground/90">
                  {p.milestone || "None set"}
                </div>
              </div>

              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Main Bottleneck</span>
                </div>
                <div className="text-xs text-foreground/90">
                  {p.bottleneck || "No bottleneck specified"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">
        Manage your portfolio in Projects or edit foundational goals in
        Settings.
      </p>
    </div>
  );
}
