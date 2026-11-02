import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { fmtMin, useOS } from "@/lib/os/store";
import { buildDayRecord, closeDay } from "@/lib/os/logic";
import {
  Button,
  Label,
  Modal,
  PriorityIcon,
  Textarea,
} from "@/components/os/ui";

export interface CloseoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CloseoutDialog({ open, onClose }: CloseoutDialogProps) {
  const { state, update } = useOS();
  const [learning, setLearning] = useState("");
  const nav = useNavigate();

  if (!open || !state.plan) return null;
  const rec = buildDayRecord(state.plan, learning);

  return (
    <Modal open onClose={onClose} title="Daily Closeout" wide>
      <div className="grid gap-3 md:grid-cols-3">
        {state.priorities.map((p) => (
          <div key={p.id} className="rounded-2xl bg-secondary/40 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <PriorityIcon id={p.id} className="h-7 w-7" />
              {p.name}
            </div>
            <div>
              Planned {fmtMin(rec.plannedMin[p.id])} · Actual{" "}
              {fmtMin(rec.actualMin[p.id])}
            </div>
            <div
              className={
                rec.outcomesAchieved.includes(p.id)
                  ? "text-success font-medium"
                  : "text-muted-foreground"
              }
            >
              Outcome{" "}
              {rec.outcomesAchieved.includes(p.id)
                ? "achieved"
                : "not marked achieved"}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Outputs ({rec.outputs.length})</Label>
          <ul className="space-y-1.5 text-sm">
            {rec.outputs.length ? (
              rec.outputs.map((o, i) => (
                <li key={i} className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-foreground/80">
                    #{o.priorityId} {o.title}:
                  </span>
                  {o.workstream && (
                    <span className="rounded bg-cyan/15 px-1.5 py-0.2 text-[10px] font-medium text-cyan">
                      {o.workstream}
                    </span>
                  )}
                  <span className="text-muted-foreground">{o.text}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No outputs recorded.</li>
            )}
          </ul>
        </div>
        <div>
          <Label>Unfinished ({rec.unfinished.length})</Label>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {rec.unfinished.length ? (
              rec.unfinished.map((u) => <li key={u}>{u}</li>)
            ) : (
              <li>All planned tasks completed!</li>
            )}
          </ul>
        </div>
      </div>
      <div className="mt-4">
        <Label>Most important learning today</Label>
        <Textarea
          placeholder="What is the single most valuable learning or operational insight from today's execution?"
          value={learning}
          onChange={(e) => setLearning(e.target.value)}
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button onClick={onClose}>Not yet</Button>
        <Button
          variant="primary"
          onClick={() => {
            update((s) => closeDay(s, learning));
            onClose();
            toast.success("Done for today. Saved to Reviews.");
            nav({ to: "/reviews" });
          }}
        >
          <Check className="h-4 w-4" />
          Done for Today
        </Button>
      </div>
    </Modal>
  );
}
