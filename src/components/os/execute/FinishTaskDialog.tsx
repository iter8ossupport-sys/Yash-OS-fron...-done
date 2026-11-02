import { useEffect, useState } from "react";
import { Activity, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Badge,
  Button,
  Input,
  Label,
  Modal,
  Textarea,
} from "@/components/os/ui";
import type { Task } from "@/lib/os/types";

export interface FinishTaskDialogProps {
  task: Task | null;
  onClose: () => void;
  onSave: (o: Record<string, string>, achieved: boolean) => void;
}

export function FinishTaskDialog({
  task,
  onClose,
  onSave,
}: FinishTaskDialogProps) {
  const [o, setO] = useState<Record<string, string>>({});
  const [ach, setAch] = useState(false);
  const [p2Workstream, setP2Workstream] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    setO({});
    setAch(false);
    setP2Workstream(null);
  }, [task?.id]);

  if (!task) return null;

  const priId = task.priorityId;

  const handleSave = () => {
    if (priId === 2 && !p2Workstream) {
      toast.error("Please select a workstream classification (A or B)");
      return;
    }
    const finalOutput: Record<string, string> = { ...o };
    if (priId === 2 && p2Workstream) {
      finalOutput["Workstream"] =
        p2Workstream === "A"
          ? "Cashflow / System Research"
          : "Fintech Product Capability";
    }
    onSave(finalOutput, ach);
  };

  return (
    <Modal open onClose={onClose} title={`Finish Task: ${task.title}`} wide>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge>Priority {priId}</Badge>
          <span className="text-xs text-muted-foreground">
            {priId === 1
              ? "Founder Capability — Product building, validation, sales & execution"
              : priId === 2
                ? "Cashflow Infrastructure — Workstream classification required"
                : "Learning for Execution — Lightweight capture"}
          </span>
        </div>

        {/* PRIORITY 1 — Founder Capability Form */}
        {priId === 1 && (
          <div className="space-y-3">
            <div>
              <Label>Actual Output</Label>
              <Textarea
                rows={2}
                placeholder="What was built, shipped, or delivered?"
                value={o["Actual output"] ?? ""}
                onChange={(e) =>
                  setO({ ...o, "Actual output": e.target.value })
                }
              />
            </div>
            <div>
              <Label>Relevant Metric Values (when applicable)</Label>
              <Input
                placeholder="e.g. 3 conversations, 1 deployment, 5 signups"
                value={o["Metric values"] ?? ""}
                onChange={(e) =>
                  setO({ ...o, "Metric values": e.target.value })
                }
              />
            </div>
            <div>
              <Label>Notes and Observations</Label>
              <Textarea
                rows={2}
                placeholder="Key user feedback, blockers, or evidence gathered..."
                value={o["Notes & observations"] ?? ""}
                onChange={(e) =>
                  setO({ ...o, "Notes & observations": e.target.value })
                }
              />
            </div>
            <div>
              <Label>Optional Context</Label>
              <Input
                placeholder="Additional founder context or reference links..."
                value={o["Context"] ?? ""}
                onChange={(e) => setO({ ...o, Context: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* PRIORITY 2 — Cashflow Infrastructure Form (A/B Workstream Required) */}
        {priId === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-foreground font-semibold">
                Required Workstream Classification:
              </Label>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setP2Workstream("A");
                    setO({});
                  }}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    p2Workstream === "A"
                      ? "border-primary bg-primary/15 shadow-sm ring-1 ring-primary/40 glow"
                      : "border-glass-border bg-secondary/30 hover:bg-secondary/50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan" />
                    <span className="font-semibold text-sm">
                      A — Cashflow / System Research
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    Record work involving the existing LBES system, strategy
                    research, simulation context, or financial tracking.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setP2Workstream("B");
                    setO({});
                  }}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    p2Workstream === "B"
                      ? "border-primary bg-primary/15 shadow-sm ring-1 ring-primary/40 glow"
                      : "border-glass-border bg-secondary/30 hover:bg-secondary/50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan" />
                    <span className="font-semibold text-sm">
                      B — Fintech Product Capability
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    Develop LBES into a useful fintech product that solves real
                    user problems.
                  </p>
                </button>
              </div>
            </div>

            {/* Workstream A Fields */}
            {p2Workstream === "A" && (
              <div className="space-y-3 rounded-2xl border border-glass-border bg-secondary/20 p-4 animate-in fade-in">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan">
                  Workstream A Details
                </div>
                <div>
                  <Label>System or Strategy Name</Label>
                  <Input
                    placeholder="e.g. LBES Core, Execution Automation, Rule Engine v2"
                    value={o["System / Strategy name"] ?? ""}
                    onChange={(e) =>
                      setO({ ...o, "System / Strategy name": e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Activity Type</Label>
                  <Input
                    placeholder="e.g. Strategy Research, Rule Definition, Backtesting, Execution Review, Automation"
                    value={o["Activity type"] ?? ""}
                    onChange={(e) =>
                      setO({ ...o, "Activity type": e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Financial or Simulated Result (when applicable)</Label>
                  <Input
                    placeholder="e.g. +1.8R, Simulated return +2.4%, 100% rule adherence"
                    value={o["Financial / simulated result"] ?? ""}
                    onChange={(e) =>
                      setO({
                        ...o,
                        "Financial / simulated result": e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Relevant Notes and Evidence</Label>
                  <Textarea
                    rows={2}
                    placeholder="Key observations, charts, screenshots, or rule verification notes..."
                    value={o["Notes & evidence"] ?? ""}
                    onChange={(e) =>
                      setO({ ...o, "Notes & evidence": e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Workstream B Fields */}
            {p2Workstream === "B" && (
              <div className="space-y-3 rounded-2xl border border-glass-border bg-secondary/20 p-4 animate-in fade-in">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan">
                  Workstream B Details
                </div>
                <div>
                  <Label>Actual Product Output</Label>
                  <Textarea
                    rows={2}
                    placeholder="What product feature or tool was developed/deployed?"
                    value={o["Actual product output"] ?? ""}
                    onChange={(e) =>
                      setO({ ...o, "Actual product output": e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Feature or Problem Worked On</Label>
                  <Input
                    placeholder="What specific user problem does this address?"
                    value={o["Feature or problem"] ?? ""}
                    onChange={(e) =>
                      setO({ ...o, "Feature or problem": e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>User Feedback or Validation</Label>
                  <Input
                    placeholder="User reactions, tester feedback, or validation results..."
                    value={o["User feedback / validation"] ?? ""}
                    onChange={(e) =>
                      setO({
                        ...o,
                        "User feedback / validation": e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Notes and Next Learning</Label>
                  <Textarea
                    rows={2}
                    placeholder="Key learnings and next product step..."
                    value={o["Notes & next learning"] ?? ""}
                    onChange={(e) =>
                      setO({ ...o, "Notes & next learning": e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRIORITY 3 — Learning for Execution Form (Lightweight) */}
        {priId === 3 && (
          <div className="space-y-3">
            <div>
              <Label>Actual Output</Label>
              <Textarea
                rows={2}
                placeholder="What fundamental was learned or applied?"
                value={o["Actual output"] ?? ""}
                onChange={(e) =>
                  setO({ ...o, "Actual output": e.target.value })
                }
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                rows={2}
                placeholder="Key takeaways and how they will improve future execution..."
                value={o["Notes"] ?? ""}
                onChange={(e) => setO({ ...o, Notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Priority Outcome Checkbox */}
        <div className="rounded-xl border border-glass-border bg-secondary/30 p-3">
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={ach}
              onChange={(e) => setAch(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <span className="font-medium">
              This also achieved the priority's approved daily outcome
            </span>
          </label>
          <p className="mt-1 text-xs text-muted-foreground ml-6.5">
            Task completion and outcome achievement are tracked separately.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          disabled={priId === 2 && !p2Workstream}
          onClick={handleSave}
        >
          <Check className="h-4 w-4" />
          Complete task
        </Button>
      </div>
    </Modal>
  );
}

// Backward-compatible alias
export const FinishDialog = FinishTaskDialog;
