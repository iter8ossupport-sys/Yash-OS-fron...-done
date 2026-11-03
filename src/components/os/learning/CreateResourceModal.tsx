import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, Modal } from "@/components/os/ui";
import type {
  LearningJourney,
  LearningResource,
  LearningResourceStatus,
  LearningResourceType,
} from "@/lib/os/types";
import { uid } from "@/lib/os/seed";

export interface CreateResourceModalProps {
  open: boolean;
  initialResource?: LearningResource | null | undefined;
  journeys?: LearningJourney[];
  defaultJourneyId?: string | null;
  onClose: () => void;
  onSave: (resource: LearningResource) => void;
}

export function CreateResourceModal({
  open,
  initialResource,
  journeys = [],
  defaultJourneyId,
  onClose,
  onSave,
}: CreateResourceModalProps) {
  const [title, setTitle] = useState(initialResource?.title || "");
  const [type, setType] = useState<LearningResourceType>(
    initialResource?.type || "book",
  );
  const [authorOrSource, setAuthorOrSource] = useState(
    initialResource?.authorOrSource || "",
  );
  const [urlOrLocation, setUrlOrLocation] = useState(
    initialResource?.urlOrLocation || "",
  );
  const [description, setDescription] = useState(
    initialResource?.description || "",
  );
  const [whyStudying, setWhyStudying] = useState(
    initialResource?.whyStudying || "",
  );
  const [status, setStatus] = useState<LearningResourceStatus>(
    initialResource?.status || "queued",
  );
  const [selectedJourneyIds, setSelectedJourneyIds] = useState<string[]>(
    initialResource?.journeyIds || (defaultJourneyId ? [defaultJourneyId] : []),
  );
  const [notes, setNotes] = useState(initialResource?.notes || "");
  const [newTakeaway, setNewTakeaway] = useState("");
  const [distilledTakeaways, setDistilledTakeaways] = useState<string[]>(
    initialResource?.distilledTakeaways || [],
  );
  const [error, setError] = useState<string | null>(null);

  const toggleJourney = (id: string) => {
    setSelectedJourneyIds((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id],
    );
  };

  const handleAddTakeaway = () => {
    if (!newTakeaway.trim()) return;
    setDistilledTakeaways([...distilledTakeaways, newTakeaway.trim()]);
    setNewTakeaway("");
  };

  const handleRemoveTakeaway = (idx: number) => {
    setDistilledTakeaways(distilledTakeaways.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Please specify a resource title.");
      return;
    }

    const now = new Date().toISOString();
    const resource: LearningResource = {
      id: initialResource?.id || `res-${uid()}`,
      title: title.trim(),
      type,
      authorOrSource: authorOrSource.trim() || undefined,
      urlOrLocation: urlOrLocation.trim() || undefined,
      description: description.trim() || undefined,
      whyStudying: whyStudying.trim() || undefined,
      status,
      journeyIds: selectedJourneyIds,
      notes: notes.trim(),
      distilledTakeaways,
      createdAt: initialResource?.createdAt || now,
      updatedAt: now,
      completedAt:
        status === "completed"
          ? initialResource?.completedAt || now
          : undefined,
    };

    onSave(resource);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        initialResource ? "Edit Learning Resource" : "Add Learning Resource"
      }
      wide
      className="max-w-3xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* 1. Title, Type, Status */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Title <span className="text-violet">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Refactoring UI or Thinking, Fast and Slow"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LearningResourceType)}
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
            >
              <option value="book">Book</option>
              <option value="course">Course</option>
              <option value="documentation">Documentation / RFC</option>
              <option value="academic_paper">Academic Paper</option>
              <option value="video">Video / Lecture</option>
              <option value="podcast">Podcast / Audio</option>
              <option value="article">Article / Deep Dive</option>
              <option value="expert_conversation">Expert Conversation</option>
              <option value="exercise">Exercise / Practice</option>
              <option value="custom">Custom Resource</option>
            </select>
          </div>
        </div>

        {/* 2. Author & Location */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Author or Source
            </label>
            <input
              type="text"
              value={authorOrSource}
              onChange={(e) => setAuthorOrSource(e.target.value)}
              placeholder="e.g. Daniel Kahneman or Tanner Linsley"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              URL or File Location
            </label>
            <input
              type="text"
              value={urlOrLocation}
              onChange={(e) => setUrlOrLocation(e.target.value)}
              placeholder="https://... or path/to/notes.pdf"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>
        </div>

        {/* 3. Why Studying & Status */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Why Studying? (Target Execution Problem)
            </label>
            <input
              type="text"
              value={whyStudying}
              onChange={(e) => setWhyStudying(e.target.value)}
              placeholder="What specific bottleneck does this resource help resolve?"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Progress Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as LearningResourceStatus)
              }
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
            >
              <option value="queued">Queued</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="referenced">Referenced Regularly</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* 4. Connected Journeys (Multi-journey reuse without duplicate canonical records) */}
        {journeys.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Connect to Learning Journeys (Resource Reuse)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {journeys.map((j) => {
                const selected = selectedJourneyIds.includes(j.id);
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => toggleJourney(j.id)}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                      selected
                        ? "border-violet bg-violet/20 font-semibold text-violet"
                        : "border-glass-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {j.title}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              A single resource can be referenced across multiple Skill and
              Subject journeys without duplicating records.
            </p>
          </div>
        )}

        {/* 5. Notes & Key Takeaways */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Personal Notes & Marginalia
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Key concepts, quotes, and observations..."
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Distilled Atomic Takeaways
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTakeaway}
              onChange={(e) => setNewTakeaway(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTakeaway();
                }
              }}
              placeholder="e.g. Establish hierarchy by font-weight and opacity, not font size alone"
              className="flex-1 rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleAddTakeaway}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>

          {distilledTakeaways.length > 0 && (
            <div className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto">
              {distilledTakeaways.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 rounded-lg border border-glass-border/60 bg-secondary/20 p-2 text-xs text-foreground"
                >
                  <span className="flex-1 leading-relaxed">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(idx)}
                    className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-glass-border/60 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialResource ? "Save Changes" : "Save Resource"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
