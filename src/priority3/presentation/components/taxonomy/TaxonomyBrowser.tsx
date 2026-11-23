/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Taxonomy Navigation Browser & Hierarchy Drilldown
 *
 * Architecture:
 * Foundation (Human vs Reality) -> Domain -> Subject -> Topic -> Knowledge Units
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import {
  Compass,
  Layers,
  Folder,
  Tag,
  Plus,
  BookOpen,
  Filter,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useP3 } from "../../context/P3Context";
import type {
  DomainEntity,
  SubjectEntity,
  TopicEntity,
} from "../../../domain/entities";
import type { FoundationId } from "../../../domain/enums";

interface CreateDomainModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly defaultFoundationId?: FoundationId | undefined;
}

function CreateDomainModal({
  open,
  onClose,
  defaultFoundationId = "human_understanding",
}: CreateDomainModalProps) {
  const { createDomain, foundations } = useP3();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [foundationId, setFoundationId] =
    useState<FoundationId>(defaultFoundationId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Domain name is required.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const now = new Date().toISOString();
      const id = `dom-${Date.now()}`;
      await createDomain({
        id,
        name: name.trim(),
        description: description.trim(),
        foundationId,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-glass-border bg-card/95 p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Create Knowledge Domain
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Domains are major areas of understanding attached to a foundational
          pillar.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Foundational Pillar
            </label>
            <select
              value={foundationId}
              onChange={(e) => setFoundationId(e.target.value as FoundationId)}
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="human_understanding">Human Understanding</option>
              <option value="reality_understanding">
                Reality Understanding
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Domain Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Systems & Concurrency"
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Description & Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, invariants, and boundaries of this domain..."
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Domain"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreateSubjectModalProps {
  readonly open: boolean;
  readonly domainId: string;
  readonly onClose: () => void;
}

function CreateSubjectModal({
  open,
  domainId,
  onClose,
}: CreateSubjectModalProps) {
  const { createSubject } = useP3();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Subject name is required.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const now = new Date().toISOString();
      const id = `sub-${Date.now()}`;
      await createSubject({
        id,
        name: name.trim(),
        description: description.trim(),
        domainId,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-glass-border bg-card/95 p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          Create Subject
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Subjects group focused topics under a parent domain.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Memory Management & Cache Coherence"
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Subject boundaries and operational context..."
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Subject"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TaxonomyBrowser() {
  const {
    foundations,
    domains,
    subjects,
    topics,
    knowledgeUnits,
    evidence,
    setActiveTab,
  } = useP3();

  const [selectedFoundation, setSelectedFoundation] = useState<
    FoundationId | "all"
  >("all");
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );

  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Filter domains
  const filteredDomains = domains.filter((d) => {
    if (selectedFoundation === "all") return true;
    return d.foundationId === selectedFoundation;
  });

  // Filter subjects
  const currentDomain = domains.find((d) => d.id === selectedDomainId);
  const filteredSubjects = subjects.filter((s) => {
    if (!selectedDomainId) return false;
    return s.domainId === selectedDomainId;
  });

  // Filter topics
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const filteredTopics = topics.filter((t) => {
    if (!selectedSubjectId) return false;
    return t.subjectId === selectedSubjectId;
  });

  // Filter knowledge units connected to active hierarchy
  const activeKnowledgeUnits = knowledgeUnits.filter((ku) => {
    if (selectedSubjectId) {
      return (
        ku.identity.subjectId === selectedSubjectId ||
        ku.identity.domainId === selectedDomainId
      );
    }
    if (selectedDomainId) {
      return ku.identity.domainId === selectedDomainId;
    }
    if (selectedFoundation !== "all") {
      const parentDomain = domains.find((d) => d.id === ku.identity.domainId);
      return parentDomain?.foundationId === selectedFoundation;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Foundation Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-p3-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            Taxonomy Hierarchy Explorer
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Foundation → Domain → Subject → Topic → Knowledge Units
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-p3-border bg-p3-surface-elevated p-0.5 text-xs">
            <button
              onClick={() => {
                setSelectedFoundation("all");
                setSelectedDomainId(null);
                setSelectedSubjectId(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedFoundation === "all"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Foundations
            </button>
            <button
              onClick={() => {
                setSelectedFoundation("human_understanding");
                setSelectedDomainId(null);
                setSelectedSubjectId(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedFoundation === "human_understanding"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Human Understanding
            </button>
            <button
              onClick={() => {
                setSelectedFoundation("reality_understanding");
                setSelectedDomainId(null);
                setSelectedSubjectId(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedFoundation === "reality_understanding"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reality Understanding
            </button>
          </div>

          <Button
            size="sm"
            variant="glass"
            onClick={() => setIsDomainModalOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Domain
          </Button>
        </div>
      </div>

      {/* 3-Column Drilldown Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Domains */}
        <div className="rounded-xl border border-glass-border bg-secondary/10 p-3 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-glass-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              1. Domains ({filteredDomains.length})
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[360px]">
            {filteredDomains.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No domains found for selected foundation.
              </div>
            ) : (
              filteredDomains.map((dom) => {
                const isSelected = dom.id === selectedDomainId;
                const domKus = knowledgeUnits.filter(
                  (k) => k.identity.domainId === dom.id,
                ).length;
                return (
                  <button
                    key={dom.id}
                    onClick={() => {
                      setSelectedDomainId(dom.id);
                      setSelectedSubjectId(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-primary/50 bg-primary/10 text-foreground font-medium shadow-sm"
                        : "border-glass-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium truncate">{dom.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {dom.description || "No description"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">
                        {domKus} KUs
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Subjects */}
        <div className="rounded-xl border border-glass-border bg-secondary/10 p-3 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-glass-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5 text-blue-400" />
              2. Subjects ({filteredSubjects.length})
            </span>
            {selectedDomainId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsSubjectModalOpen(true)}
                className="h-6 px-1.5 text-[11px] text-primary"
              >
                + Add Subject
              </Button>
            )}
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[360px]">
            {!selectedDomainId ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Select a domain on the left to inspect subjects.
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No subjects registered under this domain yet.
              </div>
            ) : (
              filteredSubjects.map((sub) => {
                const isSelected = sub.id === selectedSubjectId;
                const subKus = knowledgeUnits.filter(
                  (k) => k.identity.subjectId === sub.id,
                ).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-blue-500/50 bg-blue-500/10 text-foreground font-medium shadow-sm"
                        : "border-glass-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium truncate">{sub.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {sub.description || "No description"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">
                        {subKus} KUs
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Topics & Filtered KUs */}
        <div className="rounded-xl border border-glass-border bg-secondary/10 p-3 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-glass-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-400" />
              3. Filtered KUs ({activeKnowledgeUnits.length})
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[360px]">
            {activeKnowledgeUnits.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No Knowledge Units found for the selected taxonomy hierarchy.
              </div>
            ) : (
              activeKnowledgeUnits.map((ku) => {
                const kuEvidenceCount = evidence.filter(
                  (e) => e.knowledgeUnitId === ku.id,
                ).length;

                return (
                  <div
                    key={ku.id}
                    className="p-2.5 rounded-lg border border-glass-border bg-secondary/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">
                        {ku.title}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          ku.status === "validated"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : ku.status === "tested"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ku.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {ku.coreUnderstanding.plainEnglishExplanation}
                    </p>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2 pt-0.5">
                      <span>{ku.perspective.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{kuEvidenceCount} evidence</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Creation Modals */}
      {isDomainModalOpen && (
        <CreateDomainModal
          open={isDomainModalOpen}
          onClose={() => setIsDomainModalOpen(false)}
          defaultFoundationId={
            selectedFoundation === "all"
              ? "human_understanding"
              : selectedFoundation
          }
        />
      )}

      {isSubjectModalOpen && selectedDomainId && (
        <CreateSubjectModal
          open={isSubjectModalOpen}
          domainId={selectedDomainId}
          onClose={() => setIsSubjectModalOpen(false)}
        />
      )}
    </div>
  );
}
