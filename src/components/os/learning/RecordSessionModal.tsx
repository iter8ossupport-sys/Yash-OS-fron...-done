import { useState } from "react";
import { Button, Modal } from "@/components/os/ui";
import type {
  LearningJourney,
  LearningResource,
  LearningSession,
} from "@/lib/os/types";
import { today, uid } from "@/lib/os/seed";

export interface RecordSessionModalProps {
  open: boolean;
  initialSession?: LearningSession | null;
  journeys?: LearningJourney[];
  canonicalResources?: LearningResource[];
  availableResources?: LearningResource[];
  journeyId?: string | null;
  journeyTitle?: string | null;
  defaultJourneyId?: string | null;
  onClose: () => void;
  onSave: (session: LearningSession) => void;
}

export function RecordSessionModal({
  open,
  initialSession,
  journeys = [],
  canonicalResources,
  availableResources,
  journeyId: propJourneyId,
  journeyTitle: propJourneyTitle,
  defaultJourneyId,
  onClose,
  onSave,
}: RecordSessionModalProps) {
  const effectiveJourneys =
    journeys.length > 0
      ? journeys
      : propJourneyId
        ? ([
            {
              id: propJourneyId,
              title: propJourneyTitle || "Current Journey",
              description: "",
              purposeAndOutcome: "",
              type: "skill_development" as const,
              status: "active" as const,
              createdAt: today(),
              updatedAt: today(),
              objectives: [],
            },
          ] as LearningJourney[])
        : [];
  const allResources = canonicalResources ?? availableResources ?? [];
  const [journeyId, setJourneyId] = useState(
    initialSession?.journeyId ||
      propJourneyId ||
      defaultJourneyId ||
      (effectiveJourneys[0]?.id ?? ""),
  );
  const [title, setTitle] = useState(initialSession?.title || "");
  const [date, setDate] = useState(initialSession?.date || today());
  const [conceptStudied, setConceptStudied] = useState(
    initialSession?.conceptStudied || "",
  );
  const [questionsAndUncertainties, setQuestionsAndUncertainties] = useState(
    initialSession?.questionsAndUncertainties || "",
  );
  const [explanationInOwnWords, setExplanationInOwnWords] = useState(
    initialSession?.explanationInOwnWords || "",
  );
  const [newInsights, setNewInsights] = useState(
    initialSession?.newInsights || "",
  );
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>(
    initialSession?.referencedResourceIds || [],
  );
  const [optionalNextAction, setOptionalNextAction] = useState(
    initialSession?.optionalNextAction || "",
  );
  const [error, setError] = useState<string | null>(null);

  const toggleResource = (id: string) => {
    setSelectedResourceIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    if (!title.trim() && !conceptStudied.trim()) {
      setError("Please specify a session title or concept studied.");
      return;
    }
    if (!journeyId) {
      setError("Please link this session to a learning journey.");
      return;
    }

    const now = new Date().toISOString();
    const session: LearningSession = {
      id: initialSession?.id || `sess-${uid()}`,
      journeyId,
      title: title.trim() || conceptStudied.trim(),
      date,
      conceptStudied: conceptStudied.trim(),
      questionsAndUncertainties: questionsAndUncertainties.trim(),
      uncertaintyOrQuestions: questionsAndUncertainties.trim(),
      explanationInOwnWords: explanationInOwnWords.trim(),
      plainEnglishExplanation: explanationInOwnWords.trim(),
      newInsights: newInsights.trim(),
      referencedResourceIds: selectedResourceIds,
      referencedObjectiveIds: initialSession?.referencedObjectiveIds || [],
      optionalNextAction: optionalNextAction.trim() || undefined,
      nextAction: optionalNextAction.trim() || undefined,
      createdAt: initialSession?.createdAt || now,
      updatedAt: now,
    };

    onSave(session);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        initialSession ? "Edit Learning Session" : "Record Learning Session"
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

        {/* 1. Journey & Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Learning Journey <span className="text-violet">*</span>
            </label>
            <select
              value={journeyId}
              onChange={(e) => setJourneyId(e.target.value)}
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
            >
              {effectiveJourneys.map((j) => (
                <option key={j.id} value={j.id}>
                  [{j.type === "skill_development" ? "Skill" : "Subject"}]{" "}
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
            ></input>
          </div>
        </div>

        {/* 2. Session Title */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Session Title / Topic <span className="text-violet">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Sub-pixel Opacity & Glass Contrast in OKLCH"
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 3. Concept Studied */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Core Concept Studied
          </label>
          <textarea
            value={conceptStudied}
            onChange={(e) => setConceptStudied(e.target.value)}
            rows={2}
            placeholder="What fundamental mechanism, mental model, or rule did you examine?"
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 4. Explanation in Your Own Words */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Explanation in Your Own Words (Test of Understanding)
          </label>
          <textarea
            value={explanationInOwnWords}
            onChange={(e) => setExplanationInOwnWords(e.target.value)}
            rows={3}
            placeholder="Articulate the concept simply without checking notes. If you cannot explain it plainly, your understanding is incomplete."
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 5. Questions, Uncertainties & Gaps */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Questions & Uncertainties
            </label>
            <textarea
              value={questionsAndUncertainties}
              onChange={(e) => setQuestionsAndUncertainties(e.target.value)}
              rows={2}
              placeholder="What remains confusing, unverified, or counter-intuitive?"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              New Insights & Breakthroughs
            </label>
            <textarea
              value={newInsights}
              onChange={(e) => setNewInsights(e.target.value)}
              rows={2}
              placeholder="What surprised you? What mental model shifted?"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>
        </div>

        {/* 6. Referenced Resources */}
        {allResources.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Referenced Resources (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
              {allResources.map((res) => {
                const selected = selectedResourceIds.includes(res.id);
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => toggleResource(res.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                      selected
                        ? "border-violet bg-violet/20 font-semibold text-violet"
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

        {/* 7. Optional Next Action */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Optional Next Action / Follow-up Trial
          </label>
          <input
            type="text"
            value={optionalNextAction}
            onChange={(e) => setOptionalNextAction(e.target.value)}
            placeholder="e.g. Try applying inset highlight to glass cards in styles.css"
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
          <span className="text-[10px] text-muted-foreground">
            Sessions do not force task creation; this notes future intentions.
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-glass-border/60 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialSession ? "Save Changes" : "Save Learning Session"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
