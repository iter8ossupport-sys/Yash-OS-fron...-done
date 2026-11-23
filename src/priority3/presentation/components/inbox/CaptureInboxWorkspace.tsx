/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Capture Inbox Workspace & Processing Workflow
 *
 * Captures raw findings quickly, reviews items, processes them into Questions or
 * Knowledge Units, and archives/integrates with full provenance.
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import {
  Inbox,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Archive,
  Trash2,
  ExternalLink,
  Plus,
  Filter,
} from "lucide-react";
import { useP3 } from "../../context/P3Context";
import { QuickCaptureModal } from "./QuickCaptureModal";
import type {
  CaptureInboxMethod,
  CaptureInboxStatus,
} from "../../../domain/enums";
import type { CaptureInboxItemEntity } from "../../../domain/entities";

export function CaptureInboxWorkspace() {
  const {
    inbox,
    updateInboxItem,
    archiveInboxItem,
    deleteInboxItem,
    createQuestion,
    createKnowledgeUnit,
    refreshData,
  } = useP3();

  const [statusFilter, setStatusFilter] = useState<CaptureInboxStatus | "all">(
    "captured",
  );
  const [methodFilter, setMethodFilter] = useState<CaptureInboxMethod | "all">(
    "all",
  );
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter items
  const filteredItems = inbox.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (methodFilter !== "all" && item.method !== methodFilter) return false;
    return true;
  });

  const handleMarkReviewed = async (item: CaptureInboxItemEntity) => {
    setActionError(null);
    await updateInboxItem(item.id, { status: "reviewed" });
    await refreshData();
  };

  const handleProcessToQuestion = async (item: CaptureInboxItemEntity) => {
    try {
      setProcessingId(item.id);
      setActionError(null);
      const now = new Date().toISOString();
      const questionId = `lq-from-${item.id}`;
      await createQuestion({
        id: questionId,
        question: item.title,
        description: item.rawContent,
        origin: "execution",
        priority: "immediate",
        status: "open",
        linkedSessionIds: [],
        linkedKnowledgeUnitIds: [],
        currentUnderstanding: item.rawContent.slice(0, 150),
        remainingGaps: "Unresolved from initial capture.",
        nextLogicalStep: "Isolate root-cause variables.",
        classification: "general",
        createdAt: now,
        updatedAt: now,
      });

      await updateInboxItem(item.id, {
        status: "processed",
        processedTargetType: "question",
        processedTargetId: questionId,
      });
      await refreshData();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to convert capture to question.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessToKnowledgeUnit = async (item: CaptureInboxItemEntity) => {
    try {
      setProcessingId(item.id);
      setActionError(null);
      const now = new Date().toISOString();
      const kuId = `ku-from-${item.id}`;
      await createKnowledgeUnit({
        id: kuId,
        title: item.title,
        summary: item.rawContent.slice(0, 150),
        perspective: "personal_understanding",
        status: "captured",
        classification: "general",
        isArchived: false,
        identity: {
          id: `id-${kuId}`,
          title: item.title,
          perspective: "personal_understanding",
          classification: "general",
          tags: ["inbox_processed"],
        },
        coreUnderstanding: {
          plainEnglishExplanation: item.rawContent,
          corePrinciples: ["Derived from empirical inbox capture."],
          mentalModels: [],
        },
        deeperUnderstanding: {
          nuancedMechanisms: "Pending operational decomposition.",
          boundaryConditions: "Context bounded by initial capture conditions.",
          counterExamples: [],
        },
        sourcesAndEvidence: {
          sourceIds: [],
          evidenceIds: [],
          competingTheories: [],
        },
        relationshipsAndApplications: {
          relationshipIds: [],
          applicationRecordIds: [],
        },
        developmentHistory: {
          revisions: [],
        },
        createdAt: now,
        updatedAt: now,
      });

      await updateInboxItem(item.id, {
        status: "processed",
        processedTargetType: "knowledge_unit",
        processedTargetId: kuId,
      });
      await refreshData();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to convert capture to Knowledge Unit.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-p3-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            Capture Inbox ({filteredItems.length} items)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rapid capture channel. Review raw material, process into Questions
            or Knowledge Units, and preserve provenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as CaptureInboxStatus | "all")
            }
            className="rounded-md border border-glass-border bg-secondary/40 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="captured">Status: Captured (Unreviewed)</option>
            <option value="reviewed">Status: Reviewed</option>
            <option value="processed">Status: Processed</option>
            <option value="archived">Status: Archived</option>
            <option value="all">Status: All Statuses</option>
          </select>

          {/* Method filter */}
          <select
            value={methodFilter}
            onChange={(e) =>
              setMethodFilter(e.target.value as CaptureInboxMethod | "all")
            }
            className="rounded-md border border-glass-border bg-secondary/40 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Channel: All</option>
            <option value="quick_capture">Quick Note</option>
            <option value="source_capture">Web / Source Link</option>
            <option value="file_import">File Import</option>
            <option value="ai_assisted">AI Assisted</option>
          </select>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsQuickCaptureOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Quick Capture
          </Button>
        </div>
      </div>

      {/* Inbox Items List */}
      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
        >
          {actionError}
        </div>
      )}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-glass-border p-8 text-center text-xs text-muted-foreground">
            No items in inbox matching selected filters. Use &quot;Quick
            Capture&quot; to log raw findings.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-glass-border bg-secondary/20 hover:bg-secondary/30 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-xs text-foreground">
                    {item.title}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                      item.status === "captured"
                        ? "bg-amber-500/20 text-amber-400"
                        : item.status === "reviewed"
                          ? "bg-blue-500/20 text-blue-400"
                          : item.status === "processed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">
                    {item.method.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {item.rawContent}
                </p>

                {item.sourceUrlOrLocation && (
                  <div className="text-[11px] text-primary flex items-center gap-1 pt-1 truncate">
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.sourceUrlOrLocation}</span>
                  </div>
                )}

                {item.processedTargetType && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1 font-mono">
                    ✓ Processed into {item.processedTargetType}:{" "}
                    {item.processedTargetId}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                {item.status === "captured" && (
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => void handleMarkReviewed(item)}
                    className="h-7 text-xs flex items-center gap-1 text-blue-400"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Review
                  </Button>
                )}

                {item.status !== "processed" && (
                  <>
                    <Button
                      size="sm"
                      variant="glass"
                      disabled={processingId === item.id}
                      onClick={() => void handleProcessToQuestion(item)}
                      className="h-7 text-xs flex items-center gap-1 text-primary"
                    >
                      <HelpCircle className="h-3 w-3" />→ Question
                    </Button>
                    <Button
                      size="sm"
                      variant="glass"
                      disabled={processingId === item.id}
                      onClick={() => void handleProcessToKnowledgeUnit(item)}
                      className="h-7 text-xs flex items-center gap-1 text-emerald-400"
                    >
                      <Lightbulb className="h-3 w-3" />→ KU
                    </Button>
                  </>
                )}

                {item.status !== "archived" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void archiveInboxItem(item.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    title="Archive item"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void deleteInboxItem(item.id)}
                  className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                  title="Delete item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Capture Modal */}
      {isQuickCaptureOpen && (
        <QuickCaptureModal
          open={isQuickCaptureOpen}
          onClose={() => setIsQuickCaptureOpen(false)}
        />
      )}
    </div>
  );
}
