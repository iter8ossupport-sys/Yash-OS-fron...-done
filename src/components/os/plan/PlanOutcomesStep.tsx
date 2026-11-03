import { BookMarked, BookOpen, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Label, PriorityIcon, Textarea } from "@/components/os/ui";
import type { KnowledgeItem, Plan, Priority, PriorityId } from "@/lib/os/types";
import { useOS } from "@/lib/os/store";
import { recommendOutcomes } from "@/lib/os/seed";
import { formatBadgeClass, getKnowledgeFormat } from "@/lib/os/knowledge";

export interface PlanOutcomesStepProps {
  draft: Plan;
  priorities: Priority[];
  knowledge: KnowledgeItem[];
  onChangeDraft: (fn: (d: Plan) => Plan) => void;
  onLinkKnowledge: (priorityId: PriorityId) => void;
  onViewKnowledge: (items: KnowledgeItem[]) => void;
}

export function PlanOutcomesStep({
  draft,
  priorities,
  knowledge,
  onChangeDraft,
  onLinkKnowledge,
  onViewKnowledge,
}: PlanOutcomesStepProps) {
  const { state } = useOS();

  const handleRegenerateOutcomes = () => {
    const defaultOutcomes = recommendOutcomes(priorities);
    const activeP1 = state.projects.find(
      (p) =>
        p.priorityId === 1 &&
        (p.id === priorities.find((pr) => pr.id === 1)?.activeProjectId ||
          p.status === "active"),
    );

    const pendingDaily =
      activeP1?.executionPlan?.currentApproved.outcomes.daily.find(
        (o) => o.status === "pending",
      );

    if (pendingDaily?.text) {
      defaultOutcomes[1] = pendingDaily.text;
    }

    onChangeDraft((d) => ({
      ...d,
      outcomes: defaultOutcomes,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Proposed from your project context and execution plan. Edit before
          approving.
        </p>
        <Button size="sm" onClick={handleRegenerateOutcomes}>
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </Button>
      </div>

      {priorities.map((p) => {
        const linkedKIds = draft.outcomeKnowledgeIds?.[p.id] || [];
        const linkedItems = knowledge.filter((k) => linkedKIds.includes(k.id));

        return (
          <div key={p.id} className="flex gap-4">
            <PriorityIcon id={p.id} />
            <div className="flex-1 space-y-2">
              <Label>
                #{p.id} {p.name} — {draft.allocation[p.id]}h
              </Label>
              <Textarea
                rows={2}
                value={draft.outcomes[p.id]}
                onChange={(e) =>
                  onChangeDraft((d) => ({
                    ...d,
                    outcomes: { ...d.outcomes, [p.id]: e.target.value },
                  }))
                }
              />

              {/* Linked Knowledge Items Display */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {linkedItems.map((item) => {
                  const fmt = getKnowledgeFormat(item);
                  return (
                    <span
                      key={item.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
                        formatBadgeClass(fmt),
                      )}
                    >
                      <BookOpen className="h-3 w-3" />
                      <span className="max-w-[140px] truncate">
                        {item.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (
                            draft.outcomeKnowledgeIds?.[p.id] || []
                          ).filter((id) => id !== item.id);
                          onChangeDraft((d) => ({
                            ...d,
                            outcomeKnowledgeIds: {
                              ...d.outcomeKnowledgeIds,
                              [p.id]: updated,
                            },
                          }));
                        }}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}

                <Button
                  size="sm"
                  variant="glass"
                  className="h-7 text-xs"
                  onClick={() => onLinkKnowledge(p.id)}
                >
                  <BookMarked className="h-3.5 w-3.5" />
                  Link Knowledge
                </Button>

                {linkedItems.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => onViewKnowledge(linkedItems)}
                  >
                    View details
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
