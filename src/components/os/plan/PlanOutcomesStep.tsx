import { BookMarked, BookOpen, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Label, PriorityIcon, Textarea } from "@/components/os/ui";
import type { KnowledgeItem, Plan, Priority, PriorityId } from "@/lib/os/types";
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Proposed from your project context and milestones. Edit before
          approving.
        </p>
        <Button
          size="sm"
          onClick={() =>
            onChangeDraft((d) => ({
              ...d,
              outcomes: recommendOutcomes(priorities),
            }))
          }
        >
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
                    outcomes: {
                      ...d.outcomes,
                      [p.id]: e.target.value,
                    },
                  }))
                }
              />

              {/* Linked Knowledge for this outcome */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {linkedItems.map((k) => {
                    const fmt = getKnowledgeFormat(k);
                    return (
                      <span
                        key={k.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition cursor-pointer hover:brightness-110",
                          formatBadgeClass(fmt),
                        )}
                        onClick={() => onViewKnowledge([k])}
                        title="Click to view details"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span className="max-w-[150px] truncate">
                          {k.title}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeDraft((d) => ({
                              ...d,
                              outcomeKnowledgeIds: {
                                ...(d.outcomeKnowledgeIds || {}),
                                [p.id]: (
                                  d.outcomeKnowledgeIds?.[p.id] || []
                                ).filter((id) => id !== k.id),
                              },
                            }));
                          }}
                          className="ml-1 hover:text-destructive"
                          title="Unlink"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => onLinkKnowledge(p.id)}
                >
                  <BookMarked className="h-3 w-3 mr-1" />
                  {linkedItems.length > 0
                    ? "Edit Knowledge Reference"
                    : "+ Link Knowledge"}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
