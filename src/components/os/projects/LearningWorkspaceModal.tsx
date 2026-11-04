/**
 * ============================================================================
 * CRITICAL ARCHITECTURAL SAFEGUARD — PRIORITY 3 (LEARNING & CAPABILITY)
 * ============================================================================
 *
 * @deprecated
 * DO NOT USE THIS COMPONENT FOR NEW WORK.
 *
 * This file previously contained an obsolete, static 8-stage mock workspace.
 * To permanently eliminate regression risk, this component now acts as an
 * automatic, safe adapter delegating directly to the authoritative Stage One
 * Learning & Capability Development system:
 *
 * -> Priority3LearningWorkspaceModal from "@/components/os/learning"
 *
 * The authoritative system features:
 * 1. Six Main Workspace Views:
 *    - Overview (KPIs, active journeys, recent activity, recommended actions)
 *    - Learning Journeys (Skill Development & Subject Exploration filterable list)
 *    - Resources (Curated learning assets with status and journey tags)
 *    - Knowledge (Artifacts, mental models, frameworks with provenance)
 *    - Capability Development (Levels, progression criteria, evidence gates)
 *    - Reviews (Structured reflection and capability audits)
 * 2. Seven Journey Workspace Views (Overview, Objectives, Resources, Sessions, Applications, Knowledge, Capabilities)
 * 3. Interactive state persistence via onUpdateState and OS store
 *
 * ============================================================================
 */

import { useEffect } from "react";
import { useOS } from "@/lib/os/store";
import {
  Priority3LearningWorkspaceModal,
  type Priority3LearningWorkspaceModalProps,
} from "@/components/os/learning/Priority3LearningWorkspaceModal";

export interface LearningWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
  initialJourneyId?: string | null;
}

export function LearningWorkspaceModal({
  open,
  onClose,
  initialJourneyId,
}: LearningWorkspaceModalProps) {
  const { state, update } = useOS();

  useEffect(() => {
    if (open && process.env["NODE_ENV"] !== "production") {
      console.warn(
        "[Yash OS Architecture Notice] LearningWorkspaceModal from '@/components/os/projects' is a legacy alias. " +
          "Always import Priority3LearningWorkspaceModal directly from '@/components/os/learning'. " +
          "Rendering authoritative Priority3LearningWorkspaceModal automatically.",
      );
    }
  }, [open]);

  return (
    <Priority3LearningWorkspaceModal
      open={open}
      onClose={onClose}
      state={state}
      onUpdateState={(fn) => update(fn)}
      initialJourneyId={initialJourneyId ?? null}
    />
  );
}

// Re-export the authoritative component and types for complete backward compatibility
export {
  Priority3LearningWorkspaceModal,
  type Priority3LearningWorkspaceModalProps,
};
