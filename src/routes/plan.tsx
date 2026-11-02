import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useOS } from "@/lib/os/store";
import { approvePlan, setActiveProject } from "@/lib/os/logic";
import { newDraft, recommendOutcomes, recommendTasks } from "@/lib/os/seed";
import type { KnowledgeItem, Plan, PriorityId, Task } from "@/lib/os/types";
import { Badge, Button, Glass, PageHeader } from "@/components/os/ui";
import { KnowledgeSelectModal } from "@/components/os/KnowledgeSelectModal";
import { KnowledgeViewerModal } from "@/components/os/KnowledgeViewerModal";
import {
  IDS,
  STAGES,
  PlanNavSidebar,
  PlanContextStep,
  PlanPrioritiesStep,
  PlanAllocationStep,
  PlanOutcomesStep,
  PlanRecommendationsStep,
  PlanWorkloadStep,
  PlanApprovalStep,
} from "@/components/os/plan";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Plan — Yash OS" },
      {
        name: "description",
        content:
          "Seven-step workflow to turn daily reality into an approved plan.",
      },
      { property: "og:title", content: "Plan — Yash OS" },
      {
        property: "og:description",
        content: "Turn reality into an approved plan.",
      },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const { state, update } = useOS();
  const nav = useNavigate();
  const draft = state.draft;
  const stage = state.draftStage;

  const setDraft = (fn: (d: Plan) => Plan) =>
    update((s) => ({ ...s, draft: s.draft ? fn(s.draft) : s.draft }));
  const setStage = (n: number) => update((s) => ({ ...s, draftStage: n }));
  const setTask = (id: string, patch: Partial<Task>) =>
    setDraft((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));

  const [linkingOutcomePriorityId, setLinkingOutcomePriorityId] =
    useState<PriorityId | null>(null);
  const [linkingTaskId, setLinkingTaskId] = useState<string | null>(null);
  const [viewingKnowledge, setViewingKnowledge] = useState<
    KnowledgeItem[] | null
  >(null);

  if (!draft) {
    return (
      <div>
        <PageHeader
          eyebrow="Pre-think"
          title="Plan — 7 Step Workflow"
          subtitle="Turn reality into an approved plan."
        />
        <Glass className="p-8 text-center">
          <h2 className="text-xl font-semibold">
            {state.plan ? "Today's plan is approved." : "No plan in progress."}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {state.plan
              ? "Starting a new plan will replace the approved one once you approve it."
              : "Start with your daily context."}
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() =>
              update((s) => ({
                ...s,
                draft: newDraft({
                  hours: s.prefs.dayTypeHours["Non-College Day"],
                }),
                draftStage: 1,
              }))
            }
          >
            <Sparkles className="h-4 w-4" /> Start planning
          </Button>
        </Glass>
      </div>
    );
  }

  const ctx = draft.context;
  const sel = draft.tasks.filter((t) => t.selected);
  const selMin = sel.reduce((s, t) => s + t.duration, 0);
  const perPriorityOk = IDS.every((i) => {
    const n = sel.filter((t) => t.priorityId === i).length;
    return n >= 1 && n <= 3;
  });

  const canNext =
    stage === 4
      ? IDS.every((i) => draft.outcomes[i].trim())
      : stage === 5
        ? draft.tasks.length > 0
        : stage === 6
          ? perPriorityOk
          : true;

  const next = () => {
    if (stage === 3 && !IDS.some((i) => draft.outcomes[i]))
      setDraft((d) => ({
        ...d,
        outcomes: recommendOutcomes(state.priorities),
      }));
    if (stage === 4 && draft.tasks.length === 0)
      setDraft((d) => ({ ...d, tasks: recommendTasks(state.priorities) }));
    setStage(stage + 1);
  };

  const approve = () => {
    update((s) => approvePlan(s));
    toast.success("Plan approved and saved. Start a task when you're ready.");
    nav({ to: "/execute" });
  };

  // Reordering helpers
  const movePriorityTask = (
    priorityId: PriorityId,
    fromIdx: number,
    toIdx: number,
  ) => {
    setDraft((d) => {
      const pTasks = d.tasks.filter((t) => t.priorityId === priorityId);
      if (
        fromIdx < 0 ||
        toIdx < 0 ||
        fromIdx >= pTasks.length ||
        toIdx >= pTasks.length
      )
        return d;
      const taskA = pTasks[fromIdx];
      const taskB = pTasks[toIdx];
      if (!taskA || !taskB) return d;
      const idxA = d.tasks.indexOf(taskA);
      const idxB = d.tasks.indexOf(taskB);
      const nextTasks = [...d.tasks];
      nextTasks[idxA] = taskB;
      nextTasks[idxB] = taskA;
      return { ...d, tasks: nextTasks };
    });
  };

  const moveSelectedTask = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const selected = d.tasks.filter((t) => t.selected);
      const curIdx = selected.findIndex((t) => t.id === id);
      const targetIdx = curIdx + dir;
      if (curIdx < 0 || targetIdx < 0 || targetIdx >= selected.length) return d;
      const taskA = selected[curIdx];
      const taskB = selected[targetIdx];
      if (!taskA || !taskB) return d;
      const idxA = d.tasks.indexOf(taskA);
      const idxB = d.tasks.indexOf(taskB);
      const nextTasks = [...d.tasks];
      nextTasks[idxA] = taskB;
      nextTasks[idxB] = taskA;
      return { ...d, tasks: nextTasks };
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pre-think"
        title="Plan — 7 Step Workflow"
        subtitle="Turn reality into an approved plan."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              update((s) => ({ ...s, draft: null, draftStage: 1 }))
            }
          >
            Discard draft
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <PlanNavSidebar stage={stage} onSelectStage={setStage} />

        <Glass className="p-6" key={stage}>
          <div className="fade-up">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {STAGES[stage - 1]?.[0]}
              </h2>
              <Badge>Step {stage} of 7</Badge>
            </div>

            {/* STEP 1: Daily Context */}
            {stage === 1 && (
              <PlanContextStep
                draft={draft}
                dayTypeHours={state.prefs.dayTypeHours}
                onChangeDraft={setDraft}
              />
            )}

            {/* STEP 2: Priority Context */}
            {stage === 2 && (
              <PlanPrioritiesStep
                priorities={state.priorities}
                projects={state.projects}
                onSetActiveProject={(priorityId, projectId) =>
                  update((s) => setActiveProject(s, priorityId, projectId))
                }
              />
            )}

            {/* STEP 3: Time Allocation */}
            {stage === 3 && (
              <PlanAllocationStep
                draft={draft}
                priorities={state.priorities}
                onChangeDraft={setDraft}
              />
            )}

            {/* STEP 4: Daily Outcomes */}
            {stage === 4 && (
              <PlanOutcomesStep
                draft={draft}
                priorities={state.priorities}
                knowledge={state.knowledge}
                onChangeDraft={setDraft}
                onLinkKnowledge={(pId) => setLinkingOutcomePriorityId(pId)}
                onViewKnowledge={(items) => setViewingKnowledge(items)}
              />
            )}

            {/* STEP 5: Task Recommendations */}
            {stage === 5 && (
              <PlanRecommendationsStep
                draft={draft}
                priorities={state.priorities}
                onChangeDraft={setDraft}
              />
            )}

            {/* STEP 6: Planned Workload */}
            {stage === 6 && (
              <PlanWorkloadStep
                draft={draft}
                priorities={state.priorities}
                knowledge={state.knowledge}
                perPriorityOk={perPriorityOk}
                sel={sel}
                selMin={selMin}
                onChangeTask={setTask}
                onChangeOutcome={(pId, text) =>
                  setDraft((d) => ({
                    ...d,
                    outcomes: { ...d.outcomes, [pId]: text },
                  }))
                }
                onMovePriorityTask={movePriorityTask}
                onLinkTaskKnowledge={(taskId) => setLinkingTaskId(taskId)}
                onViewKnowledge={(items) => setViewingKnowledge(items)}
              />
            )}

            {/* STEP 7: Final Approval */}
            {stage === 7 && (
              <PlanApprovalStep
                draft={draft}
                priorities={state.priorities}
                sel={sel}
                selMin={selMin}
                onChangeOutcome={(pId, text) =>
                  setDraft((d) => ({
                    ...d,
                    outcomes: { ...d.outcomes, [pId]: text },
                  }))
                }
                onChangeTask={setTask}
                onMoveSelectedTask={moveSelectedTask}
              />
            )}

            {/* Step Navigation Controls */}
            <div className="mt-8 flex justify-between gap-3">
              <Button
                disabled={stage === 1}
                onClick={() => setStage(stage - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {stage < 7 ? (
                <Button variant="primary" disabled={!canNext} onClick={next}>
                  Next Step <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="primary" onClick={approve}>
                  <Check className="h-4 w-4" />
                  Approve plan
                </Button>
              )}
            </div>
          </div>
        </Glass>
      </div>

      {/* Knowledge Modals for Contextual Reuse */}
      {linkingOutcomePriorityId !== null && (
        <KnowledgeSelectModal
          open={linkingOutcomePriorityId !== null}
          onClose={() => setLinkingOutcomePriorityId(null)}
          selectedIds={
            draft.outcomeKnowledgeIds?.[linkingOutcomePriorityId] || []
          }
          onSelect={(ids) => {
            setDraft((d) => ({
              ...d,
              outcomeKnowledgeIds: {
                ...(d.outcomeKnowledgeIds || {}),
                [linkingOutcomePriorityId]: ids,
              },
            }));
          }}
          title={`Link Knowledge — Priority ${linkingOutcomePriorityId}`}
          subtitle="Associate relevant principles, methods, or frameworks to guide this daily outcome."
        />
      )}

      {linkingTaskId !== null && (
        <KnowledgeSelectModal
          open={linkingTaskId !== null}
          onClose={() => setLinkingTaskId(null)}
          selectedIds={
            draft.tasks.find((t) => t.id === linkingTaskId)?.knowledgeIds || []
          }
          onSelect={(ids) => {
            setTask(linkingTaskId, { knowledgeIds: ids });
          }}
          title="Link Knowledge to Task"
          subtitle="Associate a method (steps), principle (rule), or framework to execute this task."
        />
      )}

      {viewingKnowledge && (
        <KnowledgeViewerModal
          open={!!viewingKnowledge}
          onClose={() => setViewingKnowledge(null)}
          items={viewingKnowledge}
        />
      )}
    </div>
  );
}
