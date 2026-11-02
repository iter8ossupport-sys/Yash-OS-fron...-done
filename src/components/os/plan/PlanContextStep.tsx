import { Input, Label, Segmented, Textarea } from "@/components/os/ui";
import type { DayType, Energy, Plan } from "@/lib/os/types";
import { DAY_TYPES, ENERGY } from "./planConstants";

export interface PlanContextStepProps {
  draft: Plan;
  dayTypeHours: Record<DayType, number>;
  onChangeDraft: (fn: (d: Plan) => Plan) => void;
}

export function PlanContextStep({
  draft,
  dayTypeHours,
  onChangeDraft,
}: PlanContextStepProps) {
  const ctx = draft.context;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={ctx.date}
            onChange={(e) =>
              onChangeDraft((d) => ({
                ...d,
                context: { ...d.context, date: e.target.value },
              }))
            }
          />
        </div>
      </div>
      <div>
        <Label>Day type</Label>
        <Segmented
          value={ctx.dayType}
          options={DAY_TYPES}
          onChange={(v: DayType) =>
            onChangeDraft((d) => ({
              ...d,
              context: {
                ...d.context,
                dayType: v,
                hours: dayTypeHours[v],
              },
            }))
          }
        />
      </div>
      <div>
        <div className="flex justify-between">
          <Label>Available usable work hours</Label>
          <span className="text-sm font-semibold">{ctx.hours} hours</span>
        </div>
        <input
          type="range"
          min={0}
          max={14}
          step={0.5}
          value={ctx.hours}
          aria-label="Available hours"
          className="w-full"
          onChange={(e) =>
            onChangeDraft((d) => ({
              ...d,
              context: { ...d.context, hours: +e.target.value },
            }))
          }
        />
      </div>
      <div>
        <Label>Energy level</Label>
        <Segmented
          value={ctx.energy}
          options={ENERGY}
          onChange={(v: Energy) =>
            onChangeDraft((d) => ({
              ...d,
              context: { ...d.context, energy: v },
            }))
          }
        />
      </div>
      <div>
        <Label>Fixed commitments (optional)</Label>
        <Textarea
          placeholder="e.g. College, meetings, family, travel…"
          value={ctx.commitments}
          onChange={(e) =>
            onChangeDraft((d) => ({
              ...d,
              context: { ...d.context, commitments: e.target.value },
            }))
          }
        />
      </div>
    </div>
  );
}
