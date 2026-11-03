import {
  BookOpen,
  Brain,
  CheckCircle2,
  FolderGit2,
  Lightbulb,
  Plus,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Badge, Button, Glass } from "@/components/os/ui";
import type { Project } from "@/lib/os/types";
import { cn } from "@/lib/utils";

export interface Priority3LearningSectionProps {
  projects: Project[];
  onOpenLearningWorkspace: () => void;
  onOpenProjectDetails: (projectId: string) => void;
  onOpenCreateProject: () => void;
}

export function Priority3LearningSection({
  projects = [],
  onOpenLearningWorkspace,
  onOpenProjectDetails,
  onOpenCreateProject,
}: Priority3LearningSectionProps) {
  const learningProjects = projects.filter((p) => p.priorityId === 3);

  const loopStages = [
    { label: "Pre-Think", desc: "Identify bottleneck" },
    { label: "Learn", desc: "Targeted fundamental" },
    { label: "Understand", desc: "Mental model" },
    { label: "Apply", desc: "Real task trial" },
    { label: "Reality", desc: "Empirical feedback" },
    { label: "Analyze", desc: "Evidence vs hypothesis" },
    { label: "Improve", desc: "Promote to knowledge" },
    { label: "Repeat", desc: "Compound capability" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* 1. THE 8-STAGE EXECUTION LEARNING LOOP */}
      <Glass className="relative border-t-2 border-t-violet p-5 transition-all hover:border-violet/50">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-glass-border/50 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-violet/40 bg-violet/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet">
                Core Engine
              </span>
              <span className="rounded-full border border-violet/30 bg-violet/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet">
                ● 8-Stage Loop
              </span>
            </div>
            <h3 className="mt-1 font-display text-base font-semibold text-foreground">
              Learning for Execution
            </h3>
            <p className="text-xs text-muted-foreground">
              Systematic capability acquisition. Zero vanity hours or
              certificates.
            </p>
          </div>
          <Button
            size="sm"
            variant="glass"
            className="h-8 border-violet/40 text-xs text-violet hover:bg-violet/15 hover:text-foreground"
            onClick={onOpenLearningWorkspace}
          >
            <Brain className="mr-1.5 h-3.5 w-3.5" /> Workspace
          </Button>
        </div>

        {/* 8-Stage Operational Flow Strip */}
        <div className="mt-4 space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Operational Learning Loop
          </span>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-8">
            {loopStages.map((stage, i) => (
              <div
                key={stage.label}
                className="group relative flex flex-col justify-between rounded-xl border border-glass-border/60 bg-secondary/30 p-2 text-center transition-all hover:border-violet/40 hover:bg-violet/10"
              >
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground group-hover:text-violet">
                  <span>{i + 1}.</span>
                  <span>{stage.label}</span>
                </div>
                <span className="mt-1 text-[9px] text-muted-foreground/80 leading-tight">
                  {stage.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Cross-Priority Impact */}
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3 transition-colors hover:border-violet/30">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-p1" />
              <span className="text-xs font-semibold text-foreground">
                Accelerates Priority 1
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Unblocks venture engineering, distributed systems hydration, and
              AI agent workflows.
            </p>
          </div>

          <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3 transition-colors hover:border-violet/30">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-cyan" />
              <span className="text-xs font-semibold text-foreground">
                Accelerates Priority 2
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Strengthens market microstructure edge, orderflow profiling, and
              disciplined execution.
            </p>
          </div>
        </div>
      </Glass>

      {/* 2. APPLIED EXECUTION VEHICLES (PRIORITY 3 PROJECTS) */}
      <Glass className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-glass-border/50 pb-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-violet" />
            <h4 className="font-display text-sm font-semibold text-foreground">
              Applied Execution Vehicles
            </h4>
            <Badge className="border-violet/30 bg-violet/10 text-[10px] text-violet">
              {learningProjects.length}{" "}
              {learningProjects.length === 1 ? "Project" : "Projects"}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={onOpenCreateProject}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Project
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {learningProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
              No learning execution projects configured yet.
              <div className="mt-2">
                <Button size="sm" variant="glass" onClick={onOpenCreateProject}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Create First Project
                </Button>
              </div>
            </div>
          ) : (
            learningProjects.map((project) => {
              const activeGoal = (project.goalsHistory ?? []).find(
                (g) => g.id === project.activeGoalId,
              );
              const activeMilestone = (project.milestones ?? []).find(
                (m) => m.status === "active",
              );
              const docsCount = project.docs?.length ?? 0;

              return (
                <div
                  key={project.id}
                  onClick={() => onOpenProjectDetails(project.id)}
                  className="group cursor-pointer rounded-2xl border border-glass-border/80 bg-secondary/25 p-4 transition-all hover:border-violet/50 hover:bg-secondary/40"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onOpenProjectDetails(project.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-violet/30 bg-violet/10 px-2 py-0.5 text-[10px] font-semibold text-violet">
                          Priority 3 Vehicle
                        </span>
                        <span className="rounded bg-secondary/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {docsCount} {docsCount === 1 ? "Doc" : "Docs"}
                        </span>
                      </div>
                      <h5 className="mt-1 font-display text-sm font-semibold text-foreground group-hover:text-violet transition-colors">
                        {project.name}
                      </h5>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.objective || "No objective defined"}
                      </p>
                    </div>
                  </div>

                  {/* Active Goal / Milestone */}
                  {(activeGoal || activeMilestone || project.milestone) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-glass-border/40 pt-2.5 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-violet shrink-0" />
                      <span className="font-medium text-foreground/90">
                        {activeMilestone?.title ||
                          project.milestone ||
                          activeGoal?.text}
                      </span>
                    </div>
                  )}

                  {/* Learning Categories Tags */}
                  {project.learningCategories &&
                    project.learningCategories.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {project.learningCategories.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="rounded-md border border-glass-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {cat}
                          </span>
                        ))}
                        {project.learningCategories.length > 3 && (
                          <span className="text-[10px] text-muted-foreground/70 self-center">
                            +{project.learningCategories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                </div>
              );
            })
          )}
        </div>
      </Glass>
    </div>
  );
}
