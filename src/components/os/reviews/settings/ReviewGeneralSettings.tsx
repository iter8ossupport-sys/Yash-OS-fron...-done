import type { ReviewSettings } from "@/lib/os/types";
import { Label } from "@/components/os/ui";

interface ReviewGeneralSettingsProps {
  settings: ReviewSettings;
  onUpdate: (patch: Partial<ReviewSettings>) => void;
}

export function ReviewGeneralSettings({
  settings,
  onUpdate,
}: ReviewGeneralSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Default Review Period</Label>
          <select
            value={settings.defaultPeriod}
            onChange={(e) =>
              onUpdate({
                defaultPeriod: e.target
                  .value as ReviewSettings["defaultPeriod"],
              })
            }
            className="w-full h-10 rounded-xl border border-input bg-secondary/60 px-3 text-sm text-foreground outline-none"
          >
            <option value="daily" className="bg-popover">
              Daily Review
            </option>
            <option value="weekly" className="bg-popover">
              Weekly Review
            </option>
            <option value="monthly" className="bg-popover">
              Monthly Review
            </option>
            <option value="history" className="bg-popover">
              History
            </option>
          </select>
        </div>

        <div>
          <Label>Calendar Week Start Day</Label>
          <select
            value={settings.weekStartDay}
            onChange={(e) =>
              onUpdate({
                weekStartDay: parseInt(e.target.value, 10) as 1 | 0,
              })
            }
            className="w-full h-10 rounded-xl border border-input bg-secondary/60 px-3 text-sm text-foreground outline-none"
          >
            <option value={1} className="bg-popover">
              Monday (ISO 8601 Standard)
            </option>
            <option value={0} className="bg-popover">
              Sunday
            </option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4 space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-semibold text-foreground text-sm">
              Priority 2 Workstream Split Tracking
            </div>
            <div className="text-muted-foreground mt-0.5">
              Maintains isolated tracking for Cashflow Generation (A) vs Fintech
              Product (B).
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.trackP2WorkstreamSplits}
            onChange={(e) =>
              onUpdate({ trackP2WorkstreamSplits: e.target.checked })
            }
            className="h-4 w-4 rounded accent-primary"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Minimum Data Threshold (Days)</Label>
          <input
            type="number"
            min={1}
            max={14}
            value={settings.minDataThresholdDays}
            onChange={(e) =>
              onUpdate({
                minDataThresholdDays: parseInt(e.target.value, 10) || 3,
              })
            }
            className="w-full h-10 rounded-xl border border-input bg-secondary/60 px-3 text-sm text-foreground outline-none"
          />
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Minimum closed days required before AI analyst grants High
            confidence.
          </span>
        </div>

        <div>
          <Label>Export Date Format</Label>
          <select
            value={settings.exportDateFormat}
            onChange={(e) =>
              onUpdate({
                exportDateFormat: e.target
                  .value as ReviewSettings["exportDateFormat"],
              })
            }
            className="w-full h-10 rounded-xl border border-input bg-secondary/60 px-3 text-sm text-foreground outline-none"
          >
            <option value="YYYY-MM-DD" className="bg-popover">
              YYYY-MM-DD (ISO)
            </option>
            <option value="DD/MM/YYYY" className="bg-popover">
              DD/MM/YYYY (UK/India)
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
