import {
  TrendingUp,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge, Button } from "@/components/os/ui";
import type { TradingDevelopmentStage, TradingOperation } from "@/lib/os/types";
import { cn } from "@/lib/utils";

export type TradingTabId =
  | "overview"
  | "profile"
  | "financial_plan"
  | "strategies_systems"
  | "accounts_risk"
  | "performance";

export interface TradingOperationOverviewTabProps {
  operation: TradingOperation;
  isConfidential: boolean;
  onUpdateStage: (stage: TradingDevelopmentStage) => void;
  onToggleStatus: (status: "active" | "paused") => void;
  onOpenRecordSession: () => void;
  onNavigateTab: (tab: TradingTabId) => void;
}

const STAGES: { id: TradingDevelopmentStage; label: string; desc: string }[] = [
  { id: "research", label: "1. Research", desc: "Market theoretical edge" },
  {
    id: "backtesting",
    label: "2. Backtesting",
    desc: "Quantitative edge validation",
  },
  {
    id: "paper_simulation",
    label: "3. Paper Sim",
    desc: "Real-time riskless execution",
  },
  {
    id: "evaluation",
    label: "4. Evaluation",
    desc: "Prop firm evaluation proof",
  },
  {
    id: "live_funded",
    label: "5. Live Funded",
    desc: "Funded capital deployment",
  },
  {
    id: "scaling",
    label: "6. Scaling",
    desc: "Multi-contract capital scaling",
  },
];

