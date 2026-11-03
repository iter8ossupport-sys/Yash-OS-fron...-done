import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Plus,
  ShieldCheck,
  Zap,
  TrendingUp,
  X,
  Check,
} from "lucide-react";
import { Badge, Button, Input, Label, Select } from "@/components/os/ui";
import type {
  FinancialPerformanceRecord,
  TradingExecutionRecord,
  TradingStrategy,
} from "@/lib/os/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface TradingPerformanceTabProps {
  executionRecords: TradingExecutionRecord[];
  performanceHistory: FinancialPerformanceRecord[];
  strategies: TradingStrategy[];
  isConfidential: boolean;
  onOpenRecordSession: () => void;
  onRecordFinancialPerformance: (record: FinancialPerformanceRecord) => void;
}

export function TradingPerformanceTab({
  executionRecords,
  performanceHistory,
  strategies,
  isConfidential,
  onOpenRecordSession,
  onRecordFinancialPerformance,
}: TradingPerformanceTabProps) {
  const [showAddFinModal, setShowAddFinModal] = useState(false);
  const [newFin, setNewFin] = useState({
    periodRef: new Date().toISOString().slice(0, 7), // YYYY-MM
    grossPnL: 0,
    feesAndCommissions: 0,
    totalNetCashExtracted: 0,
    injectedToStartupFund: 0,
    livingExpensesCovered: 0,
    runwayMonthsCalculated: 6,
    isVerified: true,
    confidential: false,
  });

  const handleSaveFinRecord = () => {
    if (!newFin.periodRef.trim()) {
      toast.error("Period reference is required");
      return;
    }
    onRecordFinancialPerformance({
      id: `fin-${Date.now()}`,
      periodRef: newFin.periodRef.trim(),
      grossPnL: Number(newFin.grossPnL) || 0,
      feesAndCommissions: Number(newFin.feesAndCommissions) || 0,
      totalNetCashExtracted: Number(newFin.totalNetCashExtracted) || 0,
      injectedToStartupFund: Number(newFin.injectedToStartupFund) || 0,
      livingExpensesCovered: Number(newFin.livingExpensesCovered) || 0,
      runwayMonthsCalculated: Number(newFin.runwayMonthsCalculated) || 0,
      isVerified: newFin.isVerified,
      confidential: newFin.confidential,
    });
    setShowAddFinModal(false);
    toast.success("Monthly financial performance record added");
  };

  const formatMoney = (val?: number, currency: string = "INR") => {
    if (val === undefined) return "—";
    if (isConfidential) return `${currency === "USD" ? "$" : "₹"}***,***`;
    return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-IN", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: DAILY EXECUTION SESSIONS JOURNAL */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/60 pb-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan" />
              Daily Execution Sessions ({executionRecords.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Granular session logs, rule adherence verification, and discipline
              scoring.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenRecordSession}
            className="text-xs"
          >
            <Zap className="h-3.5 w-3.5 mr-1" /> Log Daily Session
          </Button>
        </div>

        {/* Sessions List */}
        <div className="space-y-2">
          {executionRecords.length === 0 ? (
            <div className="rounded-xl border border-glass-border/50 bg-secondary/10 p-6 text-center text-xs text-muted-foreground">
              No trading sessions logged yet. Click &quot;Log Daily
              Session&quot; to record your first execution.
            </div>
          ) : (
            executionRecords.map((rec) => {
              const strat = strategies.find((s) => s.id === rec.strategyId);
              return (
                <div
                  key={rec.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-glass-border/70 bg-secondary/30 p-3.5 text-xs transition-all hover:border-cyan/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {rec.date}
                      </span>
                      <Badge className="text-[10px] bg-secondary text-muted-foreground">
                        {rec.sessionType} Session
                      </Badge>
                      {strat && (
                        <span className="text-cyan font-medium text-[11px]">
                          {strat.name}
                        </span>
                      )}
                      <Badge
                        className={cn(
                          "text-[10px]",
                          rec.ruleAdherence
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-destructive/20 text-destructive border-destructive/30",
                        )}
                      >
                        {rec.ruleAdherence ? "Rules Respected" : "Rule Breach"}
                      </Badge>
                      {rec.isVerified && (
                        <span
                          className="inline-flex items-center text-emerald-400 text-[10px]"
                          title="Reconciled with broker statement"
                        >
                          <ShieldCheck className="h-3 w-3 mr-0.5" /> Statement
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground pt-0.5">
                      <span>Trades: {rec.tradesCount}</span>
                      <span>Discipline: {rec.disciplineScore} / 5</span>
                      {rec.netPnL !== undefined && (
                        <span
                          className={cn(
                            "font-mono font-semibold",
                            rec.netPnL >= 0
                              ? "text-emerald-400"
                              : "text-destructive",
                          )}
                        >
                          Net: {formatMoney(rec.netPnL, "USD")}
                        </span>
                      )}
                    </div>

                    {rec.ruleBreachReason && (
                      <div className="text-[11px] text-destructive italic">
                        Breach: {rec.ruleBreachReason}
                      </div>
                    )}

                    {rec.notes && (
                      <p className="text-[11px] text-muted-foreground/90 line-clamp-2">
                        {rec.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 2: MONTHLY FINANCIAL CASH EXTRACTION RECORDS */}
      <div className="space-y-4 pt-4 border-t border-glass-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan" />
              Monthly Cash Extraction & Runway Allocation (
              {performanceHistory.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Authoritative verified cash extractions, living expense coverage,
              and Priority 1 seed injections.
            </p>
          </div>
          <Button
            size="sm"
            variant="glass"
            onClick={() => setShowAddFinModal(true)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Monthly Record
          </Button>
        </div>

        {/* Add Financial Record Modal */}
        {showAddFinModal && (
          <div className="rounded-2xl border border-cyan/40 bg-secondary/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
              <span className="font-semibold text-xs text-cyan">
                Add Monthly Financial Performance Record
              </span>
              <button
                type="button"
                onClick={() => setShowAddFinModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Period (YYYY-MM)</Label>
                <Input
                  value={newFin.periodRef}
                  onChange={(e) =>
                    setNewFin({ ...newFin, periodRef: e.target.value })
                  }
                  placeholder="e.g. 2026-11"
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Gross PnL (₹)</Label>
                <Input
                  type="number"
                  value={newFin.grossPnL}
                  onChange={(e) =>
                    setNewFin({ ...newFin, grossPnL: Number(e.target.value) })
                  }
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Total Net Cash Extracted (₹)</Label>
                <Input
                  type="number"
                  value={newFin.totalNetCashExtracted}
                  onChange={(e) =>
                    setNewFin({
                      ...newFin,
                      totalNetCashExtracted: Number(e.target.value),
                    })
                  }
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Injected to Startup Fund (P1) (₹)</Label>
                <Input
                  type="number"
                  value={newFin.injectedToStartupFund}
                  onChange={(e) =>
                    setNewFin({
                      ...newFin,
                      injectedToStartupFund: Number(e.target.value),
                    })
                  }
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Living Expenses Covered (₹)</Label>
                <Input
                  type="number"
                  value={newFin.livingExpensesCovered}
                  onChange={(e) =>
                    setNewFin({
                      ...newFin,
                      livingExpensesCovered: Number(e.target.value),
                    })
                  }
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Runway Months Calculated</Label>
                <Input
                  type="number"
                  value={newFin.runwayMonthsCalculated}
                  onChange={(e) =>
                    setNewFin({
                      ...newFin,
                      runwayMonthsCalculated: Number(e.target.value),
                    })
                  }
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isVerifiedFinCheck"
                checked={newFin.isVerified}
                onChange={(e) =>
                  setNewFin({ ...newFin, isVerified: e.target.checked })
                }
                className="h-4 w-4 rounded border-glass-border text-cyan focus:ring-cyan"
              />
              <label
                htmlFor="isVerifiedFinCheck"
                className="text-xs text-foreground cursor-pointer"
              >
                Reconciled with Bank & Broker Payout Statements
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddFinModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveFinRecord}>
                <Check className="h-3.5 w-3.5 mr-1" /> Save Record
              </Button>
            </div>
          </div>
        )}

        {/* Financial Records Table */}
        <div className="overflow-x-auto rounded-xl border border-glass-border/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-[11px] font-semibold text-muted-foreground border-b border-glass-border/60">
              <tr>
                <th className="p-3">Period</th>
                <th className="p-3">Net Extracted Cash</th>
                <th className="p-3">P1 Seed Fund Injection</th>
                <th className="p-3">Living Covered</th>
                <th className="p-3">Runway</th>
                <th className="p-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/40">
              {performanceHistory.map((hist) => (
                <tr
                  key={hist.id}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <td className="p-3 font-mono font-semibold text-foreground">
                    {hist.periodRef}
                  </td>
                  <td className="p-3 font-mono text-emerald-400 font-semibold">
                    {formatMoney(hist.totalNetCashExtracted)}
                  </td>
                  <td className="p-3 font-mono text-cyan">
                    {formatMoney(hist.injectedToStartupFund)}
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">
                    {formatMoney(hist.livingExpensesCovered)}
                  </td>
                  <td className="p-3 font-mono text-foreground">
                    {hist.runwayMonthsCalculated} Months
                  </td>
                  <td className="p-3 text-right">
                    {hist.isVerified ? (
                      <span className="inline-flex items-center text-emerald-400 text-[10px]">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Reconciled
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">
                        Unverified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
