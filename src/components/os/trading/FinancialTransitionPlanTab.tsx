import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";
import { Badge, Button, Input, Label, Textarea } from "@/components/os/ui";
import type {
  FinancialTransitionPlan,
  TransitionMilestone,
} from "@/lib/os/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FinancialTransitionPlanTabProps {
  plan: FinancialTransitionPlan;
  isConfidential: boolean;
  onSave: (plan: Partial<FinancialTransitionPlan>) => void;
}

export function FinancialTransitionPlanTab({
  plan,
  isConfidential,
  onSave,
}: FinancialTransitionPlanTabProps) {
  const [draft, setDraft] = useState<FinancialTransitionPlan>(plan);
  const [newPhase, setNewPhase] = useState("");
  const [newTargetCap, setNewTargetCap] = useState("");
  const [newYieldTarget, setNewYieldTarget] = useState("");
  const [newPrereqs, setNewPrereqs] = useState("");

  const policy = draft.cashAllocationPolicy ?? {
    livingExpensesPercent: 40,
    startupReinvestmentPercent: 30,
    capitalBufferPercent: 20,
    taxReservePercent: 10,
  };

  const totalPercent =
    policy.livingExpensesPercent +
    policy.startupReinvestmentPercent +
    policy.capitalBufferPercent +
    policy.taxReservePercent;

  const handleUpdatePolicy = (field: keyof typeof policy, val: number) => {
    setDraft({
      ...draft,
      cashAllocationPolicy: {
        ...policy,
        [field]: val,
      },
    });
  };

  const handleAddMilestone = () => {
    const trimmedPhase = newPhase.trim();
    if (!trimmedPhase) {
      toast.error("Phase name is required");
      return;
    }
    const newM: TransitionMilestone = {
      id: `tm-${Date.now()}`,
      phase: trimmedPhase,
      targetCapital: Number(newTargetCap) || 0,
      monthlyYieldTarget: Number(newYieldTarget) || 0,
      prerequisitesSummary: newPrereqs.trim() || undefined,
      achieved: false,
    };
    setDraft({
      ...draft,
      transitionMilestones: [...(draft.transitionMilestones ?? []), newM],
    });
    setNewPhase("");
    setNewTargetCap("");
    setNewYieldTarget("");
    setNewPrereqs("");
  };

  const handleToggleMilestone = (mId: string) => {
    const ms = (draft.transitionMilestones ?? []).map((m) => {
      if (m.id !== mId) return m;
      const willAchieve = !m.achieved;
      return {
        ...m,
        achieved: willAchieve,
        achievedAt: willAchieve ? new Date().toISOString() : undefined,
        achievementEvidence: willAchieve
          ? m.achievementEvidence || "Verified via cash extraction statement"
          : undefined,
      };
    });
    setDraft({ ...draft, transitionMilestones: ms });
  };

  const handleDeleteMilestone = (mId: string) => {
    setDraft({
      ...draft,
      transitionMilestones: (draft.transitionMilestones ?? []).filter(
        (m) => m.id !== mId,
      ),
    });
  };

  const handleSave = () => {
    onSave(draft);
    toast.success("Financial & Transition Plan saved");
  };

  const formatMoney = (val: number) => {
    if (isConfidential) return "₹***,***";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-glass-border/60 pb-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-cyan" />
            Financial & Transition Plan (Authoritative Doc 2)
          </h3>
          <p className="text-xs text-muted-foreground">
            Authoritative cashflow targets, startup runway funding policy, and
            transition milestones.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          className="text-xs"
        >
          <Save className="h-3.5 w-3.5 mr-1" /> Save Financial Plan
        </Button>
      </div>

      {/* Section 1: Cashflow Targets & Living Runway */}
      <div className="rounded-2xl border border-glass-border/70 bg-secondary/30 p-4 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-cyan" /> Cashflow Baseline &
          Targets
        </h4>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Monthly Target Cashflow (INR / ₹)</Label>
            <Input
              type="number"
              value={draft.targetMonthlyCashflow}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  targetMonthlyCashflow: Number(e.target.value) || 0,
                })
              }
              className="text-xs h-9 font-mono"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Formatted: {formatMoney(draft.targetMonthlyCashflow)}
            </span>
          </div>

          <div>
            <Label>Current Extracted Cashflow (INR / ₹)</Label>
            <Input
              type="number"
              value={draft.currentMonthlyCashflow}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  currentMonthlyCashflow: Number(e.target.value) || 0,
                })
              }
              className="text-xs h-9 font-mono"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Formatted: {formatMoney(draft.currentMonthlyCashflow)}
            </span>
          </div>

          <div>
            <Label>Monthly Living Expenses (INR / ₹)</Label>
            <Input
              type="number"
              value={draft.monthlyLivingExpenses ?? 60000}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  monthlyLivingExpenses: Number(e.target.value) || 0,
                })
              }
              className="text-xs h-9 font-mono"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Formatted: {formatMoney(draft.monthlyLivingExpenses ?? 60000)}
            </span>
          </div>

          <div>
            <Label>Startup Runway Target (Months)</Label>
            <Input
              type="number"
              value={draft.startupRunwayMonthsTarget}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  startupRunwayMonthsTarget: Number(e.target.value) || 0,
                })
              }
              className="text-xs h-9 font-mono"
            />
          </div>

          <div>
            <Label>Estimated Current Runway (Months)</Label>
            <Input
              type="number"
              value={draft.estimatedCurrentRunwayMonths}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  estimatedCurrentRunwayMonths: Number(e.target.value) || 0,
                })
              }
              className="text-xs h-9 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Cash Allocation Policy */}
      <div className="rounded-2xl border border-glass-border/70 bg-secondary/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-cyan" /> Net Cash Allocation
            Policy (100% Target)
          </h4>
          <span
            className={cn(
              "text-xs font-mono font-bold px-2 py-0.5 rounded",
              totalPercent === 100
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400",
            )}
          >
            Total: {totalPercent}%
          </span>
        </div>

        {totalPercent !== 100 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Allocation percentages must total exactly 100% (currently{" "}
            {totalPercent}%).
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>1. Living Expenses (%)</Label>
            <Input
              type="number"
              value={policy.livingExpensesPercent}
              onChange={(e) =>
                handleUpdatePolicy(
                  "livingExpensesPercent",
                  Number(e.target.value) || 0,
                )
              }
              className="text-xs h-9 font-mono"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Covers core founder personal costs
            </span>
          </div>

          <div>
            <Label>2. Startup Reinvestment (%)</Label>
            <Input
              type="number"
              value={policy.startupReinvestmentPercent}
              onChange={(e) =>
                handleUpdatePolicy(
                  "startupReinvestmentPercent",
                  Number(e.target.value) || 0,
                )
              }
              className="text-xs h-9 font-mono"
            />
            <span className="text-[10px] text-cyan mt-0.5 block font-medium">
              Funds Priority 1 Seed Runway
            </span>
          </div>

          <div>
            <Label>3. Capital Buffer (%)</Label>
            <Input
              type="number"
              value={policy.capitalBufferPercent}
              onChange={(e) =>
                handleUpdatePolicy(
                  "capitalBufferPercent",
                  Number(e.target.value) || 0,
                )
              }
              className="text-xs h-9 font-mono"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Trading drawdown cushion
            </span>
          </div>

          <div>
            <Label>4. Tax & Reserve (%)</Label>
            <Input
              type="number"
              value={policy.taxReservePercent}
              onChange={(e) =>
                handleUpdatePolicy(
                  "taxReservePercent",
                  Number(e.target.value) || 0,
                )
              }
              className="text-xs h-9 font-mono"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              Statutory reserve & fees
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Transition Milestones Manager */}
      <div className="rounded-2xl border border-glass-border/70 bg-secondary/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyan" /> Transition
            Milestones & Trigger Conditions
          </h4>
          <span className="text-[10px] text-muted-foreground font-mono">
            {
              (draft.transitionMilestones ?? []).filter((m) => m.achieved)
                .length
            }{" "}
            / {(draft.transitionMilestones ?? []).length} Achieved
          </span>
        </div>

        {/* List of Milestones */}
        <div className="space-y-2">
          {(draft.transitionMilestones ?? []).map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 transition-all",
                m.achieved
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-glass-border/60 bg-secondary/20",
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-semibold text-xs",
                      m.achieved ? "text-emerald-400" : "text-foreground",
                    )}
                  >
                    {m.phase}
                  </span>
                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 py-0",
                      m.achieved
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {m.achieved ? "Achieved" : "Pending"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span>Target Capital: {formatMoney(m.targetCapital)}</span>
                  <span>
                    Monthly Yield Target: {formatMoney(m.monthlyYieldTarget)}
                  </span>
                  {m.prerequisitesSummary && (
                    <span className="italic">• {m.prerequisitesSummary}</span>
                  )}
                </div>
                {m.achieved && m.achievementEvidence && (
                  <p className="text-[10px] text-emerald-400/90 font-mono">
                    Evidence: {m.achievementEvidence}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={m.achieved ? "ghost" : "primary"}
                  onClick={() => handleToggleMilestone(m.id)}
                  className="text-xs h-7 px-2.5"
                >
                  {m.achieved ? "Revert" : "Mark Achieved"}
                </Button>
                <button
                  type="button"
                  onClick={() => handleDeleteMilestone(m.id)}
                  className="text-muted-foreground/60 hover:text-destructive p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Milestone Form */}
        <div className="rounded-xl border border-dashed border-glass-border/70 p-3 space-y-2">
          <span className="text-[11px] font-semibold text-foreground block">
            + Add New Transition Milestone
          </span>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              value={newPhase}
              onChange={(e) => setNewPhase(e.target.value)}
              placeholder="Phase name (e.g. Phase 2: Seed Runway)"
              className="text-xs h-8"
            />
            <Input
              type="number"
              value={newTargetCap}
              onChange={(e) => setNewTargetCap(e.target.value)}
              placeholder="Target Capital (₹)"
              className="text-xs h-8 font-mono"
            />
            <Input
              type="number"
              value={newYieldTarget}
              onChange={(e) => setNewYieldTarget(e.target.value)}
              placeholder="Monthly Yield (₹)"
              className="text-xs h-8 font-mono"
            />
            <Input
              value={newPrereqs}
              onChange={(e) => setNewPrereqs(e.target.value)}
              placeholder="Prerequisites / triggers"
              className="text-xs h-8"
            />
          </div>
          <Button
            size="sm"
            variant="glass"
            onClick={handleAddMilestone}
            className="text-xs h-7"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Milestone
          </Button>
        </div>
      </div>

      {/* Section 4: Flexible Strategy Notes */}
      <div className="rounded-2xl border border-glass-border/70 bg-secondary/30 p-4 space-y-2">
        <Label>Strategic Financial Notes & Scenarios (Markdown)</Label>
        <Textarea
          value={draft.flexibleContent}
          onChange={(e) =>
            setDraft({ ...draft, flexibleContent: e.target.value })
          }
          placeholder="Tax optimization notes, payout schedules, prop firm withdrawal guidelines..."
          rows={4}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
