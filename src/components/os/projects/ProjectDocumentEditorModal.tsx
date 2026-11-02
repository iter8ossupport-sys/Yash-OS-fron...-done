import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { today, uid } from "@/lib/os/seed";
import { Button, Input, Label, Modal, Textarea } from "@/components/os/ui";
import type { Project, ProjectDoc } from "@/lib/os/types";

export interface ProjectDocumentEditorModalProps {
  project: Project;
  doc: ProjectDoc | null;
  onClose: () => void;
  onSave: (doc: ProjectDoc) => void;
  onDelete: (id: string) => void;
}

export function ProjectDocumentEditorModal({
  project,
  doc,
  onClose,
  onSave,
  onDelete,
}: ProjectDocumentEditorModalProps) {
  const [title, setTitle] = useState(doc?.title ?? "");
  const [content, setContent] = useState(doc?.content ?? "");

  const handleSave = () => {
    const trimmedTitle = title.trim() || "Untitled Document";
    const now = today();
    const updated: ProjectDoc = {
      id: doc ? doc.id : uid(),
      title: trimmedTitle,
      content,
      createdAt: doc ? doc.createdAt : now,
      updatedAt: now,
    };
    onSave(updated);
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
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-glass-border/60 pt-4">
        {doc ? (
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
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            Save Document
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Backward-compatible alias
export const DocumentEditorModal = ProjectDocumentEditorModal;
export type DocumentEditorModalProps = ProjectDocumentEditorModalProps;
