import { useState } from "react";
import { ListTree, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { today, uid } from "@/lib/os/seed";
import { Button, Input, Label, Modal, Textarea } from "@/components/os/ui";
import type { Project, ProjectDoc, ProjectDocument } from "@/lib/os/types";

export interface ProjectDocumentEditorModalProps {
  project: Project;
  doc: ProjectDoc | ProjectDocument | null;
  onClose: () => void;
  onSave: (doc: ProjectDoc | ProjectDocument) => void;
  onDelete: (id: string) => void;
  onOpenStructuredPlan?: () => void;
}

export function ProjectDocumentEditorModal({
  project,
  doc,
  onClose,
  onSave,
  onDelete,
  onOpenStructuredPlan,
}: ProjectDocumentEditorModalProps) {
  const [title, setTitle] = useState(doc?.title ?? "");
  const [content, setContent] = useState(doc?.content ?? "");

  const isExecutionPlan = doc && "type" in doc && doc.type === "execution_plan";

  const handleSave = () => {
    const trimmedTitle = title.trim() || "Untitled Document";
    const now = today();

    if (doc && "type" in doc) {
      const updated: ProjectDocument = {
        ...(doc as ProjectDocument),
        title: trimmedTitle,
        content,
        version: (doc.version ?? 1) + 1,
        updatedAt: now,
      };
      onSave(updated);
    } else {
      const updated: ProjectDoc = {
        id: doc ? doc.id : uid(),
        title: trimmedTitle,
        content,
        createdAt: doc ? doc.createdAt : now,
        updatedAt: now,
      };
      onSave(updated);
    }

    toast.success(doc ? "Document saved" : "Document created");
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={
        doc
          ? `Edit Document: ${doc.title || "Untitled"}`
          : "New Project Document"
      }
      wide
    >
      <div className="space-y-4">
        <div className="text-xs text-muted-foreground">
          Project:{" "}
          <span className="font-semibold text-foreground">{project.name}</span>{" "}
          (Priority #{project.priorityId})
        </div>

        {isExecutionPlan ? (
          <div className="rounded-xl border border-cyan/40 bg-cyan/10 p-5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-cyan">
              <ListTree className="h-4 w-4" />
              Authoritative Structured Execution Plan
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This document is a navigation handle into the authoritative
              Structured Execution Plan. To prevent data desynchronization,
              freeform markdown editing is locked. Manage monthly, weekly, and
              daily outcomes directly within the Structured Plan editor.
            </p>
            {onOpenStructuredPlan && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenStructuredPlan();
                }}
              >
                Open Structured Plan Editor
              </Button>
            )}
          </div>
        ) : (
          <>
            <div>
              <Label>Document Title</Label>
              <Input
                autoFocus
                placeholder="e.g. Architecture Overview, Trading Log, Research Brief"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>Document Content</Label>
              <Textarea
                rows={12}
                className="font-mono text-xs leading-relaxed"
                placeholder="Write markdown, notes, research summaries, hypotheses, or execution plans..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-glass-border/60 pt-4">
        {doc && !isExecutionPlan ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm(`Delete document "${doc.title}"?`)) {
                onDelete(doc.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete document
          </Button>
        ) : (
          <div />
        )}

        <div className="flex gap-2">
          <Button onClick={onClose}>Close</Button>
          {!isExecutionPlan && (
            <Button variant="primary" onClick={handleSave}>
              Save Document
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
