import { useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Button, Modal } from "@/components/os/ui";
import type {
  CapabilityArea,
  CapabilityAssessmentState,
  LearningJourney,
} from "@/lib/os/types";
import { uid } from "@/lib/os/seed";

export interface AssessCapabilityModalProps {
  open: boolean;
  initialCapability?: CapabilityArea | null;
  defaultJourney?: LearningJourney | null;
  journeys?: LearningJourney[];
  defaultJourneyId?: string | null;
  onClose: () => void;
  onSave: (capability: CapabilityArea) => void;
}

export function AssessCapabilityModal({
  open,
  initialCapability,
  defaultJourney,
  journeys,
  defaultJourneyId,
  onClose,
  onSave,
}: AssessCapabilityModalProps) {
  const [name, setName] = useState(initialCapability?.name || "");
  const [description, setDescription] = useState(
    initialCapability?.description || "",
  );
  const [currentState, setCurrentState] = useState<CapabilityAssessmentState>(
    initialCapability?.currentState || "developing",
  );
  const [evidence, setEvidence] = useState(initialCapability?.evidence || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Please specify the capability area name.");
      return;
    }

    // Strict Business Invariant: Demonstrated capability requires concrete evidence!
    if (
      (currentState === "demonstrated_with_support" ||
        currentState === "demonstrated_independently") &&
      !evidence.trim()
    ) {
      setError(
        "Demonstrated capability requires concrete verifiable evidence. Course completion or study hours alone do not prove capability.",
      );
      return;
    }

    const now = new Date().toISOString();
    const journeyIds =
      initialCapability?.journeyIds ||
      (defaultJourney ? [defaultJourney.id] : []);

    const capability: CapabilityArea = {
      id: initialCapability?.id || `cap-${uid()}`,
      name: name.trim(),
      description: description.trim(),
      journeyIds,
      currentState,
      evidence: evidence.trim(),
      reviewDate: now,
      createdAt: initialCapability?.createdAt || now,
      updatedAt: now,
    };

    onSave(capability);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        initialCapability
          ? "Update Capability Assessment"
          : "Assess Capability Area"
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

        <div className="rounded-xl border border-violet/30 bg-violet/10 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-violet shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-violet">
              Truthful Evaluation Standard:
            </strong>{" "}
            Capability is evaluated separately from course consumption or
            reading hours. Mastery cannot be claimed without concrete execution
            evidence.
          </p>
        </div>

        {/* 1. Capability Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Capability Name <span className="text-violet">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Responsive Dark Glass UI Systems or Probabilistic Risk Math"
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 2. Description */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Capability Scope & Problem Solved
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What practical problems does this capability allow you to resolve autonomously?"
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* 3. Qualitative Assessment States */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            Qualitative Assessment State <span className="text-violet">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              {
                id: "not_assessed",
                title: "Not Assessed",
                desc: "Theoretical exploration only; unverified in practice.",
                badge: "text-muted-foreground border-glass-border",
              },
              {
                id: "developing",
                title: "Developing",
                desc: "Basic concepts understood; requires guidance or iteration.",
                badge: "text-amber-400 border-amber-500/30 bg-amber-500/10",
              },
              {
                id: "demonstrated_with_support",
                title: "Demonstrated with Support",
                desc: "Executed in real projects with tools, docs, or mentors.",
                badge: "text-cyan border-cyan/30 bg-cyan/10",
              },
              {
                id: "demonstrated_independently",
                title: "Demonstrated Independently",
                desc: "Executed repeatedly with high quality and zero hand-holding.",
                badge:
                  "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
              },
            ].map((st) => (
              <div
                key={st.id}
                onClick={() => {
                  setCurrentState(st.id as CapabilityAssessmentState);
                  if (error) setError(null);
                }}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  currentState === st.id
                    ? "border-violet bg-violet/15 ring-1 ring-violet shadow-sm"
                    : "border-glass-border/60 bg-secondary/25 hover:border-violet/40 hover:bg-secondary/35"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {st.title}
                  </span>
                  {currentState === st.id && (
                    <ShieldCheck className="h-3.5 w-3.5 text-violet" />
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Mandatory Concrete Supporting Evidence */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Supporting Evidence / Verifiable Output{" "}
            {(currentState === "demonstrated_with_support" ||
              currentState === "demonstrated_independently") && (
              <span className="text-violet">
                * (Mandatory for Demonstrated)
              </span>
            )}
          </label>
          <textarea
            value={evidence}
            onChange={(e) => {
              setEvidence(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            placeholder="Document exact proofs: Pull request links, test suites passed, verified live trade fills, or user interview conversion evidence."
            className="w-full rounded-xl border border-glass-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-violet focus:outline-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-glass-border/60 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Assessment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
