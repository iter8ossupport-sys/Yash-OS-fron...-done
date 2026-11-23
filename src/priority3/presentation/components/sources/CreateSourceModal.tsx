/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Modal: Register Canonical Source
 */

import React, { useState } from "react";
import { Modal, Button } from "@/components/os/ui";
import { BookOpen, AlertCircle } from "lucide-react";
import type { SourceEntity } from "../../../domain/entities";
import { SOURCE_CATEGORIES, type SourceCategory } from "../../../domain/enums";
import { validateSource } from "../../../domain/validation";
import { useP3 } from "../../context/P3Context";

export interface CreateSourceModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function CreateSourceModal({ open, onClose }: CreateSourceModalProps) {
  const { createSource } = useP3();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<SourceCategory>("primary_evidence");
  const [author, setAuthor] = useState("");
  const [urlOrLocation, setUrlOrLocation] = useState("");
  const [description, setDescription] = useState("");
  const [reliabilityAssessment, setReliabilityAssessment] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setType("primary_evidence");
    setAuthor("");
    setUrlOrLocation("");
    setDescription("");
    setReliabilityAssessment("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const now = new Date().toISOString();
    const entity: SourceEntity = {
      id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      type,
      authorOrCreator: author.trim() || undefined,
      urlOrLocation: urlOrLocation.trim() || undefined,
      accessDate: now,
      description: description.trim(),
      provenanceMetadata: {},
      reliabilityAssessment:
        reliabilityAssessment.trim() || "Peer-reviewed / verified in practice",
      classification: "general",
      createdAt: now,
      updatedAt: now,
    };

    const val = validateSource(entity);
    if (!val.valid) {
      setErrorMsg(val.errors.join("; "));
      return;
    }

    try {
      setIsSubmitting(true);
      await createSource(entity);
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
      title="Register Canonical Learning Source"
      wide
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-violet" />
            Source Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. jemalloc Architecture Paper & Source Code"
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Source Category <span className="text-destructive">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SourceCategory)}
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              {SOURCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Author / Creator / Institution
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Jason Evans (Facebook)"
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            URL, DOI, or Physical Location
          </label>
          <input
            type="text"
            value={urlOrLocation}
            onChange={(e) => setUrlOrLocation(e.target.value)}
            placeholder="https://... or RFC document ID"
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Description & Context
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this source contain? What makes it authoritative or canonical?"
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Qualitative Reliability Assessment
          </label>
          <input
            type="text"
            value={reliabilityAssessment}
            onChange={(e) => setReliabilityAssessment(e.target.value)}
            placeholder="e.g. Production-tested at scale; benchmarked against glibc malloc."
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-glass-border/70">
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
            {isSubmitting ? "Registering..." : "Register Source"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
