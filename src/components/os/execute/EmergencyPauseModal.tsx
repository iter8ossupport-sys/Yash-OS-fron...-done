import { Badge, Button, Label, Modal } from "@/components/os/ui";
import { fmtMin, fmtTime } from "@/lib/os/store";
import type { Task } from "@/lib/os/types";

export interface EmergencyPauseModalProps {
  open: boolean;
  onClose: () => void;
  interrupted: Task | undefined;
  sel: Task[];
  onSwitchTask: (id: string) => void;
}

export function EmergencyPauseModal({
  open,
  onClose,
  interrupted,
  sel,
  onSwitchTask,
}: EmergencyPauseModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Emergency Switch">
      <p className="text-sm text-muted-foreground">
        {interrupted ? (
          <>
            Paused <b className="text-foreground">{interrupted.title}</b> at{" "}
            {fmtTime(interrupted.elapsedMs)}. Its time and output are preserved.
          </>
        ) : (
          "No task was running."
        )}
      </p>
      <div className="mt-4 space-y-2">
        <Label>Remaining approved workload — choose what to switch to</Label>
        {sel
          .filter((t) => t.status !== "done")
          .map((t) => (
            <button
              key={t.id}
              onClick={() => onSwitchTask(t.id)}
              className="flex w-full items-center justify-between rounded-xl border border-glass-border bg-secondary/40 p-3 text-left text-sm transition hover:bg-accent"
            >
              <span>
                #{t.priorityId} {t.title}
                {t.id === interrupted?.id && (
                  <Badge className="ml-2">Interrupted</Badge>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {fmtMin(t.duration)}
              </span>
            </button>
          ))}
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={onClose}>Handle outside the plan</Button>
      </div>
    </Modal>
  );
}
