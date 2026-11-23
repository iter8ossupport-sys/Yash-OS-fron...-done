/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Knowledge Hub (Knowledge Units, Taxonomy Hierarchy, Capability Matrix, Capture Inbox)
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import {
  Lightbulb,
  Plus,
  Search,
  Filter,
  Link2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Layers,
  Archive,
  Compass,
  ShieldCheck,
  Inbox,
} from "lucide-react";
import type { KnowledgeUnitEntity } from "../../../domain/entities";
import type {
  KnowledgeDevelopmentStatus,
  KnowledgePerspective,
} from "../../../domain/enums";
import { useP3 } from "../../context/P3Context";
import { KnowledgeUnitEditorModal } from "./KnowledgeUnitEditorModal";
import { KnowledgeRelationshipModal } from "./KnowledgeRelationshipModal";
import { CreateEvidenceModal } from "../sources/CreateEvidenceModal";
import { TaxonomyBrowser } from "../taxonomy/TaxonomyBrowser";
import { CapabilityProgressMatrix } from "../capability/CapabilityProgressMatrix";
import { CaptureInboxWorkspace } from "../inbox/CaptureInboxWorkspace";

type KnowledgeSubView = "units" | "taxonomy" | "capability" | "inbox";

export function KnowledgeUnitList() {
  const {
    knowledgeUnits,
    relationships,
    sources,
    evidence,
    applications,
    inbox,
  } = useP3();

  const [subView, setSubView] = useState<KnowledgeSubView>("units");

  const [perspectiveFilter, setPerspectiveFilter] = useState<
    "all" | KnowledgePerspective
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | KnowledgeDevelopmentStatus
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<KnowledgeUnitEntity | null>(
    null,
  );

  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [relSourceId, setRelSourceId] = useState<string | undefined>(undefined);

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceKuId, setEvidenceKuId] = useState<string | undefined>(
    undefined,
  );

  const filteredUnits = knowledgeUnits.filter((ku) => {
    if (ku.isArchived) return false;
    if (perspectiveFilter !== "all" && ku.perspective !== perspectiveFilter)
      return false;
    if (statusFilter !== "all" && ku.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      const match =
        ku.title.toLowerCase().includes(lower) ||
        ku.summary.toLowerCase().includes(lower) ||
        ku.coreUnderstanding.plainEnglishExplanation
          .toLowerCase()
          .includes(lower) ||
        ku.identity.tags.some((t) => t.toLowerCase().includes(lower)) ||
        ku.coreUnderstanding.corePrinciples.some((p) =>
          p.toLowerCase().includes(lower),
        );
      if (!match) return false;
    }
    return true;
  });

  const handleEdit = (ku: KnowledgeUnitEntity) => {
    setEditingUnit(ku);
    setIsEditorOpen(true);
  };

  const handleLinkRelationship = (kuId: string) => {
    setRelSourceId(kuId);
    setIsRelModalOpen(true);
  };

  const handleAttachEvidence = (kuId: string) => {
    setEvidenceKuId(kuId);
    setIsEvidenceModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* View Switcher Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-p3-border">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setSubView("units")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              subView === "units"
                ? "bg-p3-accent-muted text-p3-accent"
                : "text-p3-text-secondary hover:text-p3-text-primary"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Knowledge Units ({filteredUnits.length})
          </button>
          <button
            type="button"
            onClick={() => setSubView("taxonomy")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              subView === "taxonomy"
                ? "bg-p3-accent-muted text-p3-accent font-medium"
                : "text-p3-text-secondary hover:text-p3-text-primary"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            Taxonomy Hierarchy
          </button>
          <button
            type="button"
            onClick={() => setSubView("capability")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              subView === "capability"
                ? "bg-p3-accent-muted text-p3-accent font-medium"
                : "text-p3-text-secondary hover:text-p3-text-primary"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Capability Matrix
          </button>
          <button
            type="button"
            onClick={() => setSubView("inbox")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              subView === "inbox"
                ? "bg-p3-accent-muted text-p3-accent font-medium"
                : "text-p3-text-secondary hover:text-p3-text-primary"
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            Capture Inbox ({inbox.length})
          </button>
        </div>

        {subView === "units" && (
          <button
            type="button"
            onClick={() => {
              setEditingUnit(null);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-p3-accent px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-colors shadow-xs shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Knowledge Unit</span>
          </button>
        )}
      </div>

      {/* Render Selected View */}
      {subView === "taxonomy" && <TaxonomyBrowser />}
      {subView === "capability" && <CapabilityProgressMatrix />}
      {subView === "inbox" && <CaptureInboxWorkspace />}

      {subView === "units" && (
        <div className="space-y-4">
          <p className="text-xs text-p3-text-secondary">
            Canonical, reusable mental models & invariant principles structured
            into 6 progressive sections.
          </p>
          {/* Filter & Live Search Bar */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-p3-border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-p3-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, plain-English explanation, principles, tags..."
                className="w-full rounded-lg border border-p3-input-border bg-p3-input-bg pl-8 pr-3 py-1 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:outline-none focus:border-p3-accent"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-p3-text-secondary">
                Perspective:
              </span>
              <select
                value={perspectiveFilter}
                onChange={(e) =>
                  setPerspectiveFilter(
                    e.target.value as "all" | KnowledgePerspective,
                  )
                }
                className="h-7 rounded-lg border border-p3-input-border bg-p3-input-bg px-2 text-xs text-p3-input-text focus:outline-none focus:border-p3-accent"
              >
                <option value="all">All Perspectives</option>
                <option value="objective_knowledge">Objective Knowledge</option>
                <option value="personal_understanding">
                  Personal Understanding
                </option>
                <option value="hypothesis">Hypothesis</option>
                <option value="unclassified">Unclassified</option>
              </select>

              <span className="text-[11px] text-p3-text-secondary ml-1.5">
                Maturity:
              </span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | KnowledgeDevelopmentStatus,
                  )
                }
                className="h-7 rounded-lg border border-p3-input-border bg-p3-input-bg px-2 text-xs text-p3-input-text focus:outline-none focus:border-p3-accent"
              >
                <option value="all">All Maturity Levels</option>
                <option value="captured">Captured</option>
                <option value="understood">Understood</option>
                <option value="tested">Tested</option>
                <option value="validated">Validated</option>
              </select>
            </div>
          </div>

          {/* Knowledge Units Grid */}
          {filteredUnits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-p3-border p-8 text-center text-xs text-p3-text-secondary space-y-2">
              <Lightbulb className="mx-auto h-8 w-8 text-p3-text-secondary/30" />
              <p>
                No knowledge units match the active search and filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingUnit(null);
                  setIsEditorOpen(true);
                }}
                className="rounded-lg border border-p3-border bg-p3-surface px-4 py-1.5 text-xs text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
              >
                Synthesize a new Knowledge Unit
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredUnits.map((ku) => {
                const relCount = relationships.filter(
                  (r) =>
                    r.sourceKnowledgeUnitId === ku.id ||
                    r.targetKnowledgeUnitId === ku.id,
                ).length;
                const evCount = evidence.filter(
                  (ev) => ev.knowledgeUnitId === ku.id,
                ).length;
                const appCount = applications.filter((a) =>
                  a.connectedKnowledgeUnitIds.includes(ku.id),
                ).length;

                return (
                  <div
                    key={ku.id}
                    className="flex flex-col justify-between rounded-xl border border-p3-border bg-p3-surface p-4 transition-all hover:border-p3-accent-border"
                  >
                    <div className="space-y-2.5">
                      {/* Perspective & Status Badges */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-p3-text-secondary">
                          <span>{ku.perspective.replace(/_/g, " ")}</span>
                          <span className="text-p3-border">•</span>
                          <span>{ku.status}</span>
                        </div>
                      </div>

                      <h4 className="font-display text-sm font-semibold text-p3-text-primary leading-snug">
                        {ku.title}
                      </h4>

                      <p className="text-xs text-p3-text-secondary line-clamp-2 leading-relaxed">
                        {ku.summary}
                      </p>

                      {/* Plain-English explanation preview (accent left border instead of nested box) */}
                      {ku.coreUnderstanding.plainEnglishExplanation && (
                        <div className="border-l-2 border-p3-accent-border pl-2.5 py-0.5 text-[11px] text-p3-text-secondary">
                          <span className="font-semibold text-p3-text-primary block text-[10px] uppercase tracking-wider">
                            Plain-English Model
                          </span>
                          <p className="line-clamp-2 mt-0.5 leading-relaxed text-p3-text-primary/90">
                            {ku.coreUnderstanding.plainEnglishExplanation}
                          </p>
                        </div>
                      )}

                      {/* Core principles */}
                      {ku.coreUnderstanding.corePrinciples.length > 0 && (
                        <div className="space-y-0.5">
                          {ku.coreUnderstanding.corePrinciples
                            .slice(0, 2)
                            .map((pr, idx) => (
                              <div
                                key={idx}
                                className="text-[11px] text-p3-text-secondary line-clamp-1"
                              >
                                • {pr}
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Tags */}
                      {ku.identity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5 text-[11px] text-p3-text-secondary/80 font-mono">
                          {ku.identity.tags.slice(0, 4).map((t) => (
                            <span key={t}>#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Bar */}
                    <div className="mt-3.5 flex items-center justify-between border-t border-p3-border pt-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-p3-text-secondary">
                        <span>{relCount} links</span>
                        <span>•</span>
                        <span>{evCount} evidence</span>
                        <span>•</span>
                        <span>{appCount} trials</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="h-7 w-7 rounded-lg border border-p3-border bg-p3-surface flex items-center justify-center text-p3-text-secondary hover:text-p3-accent hover:border-p3-accent-border transition-colors"
                          onClick={() => handleLinkRelationship(ku.id)}
                          title="Establish Semantic Relationship"
                        >
                          <Link2 className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          className="h-7 w-7 rounded-lg border border-p3-border bg-p3-surface flex items-center justify-center text-p3-text-secondary hover:text-p3-accent hover:border-p3-accent-border transition-colors"
                          onClick={() => handleAttachEvidence(ku.id)}
                          title="Attach Empirical Evidence"
                        >
                          <Sparkles className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          className="h-7 rounded-lg border border-p3-border bg-p3-surface px-2.5 text-xs text-p3-text-secondary hover:text-p3-accent hover:border-p3-accent-border transition-colors"
                          onClick={() => handleEdit(ku)}
                        >
                          Edit 6 Sections →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-modals */}
      <KnowledgeUnitEditorModal
        open={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingUnit(null);
        }}
        initialUnit={editingUnit}
      />
      <KnowledgeRelationshipModal
        open={isRelModalOpen}
        onClose={() => {
          setIsRelModalOpen(false);
          setRelSourceId(undefined);
        }}
        sourceUnitId={relSourceId}
      />
      <CreateEvidenceModal
        open={isEvidenceModalOpen}
        onClose={() => {
          setIsEvidenceModalOpen(false);
          setEvidenceKuId(undefined);
        }}
        initialKnowledgeUnitId={evidenceKuId}
      />
    </div>
  );
}
