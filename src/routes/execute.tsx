import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Power, Zap } from "lucide-react";
import { toast } from "sonner";
import { useOS, useNow, fmtMin } from "@/lib/os/store";
import {
  emergencyPause,
  finishTask,
  pauseTask,
  selectedTasks,
  startTask,
} from "@/lib/os/logic";
import type { KnowledgeItem, Task } from "@/lib/os/types";
import { Button, Glass, PageHeader } from "@/components/os/ui";
import { KnowledgeViewerModal } from "@/components/os/KnowledgeViewerModal";
import { KnowledgeSelectModal } from "@/components/os/KnowledgeSelectModal";
import {
  StrategicContextBar,
  ActiveTaskCard,
  ExecutionTaskList,
  FinishTaskDialog,
  EmergencyPauseModal,
  CloseoutDialog,
} from "@/components/os/execute";

type Search = { emergency?: number | undefined; closeout?: number | undefined };

export const Route = createFileRoute("/execute")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const res: Search = {};
    if (s["emergency"]) res.emergency = 1;
    if (s["closeout"]) res.closeout = 1;
    return res;
  },
  head: () => ({
    meta: [
      { title: "Execute — Yash OS" },
      {
        name: "description",
        content:
          "Focused workspace to execute the approved plan and record outputs.",
      },
      { property: "og:title", content: "Execute — Yash OS" },
      {
        property: "og:description",
        content: "Minimal, clear and action-oriented execution.",
      },
    ],
  }),
  component: ExecutePage,
});

