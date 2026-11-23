/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Quick Capture Modal
 *
 * Captures raw insights, notes, or web resources directly into the Capture Inbox
 * with provenance preservation.
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import { Inbox, Link, FileText, Sparkles } from "lucide-react";
import { useP3 } from "../../context/P3Context";
import type { CaptureInboxMethod } from "../../../domain/enums";

interface QuickCaptureModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function QuickCaptureModal({ open, onClose }: QuickCaptureModalProps) {
  const { createInboxItem } = useP3();
  const [title, setTitle] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [method, setMethod] = useState<CaptureInboxMethod>("quick_capture");
  const [sourceUrlOrLocation, setSourceUrlOrLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawContent.trim()) {
      setError("Title and raw content are both required.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const now = new Date().toISOString();
      const id = `inbox-${Date.now()}`;
      await createInboxItem({
        id,
        title: title.trim(),
        rawContent: rawContent.trim(),
        method,
        status: "captured",
        sourceUrlOrLocation: sourceUrlOrLocation.trim() || undefined,
        classification: "general",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-p3-modal-backdrop backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-xl border border-glass-border bg-card/95 p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          Quick Capture to Inbox
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Capture raw ideas, snippets, or findings immediately. Review and
          process later into Questions or Knowledge Units.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Capture Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cache thrashing observed in L3 profiling"
              className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Capture Channel
              </label>
              <select
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as CaptureInboxMethod)
                }
                className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="quick_capture">Quick Note / Thought</option>
                <option value="source_capture">Web / Paper Link</option>
                <option value="file_import">File / Code Excerpt</option>
                <option value="ai_assisted">AI-Assisted Synthesis</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Source URL / Origin
              </label>
              <input
                type="text"
                value={sourceUrlOrLocation}
                onChange={(e) => setSourceUrlOrLocation(e.target.value)}
                placeholder="https://... or book / conversation"
                className="w-full rounded-md border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Raw Content / Observation *
            </label>
            <textarea
              rows={4}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste raw text, quote, observed metric, or hypothesis..."
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
              {isSubmitting ? "Capturing..." : "Save to Inbox"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
