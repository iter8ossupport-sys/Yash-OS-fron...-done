import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { today, uid } from "@/lib/os/seed";
import { cn } from "@/lib/utils";
import { Button, Input, Label, Modal, Textarea } from "@/components/os/ui";
import type { PriorityId, Project } from "@/lib/os/types";
import { ensureWorkstreamBDocuments } from "@/lib/os/logic";
import { PRIORITIES_META, SUGGESTED_LEARNING_CATEGORIES } from "./projectsMeta";

export interface CreateProjectModalProps {
  defaultPriority: PriorityId | null;
  defaultWorkstream?: "A" | "B" | null;
  onClose: () => void;
  onCreate: (p: Project) => void;
}

export function CreateProjectModal({
  defaultPriority,
  defaultWorkstream,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [priorityId, setPriorityId] = useState<PriorityId>(
    defaultPriority ?? 1,
  );

  // Priority 2 required workstream
  const [workstream, setWorkstream] = useState<"A" | "B" | null>(
    defaultWorkstream ?? null,
  );

  // Priority 3 optional learning categories
  const [learningCategories, setLearningCategories] = useState<string[]>([]);
  const [customCatInput, setCustomCatInput] = useState("");

  const handleToggleCategory = (cat: string) => {
    if (learningCategories.includes(cat)) {
      setLearningCategories(learningCategories.filter((c) => c !== cat));
    } else {
      setLearningCategories([...learningCategories, cat]);
    }
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCatInput.trim();
    if (!trimmed) return;
    if (!learningCategories.includes(trimmed)) {
      setLearningCategories([...learningCategories, trimmed]);
    }
    setCustomCatInput("");
  };

  const canSubmit =
    Boolean(name.trim()) && (priorityId !== 2 || Boolean(workstream));

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    if (priorityId === 2 && !workstream) {
      toast.error("Please select required Workstream A or B for Priority 2");
      return;
    }

    const newProject: Project = ensureWorkstreamBDocuments({
      id: uid(),
      name: name.trim(),
      objective: objective.trim(),
      priorityId,
      status: "active",
      hypothesis: "",
      milestone: "",
      metrics: "",
      bottlenecks: "",
      evidence: "",
      decisions: "",
      learning: "",
      documents: "",
      createdAt: today(),
      deadline: "",
      workstream: priorityId === 2 ? workstream! : undefined,
      learningCategories: priorityId === 3 ? learningCategories : undefined,
      docs: [],
    });

    onCreate(newProject);
    toast.success("Project created");
  };

  return (
    <Modal open onClose={onClose} title="New Project">
      <div className="space-y-4">
        {/* Input 1: Project Name */}
        <div>
          <Label>Project Name *</Label>
          <Input
            autoFocus
            placeholder="e.g. Next-Gen Capability Engine"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Input 2: Objective */}
        <div>
          <Label>Objective</Label>
          <Textarea
            rows={2}
            placeholder="Short description of what the project aims to achieve..."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>

        {/* Input 3: Assigned Priority */}
        <div>
          <Label>Assigned Priority *</Label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES_META.map((meta) => {
              const selected = priorityId === meta.id;
              return (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => setPriorityId(meta.id)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all",
                    selected
                      ? cn(
                          "bg-secondary/70 ring-1",
                          meta.borderClass
                            .replace("border-t-", "border-")
                            .replace("border-", "ring-"),
                        )
                      : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      selected ? meta.accentClass : "",
                    )}
                  >
                    #{meta.id}
                  </span>
                  <span className="text-[11px] font-medium leading-tight mt-0.5">
                    {meta.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional Priority 2: Required A/B Workstream */}
        {priorityId === 2 && (
          <div className="rounded-xl border border-cyan/40 bg-cyan/5 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-cyan font-semibold mb-0">
                Required Workstream Classification *
              </Label>
              {!workstream && (
                <span className="text-[11px] text-destructive font-medium">
                  Required
                </span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={cn(
                  "flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all",
                  workstream === "A"
                    ? "border-cyan bg-cyan/15 text-foreground ring-1 ring-cyan"
                    : "border-glass-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60",
                )}
                onClick={() => setWorkstream("A")}
              >
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="rounded bg-cyan/20 px-1 py-0.2 text-[10px] text-cyan">
                    A
                  </span>
                  Cashflow Generation
                </div>
                <span className="mt-1 text-[11px] text-muted-foreground leading-snug">
                  Generate short-term cash through trading systems (LBES) or
                  service work.
                </span>
              </button>

              <button
                type="button"
                className={cn(
                  "flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all",
                  workstream === "B"
                    ? "border-cyan bg-cyan/15 text-foreground ring-1 ring-cyan"
                    : "border-glass-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60",
                )}
                onClick={() => setWorkstream("B")}
              >
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="rounded bg-cyan/20 px-1 py-0.2 text-[10px] text-cyan">
                    B
                  </span>
                  Fintech Product Capability
                </div>
                <span className="mt-1 text-[11px] text-muted-foreground leading-snug">
                  Build LBES into a useful fintech product solving real user
                  problems.
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Conditional Priority 3: Optional Learning Categories */}
        {priorityId === 3 && (
          <div className="rounded-xl border border-violet/40 bg-violet/5 p-3.5 space-y-2.5">
            <Label className="text-violet font-semibold mb-0">
              Learning Categories (Optional Multi-Select)
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_LEARNING_CATEGORIES.map((cat) => {
                const selected = learningCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={cn(
                      "rounded-lg border px-2 py-1 text-[11px] font-medium transition-all",
                      selected
                        ? "border-violet bg-violet/20 text-foreground ring-1 ring-violet/50"
                        : "border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {selected && (
                      <Check className="mr-1 inline h-3 w-3 text-violet" />
                    )}
                    {cat}
                  </button>
                );
              })}
              {learningCategories
                .filter((cat) => !SUGGESTED_LEARNING_CATEGORIES.includes(cat))
                .map((customCat) => (
                  <span
                    key={customCat}
                    className="inline-flex items-center gap-1 rounded-lg border border-violet/50 bg-violet/20 px-2 py-1 text-[11px] font-medium text-foreground"
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

            <div className="flex items-center gap-2 pt-1">
              <Input
                className="h-8 text-xs"
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
                className="h-8 shrink-0 text-xs"
                onClick={handleAddCustomCategory}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-glass-border/60 pt-4">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          Create Project
        </Button>
      </div>
    </Modal>
  );
}
