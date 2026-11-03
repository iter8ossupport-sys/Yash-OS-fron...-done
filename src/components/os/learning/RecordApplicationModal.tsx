import { useState } from "react";
import { Button, Modal } from "@/components/os/ui";
import type {
  ApplicationRecord,
  ApplicationRecordType,
  LearningJourney,
  Project,
} from "@/lib/os/types";
import { today, uid } from "@/lib/os/seed";

export interface RecordApplicationModalProps {
  open: boolean;
  initialApplication?: ApplicationRecord | null;
  journey?: LearningJourney;
  journeyId?: string;
  journeyTitle?: string;
  isExploration?: boolean;
  projects?: Project[];
  availableProjects?: { id: string; name: string }[] | Project[];
  onClose: () => void;
  onSave: (application: ApplicationRecord) => void;
}

export function RecordApplicationModal({
  open,
  initialApplication,
  journey,
  journeyId: propJourneyId,
  journeyTitle: propJourneyTitle,
  isExploration,
  projects = [],
  availableProjects,
  onClose,
  onSave,
}: RecordApplicationModalProps) {
  const effectiveJId = journey?.id || propJourneyId || "";
  const allProjects =
    projects.length > 0 ? projects : (availableProjects ?? []);
  const [title, setTitle] = useState(initialApplication?.title || "");
  const [type, setType] = useState<ApplicationRecordType>(
    initialApplication?.type || "practice",
  );
  const [description, setDescription] = useState(
    initialApplication?.description || "",
  );
  const [linkedProjectId, setLinkedProjectId] = useState<string>(
    initialApplication?.linkedProjectId || (allProjects[0]?.id ?? ""),
  );
  const [evidenceOutput, setEvidenceOutput] = useState(
    initialApplication?.evidenceOutput || "",
  );
  const [outcomeAchieved, setOutcomeAchieved] = useState(
    initialApplication?.outcomeAchieved ?? true,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Please provide an application title.");
      return;
    }
    if (!evidenceOutput.trim()) {
      setError("Please describe the concrete evidence or output produced.");
      return;
    }

    const now = new Date().toISOString();
    const selectedProject = allProjects.find((p) => p.id === linkedProjectId);

    const app: ApplicationRecord = {
      id: initialApplication?.id || `app-${uid()}`,
      journeyId: effectiveJId,
      title: title.trim(),
      type,
      description: description.trim(),
      linkedObjectiveIds: initialApplication?.linkedObjectiveIds || [],
      linkedPriorityId:
        (selectedProject && "priorityId" in selectedProject
          ? (selectedProject.priorityId as 1 | 2 | 3)
          : undefined) || 1,
      linkedProjectId: linkedProjectId || undefined,
      evidenceOutput: evidenceOutput.trim(),
      outcomeAchieved,
      appliedAt: initialApplication?.appliedAt || today(),
      createdAt: initialApplication?.createdAt || now,
      updatedAt: now,
    };

    onSave(app);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        initialApplication
          ? "Edit Application Record"
          : "Record Practical Application"
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

        {/* 1. Title & Type */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Application Title <span className="text-violet">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Portfolio Tree Visualizer Implementation"
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ApplicationRecordType)}
              className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
            >
              <option value="practice">Practice / Exercise</option>
              <option value="experiment">Empirical Experiment</option>
              <option value="product_implementation">
                Product Implementation
              </option>
              <option value="user_interview">User Interview Trial</option>
              <option value="real_world_problem_solving">
                Real-World Problem Solving
              </option>
            </select>
          </div>
        </div>

        {/* 2. Link to Existing Canonical Project (No task/project duplication!) */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Linked Project (Reuses Canonical Projects)
          </label>
          <select
            value={linkedProjectId}
            onChange={(e) => setLinkedProjectId(e.target.value)}
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3 py-2 text-xs text-foreground focus:border-violet focus:outline-none"
          >
            <option value="">None (Independent Practice)</option>
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {"priorityId" in p && p.priorityId ? `[P${p.priorityId}] ` : ""}
                {p.name}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-muted-foreground">
            Links directly to existing projects without creating a duplicate
            task system.
          </span>
        </div>

        {/* 3. Description */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Execution Trial Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What exactly was tested, shipped, or solved using the learned concept?"
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 4. Concrete Evidence Output */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Concrete Verifiable Output / Evidence{" "}
            <span className="text-violet">*</span>
          </label>
          <textarea
            value={evidenceOutput}
            onChange={(e) => {
              setEvidenceOutput(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            placeholder="e.g. PortfolioHierarchyTree.tsx merged with 10 passing tests, or orderflow absorption log verified with bracket stops."
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 5. Outcome Achieved */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="outcomeAchieved"
            checked={outcomeAchieved}
            onChange={(e) => setOutcomeAchieved(e.target.checked)}
            className="h-4 w-4 rounded border-glass-border bg-secondary/40 text-violet focus:ring-violet"
          />
          <label
            htmlFor="outcomeAchieved"
            className="text-xs font-medium text-foreground cursor-pointer select-none"
          >
            Execution trial succeeded (intended outcome achieved)
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-glass-border/60 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialApplication ? "Save Changes" : "Save Application Record"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
