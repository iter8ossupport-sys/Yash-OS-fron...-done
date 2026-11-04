import {
  ArrowDown,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Flag,
  FolderGit2,
  FolderKanban,
  Layers,
  ListTree,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge, Button, Glass, PriorityIcon } from "@/components/os/ui";
import type { PriorityId, Project, TradingOperation } from "@/lib/os/types";
import { cn } from "@/lib/utils";
import { PRIORITIES_META } from "./projectsMeta";

export interface PortfolioHierarchyTreeProps {
  projects: Project[];
  tradingOperation: TradingOperation | null;
  onOpenProjectDetails: (projectId: string) => void;
  onOpenCreateProject: (
    priorityId?: PriorityId,
    workstream?: "A" | "B",
  ) => void;
  onOpenTradingWorkspace: () => void;
  onOpenRecordSession: () => void;
  onOpenLearningWorkspace: () => void;
}

export function PortfolioHierarchyTree({
  projects,
  tradingOperation,
  onOpenProjectDetails,
  onOpenCreateProject,
  onOpenTradingWorkspace,
  onOpenRecordSession,
  onOpenLearningWorkspace,
}: PortfolioHierarchyTreeProps) {
  const p1Projects = projects.filter((p) => p.priorityId === 1);
  const p2FintechProjects = projects.filter(
    (p) => p.priorityId === 2 && p.workstream === "B",
  );
  const p3Projects = projects.filter((p) => p.priorityId === 3);

  const activeP1Count = p1Projects.filter((p) => p.status === "active").length;
  const activeP2Count =
    (tradingOperation ? 1 : 0) +
    p2FintechProjects.filter((p) => p.status === "active").length;
  const activeP3Count = p3Projects.filter((p) => p.status === "active").length;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* ─────────────────────────────────────────────────────────────
          ROOT: YASH OS PORTFOLIO
      ───────────────────────────────────────────────────────────── */}
      <Glass className="relative z-10 w-full max-w-3xl border border-glass-border/80 p-6 shadow-xl transition-all hover:border-glass-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-glass-border/80 bg-secondary/40 text-foreground shadow-sm">
              <FolderKanban className="h-6 w-6 text-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-glass-border/80 bg-secondary/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Portfolio Root
                </span>
                <span className="text-xs text-muted-foreground">
                  Yash OS Operating Architecture
                </span>
              </div>
              <h1 className="mt-0.5 font-display text-lg font-bold text-foreground tracking-tight sm:text-xl">
                Yash OS Portfolio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenCreateProject()}
              className="h-8 text-xs font-semibold"
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> New Project
            </Button>
          </div>
        </div>

        {/* High-Level Balanced Portfolio Overview Pills */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-glass-border/60 pt-3 sm:grid-cols-4">
          <div className="rounded-xl border border-glass-border/60 bg-secondary/25 p-2.5 text-center">
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
              Strategic Priorities
            </span>
            <span className="text-sm font-bold text-foreground">
              3 Permanent
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/60 bg-secondary/25 p-2.5 text-center">
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
              P1 Active Lines
            </span>
            <span className="text-sm font-bold text-foreground">
              {activeP1Count} {activeP1Count === 1 ? "Project" : "Projects"}
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/60 bg-secondary/25 p-2.5 text-center">
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
              P2 Workstreams
            </span>
            <span className="text-sm font-bold text-foreground">
              2 Branches (A & B)
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/60 bg-secondary/25 p-2.5 text-center">
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
              P3 Execution Lab
            </span>
            <span className="text-sm font-bold text-foreground">
              {activeP3Count} {activeP3Count === 1 ? "Vehicle" : "Vehicles"}
            </span>
          </div>
        </div>
      </Glass>

      {/* ─────────────────────────────────────────────────────────────
          VERTICAL TREE TRUNK & HORIZONTAL DISTRIBUTING CONNECTOR
      ───────────────────────────────────────────────────────────── */}
      <div className="relative flex w-full max-w-5xl flex-col items-center">
        {/* Main central vertical line from Root */}
        <div className="h-6 w-0.5 bg-glass-border" />

        {/* Horizontal distributing line across the 3 branches (hidden on mobile) */}
        <div className="relative hidden w-full lg:block">
          <div className="mx-auto h-0.5 w-[76%] bg-glass-border" />
          {/* Vertical drops to each of the 3 columns */}
          <div className="absolute left-[12%] top-0 h-4 w-0.5 -translate-x-1/2 bg-glass-border" />
          <div className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-glass-border" />
          <div className="absolute left-[88%] top-0 h-4 w-0.5 -translate-x-1/2 bg-glass-border" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          THREE STRATEGIC BRANCHES (BALANCED TREE LAYOUT)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* =========================================================
            BRANCH 1: PRIORITY 1 — FOUNDER CAPABILITY
        ========================================================= */}
        <div className="flex min-w-0 flex-col gap-3">
          {/* Branch 1 Header Card */}
          <Glass className="relative border border-glass-border/80 p-4 shadow-md transition-all hover:border-glass-border hover:bg-secondary/20">
            <div className="flex items-start gap-3 border-b border-glass-border/60 pb-3">
              <PriorityIcon
                id={1}
                className="h-10 w-10 shrink-0 border-glass-border/80 bg-secondary/40 text-foreground"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border border-glass-border/80 bg-secondary/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Priority 1
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Core System
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 shrink-0 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => onOpenCreateProject(1)}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Project
                  </Button>
                </div>
                <h2 className="font-display text-base font-semibold text-foreground tracking-tight">
                  Founder Capability
                </h2>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {PRIORITIES_META[0]?.purpose}
            </p>
          </Glass>

          {/* Directional Down Connector */}
          <div className="flex items-center justify-center py-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-glass-border bg-secondary/50 text-muted-foreground shadow-sm">
              <ArrowDown className="h-3 w-3 stroke-[2]" />
            </div>
          </div>

          {/* Priority 1 Project Cards */}
          <div className="flex flex-col gap-3">
            {p1Projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
                No active projects under Priority 1.
                <div className="mt-2">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => onOpenCreateProject(1)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Create first project
                  </Button>
                </div>
              </div>
            ) : (
              p1Projects.map((project) => (
                <ProjectHierarchyCard
                  key={project.id}
                  project={project}
                  onOpenDetails={() => onOpenProjectDetails(project.id)}
                  accentColor="p1"
                  badgeText="Docs 5/5 Standardized"
                />
              ))
            )}
          </div>
        </div>

        {/* =========================================================
            BRANCH 2: PRIORITY 2 — CASHFLOW INFRASTRUCTURE
        ========================================================= */}
        <div className="flex min-w-0 flex-col gap-3">
          {/* Branch 2 Header Card */}
          <Glass className="relative border border-glass-border/80 p-4 shadow-md transition-all hover:border-glass-border hover:bg-secondary/20">
            <div className="flex items-start gap-3 border-b border-glass-border/60 pb-3">
              <PriorityIcon
                id={2}
                className="h-10 w-10 shrink-0 border-glass-border/80 bg-secondary/40 text-foreground"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border border-glass-border/80 bg-secondary/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Priority 2
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Cashflow Engine
                    </span>
                  </div>
                  <span className="rounded-md border border-glass-border/80 bg-secondary/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    2 Workstreams
                  </span>
                </div>
                <h2 className="font-display text-base font-semibold text-foreground tracking-tight">
                  Cashflow Infrastructure
                </h2>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {PRIORITIES_META[1]?.purpose}
            </p>
          </Glass>

          {/* Directional Down Connector */}
          <div className="flex items-center justify-center py-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-glass-border bg-secondary/50 text-muted-foreground shadow-sm">
              <ArrowDown className="h-3 w-3 stroke-[2]" />
            </div>
          </div>

          {/* Priority 2 Sub-Branches Container */}
          <div className="flex flex-col gap-4">
            {/* ─────────────────────────────────────────────────────
                CHILD BRANCH 2A: WORKSTREAM A — TRADING OPERATION
            ───────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-glass-border/80 bg-secondary/20 p-4 transition-all hover:border-glass-border">
              <div className="flex items-start justify-between gap-2 border-b border-glass-border/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border border-glass-border/80 bg-secondary/40 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                      Workstream A
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Financial Execution
                    </span>
                  </div>
                  <h3 className="font-display text-xs font-bold text-foreground">
                    Trading Operation
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="glass"
                    className="h-6 px-2 text-[10px] text-cyan hover:bg-cyan/15"
                    onClick={onOpenTradingWorkspace}
                    title="Open Trading Workspace"
                  >
                    Workspace <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Trading Operation Card Details */}
              {tradingOperation ? (
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-xs text-foreground block">
                        {tradingOperation.name}
                      </span>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {tradingOperation.operatingProfile
                          .coreEdgeDescription ||
                          "Breakout volatility expansion edge"}
                      </p>
                    </div>
                    <Badge className="border-cyan/30 bg-cyan/10 text-[9px] uppercase tracking-wider text-cyan shrink-0">
                      {(
                        tradingOperation.currentStage || "paper_simulation"
                      ).replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Financial Targets Grid */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <div className="rounded-lg bg-secondary/40 p-1.5 text-center">
                      <span className="block text-[9px] text-muted-foreground">
                        Target Cashflow
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        $
                        {tradingOperation.financialPlan.targetMonthlyCashflow.toLocaleString()}
                        /mo
                      </span>
                    </div>

                    <div className="rounded-lg bg-secondary/40 p-1.5 text-center">
                      <span className="block text-[9px] text-muted-foreground">
                        Runway Target
                      </span>
                      <span className="text-xs font-semibold text-cyan">
                        {
                          tradingOperation.financialPlan
                            .startupRunwayMonthsTarget
                        }{" "}
                        months
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                      onClick={onOpenRecordSession}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Quick Record Session
                    </Button>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Canonical Engine
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  Trading operation not initialized.
                </div>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────
                CHILD BRANCH 2B: WORKSTREAM B — FINTECH PRODUCTS
            ───────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-glass-border/80 bg-secondary/20 p-4 transition-all hover:border-glass-border">
              <div className="flex items-start justify-between gap-2 border-b border-glass-border/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border border-glass-border/80 bg-secondary/40 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                      Workstream B
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Fintech Software
                    </span>
                  </div>
                  <h3 className="font-display text-xs font-bold text-foreground">
                    Fintech Product Development
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => onOpenCreateProject(2, "B")}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Fintech Project
                </Button>
              </div>

              {/* Workstream B Project Cards List */}
              <div className="mt-3 flex flex-col gap-2.5">
                {p2FintechProjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-glass-border/70 p-4 text-center text-xs text-muted-foreground">
                    No active Fintech projects under Workstream B.
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="glass"
                        className="text-xs"
                        onClick={() => onOpenCreateProject(2, "B")}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Create Fintech
                        Project
                      </Button>
                    </div>
                  </div>
                ) : (
                  p2FintechProjects.map((project) => (
                    <ProjectHierarchyCard
                      key={project.id}
                      project={project}
                      onOpenDetails={() => onOpenProjectDetails(project.id)}
                      accentColor="cyan"
                      badgeText="Docs 6/6 Standardized"
                      showComplianceBadge
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BRANCH 3: PRIORITY 3 — LEARNING FOR EXECUTION
        ========================================================= */}
        <div className="flex min-w-0 flex-col gap-3">
          {/* Branch 3 Header Card */}
          <Glass className="relative border border-glass-border/80 p-4 shadow-md transition-all hover:border-glass-border hover:bg-secondary/20">
            <div className="flex items-start gap-3 border-b border-glass-border/60 pb-3">
              <PriorityIcon
                id={3}
                className="h-10 w-10 shrink-0 border-glass-border/80 bg-secondary/40 text-foreground"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border border-glass-border/80 bg-secondary/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Priority 3
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Execution Learning
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={onOpenLearningWorkspace}
                      title="Open Learning Workspace"
                    >
                      <Brain className="mr-1 h-3 w-3" /> Workspace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => onOpenCreateProject(3)}
                      title="Add Learning Project"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <h2 className="font-display text-base font-semibold text-foreground tracking-tight">
                  Learning for Execution
                </h2>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {PRIORITIES_META[2]?.purpose}
            </p>
          </Glass>

          {/* Directional Down Connector */}
          <div className="flex items-center justify-center py-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-glass-border bg-secondary/50 text-muted-foreground shadow-sm">
              <ArrowDown className="h-3 w-3 stroke-[2]" />
            </div>
          </div>

          {/* Priority 3 Project Cards */}
          <div className="flex flex-col gap-3">
            {p3Projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
                No active learning projects under Priority 3.
                <div className="mt-2">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => onOpenCreateProject(3)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Create first project
                  </Button>
                </div>
              </div>
            ) : (
              p3Projects.map((project) => (
                <ProjectHierarchyCard
                  key={project.id}
                  project={project}
                  onOpenDetails={() => onOpenProjectDetails(project.id)}
                  accentColor="violet"
                  badgeText="Docs 5/5 Standardized"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Standardized Project Node Card within the Portfolio Hierarchy.
 * Clearly displays: Project name, Description, Active goal, Milestone, Deadline, Status.
 */
interface ProjectHierarchyCardProps {
  project: Project;
  onOpenDetails: () => void;
  accentColor: "p1" | "cyan" | "violet";
  badgeText?: string;
  showComplianceBadge?: boolean;
}

function ProjectHierarchyCard({
  project,
  onOpenDetails,
  accentColor,
  badgeText,
  showComplianceBadge,
}: ProjectHierarchyCardProps) {
  const activeGoal =
    project.goals?.find((g) => g.id === project.activeGoalId) ||
    project.goals?.[0] ||
    project.goalsHistory?.find((g) => g.id === project.activeGoalId);

  const activeMilestone =
    project.milestones?.find(
      (m) => m.status === "active" || m.isPrimaryActive,
    ) || project.milestones?.[0];

  const deadline = project.deadline || activeMilestone?.deadline;

  return (
    <div
      onClick={onOpenDetails}
      className={cn(
        "group cursor-pointer rounded-2xl border border-glass-border/80 bg-secondary/30 p-4 transition-all hover:border-glass-border hover:bg-secondary/45",
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onOpenDetails();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-cyan transition-colors">
              {project.name}
            </h4>
            <Badge className="border-glass-border bg-secondary/60 text-[10px] capitalize shrink-0">
              {project.status}
            </Badge>
          </div>

          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.objective ||
              project.hypothesis ||
              "No detailed objective specified."}
          </p>
        </div>

        {/* Directional Action Arrow Button */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl border border-glass-border/60 bg-secondary/50 text-muted-foreground transition-all group-hover:border-cyan/40 group-hover:bg-cyan/15 group-hover:text-cyan shrink-0"
          title="Open Project Workspace"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Goal & Milestone Execution Spine */}
      <div className="mt-3 space-y-1.5 border-t border-glass-border/50 pt-2.5 text-[11px]">
        {/* Active Goal */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Target className="h-3 w-3 shrink-0 text-cyan" />
          <span className="font-medium text-foreground truncate">
            {activeGoal?.text || "No active goal defined"}
          </span>
        </div>

        {/* Milestone & Deadline */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Flag className="h-3 w-3 shrink-0 text-amber-400" />
            <span className="truncate">
              {activeMilestone?.title ||
                project.milestone ||
                "No active milestone"}
            </span>
          </div>

          {deadline && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
              <Clock className="h-2.5 w-2.5" />
              <span>{deadline}</span>
            </div>
          )}
        </div>
      </div>

      {/* Badges Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-glass-border/40 pt-2 text-[10px] text-muted-foreground">
        <span>{badgeText || "Docs Standardized"}</span>
        {showComplianceBadge && (
          <span className="flex items-center gap-1 font-semibold text-cyan">
            <ShieldCheck className="h-3 w-3" /> Legal & Compliance
          </span>
        )}
      </div>
    </div>
  );
}
