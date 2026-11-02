import { useState, useMemo } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { evaluateCustomMetric } from "@/lib/os/reviews/analytics";
import type {
  CustomMetricDefinition,
  PriorityId,
  ReviewPeriodSummary,
} from "@/lib/os/types";
import { Badge, Button, Input, Label } from "@/components/os/ui";
import { toast } from "sonner";

interface ReviewCustomMetricsSettingsProps {
  customMetrics?: CustomMetricDefinition[] | undefined;
  trailing14Summary: ReviewPeriodSummary;
  onAddMetric: (metric: CustomMetricDefinition) => void;
  onDeleteMetric: (metricId: string) => void;
}

export function ReviewCustomMetricsSettings({
  customMetrics = [],
  trailing14Summary,
  onAddMetric,
  onDeleteMetric,
}: ReviewCustomMetricsSettingsProps) {
  const [metricName, setMetricName] = useState("");
  const [metricDesc, setMetricDesc] = useState("");
  const [metricFormula, setMetricFormula] =
    useState<CustomMetricDefinition["formula"]>("yield_per_hour");
  const [metricNum, setMetricNum] =
    useState<CustomMetricDefinition["numerator"]>("outcomesAchieved");
  const [metricDen, setMetricDen] =
    useState<CustomMetricDefinition["denominator"]>("totalActualHours");
  const [metricUnit, setMetricUnit] =
    useState<CustomMetricDefinition["unit"]>("ratio");
  const [metricTarget, setMetricTarget] = useState<number>(1);
  const [metricPriority, setMetricPriority] = useState<string>("");

  const previewEvaluation = useMemo(() => {
    const mockMetric: CustomMetricDefinition = {
      id: "preview",
      name: metricName || "Preview Metric",
      description: metricDesc,
      formula: metricFormula,
      numerator: metricNum,
      denominator: metricDen,
      unit: metricUnit,
      targetValue: metricTarget,
      priorityFilter: metricPriority
        ? (parseInt(metricPriority, 10) as PriorityId)
        : undefined,
    };
    return evaluateCustomMetric(mockMetric, trailing14Summary);
  }, [
    metricName,
    metricDesc,
    metricFormula,
    metricNum,
    metricDen,
    metricUnit,
    metricTarget,
    metricPriority,
    trailing14Summary,
  ]);

  const handleCreateMetric = () => {
    if (!metricName.trim()) {
      toast.error("Please enter a metric name.");
      return;
    }

    const newMetric: CustomMetricDefinition = {
      id: `metric-${Math.random().toString(36).slice(2, 8)}`,
      name: metricName.trim(),
      description: metricDesc.trim(),
      formula: metricFormula,
      numerator: metricNum,
      denominator: metricDen,
      unit: metricUnit,
      targetValue: metricTarget,
      priorityFilter: metricPriority
        ? (parseInt(metricPriority, 10) as PriorityId)
        : undefined,
    };

    onAddMetric(newMetric);
    toast.success(`Custom metric "${metricName}" created.`);
    setMetricName("");
    setMetricDesc("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-cyan" />
          <span className="font-semibold text-foreground text-sm">
            Custom Metric Formula Builder
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Construct deterministic mathematical metrics using atomic execution
          data. Formulas evaluate dynamically over review periods.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Metric Name</Label>
            <Input
              placeholder="e.g. Focus Ratio, P2 Cash Velocity"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              placeholder="What does this metric measure?"
              value={metricDesc}
              onChange={(e) => setMetricDesc(e.target.value)}
            />
          </div>
        </div>

        {/* Mathematical Equation Controls */}
        <div className="rounded-xl border border-glass-border/60 bg-secondary/20 p-3 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Formula Structure</Label>
              <select
                value={metricFormula}
                onChange={(e) =>
                  setMetricFormula(
                    e.target.value as CustomMetricDefinition["formula"],
                  )
                }
                className="w-full h-9 rounded-xl border border-input bg-secondary/60 px-2.5 text-xs outline-none"
              >
                <option value="yield_per_hour">
                  Yield Density (Output / Hours)
                </option>
                <option value="rate">Completion Rate (Num / Den %)</option>
                <option value="ratio">Direct Ratio (Num / Den)</option>
                <option value="velocity">Velocity per Day</option>
              </select>
            </div>

            <div>
              <Label>Numerator [ A ]</Label>
              <select
                value={metricNum}
                onChange={(e) =>
                  setMetricNum(
                    e.target.value as CustomMetricDefinition["numerator"],
                  )
                }
                className="w-full h-9 rounded-xl border border-input bg-secondary/60 px-2.5 text-xs outline-none"
              >
                <option value="outcomesAchieved">Outcomes Achieved</option>
                <option value="actualHours">Actual Hours Logged</option>
                <option value="tasksDone">Tasks Completed</option>
                <option value="p2HoursA">
                  P2 Workstream A (Trading Hours)
                </option>
                <option value="p2HoursB">
                  P2 Workstream B (Product Hours)
                </option>
              </select>
            </div>

            <div>
              <Label>Denominator [ B ]</Label>
              <select
                value={metricDen}
                onChange={(e) =>
                  setMetricDen(
                    e.target.value as CustomMetricDefinition["denominator"],
                  )
                }
                className="w-full h-9 rounded-xl border border-input bg-secondary/60 px-2.5 text-xs outline-none"
              >
                <option value="totalActualHours">Total Actual Hours</option>
                <option value="plannedHours">Planned Hours Allocation</option>
                <option value="tasksPlanned">Tasks Planned</option>
                <option value="recordedDays">Recorded Days Count</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Display Unit</Label>
              <select
                value={metricUnit}
                onChange={(e) =>
                  setMetricUnit(
                    e.target.value as CustomMetricDefinition["unit"],
                  )
                }
                className="w-full h-9 rounded-xl border border-input bg-secondary/60 px-2.5 text-xs outline-none"
              >
                <option value="ratio">Ratio (e.g. 0.8)</option>
                <option value="%">Percentage (%)</option>
                <option value="h">Hours (h)</option>
                <option value="count">Count</option>
              </select>
            </div>

            <div>
              <Label>Target Value</Label>
              <Input
                type="number"
                step={0.1}
                value={metricTarget}
                onChange={(e) =>
                  setMetricTarget(parseFloat(e.target.value) || 0)
                }
                className="h-9 font-mono"
              />
            </div>

            <div>
              <Label>Priority Filter</Label>
              <select
                value={metricPriority}
                onChange={(e) => setMetricPriority(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-secondary/60 px-2.5 text-xs outline-none"
              >
                <option value="">All Priorities</option>
                <option value="1">Priority #1 Only</option>
                <option value="2">Priority #2 Only</option>
                <option value="3">Priority #3 Only</option>
              </select>
            </div>
          </div>

          {/* Live Preview Ribbon */}
          <div className="pt-2 border-t border-glass-border/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground mr-1.5">
                Live Trailing 14d Test Value:
              </span>
              <span className="font-mono font-bold text-foreground">
                {previewEvaluation.formatted}
              </span>
              <span className="text-muted-foreground ml-2">
                (Target: {metricTarget}
                {metricUnit})
              </span>
            </div>
            <Badge
              className={
                previewEvaluation.targetMet
                  ? "border-success/30 text-success bg-success/10"
                  : "border-warning/30 text-warning bg-warning/10"
              }
            >
              {previewEvaluation.targetMet ? "Target Met" : "Below Target"}
            </Badge>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={handleCreateMetric}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Custom Metric
          </Button>
        </div>
      </div>

      {/* List of Defined Metrics */}
      <div className="space-y-2">
        <span className="font-semibold text-muted-foreground block text-xs">
          Active Custom Metrics ({customMetrics.length})
        </span>
        {customMetrics.length === 0 ? (
          <p className="text-muted-foreground italic">
            No custom metric formulas defined yet.
          </p>
        ) : (
          customMetrics.map((m) => {
            const evalResult = evaluateCustomMetric(m, trailing14Summary);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {m.name}
                    </span>
                    <span className="font-mono font-bold text-xs text-cyan">
                      {evalResult.formatted}
                    </span>
                    <Badge className="text-[10px]">
                      Target: {m.targetValue}
                      {m.unit}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    {m.description || `${m.numerator} / ${m.denominator}`} ·
                    Formula: {m.formula}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8 hover:bg-destructive/15"
                  onClick={() => onDeleteMetric(m.id)}
                  aria-label="Delete Metric"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
