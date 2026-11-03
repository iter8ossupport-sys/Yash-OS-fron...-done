import { useState } from "react";
import {
  Layers,
  Cpu,
  FlaskConical,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/os/ui";
import type {
  TradingDevelopmentStage,
  TradingExperiment,
  TradingStrategy,
  TradingSystem,
} from "@/lib/os/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface TradingStrategiesSystemsTabProps {
  strategies: TradingStrategy[];
  systems: TradingSystem[];
  experiments: TradingExperiment[];
  onSaveStrategy: (strategy: TradingStrategy) => void;
  onDeleteStrategy: (id: string) => void;
  onSaveSystem: (system: TradingSystem) => void;
  onDeleteSystem: (id: string) => void;
}

export function TradingStrategiesSystemsTab({
  strategies,
  systems,
  experiments,
  onSaveStrategy,
  onDeleteStrategy,
  onSaveSystem,
  onDeleteSystem,
}: TradingStrategiesSystemsTabProps) {
  // Strategy editing state
  const [editingStrategy, setEditingStrategy] =
    useState<Partial<TradingStrategy> | null>(null);

  // System editing state
  const [editingSystem, setEditingSystem] =
    useState<Partial<TradingSystem> | null>(null);

  const handleSaveStrategy = () => {
    if (!editingStrategy?.name?.trim()) {
      toast.error("Strategy name is required");
      return;
    }
    const strat: TradingStrategy = {
      id: editingStrategy.id || `strat-${Date.now()}`,
      name: editingStrategy.name.trim(),
      assetClass: editingStrategy.assetClass || "futures",
      timeframe: editingStrategy.timeframe || "15m / 5m",
      rulesMarkdown: editingStrategy.rulesMarkdown || "",
      status: editingStrategy.status || "active",
      stage: editingStrategy.stage || "paper_simulation",
      expectedWinRate: Number(editingStrategy.expectedWinRate) || undefined,
      expectedRiskReward:
        Number(editingStrategy.expectedRiskReward) || undefined,
    };
    onSaveStrategy(strat);
    setEditingStrategy(null);
    toast.success("Strategy saved");
  };

  const handleSaveSystem = () => {
    if (!editingSystem?.name?.trim()) {
      toast.error("System name is required");
      return;
    }
    const sys: TradingSystem = {
      id: editingSystem.id || `sys-${Date.now()}`,
      name: editingSystem.name.trim(),
      strategyId: editingSystem.strategyId || strategies[0]?.id || "",
      automationLevel: editingSystem.automationLevel || "semi_automated",
      platformOrTech:
        editingSystem.platformOrTech || "TradingView / PineScript",
      status: editingSystem.status || "live",
      documentationUrl: editingSystem.documentationUrl?.trim() || undefined,
    };
    onSaveSystem(sys);
    setEditingSystem(null);
    toast.success("Execution system saved");
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: TRADING STRATEGIES */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/60 pb-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan" />
              Trading Strategies Catalog ({strategies.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Market edges, setup rules, timeframes and statistical expectancy.
            </p>
          </div>
          <Button
            size="sm"
            variant="glass"
            onClick={() =>
              setEditingStrategy({
                name: "",
                assetClass: "futures",
                timeframe: "15m",
                status: "active",
                stage: "paper_simulation",
                expectedWinRate: 55,
                expectedRiskReward: 2.0,
                rulesMarkdown: "",
              })
            }
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> New Strategy
          </Button>
        </div>

        {/* Strategy Editor Inline Modal / Form */}
        {editingStrategy && (
          <div className="rounded-2xl border border-cyan/40 bg-secondary/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
              <span className="font-semibold text-xs text-cyan">
                {editingStrategy.id ? "Edit Strategy" : "Create New Strategy"}
              </span>
              <button
                type="button"
                onClick={() => setEditingStrategy(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Strategy Name</Label>
                <Input
                  value={editingStrategy.name ?? ""}
                  onChange={(e) =>
                    setEditingStrategy({
                      ...editingStrategy,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. London Breakout (LBES)"
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Asset Class</Label>
                <Select
                  value={editingStrategy.assetClass ?? "futures"}
                  onChange={(val) =>
                    setEditingStrategy({
                      ...editingStrategy,
                      assetClass: val as TradingStrategy["assetClass"],
                    })
                  }
                  options={[
                    { value: "futures", label: "Futures (NQ/ES)" },
                    { value: "forex", label: "Forex" },
                    { value: "equities", label: "Equities" },
                    { value: "crypto", label: "Crypto" },
                    { value: "options", label: "Options" },
                  ]}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Timeframe</Label>
                <Input
                  value={editingStrategy.timeframe ?? ""}
                  onChange={(e) =>
                    setEditingStrategy({
                      ...editingStrategy,
                      timeframe: e.target.value,
                    })
                  }
                  placeholder="e.g. 15m / 5m execution"
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={editingStrategy.status ?? "active"}
                  onChange={(val) =>
                    setEditingStrategy({
                      ...editingStrategy,
                      status: val as TradingStrategy["status"],
                    })
                  }
                  options={[
                    { value: "active", label: "Active" },
                    { value: "incubating", label: "Incubating" },
                    { value: "paused", label: "Paused" },
                    { value: "retired", label: "Retired" },
                  ]}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Stage</Label>
                <Select
                  value={editingStrategy.stage ?? "paper_simulation"}
                  onChange={(val) =>
                    setEditingStrategy({
                      ...editingStrategy,
                      stage: val as TradingDevelopmentStage,
                    })
                  }
                  options={[
                    { value: "research", label: "Research" },
                    { value: "backtesting", label: "Backtesting" },
                    { value: "paper_simulation", label: "Paper Simulation" },
                    { value: "evaluation", label: "Evaluation" },
                    { value: "live_funded", label: "Live Funded" },
                    { value: "scaling", label: "Scaling" },
                  ]}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Expected Win Rate (%)</Label>
                <Input
                  type="number"
                  value={editingStrategy.expectedWinRate ?? ""}
                  onChange={(e) =>
                    setEditingStrategy({
                      ...editingStrategy,
                      expectedWinRate: Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 55"
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Expected Risk / Reward (R)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editingStrategy.expectedRiskReward ?? ""}
                  onChange={(e) =>
                    setEditingStrategy({
                      ...editingStrategy,
                      expectedRiskReward: Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 2.0"
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>

            <div>
              <Label>Rules & Setup Protocol (Markdown)</Label>
              <Textarea
                value={editingStrategy.rulesMarkdown ?? ""}
                onChange={(e) =>
                  setEditingStrategy({
                    ...editingStrategy,
                    rulesMarkdown: e.target.value,
                  })
                }
                placeholder="Entry conditions, invalidation, take profit targets..."
                rows={3}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingStrategy(null)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveStrategy}>
                <Check className="h-3.5 w-3.5 mr-1" /> Save Strategy
              </Button>
            </div>
          </div>
        )}

        {/* Strategies Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {strategies.map((strat) => (
            <div
              key={strat.id}
              className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/30 p-4 transition-all hover:border-cyan/30"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      {strat.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {strat.assetClass} • {strat.timeframe}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      className={cn(
                        "text-[10px] capitalize",
                        strat.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {strat.status}
                    </Badge>
                    <Badge className="text-[10px] bg-cyan/15 text-cyan border-cyan/30 capitalize">
                      {strat.stage?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-4 text-[11px] font-mono text-muted-foreground pt-1">
                  {strat.expectedWinRate !== undefined && (
                    <span>Win Rate: {strat.expectedWinRate}%</span>
                  )}
                  {strat.expectedRiskReward !== undefined && (
                    <span>R:R: 1:{strat.expectedRiskReward}</span>
                  )}
                </div>

                {strat.rulesMarkdown && (
                  <p className="text-[11px] text-muted-foreground/80 line-clamp-2 font-mono">
                    {strat.rulesMarkdown}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-glass-border/40 pt-2.5 mt-3">
                <button
                  type="button"
                  onClick={() => setEditingStrategy(strat)}
                  className="text-xs text-muted-foreground hover:text-cyan flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete strategy "${strat.name}"?`)) {
                      onDeleteStrategy(strat.id);
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 ml-2"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: EXECUTION SYSTEMS */}
      <div className="space-y-4 pt-4 border-t border-glass-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan" />
              Execution Systems ({systems.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Software engines, TradingView scripts, and API connectors
              executing the strategies.
            </p>
          </div>
          <Button
            size="sm"
            variant="glass"
            onClick={() =>
              setEditingSystem({
                name: "",
                strategyId: strategies[0]?.id || "",
                automationLevel: "semi_automated",
                platformOrTech: "TradingView / PineScript",
                status: "live",
              })
            }
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> New System
          </Button>
        </div>

        {/* System Editor Inline Modal */}
        {editingSystem && (
          <div className="rounded-2xl border border-cyan/40 bg-secondary/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
              <span className="font-semibold text-xs text-cyan">
                {editingSystem.id
                  ? "Edit Execution System"
                  : "Create Execution System"}
              </span>
              <button
                type="button"
                onClick={() => setEditingSystem(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>System Name</Label>
                <Input
                  value={editingSystem.name ?? ""}
                  onChange={(e) =>
                    setEditingSystem({ ...editingSystem, name: e.target.value })
                  }
                  placeholder="e.g. LBES PineScript v2"
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Linked Strategy</Label>
                <Select
                  value={editingSystem.strategyId ?? strategies[0]?.id ?? ""}
                  onChange={(val) =>
                    setEditingSystem({ ...editingSystem, strategyId: val })
                  }
                  options={strategies.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Automation Level</Label>
                <Select
                  value={editingSystem.automationLevel ?? "semi_automated"}
                  onChange={(val) =>
                    setEditingSystem({
                      ...editingSystem,
                      automationLevel: val as TradingSystem["automationLevel"],
                    })
                  }
                  options={[
                    { value: "manual", label: "Manual Execution" },
                    {
                      value: "semi_automated",
                      label: "Semi-Automated (Alerts)",
                    },
                    {
                      value: "fully_automated",
                      label: "Fully Automated (API)",
                    },
                  ]}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Platform / Technology</Label>
                <Input
                  value={editingSystem.platformOrTech ?? ""}
                  onChange={(e) =>
                    setEditingSystem({
                      ...editingSystem,
                      platformOrTech: e.target.value,
                    })
                  }
                  placeholder="e.g. TradingView / PineScript, Python"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingSystem(null)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveSystem}>
                <Check className="h-3.5 w-3.5 mr-1" /> Save System
              </Button>
            </div>
          </div>
        )}

        {/* Systems List */}
        <div className="grid gap-3 sm:grid-cols-2">
          {systems.map((sys) => {
            const linkedStrat = strategies.find((s) => s.id === sys.strategyId);
            return (
              <div
                key={sys.id}
                className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/30 p-3.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      {sys.name}
                    </span>
                    <Badge className="text-[10px] capitalize">
                      {sys.automationLevel.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Strategy:{" "}
                    <span className="text-cyan">
                      {linkedStrat?.name || "None"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground/80">
                    Platform: {sys.platformOrTech}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-glass-border/40 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSystem(sys)}
                    className="text-xs text-muted-foreground hover:text-cyan flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete system "${sys.name}"?`)) {
                        onDeleteSystem(sys.id);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 ml-2"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: TRADING EXPERIMENTS */}
      <div className="space-y-3 pt-4 border-t border-glass-border/60">
        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-cyan" />
          Trading Experiments & Edge Validation ({experiments.length})
        </h3>

        <div className="space-y-2">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  Hypothesis: {exp.hypothesis}
                </span>
                <Badge
                  className={cn(
                    "text-[10px]",
                    exp.validated
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {exp.validated ? "Validated" : "Testing"}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground flex gap-4">
                <span>
                  Trades Executed: {exp.tradesExecuted} / {exp.tradesPlanned}
                </span>
                <span>Start Date: {exp.startDate}</span>
              </div>
              {exp.findings && (
                <p className="text-[11px] text-muted-foreground/90 italic">
                  Findings: {exp.findings}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
