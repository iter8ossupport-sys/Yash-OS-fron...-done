/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Legacy Compatibility Adapter: LearningWorkspaceModal
 *
 * Forwards legacy calls directly to the authoritative P3WorkspaceModal.
 */

import React from "react";
import { P3WorkspaceModal } from "@/priority3/presentation";

export interface LearningWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
  initialJourneyId?: string | null | undefined;
}

export function LearningWorkspaceModal({
  open,
  onClose,
}: LearningWorkspaceModalProps) {
  return <P3WorkspaceModal open={open} onClose={onClose} />;
}
