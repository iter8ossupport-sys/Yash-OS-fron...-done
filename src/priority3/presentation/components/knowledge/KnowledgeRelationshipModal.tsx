/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Modal: Link Two Knowledge Units with Semantic Relationship & Mandatory Explanation
 */

import React, { useState } from "react";
import { Modal, Button } from "@/components/os/ui";
import { Link2, AlertCircle } from "lucide-react";
import type { KnowledgeRelationshipEntity } from "../../../domain/entities";
import {
  RELATIONSHIP_TYPES,
  type RelationshipType,
} from "../../../domain/enums";
import { canCreateKnowledgeRelationship } from "../../../domain/rules";
import { useP3 } from "../../context/P3Context";

export interface KnowledgeRelationshipModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly sourceUnitId?: string | undefined;
}

export function KnowledgeRelationshipModal({
  open,
  onClose,
  sourceUnitId,
}: KnowledgeRelationshipModalProps) {
  const { knowledgeUnits, createRelationship } = useP3();

  const [sourceId, setSourceId] = useState<string>(
    sourceUnitId ?? (knowledgeUnits[0]?.id || ""),
  );
  const [targetId, setTargetId] = useState<string>(
    knowledgeUnits.find(
      (ku) => ku.id !== (sourceUnitId || knowledgeUnits[0]?.id),
    )?.id || "",
  );
  const [relType, setRelType] = useState<RelationshipType>("related_to");
  const [explanation, setExplanation] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSourceId(sourceUnitId ?? (knowledgeUnits[0]?.id || ""));
    setTargetId(
      knowledgeUnits.find(
        (ku) => ku.id !== (sourceUnitId || knowledgeUnits[0]?.id),
      )?.id || "",
    );
    setRelType("related_to");
    setExplanation("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const check = canCreateKnowledgeRelationship(
      sourceId,
      targetId,
      relType,
      explanation.trim(),
    );
    if (!check.valid) {
      setErrorMsg(check.error ?? "Invalid relationship configuration.");
      return;
    }

    const now = new Date().toISOString();
    const relEntity: KnowledgeRelationshipEntity = {
      id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sourceKnowledgeUnitId: sourceId,
      targetKnowledgeUnitId: targetId,
      type: relType,
      explanation: explanation.trim(),
      createdAt: now,
    };

    try {
      setIsSubmitting(true);
      await createRelationship(relEntity);
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
      title="Establish Semantic Knowledge Link"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Source Knowledge Unit <span className="text-destructive">*</span>
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              {knowledgeUnits.map((ku) => (
                <option key={ku.id} value={ku.id}>
                  {ku.title} ({ku.perspective})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Target Knowledge Unit <span className="text-destructive">*</span>
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              {knowledgeUnits
                .filter((ku) => ku.id !== sourceId)
                .map((ku) => (
                  <option key={ku.id} value={ku.id}>
                    {ku.title} ({ku.perspective})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-violet" />
            Semantic Relationship Type{" "}
            <span className="text-destructive">*</span>
          </label>
          <select
            value={relType}
            onChange={(e) => setRelType(e.target.value as RelationshipType)}
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none"
          >
            {RELATIONSHIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Mandatory Architectural Explanation / Rationale{" "}
            <span className="text-destructive">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain specifically why and how these two units are linked. (e.g. Unit A defines the allocator interface that Unit B implements; or Unit B empirically tests Unit A's hypothesis)."
            className="w-full rounded-xl border border-glass-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet"
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
            disabled={
              isSubmitting ||
              !sourceId ||
              !targetId ||
              explanation.trim().length < 5
            }
          >
            {isSubmitting ? "Linking..." : "Establish Relationship"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
