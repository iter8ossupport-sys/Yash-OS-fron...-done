import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  applyAppearanceUpdate,
  selectAppearanceSettings,
} from "@/lib/os/settings";
import { useOS } from "@/lib/os/store";
import type { Theme } from "@/lib/os/types";
import { Label } from "@/components/os/ui";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

const THEME_OPTIONS: ReadonlyArray<{
  value: Theme;
  label: string;
  summary: string;
  icon: typeof Moon;
}> = [
  {
    value: "dark",
    label: "Blue Theme (Dark)",
    summary: "Deep navy surfaces with crisp cyan and blue highlights.",
    icon: Moon,
  },
  {
    value: "light",
    label: "White Theme (Light)",
    summary: "High-clarity daylight surfaces with soft contrast borders.",
    icon: Sun,
  },
  {
    value: "system",
    label: "System Default",
    summary: "Follows your operating system light or dark appearance setting.",
    icon: Monitor,
  },
];

export function AppearanceSettings() {
  const { state, update } = useOS();
  const { theme } = selectAppearanceSettings(state);

  const handleSelectTheme = (nextTheme: Theme) => {
    update((s) => {
      const res = applyAppearanceUpdate(s, { theme: nextTheme });
      return res.ok ? res.state : s;
    });
    const label =
      THEME_OPTIONS.find((o) => o.value === nextTheme)?.label ?? nextTheme;
    toast.success(`Appearance updated: ${label}`);
  };

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Appearance"
        description="Choose between the Blue dark theme, White light theme, or automatic OS preference."
        icon={Palette}
      />

      <div className="space-y-3">
        <Label>Interface Theme</Label>
        <div
          role="radiogroup"
          aria-label="Interface Theme"
          className="grid gap-3 sm:grid-cols-3"
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleSelectTheme(opt.value)}
                className={cn(
                  "flex flex-col items-start rounded-2xl border p-4 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span>{opt.label}</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {opt.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