function ExecutePage() {
  const { state, update, setGoalsOpen } = useOS();
  const search = Route.useSearch();
  const nav = useNavigate();
  const plan = state.plan;
  const sel = selectedTasks(plan);
  const active = sel.find((t) => t.id === state.activeTaskId);
  const now = useNow(!!active);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState<Task | null>(null);
  const [emergency, setEmergency] = useState(false);
  const [closeout, setCloseout] = useState(false);
  const [viewingKnowledge, setViewingKnowledge] = useState<
    KnowledgeItem[] | null
  >(null);
  const [linkingKnowledgeTaskId, setLinkingKnowledgeTaskId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!plan) return;
    if (search.emergency) {
      triggerEmergency();
      nav({ to: "/execute", search: {}, replace: true });
    }
    if (search.closeout) {
      setCloseout(true);
      nav({ to: "/execute", search: {}, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.emergency, search.closeout, !!plan]);

  function triggerEmergency() {
    update((s) => emergencyPause(s));
    setEmergency(true);
  }

  if (!plan) {
    return (
      <div>
        <PageHeader
          eyebrow="Act"
          title="Execute — Focused Workspace"
          subtitle="Minimal, clear and action-oriented."
        />
        <Glass className="p-10 text-center">
          <h2 className="text-xl font-semibold">No approved plan yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Execution loads the plan you approve in the Plan workflow.
          </p>
          <Link to="/plan">
            <Button variant="primary" className="mt-6">
              Plan today
            </Button>
          </Link>
        </Glass>
      </div>
    );
  }

  // The task displayed in the top execution card:
  // User selection has first priority, falling back to active running task, paused task, or first pending task.
  const selectedTask = selectedTaskId
    ? sel.find((t) => t.id === selectedTaskId)
    : null;
  const current =
    selectedTask ??
    active ??
    sel.find((t) => t.id === state.interruptedTaskId && t.status !== "done") ??
    sel.find((t) => t.status === "paused") ??
    sel.find((t) => t.status === "pending") ??
    sel[0];

  const interrupted = sel.find(
    (t) => t.id === state.interruptedTaskId && t.status !== "done",
  );
  const doneCount = sel.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Act"
        title="Execute — Focused Workspace"
        subtitle={`${plan.context.date} · ${doneCount}/${sel.length} tasks done · ${fmtMin(
          sel.reduce((s, t) => s + t.duration, 0),
        )} planned`}
        actions={
          <>
            <Button variant="danger" onClick={triggerEmergency}>
              <Zap className="h-4 w-4" />
              Emergency Switch
            </Button>
            <Button onClick={() => setCloseout(true)}>
              <Power className="h-4 w-4" />
              Daily closeout
            </Button>
          </>
        }
      />

      {/* Strategic Context Bar */}
      <StrategicContextBar
        goals={state.goals}
        priorities={state.priorities}
        onOpenGoals={() => setGoalsOpen(true)}
      />

      {/* 1. TOP ACTIVE-TASK EXECUTION CARD */}
      {current && (
        <ActiveTaskCard
          current={current}
          plan={plan}
          priorities={state.priorities}
          knowledge={state.knowledge}
          timerEnabled={state.prefs.timer}
          now={now}
          onPauseTask={(id) => update((s) => pauseTask(s, id))}
          onStartTask={(id) =>
            update((s) => ({
              ...startTask(s, id),
              interruptedTaskId:
                s.interruptedTaskId === id ? null : s.interruptedTaskId,
            }))
          }
          onFinishTask={(task) => setFinishing(task)}
          onViewKnowledge={(items) => setViewingKnowledge(items)}
          onLinkKnowledge={(id) => setLinkingKnowledgeTaskId(id)}
        />
      )}

      {!current && (
        <Glass className="p-8 text-center">
          <h2 className="text-xl font-semibold">
            All approved tasks are finished.
          </h2>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => setCloseout(true)}
          >
            Run daily closeout
          </Button>
        </Glass>
      )}

      {/* 2. APPROVED DAILY EXECUTION (3 PRIORITIES) */}
      <ExecutionTaskList
        plan={plan}
        sel={sel}
        currentId={current?.id}
        priorities={state.priorities}
        knowledge={state.knowledge}
        now={now}
        onSelectTask={(id) => setSelectedTaskId(id)}
        onStartTask={(id) =>
          update((s) => ({
            ...startTask(s, id),
            interruptedTaskId:
              s.interruptedTaskId === id ? null : s.interruptedTaskId,
          }))
        }
        onPauseTask={(id) => update((s) => pauseTask(s, id))}
        onFinishTask={(task) => setFinishing(task)}
        onViewKnowledge={(items) => setViewingKnowledge(items)}
      />

      {/* 3. TASK COMPLETION MODAL */}
      <FinishTaskDialog
        task={finishing}
        onClose={() => setFinishing(null)}
        onSave={(out, ach) => {
          update((s) => finishTask(s, finishing!.id, out, ach));
          setFinishing(null);
          toast.success("Output recorded successfully");
        }}
      />

      {/* Emergency Switch Modal */}
      <EmergencyPauseModal
        open={emergency}
        onClose={() => setEmergency(false)}
        interrupted={interrupted}
        sel={sel}
        onSwitchTask={(id) => {
          update((s) => startTask(s, id));
          setEmergency(false);
          toast(`Switched to: ${sel.find((t) => t.id === id)?.title || ""}`);
        }}
      />

      {/* Closeout Dialog */}
      <CloseoutDialog open={closeout} onClose={() => setCloseout(false)} />

      {/* Knowledge Modals */}
      {viewingKnowledge && (
        <KnowledgeViewerModal
          open={!!viewingKnowledge}
          onClose={() => setViewingKnowledge(null)}
          items={viewingKnowledge}
          title="Contextual Knowledge Reference"
        />
      )}

      {linkingKnowledgeTaskId !== null && (
        <KnowledgeSelectModal
          open={linkingKnowledgeTaskId !== null}
          onClose={() => setLinkingKnowledgeTaskId(null)}
          selectedIds={
            state.plan?.tasks.find((t) => t.id === linkingKnowledgeTaskId)
              ?.knowledgeIds || []
          }
          onSelect={(ids) => {
            update((s) => {
              if (!s.plan) return s;
              return {
                ...s,
                plan: {
                  ...s.plan,
                  tasks: s.plan.tasks.map((t) =>
                    t.id === linkingKnowledgeTaskId
                      ? { ...t, knowledgeIds: ids }
                      : t,
                  ),
                },
              };
            });
            toast.success("Knowledge linked to active task");
          }}
          title="Link Knowledge to Active Task"
          subtitle="Associate a method (steps), principle (rule), or framework to guide execution."
        />
      )}
    </div>
  );
}
