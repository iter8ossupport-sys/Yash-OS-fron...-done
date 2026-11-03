import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge, Button, Modal } from "@/components/os/ui";
import type {
  CapabilityArea,
  LearningJourney,
  LearningJourneyType,
  LearningResource,
} from "@/lib/os/types";
import { uid } from "@/lib/os/seed";

export interface CreateJourneyModalProps {
  open: boolean;
  existingCapabilities?: CapabilityArea[];
  capabilities?: CapabilityArea[];
  canonicalResources?: LearningResource[];
  availableResources?: LearningResource[];
  onClose: () => void;
  onSave: (journey: LearningJourney) => void;
}

export function CreateJourneyModal({
  open,
  existingCapabilities,
  capabilities,
  canonicalResources,
  availableResources,
  onClose,
  onSave,
}: CreateJourneyModalProps) {
  const allCapabilities = existingCapabilities ?? capabilities ?? [];
  const allResources = canonicalResources ?? availableResources ?? [];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<LearningJourneyType>("skill_development");
  const [purposeAndOutcome, setPurposeAndOutcome] = useState("");
  const [selectedCapIds, setSelectedCapIds] = useState<string[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [newObjectiveText, setNewObjectiveText] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddObjective = () => {
    if (!newObjectiveText.trim()) return;
    setObjectives([...objectives, newObjectiveText.trim()]);
    setNewObjectiveText("");
  };

  const handleRemoveObjective = (idx: number) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const toggleCapability = (id: string) => {
    setSelectedCapIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleResource = (id: string) => {
    setSelectedResourceIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Please provide a journey name.");
      return;
    }

    const journeyId = `journey-${uid()}`;
    const now = new Date().toISOString();

    const createdObjectives = objectives.map((objText, i) => ({
      id: `obj-${journeyId}-${i + 1}`,
      journeyId,
      title: objText,
      status: "active" as const,
      createdAt: now,
    }));

    const journey: LearningJourney = {
      id: journeyId,
      title: title.trim(),
      description: description.trim(),
      type,
      status: "active",
      purposeAndOutcome: purposeAndOutcome.trim(),
      capabilityAreaIds: selectedCapIds,
      objectives: createdObjectives,
      createdAt: now,
      updatedAt: now,
    };

    onSave(journey);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Learning Journey"
      wide
      className="max-w-3xl"
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* 1. Journey Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            Journey Type <span className="text-violet">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              onClick={() => setType("skill_development")}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                type === "skill_development"
                  ? "border-violet bg-violet/15 shadow-md shadow-violet/10 ring-1 ring-violet"
                  : "border-glass-border/70 bg-secondary/20 hover:border-violet/40 hover:bg-secondary/35"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">
                  Skill Development
                </span>
                <Badge className="border-violet/40 bg-violet/20 text-[10px] text-violet uppercase">
                  Execution
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Develop practical founder capabilities through deep
                understanding, deliberate practice, real-world application, and
                verifiable evidence.
              </p>
              <div className="mt-2 text-[10px] font-medium text-violet">
                Requires: Understanding + Practical Output Evidence
              </div>
            </div>

            <div
              onClick={() => setType("subject_exploration")}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                type === "subject_exploration"
                  ? "border-cyan bg-cyan/15 shadow-md shadow-cyan/10 ring-1 ring-cyan"
                  : "border-glass-border/70 bg-secondary/20 hover:border-cyan/40 hover:bg-secondary/35"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">
                  Subject Exploration
                </span>
                <Badge className="border-cyan/40 bg-cyan/20 text-[10px] text-cyan uppercase">
                  Synthesis
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Explore subjects (e.g. Psychology, Economics, AI, History),
                synthesize mental models, and retain insights. Practical
                application is strictly optional.
              </p>
              <div className="mt-2 text-[10px] font-medium text-cyan">
                Requires: Understanding + Conceptual Synthesis
              </div>
            </div>
          </div>
        </div>

        {/* 2. Title & Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Journey Name <span className="text-violet">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                type === "skill_development"
                  ? "e.g. UI/UX & Design Systems Engineering"
                  : "e.g. Cognitive Psychology & Decision Architecture"
              }
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What domain is this journey scoping and why does it matter to your founder mission?"
              rows={2}
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Purpose & Intended Outcome
            </label>
            <input
              type="text"
              value={purposeAndOutcome}
              onChange={(e) => setPurposeAndOutcome(e.target.value)}
              placeholder="What will you understand, decide, or execute differently once this journey succeeds?"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>
        </div>

        {/* 3. Initial Objectives */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Learning Objectives (Optional initial milestones)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newObjectiveText}
              onChange={(e) => setNewObjectiveText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddObjective();
                }
              }}
              placeholder="e.g. Master sub-pixel border rendering in OKLCH"
              className="flex-1 rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleAddObjective}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>

          {objectives.length > 0 && (
            <div className="mt-2.5 space-y-1.5">
              {objectives.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-glass-border/60 bg-secondary/20 px-3 py-1.5 text-xs text-foreground"
                >
                  <span className="truncate pr-2">
                    <span className="font-mono text-violet mr-2">{i + 1}.</span>
                    {obj}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Relevant Capability Areas */}
        {allCapabilities.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Connect to Capability Areas (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allCapabilities.map((cap) => {
                const selected = selectedCapIds.includes(cap.id);
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => toggleCapability(cap.id)}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                      selected
                        ? "border-violet bg-violet/20 font-semibold text-violet"
                        : "border-glass-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cap.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Attach Canonical Resources */}
        {allResources.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Attach Existing Resources (Optional - reusable across journeys)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
              {allResources.map((res) => {
                const selected = selectedResourceIds.includes(res.id);
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => toggleResource(res.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                      selected
                        ? "border-cyan bg-cyan/20 font-semibold text-cyan"
                        : "border-glass-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="uppercase text-[9px] font-mono text-muted-foreground">
                      [{res.type}]
                    </span>
                    <span className="truncate max-w-[200px]">{res.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-glass-border/60 pt-4">
          <span className="text-[11px] text-muted-foreground">
            You can refine objectives, resources and capabilities anytime.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Create Journey
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
