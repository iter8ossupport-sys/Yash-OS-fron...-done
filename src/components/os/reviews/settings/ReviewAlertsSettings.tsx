import { Bell } from "lucide-react";
import type { AlertSettings } from "@/lib/os/types";
import { toast } from "sonner";

interface ReviewAlertsSettingsProps {
  alertSettings: AlertSettings;
  onUpdateAlerts: (settings: AlertSettings) => void;
}

export function ReviewAlertsSettings({
  alertSettings,
  onUpdateAlerts,
}: ReviewAlertsSettingsProps) {
  const enabled = alertSettings.enabledAlerts;

  const updateAlt = (patch: Partial<AlertSettings>) => {
    onUpdateAlerts({ ...alertSettings, ...patch });
    toast.success("Alert thresholds updated.");
  };

  const toggleEnabled = (key: keyof AlertSettings["enabledAlerts"]) => {
    onUpdateAlerts({
      ...alertSettings,
      enabledAlerts: {
        ...alertSettings.enabledAlerts,
        [key]: !alertSettings.enabledAlerts[key],
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-warning" />
          <span className="font-semibold text-foreground text-sm">
            Operational Alert Sensitivity & Thresholds
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Configure threshold triggers and sensitivity parameters for anomaly
          detection across review periods.
        </p>

        <div className="space-y-4">
          {/* 1. Workstream Imbalance */}
          <div className="p-3.5 rounded-xl border border-glass-border bg-secondary/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={enabled.workstreamImbalance}
                  onChange={() => toggleEnabled("workstreamImbalance")}
                  className="h-3.5 w-3.5 accent-primary rounded"
                />
                Priority 2 Workstream Imbalance Alert
              </label>
              <span className="font-mono text-cyan font-bold">
                {alertSettings.workstreamImbalanceThreshold}% split
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={95}
              step={5}
              disabled={!enabled.workstreamImbalance}
              value={alertSettings.workstreamImbalanceThreshold}
              onChange={(e) =>
                updateAlt({
                  workstreamImbalanceThreshold: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-cyan h-2 bg-secondary rounded-lg cursor-pointer disabled:opacity-30"
            />
            <div className="text-[11px] text-muted-foreground">
              Triggers when Workstream A (Trading) exceeds this percentage of
              total Priority 2 hours with 0h logged in Workstream B.
            </div>
          </div>

          {/* 2. Chronic Bottleneck */}
          <div className="p-3.5 rounded-xl border border-glass-border bg-secondary/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={enabled.chronicBottleneck}
                  onChange={() => toggleEnabled("chronicBottleneck")}
                  className="h-3.5 w-3.5 accent-primary rounded"
                />
                Chronic Bottleneck Recurrence Trigger
              </label>
              <span className="font-mono text-warning font-bold">
                {alertSettings.chronicBottleneckThreshold} occurrences
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              disabled={!enabled.chronicBottleneck}
              value={alertSettings.chronicBottleneckThreshold}
              onChange={(e) =>
                updateAlt({
                  chronicBottleneckThreshold: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-warning h-2 bg-secondary rounded-lg cursor-pointer disabled:opacity-30"
            />
            <div className="text-[11px] text-muted-foreground">
              Triggers a critical alert when any unfinished task repeats across
              this many distinct review days.
            </div>
          </div>

          {/* 3. Planning Realism Drift */}
          <div className="p-3.5 rounded-xl border border-glass-border bg-secondary/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={enabled.realismDrift}
                  onChange={() => toggleEnabled("realismDrift")}
                  className="h-3.5 w-3.5 accent-primary rounded"
                />
                Planning Realism Lower Tolerance Bound
              </label>
              <span className="font-mono text-primary font-bold">
                {Math.round(alertSettings.realismDriftMin * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={85}
              step={5}
              disabled={!enabled.realismDrift}
              value={Math.round(alertSettings.realismDriftMin * 100)}
              onChange={(e) =>
                updateAlt({
                  realismDriftMin: parseInt(e.target.value, 10) / 100,
                })
              }
              className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer disabled:opacity-30"
            />
            <div className="text-[11px] text-muted-foreground">
              Triggers when actual execution is under this percentage of planned
              workload (over-commitment signal).
            </div>
          </div>

          {/* 4. Data Continuity Gap */}
          <div className="p-3.5 rounded-xl border border-glass-border bg-secondary/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={enabled.dataGap}
                  onChange={() => toggleEnabled("dataGap")}
                  className="h-3.5 w-3.5 accent-primary rounded"
                />
                Data Continuity Gap Tolerance
              </label>
              <span className="font-mono text-muted-foreground font-bold">
                {alertSettings.dataGapDaysThreshold} gap days
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              disabled={!enabled.dataGap}
              value={alertSettings.dataGapDaysThreshold}
              onChange={(e) =>
                updateAlt({
                  dataGapDaysThreshold: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-muted-foreground h-2 bg-secondary rounded-lg cursor-pointer disabled:opacity-30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
