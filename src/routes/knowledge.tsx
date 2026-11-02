import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useOS } from "@/lib/os/store";
import { today, uid } from "@/lib/os/seed";
import type { KnowledgeItem } from "@/lib/os/types";
import { getKnowledgeFormat, matchesKnowledgeQuery } from "@/lib/os/knowledge";
import { Button, Empty, PageHeader } from "@/components/os/ui";
import {
  KnowledgeCard,
  KnowledgeFilters,
  KnowledgeEditorModal,
} from "@/components/os/knowledge";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge — Yash OS" },
      {
        name: "description",
        content:
          "Notes, research, lessons, principles, methods and frameworks linked to your work.",
      },
      { property: "og:title", content: "Knowledge — Yash OS" },
      {
        property: "og:description",
        content: "Knowledge that's useful during execution.",
      },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const { state, update } = useOS();
  const [q, setQ] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [type, setType] = useState("all");
  const [prio, setPrio] = useState("all");
  const [edit, setEdit] = useState<KnowledgeItem | null>(null);

  const items = state.knowledge.filter((k) => {
    const kFmt = getKnowledgeFormat(k);
    if (formatFilter !== "all" && kFmt !== formatFilter) return false;
    if (type !== "all" && k.type !== type) return false;
    if (prio !== "all" && String(k.priorityId) !== prio) return false;
    return matchesKnowledgeQuery(k, q);
  });

  const blank = (): KnowledgeItem => ({
    id: uid(),
    title: "",
    type: "Note",
    knowledgeFormat: "principle",
    body: "",
    tags: "",
    createdAt: today(),
    schemaVersion: 1,
  });

  const handleSave = (saved: KnowledgeItem) => {
    update((s) => ({
      ...s,
      knowledge: s.knowledge.some((k) => k.id === saved.id)
        ? s.knowledge.map((k) => (k.id === saved.id ? saved : k))
        : [saved, ...s.knowledge],
    }));
    toast.success("Knowledge entry saved");
  };

  const handleDelete = (id: string) => {
    update((s) => ({
      ...s,
      knowledge: s.knowledge.filter((k) => k.id !== id),
    }));
    toast.success("Knowledge entry deleted");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Memory"
        title="Knowledge"
        subtitle="Principles, methods, frameworks, and notes to guide planning and execution."
        actions={
          <Button variant="primary" onClick={() => setEdit(blank())}>
            <Plus className="h-4 w-4" />
            New entry
          </Button>
        }
      />

      <KnowledgeFilters
        query={q}
        onQueryChange={setQ}
        formatFilter={formatFilter}
        onFormatFilterChange={setFormatFilter}
        typeFilter={type}
        onTypeFilterChange={setType}
        priorityFilter={prio}
        onPriorityFilterChange={setPrio}
        priorities={state.priorities}
      />

      {items.length === 0 ? (
        <Empty title="No knowledge entries found">
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search query or format filter, or create a new
            entry.
          </p>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((k) => {
            const linkedProject = state.projects.find(
              (p) => p.id === k.projectId,
            );

            return (
              <KnowledgeCard
                key={k.id}
                item={k}
                linkedProject={linkedProject}
                onClick={() => setEdit(k)}
              />
            );
          })}
        </div>
      )}

      {edit && (
        <KnowledgeEditorModal
          open={!!edit}
          onClose={() => setEdit(null)}
          item={edit}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
