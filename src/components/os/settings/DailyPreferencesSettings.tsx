import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  COMMON_TIMEZONES,
  MAX_DAY_HOURS,
  MIN_DAY_HOURS,
  VALID_DAY_TYPES,
  applyDailyPreferencesUpdate,
  getDetectedTimeZone,
  selectDailyPreferences,
} from "@/lib/os/settings";
import { useOS } from "@/lib/os/store";
import type { DayType } from "@/lib/os/types";
import { Button, Input, Label, Select, Textarea } from "@/components/os/ui";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

export function DailyPreferencesSettings() {
  const { state, update } = useOS();
  const current = selectDailyPreferences(state);
  const detectedTz = getDetectedTimeZone();
  const collegeHours = current.dayTypeHours["College Day"];
  const nonCollegeHours = current.dayTypeHours["Non-College Day"];
  const weekendHours = current.dayTypeHours["Weekend/Holiday"];
  const customHours = current.dayTypeHours.Custom;

  const [timeZone, setTimeZone] = useState(current.timeZone);
  const [weekStartDay, setWeekStartDay] = useState<0 | 1>(current.weekStartDay);
  const [defaultDayType, setDefaultDayType] = useState<DayType>(
    current.defaultDayType,
  );
  const [hourInputs, setHourInputs] = useState<Record<DayType, string>>(() => ({
    "College Day": String(collegeHours),
    "Non-College Day": String(nonCollegeHours),
    "Weekend/Holiday": String(weekendHours),
    Custom: String(customHours),
  }));
  const [timer, setTimer] = useState(current.timer);
  const [constraints, setConstraints] = useState(current.constraints);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeZone(current.timeZone);
    setWeekStartDay(current.weekStartDay);
    setDefaultDayType(current.defaultDayType);
    setHourInputs({
      "College Day": String(collegeHours),
      "Non-College Day": String(nonCollegeHours),
      "Weekend/Holiday": String(weekendHours),
      Custom: String(customHours),
    });
    setTimer(current.timer);
    setConstraints(current.constraints);
    setError(null);
  }, [
    current.timeZone,
    current.weekStartDay,
    current.defaultDayType,
    collegeHours,
    nonCollegeHours,
    weekendHours,
    customHours,
    current.timer,
    current.constraints,
  ]);

  const timeZoneOptions = COMMON_TIMEZONES.map((tz) => ({
    value: tz.value,
    label: tz.value === "auto" ? `Automatic (${detectedTz})` : tz.label,
  }));

  const parseHourInputs = (): Record<DayType, number> | null => {
    const map = {} as Record<DayType, number>;
    for (const dt of VALID_DAY_TYPES) {
      const raw = hourInputs[dt]?.trim() ?? "";
      if (!raw) {
        setError(
          `${dt}: enter daily working hours (${MIN_DAY_HOURS}–${MAX_DAY_HOURS}).`,
        );
        return null;
      }
      const num = Number(raw);
      if (!Number.isFinite(num) || num < MIN_DAY_HOURS || num > MAX_DAY_HOURS) {
        setError(
          `${dt}: daily hours must be between ${MIN_DAY_HOURS} and ${MAX_DAY_HOURS}.`,
        );
        return null;
      }
      map[dt] = Math.round(num * 2) / 2;
    }
    return map;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHours = parseHourInputs();
    if (!parsedHours) {
      toast.error("Please fix invalid daily hour values.");
      return;
    }

    const patch = {
      timeZone,
      weekStartDay,
      defaultDayType,
      dayTypeHours: parsedHours,
      timer,
      constraints,
    };
    const check = applyDailyPreferencesUpdate(state, patch);
    if (!check.ok) {
      setError(check.error);
      toast.error(check.error);
      return;
    }

    setError(null);
    update((s) => {
      const next = applyDailyPreferencesUpdate(s, patch);
      return next.ok ? next.state : s;
    });
    toast.success("Daily preferences saved");
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SettingsSectionHeader
        title="Daily Preferences"
        description="Configure time zone, week boundary, default planning day hours, execution timer, and operating constraints."
        icon={CalendarClock}
      />

      {/* Locale & Calendar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Time Zone</Label>
          <Select
            value={timeZone}
            onChange={(v) => setTimeZone(v)}
            options={timeZoneOptions}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Controls header date formatting and Home time-of-day greetings.
          </p>
        </div>

        <div>
          <Label>Week Start Day</Label>
          <div
            role="radiogroup"
            aria-label="Week Start Day"
            className="grid grid-cols-2 gap-2"
          >
            {[
              { value: 1 as const, label: "Monday (ISO)" },
              { value: 0 as const, label: "Sunday" },
            ].map((opt) => {
              const active = weekStartDay === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setWeekStartDay(opt.value)}
                  className={cn(
                    "h-10 rounded-xl border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Determines weekly boundaries in Review Overview and Weekly Reviews.
          </p>
        </div>
      </div>

      {/* Default Day Type & Working Hours */}
      <div className="space-y-3">
        <div>
          <Label>Default Day Type for New Plans</Label>
          <Select
            value={defaultDayType}
            onChange={(v) => setDefaultDayType(v as DayType)}
            options={VALID_DAY_TYPES.map((dt) => ({ value: dt, label: dt }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Pre-selected day type and default hour budget when starting a new
            draft in Plan.
          </p>
        </div>

        <div className="pt-2">
          <Label>Default Working Hours per Day Type</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {VALID_DAY_TYPES.map((dt) => (
              <div
                key={dt}
                className="rounded-xl border border-glass-border bg-secondary/30 p-3"
              >
                <label
                  htmlFor={`hours-${dt}`}
                  className="mb-1 block text-xs font-medium text-foreground"
                >
                  {dt}
                </label>
                <Input
                  id={`hours-${dt}`}
                  type="number"
                  min={MIN_DAY_HOURS}
                  max={MAX_DAY_HOURS}
                  step={0.5}
                  value={hourInputs[dt]}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHourInputs((prev) => ({ ...prev, [dt]: val }));
                    if (error) setError(null);
                  }}
                />
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  hours / day (0–16)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Experience */}
      <div className="rounded-2xl border border-glass-border bg-secondary/20 p-4">
        <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
          <div>
            <span className="font-semibold text-foreground">
              Show Execution Timer
            </span>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Display the active task countdown ring in the Execute workspace.
            </p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={timer}
            onChange={(e) => setTimer(e.target.checked)}
          />
        </label>
      </div>

      {/* Operating Constraints */}
      <div className="space-y-1.5">
        <Label htmlFor="daily-constraints">
          Personal Operating Constraints
        </Label>
        <p className="text-xs text-muted-foreground">
          Shown as a reference reminder on Step 1 when creating a daily plan.
        </p>
        <Textarea
          id="daily-constraints"
          rows={3}
          maxLength={1000}
          value={constraints}
          onChange={(e) => {
            setConstraints(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. No meetings before 14:00. Deep work blocks reserved for Priority 1."
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          Save Daily Preferences
        </Button>
      </div>
    </form>
  );
}
