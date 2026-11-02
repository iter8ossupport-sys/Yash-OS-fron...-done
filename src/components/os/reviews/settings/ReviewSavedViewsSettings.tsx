import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { CustomReviewView, PriorityId } from "@/lib/os/types";
import { Button, Input, Label } from "@/components/os/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ALL_CARDS } from "./reviewSettingsConstants";

interface ReviewSavedViewsSettingsProps {
  customViews?: CustomReviewView[] | undefined;
  onSaveView: (view: CustomReviewView) => void;
  onDeleteView: (viewId: string) => void;
}

export function ReviewSavedViewsSettings({
  customViews = [],
  onSaveView,
  onDeleteView,
}: ReviewSavedViewsSettingsProps) {
  const [viewName, setViewName] = useState("");
  const [viewPriorityFilter, setViewPriorityFilter] = useState<string>("");
  const [viewPreset, setViewPreset] = useState<
    "last_7_days" | "last_14_days" | "last_30_days"
  >("last_14_days");
  const [selectedCards, setSelectedCards] = useState<string[]>([
    "kpi_ribbon",
    "realism_chart",
    "outcomes_ratio",
    "p2_split",
  ]);
  const [chartPref, setChartPref] = useState<
    "bar" | "distribution" | "stacked"
  >("bar");

  const handleCreateView = () => {
    if (!viewName.trim()) {
      toast.error("Please enter a name for the view.");
      return;
    }

    const newView: CustomReviewView = {
      id: `view-${Math.random().toString(36).slice(2, 8)}`,
      name: viewName.trim(),
      priorityFilter: viewPriorityFilter
        ? (parseInt(viewPriorityFilter, 10) as PriorityId)
        : undefined,
      dateRangePreset: viewPreset,
      selectedMetricCards: selectedCards,
      chartTypePreference: chartPref,
    };

    onSaveView(newView);
    toast.success(`Custom view "${viewName}" saved.`);
    setViewName("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4 space-y-4">
        <span className="font-semibold text-foreground text-sm block">
          Create Customized View Preset
        </span>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>View Name</Label>
            <Input
              placeholder="e.g. Founder Executive Brief"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
          </div>
          <div>
            <Label>Priority Focus</Label>
            <select
              value={viewPriorityFilter}
              onChange={(e) => setViewPriorityFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-secondary/60 px-3 text-sm text-foreground outline-none"
            >
              <option value="" className="bg-popover">
                All Priorities
              </option>
              <option value="1" className="bg-popover">
                #1 Founder Capability
              </option>
              <option value="2" className="bg-popover">
                #2 Cashflow Infrastructure
              </option>
              <option value="3" className="bg-popover">
                #3 Learning for Execution
              </option>
            </select>
          </div>
          <div>
            <Label>Date Range Window</Label>
            <select
              value={viewPreset}
              onChange={(e) =>
                setViewPreset(
                  e.target.value as
                    "last_7_days" | "last_14_days" | "last_30_days",
                )
              }
              className="w-full h-10 rounded-xl border border-input bg-secondary/60 px-3 text-sm text-foreground outline-none"
            >
              <option value="last_7_days" className="bg-popover">
                Last 7 Days
              </option>
              <option value="last_14_days" className="bg-popover">
                Last 14 Days
              </option>
              <option value="last_30_days" className="bg-popover">
                Last 30 Days
              </option>
            </select>
          </div>
        </div>

        {/* Card Visibility Selection */}
        <div className="space-y-2 pt-2 border-t border-glass-border/40">
          <Label>Visible Dashboard Cards & Layout Modules</Label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_CARDS.map((card) => {
              const checked = selectedCards.includes(card.id);
              return (
                <label
                  key={card.id}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer",
                    checked
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-glass-border bg-secondary/20 text-muted-foreground",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCards([...selectedCards, card.id]);
                      } else {
                        setSelectedCards(
                          selectedCards.filter((c) => c !== card.id),
                        );
                      }
                    }}
                    className="h-3.5 w-3.5 accent-primary rounded"
                  />
                  <span className="text-xs font-medium">{card.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <Label className="mb-0">Chart Preference:</Label>
            <select
              value={chartPref}
              onChange={(e) =>
                setChartPref(
                  e.target.value as "bar" | "distribution" | "stacked",
                )
              }
              className="h-8 rounded-lg border border-input bg-secondary/60 px-2 text-xs"
            >
              <option value="bar">Grouped Bar</option>
              <option value="distribution">Distribution Ratio</option>
              <option value="stacked">Stacked Volume</option>
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={handleCreateView}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Save View Preset
          </Button>
        </div>
      </div>

      {/* Saved Custom Views List */}
      <div className="space-y-2">
        <span className="font-semibold text-muted-foreground block text-xs">
          Active Saved Views ({customViews.length})
        </span>
        {customViews.length === 0 ? (
          <p className="text-muted-foreground italic">
            No custom views saved yet.
          </p>
        ) : (
          customViews.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 p-3"
            >
              <div>
                <div className="font-semibold text-foreground text-sm">
                  {v.name}
                </div>
                <div className="text-muted-foreground text-[11px] mt-0.5">
                  {v.priorityFilter
                    ? `Priority #${v.priorityFilter}`
                    : "All Priorities"}{" "}
                  · {v.dateRangePreset?.replace("_", " ") ?? "Default Range"} ·{" "}
                  {v.selectedMetricCards?.length ?? 4} visible cards
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-8 w-8 hover:bg-destructive/15"
                onClick={() => onDeleteView(v.id)}
                aria-label="Delete View"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
