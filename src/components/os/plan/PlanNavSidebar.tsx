import { Check } from "lucide-react";
import { Glass } from "@/components/os/ui";
import { cn } from "@/lib/utils";
import { STAGES } from "./planConstants";

export interface PlanNavSidebarProps {
  stage: number;
  onSelectStage: (stage: number) => void;
}

export function PlanNavSidebar({ stage, onSelectStage }: PlanNavSidebarProps) {
  return (
    <Glass className="h-fit p-3">
      <ol className="space-y-1">
        {STAGES.map(([t, sub], i) => {
          const n = i + 1;
          return (
            <li key={t}>
              <button
                disabled={n > stage}
                onClick={() => onSelectStage(n)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition",
                  n === stage
                    ? "bg-gradient-primary text-primary-foreground glow"
                    : n < stage
                      ? "hover:bg-accent"
                      : "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    n === stage
                      ? "border-primary-foreground/50"
                      : "border-glass-border",
                  )}
                >
                  {n < stage ? <Check className="h-3.5 w-3.5" /> : n}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t}</span>
                  <span
                    className={cn(
                      "block text-[11px]",
                      n === stage ? "opacity-80" : "text-muted-foreground",
                    )}
                  >
                    {sub}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </Glass>
  );
}
