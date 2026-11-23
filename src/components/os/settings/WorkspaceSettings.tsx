import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { toast } from "sonner";
import {
  applyWorkspaceUpdate,
  selectWorkspaceSettings,
} from "@/lib/os/settings";
import { useOS } from "@/lib/os/store";
import type { ReviewSettings } from "@/lib/os/types";
import { Button, Input, Label, Select, Textarea } from "@/components/os/ui";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

const REVIEW_PERIOD_OPTIONS: Array<{
  value: ReviewSettings["defaultPeriod"];
  label: string;
}> = [
  { value: "daily", label: "Overview / Daily Default" },
  { value: "weekly", label: "Weekly Review" },
  { value: "monthly", label: "Monthly Review" },
  { value: "history", label: "Historical Records" },
];

export function WorkspaceSettings() {
  const { state, update } = useOS();
  const current = selectWorkspaceSettings(state);
  const phasesKey = current.foundation.phases.join("\0");

  const [northStar, setNorthStar] = useState(current.foundation.northStar);
  const [northStarLong, setNorthStarLong] = useState(
    current.foundation.northStarLong,
  );
  const [mission, setMission] = useState(current.foundation.mission);
  const [trajectory, setTrajectory] = useState(current.foundation.trajectory);
  const [phases, setPhases] = useState<string[]>(current.foundation.phases);
  const [defaultPeriod, setDefaultPeriod] = useState<
    ReviewSettings["defaultPeriod"]
  >(current.defaultReviewPeriod);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNorthStar(current.foundation.northStar);
    setNorthStarLong(current.foundation.northStarLong);
    setMission(current.foundation.mission);
    setTrajectory(current.foundation.trajectory);
    setPhases(phasesKey ? phasesKey.split("\0") : []);
    setDefaultPeriod(current.defaultReviewPeriod);
    setError(null);
  }, [
    current.foundation.northStar,
    current.foundation.northStarLong,
    current.foundation.mission,
    current.foundation.trajectory,
    phasesKey,
    current.defaultReviewPeriod,
  ]);

  const isDirty =
    northStar !== current.foundation.northStar ||
    northStarLong !== current.foundation.northStarLong ||
    mission !== current.foundation.mission ||
    trajectory !== current.foundation.trajectory ||
    defaultPeriod !== current.defaultReviewPeriod ||
    phases.some((ph, idx) => ph !== current.foundation.phases[idx]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const check = applyWorkspaceUpdate(state, {
      foundation: {
        northStar,
        northStarLong,
        mission,
        trajectory,
        phases,
      },
      defaultReviewPeriod: defaultPeriod,
    });
    if (!check.ok) {
      setError(check.error);
      toast.error(check.error);
      return;
    }
    setError(null);
    update((s) => {
      const next = applyWorkspaceUpdate(s, {
        foundation: {
          northStar,
          northStarLong,
          mission,
          trajectory,
          phases,
        },
        defaultReviewPeriod: defaultPeriod,
      });
      return next.ok ? next.state : s;
    });
    toast.success("Workspace preferences saved");
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SettingsSectionHeader
        title="Workspace Preferences"
        description="Configure foundational direction defaults and your landing review view."
        icon={Compass}
      />

      <div className="space-y-4">
        <div>
          <Label htmlFor="ws-north-star">North Star (Concise Vision)</Label>
          <Input
            id="ws-north-star"
            value={northStar}
            onChange={(e) => {
              setNorthStar(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Build systems that remove human friction."
            maxLength={200}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Displayed in the global sidebar, Home hero card, and Goals overview.
          </p>
        </div>

        <div>
          <Label htmlFor="ws-north-star-long">
            North Star (Full Vision Narrative)
          </Label>
          <Textarea
            id="ws-north-star-long"
            rows={2}
            value={northStarLong}
            onChange={(e) => setNorthStarLong(e.target.value)}
            placeholder="Full narrative articulating your long-term ambition."
            maxLength={600}
          />
        </div>

        <div>
          <Label htmlFor="ws-mission">Mission</Label>
          <Textarea
            id="ws-mission"
            rows={2}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Your current operating mission."
            maxLength={600}
          />
        </div>

        <div>
          <Label htmlFor="ws-trajectory">Founder Trajectory</Label>
          <Input
            id="ws-trajectory"
            value={trajectory}
            onChange={(e) => setTrajectory(e.target.value)}
            placeholder="e.g. Operator → Builder → Founder → Infrastructure company."
            maxLength={600}
          />
        </div>

        <div>
          <Label>Strategic Phases</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {phases.map((ph, idx) => (
              <Input
                key={idx}
                aria-label={`Strategic phase ${idx + 1}`}
                value={ph}
                onChange={(e) =>
                  setPhases((prev) =>
                    prev.map((item, j) => (j === idx ? e.target.value : item)),
                  )
                }
              />
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Label>Default Reviews Landing View</Label>
          <Select
            value={defaultPeriod}
            onChange={(v) =>
              setDefaultPeriod(v as ReviewSettings["defaultPeriod"])
            }
            options={REVIEW_PERIOD_OPTIONS}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Selects which Reviews view opens by default when visiting Reviews
            without a specific tab parameter.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-glass-border bg-secondary/20 p-3.5 text-xs text-muted-foreground">
        Priority active projects, milestones, and goals are operational records
        managed directly in{" "}
        <strong className="text-foreground">Projects</strong> and the{" "}
        <strong className="text-foreground">Goals & Milestones</strong> panel.
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={!isDirty && !error}>
          Save Workspace Preferences
        </Button>
      </div>
    </form>
  );
}
