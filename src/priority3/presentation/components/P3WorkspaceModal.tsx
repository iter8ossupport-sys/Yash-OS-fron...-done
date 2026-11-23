/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Standalone P3 Workspace Modal Container
 */

import React from "react";
import { Modal } from "@/components/os/ui";
import { P3Provider, type P3WorkspaceTab } from "../context/P3Context";
import { P3WorkspaceShell, type P3WorkspaceMode } from "./P3WorkspaceShell";
import type { IStorageDriver } from "../../infrastructure/persistence/storageEngine";
import type { Project } from "@/lib/os/types";
import type { LearningFoundationType } from "./creation/CreateLearningProjectModal";

export interface P3WorkspaceModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly storageDriver?: IStorageDriver | undefined;
  readonly initialTab?: P3WorkspaceTab | undefined;
  readonly project?: Project | undefined;
  readonly foundation?: LearningFoundationType | undefined;
  readonly initialMode?: P3WorkspaceMode | undefined;
}

export function P3WorkspaceModal({
  open,
  onClose,
  storageDriver,
  initialTab = "overview",
  project,
  foundation,
  initialMode,
}: P3WorkspaceModalProps) {
  const modalTitle = project
    ? `Priority 3: ${project.name}`
    : "Priority 3: Learning & Knowledge Intelligence System";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      wide
      className="max-w-6xl max-h-[92vh] overflow-y-auto"
    >
      <P3Provider storageDriver={storageDriver} initialTab={initialTab}>
        <P3WorkspaceShell
          project={project}
          foundation={foundation}
          initialMode={initialMode}
        />
      </P3Provider>
    </Modal>
  );
}
