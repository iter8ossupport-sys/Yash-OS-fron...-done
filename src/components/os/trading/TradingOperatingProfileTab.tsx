import { useState } from "react";
import {
  ShieldAlert,
  ListChecks,
  BookOpen,
  Plus,
  Trash2,
  Save,
  Tag,
} from "lucide-react";
import { Button, Input, Label, Select, Textarea } from "@/components/os/ui";
import type { TradingOperatingProfile } from "@/lib/os/types";
import { toast } from "sonner";

export interface TradingOperatingProfileTabProps {
  profile: TradingOperatingProfile;
  onSave: (profile: Partial<TradingOperatingProfile>) => void;
}

export function TradingOperatingProfileTab({
  profile,
  onSave,
}: TradingOperatingProfileTabProps) {
  const [draft, setDraft] = useState<TradingOperatingProfile>(profile);
  const [newMarket, setNewMarket] = useState("");
  const [newPrePrepItem, setNewPrePrepItem] = useState("");
  const [newPostReviewItem, setNewPostReviewItem] = useState("");
  const [newInTradeItem, setNewInTradeItem] = useState("");

  const handleAddMarket = () => {
    const trimmed = newMarket.trim();
    if (!trimmed) return;
    if (!draft.marketFocus.includes(trimmed)) {
      setDraft({ ...draft, marketFocus: [...draft.marketFocus, trimmed] });
    }
    setNewMarket("");
  };

  const handleRemoveMarket = (item: string) => {
    setDraft({
      ...draft,
      marketFocus: draft.marketFocus.filter((m) => m !== item),
    });
  };

  const handleAddPrePrep = () => {
    const trimmed = newPrePrepItem.trim();
    if (!trimmed) return;
    setDraft({
      ...draft,
      routines: {
        ...draft.routines,
        preMarketPrepChecklist: [
          ...draft.routines.preMarketPrepChecklist,
          trimmed,
        ],
      },
    });
    setNewPrePrepItem("");
  };

  const handleRemovePrePrep = (idx: number) => {
    setDraft({
      ...draft,
      routines: {
        ...draft.routines,
        preMarketPrepChecklist: draft.routines.preMarketPrepChecklist.filter(
          (_, i) => i !== idx,
        ),
      },
    });
  };

  const handleAddPostReview = () => {
    const trimmed = newPostReviewItem.trim();
    if (!trimmed) return;
    setDraft({
      ...draft,
      routines: {
        ...draft.routines,
        postMarketReviewChecklist: [
          ...draft.routines.postMarketReviewChecklist,
          trimmed,
        ],
      },
    });
    setNewPostReviewItem("");
  };

  const handleRemovePostReview = (idx: number) => {
    setDraft({
      ...draft,
      routines: {
        ...draft.routines,
        postMarketReviewChecklist:
          draft.routines.postMarketReviewChecklist.filter((_, i) => i !== idx),
      },
    });
  };

  const handleAddInTrade = () => {
    const trimmed = newInTradeItem.trim();
    if (!trimmed) return;
    setDraft({
      ...draft,
      routines: {
        ...draft.routines,
        inTradeExecutionChecklist: [
          ...(draft.routines.inTradeExecutionChecklist ?? []),
          trimmed,
        ],
      },
    });
    setNewInTradeItem("");
  };

  const handleRemoveInTrade = (idx: number) => {
    setDraft({
      ...draft,
      routines: {
        ...draft.routines,
        inTradeExecutionChecklist: (
          draft.routines.inTradeExecutionChecklist ?? []
        ).filter((_, i) => i !== idx),
      },
    });
  };

  const handleSave = () => {
    onSave(draft);
    toast.success("Trading Operating Profile saved");
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-glass-border/60 pb-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan" />
            Trading Operating Profile (Authoritative Doc 1)
          </h3>
          <p className="text-xs text-muted-foreground">
            Market focus, quantitative edge, non-negotiable risk rules, and
            execution routines.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          className="text-xs"
        >
          <Save className="h-3.5 w-3.5 mr-1" /> Save Profile
        </Button>
      </div>

      {/* Section 1: Core Edge & Market Focus */}
      <div className="rounded-2xl border border-glass-border/70 bg-secondary/30 p-4 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-cyan" /> Edge & Market Focus
        </h4>

        <div>
          <Label>Core Statistical / Execution Edge</Label>
          <Textarea
            value={draft.coreEdgeDescription}
            onChange={(e) =>
              setDraft({ ...draft, coreEdgeDescription: e.target.value })
            }
            placeholder="Describe the mathematical or structural market inefficiency exploited..."
            rows={3}
          />
        </div>

        <div>
          <Label>Primary Markets / Instruments Focus</Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {draft.marketFocus.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-lg border border-cyan/40 bg-cyan/15 px-2.5 py-1 text-xs font-medium text-cyan"
              >
                {m}
                <button
                  type="button"
                  onClick={() => handleRemoveMarket(m)}
                  className="hover:text-destructive text-cyan/70 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-sm">
            <Input
              value={newMarket}
              onChange={(e) => setNewMarket(e.target.value)}
              placeholder="e.g. NQ Futures, ES, EUR/USD..."
              className="text-xs h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMarket();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="glass"
              onClick={handleAddMarket}
              className="text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>
      </div>

      {/* Section 2: Non-Negotiable Risk Rules Matrix */}
      <div className="rounded-2xl border border-cyan/40 bg-secondary/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-cyan" /> Non-Negotiable Risk
            Rules Matrix
          </h4>
          <span className="text-[10px] text-muted-foreground font-mono">
            Circuit Breaker Enforced
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Max Daily Drawdown (Currency)</Label>
            <Input
              type="number"
              value={draft.riskRules.maxDailyDrawdownCurrency}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  riskRules: {
                    ...draft.riskRules,
                    maxDailyDrawdownCurrency: Number(e.target.value) || 0,
                  },
                })
              }
              className="text-xs h-9 font-mono"
            />
          </div>

          <div>
            <Label>Max Trailing Drawdown (%)</Label>
            <Input
              type="number"
              step="0.5"
              value={draft.riskRules.maxTrailingDrawdownPercent}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  riskRules: {
                    ...draft.riskRules,
                    maxTrailingDrawdownPercent: Number(e.target.value) || 0,
                  },
                })
              }
              className="text-xs h-9 font-mono"
            />
          </div>

          <div>
            <Label>Max Risk Per Trade (%)</Label>
            <Input
              type="number"
              step="0.25"
              value={draft.riskRules.maxRiskPerTradePercent}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  riskRules: {
                    ...draft.riskRules,
                    maxRiskPerTradePercent: Number(e.target.value) || 0,
                  },
                })
              }
              className="text-xs h-9 font-mono"
            />
          </div>

          <div>
            <Label>Leverage / Contract Limit</Label>
            <Input
              value={draft.riskRules.leverageOrContractLimit}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  riskRules: {
                    ...draft.riskRules,
                    leverageOrContractLimit: e.target.value,
                  },
                })
              }
              placeholder="e.g. 2 NQ Mini or 10 Micro Contracts"
              className="text-xs h-9"
            />
          </div>

          <div>
            <Label>Max Consecutive Losses</Label>
            <Input
              type="number"
              value={draft.riskRules.maxConsecutiveLosses ?? 3}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  riskRules: {
                    ...draft.riskRules,
                    maxConsecutiveLosses: Number(e.target.value) || 0,
                  },
                })
              }
              className="text-xs h-9 font-mono"
            />
          </div>

          <div>
            <Label>Circuit Breaker Action</Label>
            <Select
              value={draft.riskRules.circuitBreakerAction ?? "stop_for_day"}
              onChange={(val) =>
                setDraft({
                  ...draft,
                  riskRules: {
                    ...draft.riskRules,
                    circuitBreakerAction: val as
                      "stop_for_day" | "halve_risk" | "review_required",
                  },
                })
              }
              options={[
                { value: "stop_for_day", label: "Stop Trading for the Day" },
                { value: "halve_risk", label: "Halve Risk per Trade (50%)" },
                {
                  value: "review_required",
                  label: "Mandatory Playbook Review",
                },
              ]}
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="hardStopCheck"
            checked={draft.riskRules.hardStopRequired}
            onChange={(e) =>
              setDraft({
                ...draft,
                riskRules: {
                  ...draft.riskRules,
                  hardStopRequired: e.target.checked,
                },
              })
            }
            className="h-4 w-4 rounded border-glass-border text-cyan focus:ring-cyan"
          />
          <label
            htmlFor="hardStopCheck"
            className="text-xs font-medium text-foreground cursor-pointer"
          >
            Mandatory Hard Stop Required on Order Entry (Never Trade Without
            Physical Stop)
          </label>
        </div>
      </div>

      {/* Section 3: Execution Routines & Checklists */}
      <div className="rounded-2xl border border-glass-border/70 bg-secondary/30 p-4 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ListChecks className="h-4 w-4 text-cyan" /> Daily Operational
          Routines & Checklists
        </h4>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Pre-Market Prep */}
          <div className="space-y-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-3">
            <span className="text-xs font-semibold text-foreground block">
              1. Pre-Market Preparation
            </span>
            <div className="space-y-1.5">
              {draft.routines.preMarketPrepChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-1 text-xs"
                >
                  <span className="text-muted-foreground leading-snug">
                    • {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrePrep(idx)}
                    className="text-muted-foreground/60 hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 pt-1">
              <Input
                value={newPrePrepItem}
                onChange={(e) => setNewPrePrepItem(e.target.value)}
                placeholder="Add checklist step..."
                className="text-xs h-7"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPrePrep();
                  }
                }}
              />
              <Button
                size="sm"
                variant="glass"
                onClick={handleAddPrePrep}
                className="h-7 px-2 text-xs"
              >
                +
              </Button>
            </div>
          </div>

          {/* In-Trade Execution */}
          <div className="space-y-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-3">
            <span className="text-xs font-semibold text-foreground block">
              2. In-Trade Execution
            </span>
            <div className="space-y-1.5">
              {(draft.routines.inTradeExecutionChecklist ?? []).map(
                (item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-1 text-xs"
                  >
                    <span className="text-muted-foreground leading-snug">
                      • {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInTrade(idx)}
                      className="text-muted-foreground/60 hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ),
              )}
            </div>
            <div className="flex gap-1.5 pt-1">
              <Input
                value={newInTradeItem}
                onChange={(e) => setNewInTradeItem(e.target.value)}
                placeholder="Add checklist step..."
                className="text-xs h-7"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInTrade();
                  }
                }}
              />
              <Button
                size="sm"
                variant="glass"
                onClick={handleAddInTrade}
                className="h-7 px-2 text-xs"
              >
                +
              </Button>
            </div>
          </div>

          {/* Post-Market Review */}
          <div className="space-y-2 rounded-xl border border-glass-border/60 bg-secondary/20 p-3">
            <span className="text-xs font-semibold text-foreground block">
              3. Post-Market Review
            </span>
            <div className="space-y-1.5">
              {draft.routines.postMarketReviewChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-1 text-xs"
                >
                  <span className="text-muted-foreground leading-snug">
                    • {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePostReview(idx)}
                    className="text-muted-foreground/60 hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 pt-1">
              <Input
                value={newPostReviewItem}
                onChange={(e) => setNewPostReviewItem(e.target.value)}
                placeholder="Add checklist step..."
                className="text-xs h-7"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPostReview();
                  }
                }}
              />
              <Button
                size="sm"
                variant="glass"
                onClick={handleAddPostReview}
                className="h-7 px-2 text-xs"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Playbook & Setup Protocols Markdown */}
      <div className="rounded-2xl border border-glass-border/70 bg-secondary/30 p-4 space-y-2">
        <Label>Execution Playbook & Strategy Notes (Markdown)</Label>
        <Textarea
          value={draft.flexibleContent}
          onChange={(e) =>
            setDraft({ ...draft, flexibleContent: e.target.value })
          }
          placeholder="Execution protocols, session timing windows, order flow setups, invalidation levels..."
          rows={6}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
