import { useState } from "react";
import { Check, FileText, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useOS } from "@/lib/os/store";
import { cn } from "@/lib/utils";
import {
  Badge,
  Button,
  Input,
  Label,
  Modal,
  Select,
  Textarea,
} from "@/components/os/ui";
import type {
  PriorityId,
  Project,
  ProjectDoc,
  ProjectStatus,
} from "@/lib/os/types";
import {
  PRIORITIES_META,
  STATUSES,
  SUGGESTED_LEARNING_CATEGORIES,
} from "./projectsMeta";

export interface ProjectDetailsModalProps {
  project: Project;
  isActive: boolean;
  onClose: () => void;
  onSave: (p: Project) => void;
  onDelete: () => void;
  onSetActive: (active: boolean) => void;
  onOpenDocEditor: (doc: ProjectDoc | null) => void;
}

export function ProjectDetailsModal({
  project,
  isActive,
  onClose,
  onSave,
  onDelete,
  onSetActive,
  onOpenDocEditor,
}: ProjectDetailsModalProps) {
  const { state } = useOS();
  const [draft, setDraft] = useState<Project>(project);

  const docCount = draft.docs?.length ?? 0;

  // Task output history from closed days for this priority
  const taskHistory = state.history.flatMap((h) =>
    h.outputs
      .filter((o) => o.priorityId === draft.priorityId)
      .map((o) => ({ ...o, date: h.date })),
  );

  const handleSaveDraft = () => {
    // Validate Priority 2 required workstream
    if (draft.priorityId === 2 && !draft.workstream) {
      toast.error(
        "Please select a required workstream (A or B) for Priority 2",
      );
      return;
    }
    onSave(draft);
  };

  const handleToggleCategory = (cat: string) => {
    const cats = draft.learningCategories ?? [];
    if (cats.includes(cat)) {
      setDraft({ ...draft, learningCategories: cats.filter((c) => c !== cat) });
    } else {
      setDraft({ ...draft, learningCategories: [...cats, cat] });
    }
  };

  const [customCatInput, setCustomCatInput] = useState("");
  const handleAddCustomCategory = () => {
    const trimmed = customCatInput.trim();
    if (!trimmed) return;
    const cats = draft.learningCategories ?? [];
    if (!cats.includes(trimmed)) {
      setDraft({ ...draft, learningCategories: [...cats, trimmed] });
    }
    setCustomCatInput("");
  };

  const priorityMeta =
    PRIORITIES_META.find((m) => m.id === draft.priorityId) ??
    PRIORITIES_META[0]!;

  return (
    <Modal open onClose={onClose} title={draft.name || "Project Details"} wide>
      <div className="space-y-6">
        {/* Active Project Status Banner & Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/30 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 font-semibold text-[11px]",
                priorityMeta.badgeClass,
              )}
            >
              #{draft.priorityId} {priorityMeta.name}
            </span>

            {draft.priorityId === 2 && draft.workstream && (
              <span className="rounded-md border border-cyan/40 bg-cyan/15 px-2 py-0.5 text-[11px] font-semibold text-cyan">
                Workstream {draft.workstream}
              </span>
            )}

            {isActive ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-cyan ml-1">
                <Star className="h-3.5 w-3.5 fill-cyan text-cyan" />
                Active project for #{draft.priorityId}
              </span>
            ) : (
              <span className="text-muted-foreground ml-1">
                Not active for #{draft.priorityId}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant={isActive ? "ghost" : "primary"}
            className="h-8 text-xs"
            onClick={() => onSetActive(!isActive)}
          >
            {isActive ? (
              "Unset as active"
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Set as active
              </>
            )}
          </Button>
        </div>

        {/* Primary Row: Name, Priority, Status, Deadline */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Project Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Project Name"
            />
          </div>

          <div>
            <Label>Assigned Priority</Label>
            <Select
              value={String(draft.priorityId)}
              onChange={(v) =>
                setDraft({ ...draft, priorityId: +v as PriorityId })
              }
              options={PRIORITIES_META.map((pr) => ({
                value: String(pr.id),
                label: pr.fullName,
              }))}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={draft.status}
              onChange={(v) =>
                setDraft({ ...draft, status: v as ProjectStatus })
              }
              options={STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </div>

          <div>
            <Label>Nearest Deadline</Label>
            <Input
              placeholder="e.g. 2026-11-15 or Next Monday"
              value={draft.deadline ?? ""}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
            />
          </div>
        </div>

        {/* 4. PRIORITY 2: REQUIRED WORKSTREAM SELECTION */}
        {draft.priorityId === 2 && (
          <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-cyan font-semibold mb-0">
                Required Workstream Classification
              </Label>
              {!draft.workstream && (
                <span className="text-xs text-destructive font-medium">
                  Selection required
                </span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className={cn(
                  "flex flex-col text-left p-3 rounded-xl border text-xs transition-all",
                  draft.workstream === "A"
                    ? "border-cyan bg-cyan/15 text-foreground ring-1 ring-cyan"
                    : "border-glass-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60",
                )}
                onClick={() => setDraft({ ...draft, workstream: "A" })}
              >
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                  <span className="rounded bg-cyan/20 px-1.5 py-0.2 text-[10px] text-cyan">
                    A
                  </span>
                  Cashflow Generation
                </div>
                <span className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Generate short-term cash through trading systems (LBES) or
                  service work.
                </span>
              </button>

              <button
                type="button"
                className={cn(
                  "flex flex-col text-left p-3 rounded-xl border text-xs transition-all",
                  draft.workstream === "B"
                    ? "border-cyan bg-cyan/15 text-foreground ring-1 ring-cyan"
                    : "border-glass-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60",
                )}
                onClick={() => setDraft({ ...draft, workstream: "B" })}
              >
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                  <span className="rounded bg-cyan/20 px-1.5 py-0.2 text-[10px] text-cyan">
                    B
                  </span>
                  Fintech Product Capability
                </div>
                <span className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Build LBES into a useful fintech product solving real user
                  problems.
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 5. PRIORITY 3: FLEXIBLE LEARNING CATEGORIES */}
        {draft.priorityId === 3 && (
          <div className="rounded-2xl border border-violet/30 bg-violet/5 p-4 space-y-3">
            <Label className="text-violet font-semibold mb-0">
              Learning Categories (Multi-select)
            </Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_LEARNING_CATEGORIES.map((cat) => {
                const selected = (draft.learningCategories ?? []).includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                      selected
                        ? "border-violet bg-violet/20 text-foreground ring-1 ring-violet/50"
                        : "border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70",
                    )}
                  >
                    {selected && (
                      <Check className="mr-1.5 inline h-3.5 w-3.5 text-violet" />
                    )}
                    {cat}
                  </button>
                );
              })}
              {(draft.learningCategories ?? [])
                .filter((cat) => !SUGGESTED_LEARNING_CATEGORIES.includes(cat))
                .map((customCat) => (
                  <span
                    key={customCat}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet/50 bg-violet/20 px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {customCat}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(customCat)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
            </div>

            <div className="flex items-center gap-2 max-w-md pt-1">
              <Input
                className="h-9 text-xs"
                placeholder="Add custom learning category..."
                value={customCatInput}
                onChange={(e) => setCustomCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomCategory();
                  }
                }}
              />
              <Button
                size="sm"
                variant="glass"
                className="h-9 shrink-0 text-xs"
                onClick={handleAddCustomCategory}
              >
                Add
              </Button>
            </div>
          </div>
        )}

        {/* 2. FIVE HORIZONTAL ROWS (TWO COLUMNS PER ROW ON DESKTOP) */}
        {/* Row 1: Objective | Current Milestone */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Objective</Label>
            <Textarea
              rows={3}
              value={draft.objective}
              onChange={(e) =>
                setDraft({ ...draft, objective: e.target.value })
              }
              placeholder="What is this project aiming to achieve?"
            />
          </div>
          <div>
            <Label>Current Milestone</Label>
            <Textarea
              rows={3}
              value={draft.milestone}
              onChange={(e) =>
                setDraft({ ...draft, milestone: e.target.value })
              }
              placeholder="Next immediate milestone to achieve..."
            />
          </div>
        </div>

        {/* Row 2: Hypothesis | Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Hypothesis</Label>
            <Textarea
              rows={3}
              value={draft.hypothesis}
              onChange={(e) =>
                setDraft({ ...draft, hypothesis: e.target.value })
              }
              placeholder="Core assumption being validated through execution..."
            />
          </div>
          <div>
            <Label>Metrics</Label>
            <Textarea
              rows={3}
              value={draft.metrics}
              onChange={(e) => setDraft({ ...draft, metrics: e.target.value })}
              placeholder="Key metrics, targets, and quantifiable signals..."
            />
          </div>
        </div>

        {/* Row 3: Bottlenecks | Market Evidence / Actual Outputs */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Bottlenecks</Label>
            <Textarea
              rows={3}
              value={draft.bottlenecks}
              onChange={(e) =>
                setDraft({ ...draft, bottlenecks: e.target.value })
              }
              placeholder="Current blockers, friction, or constraints..."
            />
          </div>
          <div>
            <Label>Market Evidence / Actual Outputs</Label>
            <Textarea
              rows={3}
              value={draft.evidence}
              onChange={(e) => setDraft({ ...draft, evidence: e.target.value })}
              placeholder="Real user quotes, signups, transactions, validation data..."
            />
          </div>
        </div>

        {/* Row 4: Decisions | Learning */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Decisions</Label>
            <Textarea
              rows={3}
              value={draft.decisions}
              onChange={(e) =>
                setDraft({ ...draft, decisions: e.target.value })
              }
              placeholder="Key architectural, business, and strategic decisions made..."
            />
          </div>
          <div>
            <Label>Learning</Label>
            <Textarea
              rows={3}
              value={draft.learning}
              onChange={(e) => setDraft({ ...draft, learning: e.target.value })}
              placeholder="Key lessons and principles distilled from execution..."
            />
          </div>
        </div>

        {/* Row 5: Supporting Documents | Task Output History */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Supporting Documents (Text / Links)</Label>
            <Textarea
              rows={3}
              value={draft.documents}
              onChange={(e) =>
                setDraft({ ...draft, documents: e.target.value })
              }
              placeholder="Reference URLs, specs, design assets, and external files..."
            />
          </div>

          <div>
            <Label>Task Output History (Priority #{draft.priorityId})</Label>
            {taskHistory.length > 0 ? (
              <div className="h-[76px] overflow-y-auto space-y-1 rounded-xl border border-glass-border/60 bg-secondary/30 p-2.5 text-xs">
                {taskHistory.map((item, idx) => (
                  <div key={idx} className="leading-snug">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {item.date}
                    </span>{" "}
                    —{" "}
                    <span className="font-medium text-foreground">
                      {item.title}
                    </span>
                    : <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[76px] items-center justify-center rounded-xl border border-glass-border/60 bg-secondary/20 p-2.5 text-xs text-muted-foreground">
                No recorded task outputs for this priority yet.
              </div>
            )}
          </div>
        </div>

        {/* 6. DEDICATED PROJECT DOCUMENTS SECTION (Max 5) */}
        <div className="rounded-2xl border border-glass-border/70 bg-secondary/20 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan" />
                <span className="font-semibold text-sm text-foreground">
                  Project Documents
                </span>
                <Badge className="text-xs px-2 py-0.5">Docs {docCount}/5</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Up to 5 editable documents associated with this project.
              </p>
            </div>

            {docCount < 5 && (
              <Button
                size="sm"
                variant="glass"
                className="h-8 text-xs"
                onClick={() => onOpenDocEditor(null)}
              >
                <Plus className="h-3.5 w-3.5" /> Add document
              </Button>
            )}
          </div>

          {/* Document Cards List */}
          {docCount > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(draft.docs ?? []).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocEditor(doc)}
                  className="flex cursor-pointer flex-col justify-between rounded-xl border border-glass-border/60 bg-secondary/40 p-3 transition-all hover:border-cyan/40 hover:bg-secondary/70 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate font-semibold text-xs text-foreground">
                      {doc.title || "Untitled Document"}
                    </span>
                    <span className="text-[10px] text-cyan shrink-0 font-medium">
                      Edit
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {doc.content || "Empty document"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-glass-border/50 p-4 text-center text-xs text-muted-foreground">
              No documents created yet. Click "+ Add document" to attach up to 5
              documents.
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-glass-border/60 pt-4">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  `Delete project "${draft.name}"? This will remove its active assignment if active.`,
                )
              ) {
                onDelete();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete project
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveDraft}>
              Save Project
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