export function TradingOperationOverviewTab({
  operation,
  isConfidential,
  onUpdateStage,
  onToggleStatus,
  onOpenRecordSession,
  onNavigateTab,
}: TradingOperationOverviewTabProps) {
  const currentStage = operation.currentStage ?? "paper_simulation";
  const records = operation.executionRecords ?? [];
  const activeStrategies = (operation.strategies ?? []).filter(
    (s) => s.status === "active",
  );
  const activeAccounts = (operation.accounts ?? []).filter(
    (a) => a.status === "active",
  );

  const totalSessions = records.length;
  const adherenceCount = records.filter((r) => r.ruleAdherence).length;
  const adherenceRate =
    totalSessions > 0
      ? Math.round((adherenceCount / totalSessions) * 100)
      : 100;
  const avgDiscipline =
    totalSessions > 0
      ? (
          records.reduce((acc, r) => acc + (r.disciplineScore || 5), 0) /
          totalSessions
        ).toFixed(1)
      : "5.0";

  const formatMoney = (amount: number, currency: string = "INR") => {
    if (isConfidential) return "₹***,***";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentMonthlyCash =
    operation.financialPlan?.currentMonthlyCashflow ?? 0;
  const targetMonthlyCash =
    operation.financialPlan?.targetMonthlyCashflow ?? 200000;
  const cashProgressPercent = Math.min(
    100,
    Math.round((currentMonthlyCash / (targetMonthlyCash || 1)) * 100),
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-display text-base font-semibold text-foreground">
              {operation.name}
            </h3>
            <button
              type="button"
              onClick={() =>
                onToggleStatus(
                  operation.status === "active" ? "paused" : "active",
                )
              }
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-all",
                operation.status === "active"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30",
              )}
            >
              ● {operation.status}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Workstream A — Disciplined quantitative & discretionary cashflow
            generation engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenRecordSession}
            className="text-xs"
          >
            <Zap className="h-3.5 w-3.5 mr-1" /> Log Daily Session
          </Button>
        </div>
      </div>

      {/* 2. Development Stage Progression Pipeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trading Development Lifecycle Stage
          </span>
          <span className="text-xs text-cyan font-mono">
            Current: {STAGES.find((s) => s.id === currentStage)?.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {STAGES.map((s, idx) => {
            const isCurrent = s.id === currentStage;
            const isPassed =
              STAGES.findIndex((x) => x.id === currentStage) > idx;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdateStage(s.id)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-2.5 text-left transition-all",
                  isCurrent
                    ? "border-cyan bg-cyan/15 shadow-sm ring-1 ring-cyan/40"
                    : isPassed
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-glass-border/70 bg-secondary/20 hover:bg-secondary/40",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      isCurrent
                        ? "text-cyan"
                        : isPassed
                          ? "text-emerald-400"
                          : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                  {isPassed && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <span className="mt-1 text-[10px] text-muted-foreground/80 line-clamp-1">
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Executive KPI Dashboard Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Monthly Cashflow */}
        <div className="rounded-xl border border-glass-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-cyan" /> Monthly Cashflow
            </span>
            <span className="text-[10px] font-mono text-cyan">
              {cashProgressPercent}%
            </span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatMoney(currentMonthlyCash)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Target: {formatMoney(targetMonthlyCash)} / month
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all"
              style={{ width: `${cashProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Startup Runway Support */}
        <div className="rounded-xl border border-glass-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan" /> Startup Runway
            </span>
            <Badge className="text-[10px] px-1.5 py-0 border-cyan/30 text-cyan">
              P1 Fund
            </Badge>
          </div>
          <div className="text-lg font-bold text-foreground">
            {operation.financialPlan?.estimatedCurrentRunwayMonths ?? 6} Months
          </div>
          <div className="text-[11px] text-muted-foreground">
            Target Goal:{" "}
            {operation.financialPlan?.startupRunwayMonthsTarget ?? 12} Months
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-cyan rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    ((operation.financialPlan?.estimatedCurrentRunwayMonths ??
                      6) /
                      (operation.financialPlan?.startupRunwayMonthsTarget ??
                        12)) *
                      100,
                  ),
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 3: Active Strategies & Systems */}
        <div className="rounded-xl border border-glass-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan" /> Active Architecture
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {activeStrategies.length} active
            </span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {activeStrategies.length} / {(operation.strategies ?? []).length}{" "}
            Strategies
          </div>
          <div className="text-[11px] text-muted-foreground">
            Accounts: {activeAccounts.length} live / evaluating
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("strategies_systems")}
            className="text-[11px] text-cyan hover:underline inline-flex items-center gap-1 pt-0.5"
          >
            Manage systems <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Metric 4: Discipline & Adherence Rate */}
        <div className="rounded-xl border border-glass-border/70 bg-secondary/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan" /> Discipline Rating
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {adherenceRate}% Rule Adherence
            </span>
          </div>
          <div className="text-lg font-bold text-foreground flex items-baseline gap-1">
            {avgDiscipline}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              / 5.0
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {totalSessions} execution sessions logged
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("performance")}
            className="text-[11px] text-cyan hover:underline inline-flex items-center gap-1 pt-0.5"
          >
            Review journal <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 4. Risk Rules & Circuit Breaker Summary */}
      <div className="rounded-2xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-cyan" />
            <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground">
              Active Risk Safeguards & Circuit Breakers
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("profile")}
            className="text-xs text-cyan hover:underline inline-flex items-center gap-1"
          >
            Configure Rules <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-glass-border/60 bg-secondary/40 p-2.5">
            <span className="text-[10px] text-muted-foreground block">
              Max Daily Drawdown
            </span>
            <span className="font-semibold text-foreground font-mono mt-0.5 block">
              {formatMoney(
                operation.operatingProfile?.riskRules
                  ?.maxDailyDrawdownCurrency ?? 500,
                "USD",
              )}
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/60 bg-secondary/40 p-2.5">
            <span className="text-[10px] text-muted-foreground block">
              Max Risk Per Trade
            </span>
            <span className="font-semibold text-foreground font-mono mt-0.5 block">
              {operation.operatingProfile?.riskRules?.maxRiskPerTradePercent ??
                1}
              %
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/60 bg-secondary/40 p-2.5">
            <span className="text-[10px] text-muted-foreground block">
              Hard Stop Enforcement
            </span>
            <span className="font-semibold text-emerald-400 mt-0.5 block">
              {operation.operatingProfile?.riskRules?.hardStopRequired
                ? "Mandatory Hard Stop"
                : "Discretionary"}
            </span>
          </div>

          <div className="rounded-xl border border-glass-border/60 bg-secondary/40 p-2.5">
            <span className="text-[10px] text-muted-foreground block">
              Circuit Breaker Action
            </span>
            <span className="font-semibold text-amber-400 mt-0.5 block capitalize">
              {operation.operatingProfile?.riskRules?.circuitBreakerAction?.replace(
                /_/g,
                " ",
              ) ?? "Stop For Day"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
