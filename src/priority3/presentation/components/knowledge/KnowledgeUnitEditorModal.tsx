/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Modal: Progressive 6-Section Knowledge Unit Editor
 *
 * Strict Architectural Rule: Preserves epistemological perspective, progressive
 * enrichment without claiming universal dogmatism, and records revision history.
 */

import React, { useEffect, useState } from "react";
import { Modal, Button } from "@/components/os/ui";
import {
  Lightbulb,
  FileText,
  Layers,
  Sparkles,
  Link2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  KnowledgeRevision,
  KnowledgeUnitEntity,
} from "../../../domain/entities";
import {
  KNOWLEDGE_DEVELOPMENT_STATUSES,
  KNOWLEDGE_PERSPECTIVES,
  type FoundationId,
  type KnowledgeDevelopmentStatus,
  type KnowledgePerspective,
} from "../../../domain/enums";
import { validateKnowledgeUnit } from "../../../domain/validation";
import { useP3 } from "../../context/P3Context";

export interface KnowledgeUnitEditorModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly initialUnit?: KnowledgeUnitEntity | null | undefined;
}

export function KnowledgeUnitEditorModal({
  open,
  onClose,
  initialUnit,
}: KnowledgeUnitEditorModalProps) {
  const { createKnowledgeUnit, updateKnowledgeUnit, sources, evidence } =
    useP3();

  // Active section tab in editor
  const [activeSection, setActiveSection] = useState<number>(1);

  // Section 1: Identity & Classification
  const [title, setTitle] = useState("");
  const [perspective, setPerspective] = useState<KnowledgePerspective>(
    "personal_understanding",
  );
  const [status, setStatus] = useState<KnowledgeDevelopmentStatus>("captured");
  const [foundationId, setFoundationId] = useState<FoundationId | "none">(
    "none",
  );
  const [tagsInput, setTagsInput] = useState("");

  // Section 2: Core Understanding
  const [summary, setSummary] = useState("");
  const [plainEnglishExplanation, setPlainEnglishExplanation] = useState("");
  const [corePrinciples, setCorePrinciples] = useState<string[]>([]);
  const [newPrinciple, setNewPrinciple] = useState("");
  const [mentalModels, setMentalModels] = useState<
    KnowledgeUnitEntity["coreUnderstanding"]["mentalModels"]
  >([]);

  // Section 3: Deeper Understanding
  const [nuancedMechanisms, setNuancedMechanisms] = useState("");
  const [boundaryConditions, setBoundaryConditions] = useState("");
  const [counterExamples, setCounterExamples] = useState<string[]>([]);
  const [newCounterExample, setNewCounterExample] = useState("");

  // Section 4: Sources & Evidence
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [competingTheories, setCompetingTheories] = useState<
    KnowledgeUnitEntity["sourcesAndEvidence"]["competingTheories"]
  >([]);

  // Section 5: Relationships & Applications
  const [operationalNotes, setOperationalNotes] = useState("");

  // Section 6: Revisions & Reason for Change
  const [reasonForChange, setReasonForChange] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate when editing existing unit
  useEffect(() => {
    if (initialUnit) {
      setTitle(initialUnit.title);
      setPerspective(initialUnit.perspective);
      setStatus(initialUnit.status);
      setFoundationId(initialUnit.foundationId ?? "none");
      setTagsInput(initialUnit.identity.tags.join(", "));
      setSummary(initialUnit.summary);
      setPlainEnglishExplanation(
        initialUnit.coreUnderstanding.plainEnglishExplanation,
      );
      setCorePrinciples([...initialUnit.coreUnderstanding.corePrinciples]);
      setMentalModels([...(initialUnit.coreUnderstanding.mentalModels ?? [])]);
      setNuancedMechanisms(initialUnit.deeperUnderstanding.nuancedMechanisms);
      setBoundaryConditions(initialUnit.deeperUnderstanding.boundaryConditions);
      setCounterExamples([...initialUnit.deeperUnderstanding.counterExamples]);
      setSelectedSourceIds([...initialUnit.sourcesAndEvidence.sourceIds]);
      setSelectedEvidenceIds([...initialUnit.sourcesAndEvidence.evidenceIds]);
      setCompetingTheories([
        ...(initialUnit.sourcesAndEvidence.competingTheories ?? []),
      ]);
      setOperationalNotes(
        initialUnit.relationshipsAndApplications.operationalNotes ?? "",
      );
      setReasonForChange("");
    } else {
      resetForm();
    }
  }, [initialUnit, open]);

  const resetForm = () => {
    setTitle("");
    setPerspective("personal_understanding");
    setStatus("captured");
    setFoundationId("none");
    setTagsInput("");
    setSummary("");
    setPlainEnglishExplanation("");
    setCorePrinciples([]);
    setNewPrinciple("");
    setMentalModels([]);
    setNuancedMechanisms("");
    setBoundaryConditions("");
    setCounterExamples([]);
    setNewCounterExample("");
    setSelectedSourceIds([]);
    setSelectedEvidenceIds([]);
    setCompetingTheories([]);
    setOperationalNotes("");
    setReasonForChange("");
    setErrorMsg(null);
    setActiveSection(1);
  };

  const handleAddPrinciple = () => {
    if (newPrinciple.trim()) {
      setCorePrinciples((prev) => [...prev, newPrinciple.trim()]);
      setNewPrinciple("");
    }
  };

  const handleRemovePrinciple = (idx: number) => {
    setCorePrinciples((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddCounterExample = () => {
    if (newCounterExample.trim()) {
      setCounterExamples((prev) => [...prev, newCounterExample.trim()]);
      setNewCounterExample("");
    }
  };

  const handleRemoveCounterExample = (idx: number) => {
    setCounterExamples((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSourceToggle = (id: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const now = new Date().toISOString();
    const kuId =
      initialUnit?.id ||
      `ku-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Build revisions history
    const previousRevisions = initialUnit?.developmentHistory.revisions ?? [];
    let updatedRevisions: KnowledgeRevision[] = [...previousRevisions];

    if (initialUnit) {
      const rev: KnowledgeRevision = {
        id: `rev-${Date.now()}`,
        timestamp: now,
        previousStatus: initialUnit.status,
        newStatus: status,
        previousSummary: initialUnit.summary,
        previousExplanation:
          initialUnit.coreUnderstanding.plainEnglishExplanation,
        reasonForChange:
          reasonForChange.trim() || "Updated Knowledge Unit content.",
        authorOrContext: "User Revision",
      };
      updatedRevisions = [rev, ...updatedRevisions];
    } else {
      const initialRev: KnowledgeRevision = {
        id: `rev-${Date.now()}`,
        timestamp: now,
        previousStatus: "captured",
        newStatus: status,
        previousSummary: "",
        previousExplanation: "",
        reasonForChange: "Initial unit creation.",
        authorOrContext: "Direct Authoring",
      };
      updatedRevisions = [initialRev];
    }

    const resolvedClassification =
      initialUnit?.classification ??
      initialUnit?.identity?.classification ??
      "general";
    const resolvedDomainId =
      initialUnit?.domainId ?? initialUnit?.identity?.domainId;
    const resolvedSubjectId =
      initialUnit?.subjectId ?? initialUnit?.identity?.subjectId;
    const resolvedTopicId =
      initialUnit?.topicId ?? initialUnit?.identity?.topicId;
    const resolvedFoundationId =
      foundationId === "none" ? undefined : foundationId;

    const entity: KnowledgeUnitEntity = {
      id: kuId,
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      perspective,
      status,
      classification: resolvedClassification,
      foundationId: resolvedFoundationId,
      domainId: resolvedDomainId,
      subjectId: resolvedSubjectId,
      topicId: resolvedTopicId,
      identity: {
        id: kuId,
        title: title.trim(),
        perspective,
        classification: resolvedClassification,
        tags: parsedTags,
        foundationId: resolvedFoundationId,
        domainId: resolvedDomainId,
        subjectId: resolvedSubjectId,
        topicId: resolvedTopicId,
      },
      coreUnderstanding: {
        plainEnglishExplanation: plainEnglishExplanation.trim(),
        corePrinciples,
        mentalModels,
      },
      deeperUnderstanding: {
        nuancedMechanisms: nuancedMechanisms.trim(),
        boundaryConditions: boundaryConditions.trim(),
        counterExamples,
      },
      sourcesAndEvidence: {
        sourceIds: selectedSourceIds,
        evidenceIds: selectedEvidenceIds,
        competingTheories,
      },
      relationshipsAndApplications: {
        relationshipIds:
          initialUnit?.relationshipsAndApplications.relationshipIds ?? [],
        applicationRecordIds:
          initialUnit?.relationshipsAndApplications.applicationRecordIds ?? [],
        operationalNotes: operationalNotes.trim() || undefined,
      },
      developmentHistory: {
        revisions: updatedRevisions,
      },
      isArchived: initialUnit?.isArchived ?? false,
      createdAt: initialUnit?.createdAt ?? now,
      updatedAt: now,
      archivedAt: initialUnit?.archivedAt,
    };

    const val = validateKnowledgeUnit(entity, "capture");
    if (!val.valid) {
      setErrorMsg(val.errors.join("; "));
      return;
    }

    try {
      setIsSubmitting(true);
      if (initialUnit) {
        await updateKnowledgeUnit(initialUnit.id, entity);
      } else {
        await createKnowledgeUnit(entity);
      }
      resetForm();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={
        initialUnit
          ? `Edit Knowledge Unit: ${initialUnit.title}`
          : "Synthesize Canonical Knowledge Unit"
      }
      wide
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 6 Canonical Section Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-glass-border/70 pb-2 scrollbar-none">
          {[
            { id: 1, label: "1. Identity & Classification", icon: FileText },
            { id: 2, label: "2. Core Understanding", icon: Lightbulb },
            { id: 3, label: "3. Deeper Nuance & Boundaries", icon: Layers },
            { id: 4, label: "4. Sources & Evidence", icon: Sparkles },
            { id: 5, label: "5. Relationships & Execution", icon: Link2 },
            { id: 6, label: "6. Revisions & History", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-violet/15 text-violet border border-violet/40"
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* SECTION 1: IDENTITY & CLASSIFICATION */}
        {activeSection === 1 && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Knowledge Unit Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Per-Thread Arena Allocation Pattern"
                className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Epistemological Perspective{" "}
                  <span className="text-destructive">*</span>
                </label>
                <select
                  value={perspective}
                  onChange={(e) =>
                    setPerspective(e.target.value as KnowledgePerspective)
                  }
                  className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="objective_knowledge">
                    Objective Knowledge (Empirical facts, laws)
                  </option>
                  <option value="personal_understanding">
                    Personal Understanding (Mental models, interpretations)
                  </option>
                  <option value="hypothesis">
                    Hypothesis / Conjectured Model
                  </option>
                  <option value="unclassified">
                    Unclassified / Imported Note
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Maturity Status <span className="text-destructive">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as KnowledgeDevelopmentStatus)
                  }
                  className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="captured">Captured (Initial synthesis)</option>
                  <option value="understood">
                    Understood (Articulated clearly)
                  </option>
                  <option value="tested">Tested (Trial in real tasks)</option>
                  <option value="validated">
                    Validated (Verifiable evidence confirmed)
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Foundation Attachment
                </label>
                <select
                  value={foundationId}
                  onChange={(e) =>
                    setFoundationId(e.target.value as FoundationId | "none")
                  }
                  className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="none">None / Independent</option>
                  <option value="human_understanding">
                    Human Understanding
                  </option>
                  <option value="reality_understanding">
                    Reality Understanding
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="architecture, memory, low-latency, c++"
                className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
              />
            </div>
          </div>
        )}

        {/* SECTION 2: CORE UNDERSTANDING */}
        {activeSection === 2 && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                High-Level Executive Summary
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="One or two sentences explaining the essence of this knowledge unit."
                className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Plain-English Explanation (No Jargon Crutch)
              </label>
              <textarea
                rows={4}
                value={plainEnglishExplanation}
                onChange={(e) => setPlainEnglishExplanation(e.target.value)}
                placeholder="Explain how this mechanism works in simple terms as if teaching a bright beginner. If you cannot explain it simply, understanding is incomplete."
                className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Core Principles & Invariant Rules
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrinciple}
                  onChange={(e) => setNewPrinciple(e.target.value)}
                  placeholder="e.g. Contention scales with concurrent writes to shared cachelines."
                  className="flex-1 rounded-xl border border-glass-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPrinciple();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="glass"
                  size="sm"
                  onClick={handleAddPrinciple}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>

              {corePrinciples.length > 0 && (
                <div className="space-y-1 mt-2">
                  {corePrinciples.map((pr, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-glass-border/60 bg-secondary/30 px-3 py-1.5 text-xs text-foreground"
                    >
                      <span>• {pr}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrinciple(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: DEEPER NUANCE & BOUNDARIES */}
        {activeSection === 3 && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nuanced Mechanisms & Under-the-Hood Details
              </label>
              <textarea
                rows={3}
                value={nuancedMechanisms}
                onChange={(e) => setNuancedMechanisms(e.target.value)}
                placeholder="What subtle interactions, cacheline invalidations, or OS kernel semantics govern this?"
                className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Boundary Conditions (Where does this model break down?)
              </label>
              <textarea
                rows={2}
                value={boundaryConditions}
                onChange={(e) => setBoundaryConditions(e.target.value)}
                placeholder="When is this rule NOT applicable? Under what constraints does it fail?"
                className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Known Counter-Examples
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCounterExample}
                  onChange={(e) => setNewCounterExample(e.target.value)}
                  placeholder="e.g. Read-mostly data structures benefit more from single shared arrays."
                  className="flex-1 rounded-xl border border-glass-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCounterExample();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="glass"
                  size="sm"
                  onClick={handleAddCounterExample}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>

              {counterExamples.length > 0 && (
                <div className="space-y-1 mt-2">
                  {counterExamples.map((ce, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-glass-border/60 bg-secondary/30 px-3 py-1.5 text-xs text-foreground"
                    >
                      <span>✗ {ce}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCounterExample(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: SOURCES & EVIDENCE */}
        {activeSection === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-foreground block mb-1.5">
                Attached Canonical Sources ({selectedSourceIds.length})
              </span>
              {sources.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No canonical sources created yet. Register sources in the
                  Knowledge Hub or during session recording.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2.5 rounded-xl border border-glass-border/70 bg-secondary/20">
                  {sources.map((src) => {
                    const isSelected = selectedSourceIds.includes(src.id);
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => handleSourceToggle(src.id)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? "border border-violet/60 bg-violet/20 text-violet"
                            : "border border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {src.title} ({src.type})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-foreground block mb-1.5">
                Verified Empirical Evidence ({selectedEvidenceIds.length})
              </span>
              {evidence.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No empirical evidence recorded yet. Attach benchmark traces,
                  test runs, or production observations.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2.5 rounded-xl border border-glass-border/70 bg-secondary/20">
                  {evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-lg border border-glass-border/50 bg-secondary/30 p-2 text-xs"
                    >
                      <span className="font-semibold text-foreground">
                        [{ev.polarity.toUpperCase()}] {ev.description}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {ev.context} ({ev.evidenceType})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 5: RELATIONSHIPS & APPLICATIONS */}
        {activeSection === 5 && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Operational Notes for Work & Projects
              </label>
              <textarea
                rows={3}
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
                placeholder="How does this knowledge unit translate into daily operational guidelines for P1 Ventures or P2 Systems?"
                className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
              />
            </div>

            <div className="rounded-xl border border-glass-border/60 bg-secondary/20 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground block mb-1">
                Connected Execution & Links:
              </span>
              <p>
                Semantic relationships to other Knowledge Units are established
                via the <strong>Establish Relationship</strong> action on the
                knowledge card. Real-world execution records are logged via{" "}
                <strong>Record Application</strong>.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 6: REVISIONS & HISTORY */}
        {activeSection === 6 && (
          <div className="space-y-3.5">
            {initialUnit && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reason for This Revision
                </label>
                <input
                  type="text"
                  value={reasonForChange}
                  onChange={(e) => setReasonForChange(e.target.value)}
                  placeholder="e.g. Added boundary conditions discovered during load test failure."
                  className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
                />
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground block">
                Historical Revision Timeline (
                {initialUnit?.developmentHistory.revisions.length ?? 0} logged)
              </span>

              {initialUnit?.developmentHistory.revisions.length ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {initialUnit.developmentHistory.revisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {rev.reasonForChange}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(rev.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Status:{" "}
                        <span className="text-violet">{rev.newStatus}</span> •
                        By: {rev.authorOrContext}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Initial revision will be logged automatically upon saving.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-glass-border/70">
          <div className="flex items-center gap-1.5">
            {activeSection > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection((s) => s - 1)}
              >
                ← Back
              </Button>
            )}
            {activeSection < 6 && (
              <Button
                type="button"
                variant="glass"
                size="sm"
                onClick={() => setActiveSection((s) => s + 1)}
              >
                Next Section →
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting
                ? "Saving..."
                : initialUnit
                  ? "Update Knowledge Unit"
                  : "Save Knowledge Unit"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
