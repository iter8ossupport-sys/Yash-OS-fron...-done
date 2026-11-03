import { useState } from "react";
import { Button, Modal } from "@/components/os/ui";
import type {
  KnowledgeArtifact,
  KnowledgeArtifactCategory,
  LearningJourney,
  LearningResource,
} from "@/lib/os/types";
import { uid } from "@/lib/os/seed";

export interface CaptureKnowledgeModalProps {
  open: boolean;
  initialArtifact?: KnowledgeArtifact | null;
  defaultJourney?: LearningJourney | null;
  journeys?: LearningJourney[];
  resources?: LearningResource[];
  journeyId?: string | null;
  journeyTitle?: string | null;
  resourceId?: string | null;
  resourceTitle?: string | null;
  onClose: () => void;
  onSave: (artifact: KnowledgeArtifact) => void;
}

export function CaptureKnowledgeModal({
  open,
  initialArtifact,
  defaultJourney,
  journeys = [],
  resources = [],
  journeyId: propJourneyId,
  journeyTitle: propJourneyTitle,
  resourceId: propResourceId,
  resourceTitle: propResourceTitle,
  onClose,
  onSave,
}: CaptureKnowledgeModalProps) {
  const [title, setTitle] = useState(initialArtifact?.title || "");
  const [category, setCategory] = useState<KnowledgeArtifactCategory>(
    initialArtifact?.category || "principle",
  );
  const [content, setContent] = useState(initialArtifact?.content || "");
  const [journeyId, setJourneyId] = useState(
    initialArtifact?.sourceProvenance?.journeyId ||
      propJourneyId ||
      defaultJourney?.id ||
      (journeys[0]?.id ?? ""),
  );
  const [resourceId, setResourceId] = useState(
    initialArtifact?.sourceProvenance?.resourceId || propResourceId || "",
  );
  const [tagsInput, setTagsInput] = useState(
    initialArtifact?.tags?.join(", ") || "",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Please specify a title for the knowledge artifact.");
      return;
    }
    if (!content.trim()) {
      setError("Please specify the artifact content.");
      return;
    }

    const now = new Date().toISOString();
    const effectiveJId = journeyId || propJourneyId || defaultJourney?.id || "";
    const selectedJourney = journeys.find((j) => j.id === effectiveJId);
    const selectedResource = resources.find((r) => r.id === resourceId);

    const artifact: KnowledgeArtifact = {
      id: initialArtifact?.id || `art-${uid()}`,
      title: title.trim(),
      category,
      content: content.trim(),
      sourceProvenance: effectiveJId
        ? {
            journeyId: effectiveJId,
            journeyTitle:
              selectedJourney?.title || propJourneyTitle || undefined,
            resourceId: resourceId || propResourceId || undefined,
            resourceTitle:
              selectedResource?.title || propResourceTitle || undefined,
          }
        : undefined,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      createdAt: initialArtifact?.createdAt || now,
      updatedAt: now,
    };

    onSave(artifact);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        initialArtifact
          ? "Edit Knowledge Artifact"
          : "Capture Reusable Knowledge"
      }
      wide
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* 1. Title & Category */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Artifact Title <span className="text-violet">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. The Glass Highlight Rule or System 1 Circuit Breaker"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as KnowledgeArtifactCategory)
              }
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
            >
              <option value="principle">Principle (Invariant truth)</option>
              <option value="method">Method (Repeatable execution)</option>
              <option value="framework">Framework (Mental model)</option>
              <option value="concept">Concept (Deconstructed theory)</option>
              <option value="note">Atomic Note</option>
              <option value="research_insight">Research Insight</option>
              <option value="decision">Decision Record (ADR)</option>
            </select>
          </div>
        </div>

        {/* 2. Source Provenance */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Source Journey (Provenance)
            </label>
            <select
              value={journeyId}
              onChange={(e) => setJourneyId(e.target.value)}
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
            >
              <option value="">None (Independent Knowledge)</option>
              {journeys.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Source Resource (Optional Citation)
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
            >
              <option value="">None</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.type}] {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Content */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Knowledge Content / Invariant Rule{" "}
            <span className="text-violet">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            rows={4}
            placeholder="State the distilled rule, framework mechanism, or procedural step clearly so it can be deployed immediately in future work."
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 4. Tags */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. design, css, glassmorphism, risk"
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-glass-border/60 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialArtifact ? "Save Changes" : "Save Knowledge"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
