import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Plus,
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
  Target,
  Clock,
} from "lucide-react";
import { Badge, Button, Glass } from "@/components/os/ui";
import type { Project, TradingOperation } from "@/lib/os/types";
import { cn } from "@/lib/utils";

export interface Priority2CashflowSectionProps {
  projects: Project[];
  tradingOperation?: TradingOperation | undefined;
  onOpenTradingWorkspace: () => void;
  onOpenRecordSession: () => void;
  onOpenProjectDetails: (projectId: string) => void;
  onOpenCreateFintechProject: () => void;
  onOpenComplianceTracker: (project: Project) => void;
}

export function Priority2CashflowSection({
  projects,
  tradingOperation,
  onOpenTradingWorkspace,
  onOpenRecordSession,
  onOpenProjectDetails,
  onOpenCreateFintechProject,
  onOpenComplianceTracker,
}: Priority2CashflowSectionProps) {
  const fintechProjects = projects.filter(
    (p) => p.priorityId === 2 && p.workstream === "B",
  );

  const operation = tradingOperation;
  const currentStage = operation?.currentStage ?? "paper_simulation";
  const records = operation?.executionRecords ?? [];
  const activeStrategies = (operation?.strategies ?? []).filter(
    (s) => s.status === "active",
  );
  const activeAccounts = (operation?.accounts ?? []).filter(
    (a) => a.status === "active",
  );

  const totalSessions = records.length;
  const adherenceCount = records.filter((r) => r.ruleAdherence).length;
  const adherenceRate =
    totalSessions > 0
      ? Math.round((adherenceCount / totalSessions) * 100)
      : 100;

  const currentCash = operation?.financialPlan?.currentMonthlyCashflow ?? 0;
  const targetCash = operation?.financialPlan?.targetMonthlyCashflow ?? 200000;
  const cashProgress = Math.min(
    100,
    Math.round((currentCash / (targetCash || 1)) * 100),
  );

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* 1. WORKSTREAM A — FINANCIAL-MARKET EXECUTION */}
      <Glass className="relative border-t-2 border-t-cyan p-5 transition-all hover:border-cyan/50">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-glass-border/50 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-cyan/40 bg-cyan/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan">
                Workstream A
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  operation?.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                )}
              >
                ● {operation?.status ?? "active"}
              </span>
            </div>
            <h3 className="mt-1 font-display text-base font-semibold text-foreground">
              {operation?.name ?? "Trading Operation (LBES)"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Consolidated financial-market execution engine. Strict
              quantitative discipline.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="glass"
              className="h-8 text-xs px-2.5"
              onClick={onOpenRecordSession}
              title="Quick log session"
            >
              <Zap className="h-3.5 w-3.5 mr-1" /> Log
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="h-8 text-xs px-3"
              onClick={onOpenTradingWorkspace}
            >
              Workspace <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Workstream A KPIs */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-glass-border/50 bg-secondary/30 p-2.5 space-y-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-cyan" /> Monthly Cash
            </span>
            <div className="font-bold text-foreground text-xs font-mono">
              {formatMoney(currentCash)}
            </div>
            <span className="text-[10px] text-muted-foreground">
              of {formatMoney(targetCash)} ({cashProgress}%)
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/50 bg-secondary/30 p-2.5 space-y-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-cyan" /> Stage
            </span>
            <div className="font-semibold text-cyan text-xs capitalize truncate">
              {currentStage.replace(/_/g, " ")}
            </div>
            <span className="text-[10px] text-muted-foreground">
              Runway:{" "}
              {operation?.financialPlan?.estimatedCurrentRunwayMonths ?? 6} mo
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/50 bg-secondary/30 p-2.5 space-y-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3 text-cyan" /> Systems
            </span>
            <div className="font-semibold text-foreground text-xs">
              {activeStrategies.length} active strat
            </div>
            <span className="text-[10px] text-muted-foreground">
              {activeAccounts.length} accounts
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/50 bg-secondary/30 p-2.5 space-y-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan" /> Discipline
            </span>
            <div className="font-semibold text-emerald-400 text-xs">
              {adherenceRate}% Adherence
            </div>
            <span className="text-[10px] text-muted-foreground">
              {totalSessions} sessions logged
            </span>
          </div>
        </div>
      </Glass>

      {/* 2. WORKSTREAM B — FINTECH PRODUCT DEVELOPMENT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-cyan/40 bg-cyan/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan">
                Workstream B
              </span>
              <h4 className="font-display text-sm font-semibold text-foreground">
                Fintech Product Development
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Software tools, non-custodial apps, and regulatory boundary
              governance.
            </p>
          </div>

          <Button
            size="sm"
            variant="glass"
            className="h-8 text-xs"
            onClick={onOpenCreateFintechProject}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> New Project
          </Button>
        </div>

        {/* List of Workstream B Projects */}
        <div className="flex flex-col gap-3">
          {fintechProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-glass-border/70 p-6 text-center text-xs text-muted-foreground">
              No Fintech products under Workstream B yet.
              <div className="mt-2">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={onOpenCreateFintechProject}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create first fintech project
                </Button>
              </div>
            </div>
          ) : (
            fintechProjects.map((p) => {
              const activeGoal = (p.goals ?? []).find(
                (g) => g.id === p.activeGoalId,
              );
              const activeMilestone = (p.milestones ?? []).find(
                (m) => m.status === "active",
              );
              const complianceContent = p.complianceContent;
              const verifiedReqsCount =
                (complianceContent?.licensing?.filter(
                  (l) => l.status === "verified_requirement",
                ).length ?? 0) +
                (complianceContent?.disclosures?.filter(
                  (d) => d.status === "verified_requirement",
                ).length ?? 0) +
                (complianceContent?.thirdPartyObligations?.filter(
                  (t) => t.status === "verified_requirement",
                ).length ?? 0);
              const openQuestionsCount =
                complianceContent?.unresolvedQuestions?.filter(
                  (q) => q.status === "open",
                ).length ?? 0;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-glass-border/70 bg-secondary/30 p-4 transition-all hover:border-cyan/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => onOpenProjectDetails(p.id)}
                          className="font-semibold text-sm text-foreground hover:text-cyan cursor-pointer transition-colors"
                        >
                          {p.name}
                        </h4>
                        <Badge className="text-[10px] capitalize">
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {p.objective}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="glass"
                      className="h-7 text-xs px-2"
                      onClick={() => onOpenProjectDetails(p.id)}
                    >
                      Details
                    </Button>
                  </div>

                  {/* Active Goal & Milestone */}
                  {(activeGoal || activeMilestone) && (
                    <div className="space-y-1 text-xs border-t border-glass-border/40 pt-2">
                      {activeGoal && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Target className="h-3 w-3 text-cyan shrink-0" />
                          <span className="truncate">
                            Goal: {activeGoal.text}
                          </span>
                        </div>
                      )}
                      {activeMilestone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3 text-cyan shrink-0" />
                          <span className="truncate">
                            Milestone: {activeMilestone.title}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document 6 Compliance Pill */}
                  <div className="flex items-center justify-between border-t border-glass-border/40 pt-2 text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-cyan" />
                      Doc 6 Compliance:
                    </span>

                    <button
                      type="button"
                      onClick={() => onOpenComplianceTracker(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/40 bg-cyan/15 px-2.5 py-0.5 text-xs font-semibold text-cyan hover:bg-cyan/25 transition-all"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {verifiedReqsCount} Verified • {openQuestionsCount} Open
                      Qs
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
