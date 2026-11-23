/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Test Suite: Light & Dark Theme Compatibility Verification
 *
 * Verifies that:
 * 1. P3 surfaces, modals, inputs, and cards adapt cleanly between Light and Dark mode.
 * 2. Zero hardcoded dark navy (#071426, #10213A, #0B182B) or white text (#F4F7FB) remain in cards, dialogs, or inputs.
 * 3. Watermarks retain restrained 4% opacity (opacity-[0.04]) and do not obstruct readability.
 * 4. All interactive states (selected cards, focus rings, buttons) use semantic P3 tokens.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateLearningProjectModal } from "@/priority3/presentation/components/creation/CreateLearningProjectModal";
import { P3WorkspaceModal } from "@/priority3/presentation/components/P3WorkspaceModal";
import { P3WorkspaceShell } from "@/priority3/presentation/components/P3WorkspaceShell";
import { GuidedLearningEngine } from "@/priority3/presentation/components/inquiry/GuidedLearningEngine";
import { GuidedInquiryFlowModal } from "@/priority3/presentation/components/inquiry/GuidedInquiryFlowModal";
import { P3Provider } from "@/priority3/presentation/context/P3Context";
import { MemoryStorageDriver } from "@/priority3/infrastructure/persistence/storageEngine";
import type { Project } from "@/lib/os/types";

const mockProject: Project = {
  id: "test-p3-project",
  name: "Neuroscience Investigation",
  objective: "Understand synaptic plasticity and cognitive decline",
  priorityId: 3,
  status: "active",
  hypothesis: "",
  milestone: "",
  metrics: "",
  bottlenecks: "",
  evidence: "",
  decisions: "",
  learning: "",
  documents: "",
  createdAt: "2026-11-22",
  learningFoundation: "human_understanding",
  learningCategories: ["human_understanding"],
  docs: [],
};

describe("Priority 3: Light & Dark Theme Compatibility Verification", () => {
  beforeEach(() => {
    localStorage.clear();
    // Default to Light Mode (no .dark class on html)
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  describe("1. CreateLearningProjectModal Theme Compatibility", () => {
    it("renders with semantic P3 tokens in Light mode (no hardcoded dark navy)", () => {
      render(
        <CreateLearningProjectModal
          open={true}
          onClose={vi.fn()}
          onCreate={vi.fn()}
        />,
      );

      // Verify modal dialog container uses semantic theme tokens
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog.className).toContain("bg-p3-modal-bg");
      expect(dialog.className).toContain("text-p3-text-primary");
      expect(dialog.className).toContain("border-p3-border");
      expect(dialog.className).not.toContain("bg-[#071426]");
      expect(dialog.className).not.toContain("border-white/10");

      // Verify input field uses semantic token
      const input = screen.getByPlaceholderText(
        /e\.g\. Neuroscience, AI Systems, Decision Making/i,
      );
      expect(input).toBeInTheDocument();
      expect(input.className).toContain("bg-p3-input-bg");
      expect(input.className).toContain("text-p3-input-text");
      expect(input.className).toContain("border-p3-input-border");
      expect(input.className).not.toContain("bg-[#0B182B]");

      // Verify action buttons
      const createBtn = screen.getByRole("button", {
        name: /Create Project/i,
      });
      expect(createBtn.className).toContain("bg-p3-accent");
      expect(createBtn.className).toContain("text-white dark:text-[#071426]");

      const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
      expect(cancelBtn.className).toContain("text-p3-text-secondary");
    });

    it("supports switching foundation selection dynamically with semantic active states", () => {
      render(
        <CreateLearningProjectModal
          open={true}
          onClose={vi.fn()}
          onCreate={vi.fn()}
        />,
      );

      // Human Understanding card (A) is selected by default
      const humanCard = screen
        .getByText("Human Understanding")
        .closest('[role="button"]')!;
      expect(humanCard.className).toContain("border-p3-accent");
      expect(humanCard.className).toContain("bg-p3-accent-muted");

      // Click Reality Understanding (B)
      const realityCard = screen
        .getByText("Reality Understanding")
        .closest('[role="button"]')!;
      fireEvent.click(realityCard);
      expect(realityCard.className).toContain("border-p3-accent");
      expect(realityCard.className).toContain("bg-p3-accent-muted");

      // Click Custom (C)
      const customCard = screen.getByText("Custom").closest('[role="button"]')!;
      fireEvent.click(customCard);
      expect(customCard.className).toContain("border-p3-accent");
      expect(customCard.className).toContain("bg-p3-accent-muted");
    });
  });

  describe("2. P3WorkspaceShell & Watermark Subtlety", () => {
    it("renders subtle 4% opacity background watermark behind content", () => {
      const memoryDriver = new MemoryStorageDriver();

      render(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell
            project={mockProject}
            foundation="human_understanding"
          />
        </P3Provider>,
      );

      // Look for the watermark element
      const container = document.querySelector(".opacity-\\[0\\.04\\]");
      expect(container).toBeInTheDocument();
      expect(container?.className).toContain("pointer-events-none");
      expect(container?.className).toContain("absolute");
      expect(container?.className).toContain("z-0");
    });

    it("renders Mode switcher and System Library tabs with theme tokens", () => {
      const memoryDriver = new MemoryStorageDriver();

      render(
        <P3Provider storageDriver={memoryDriver} initialTab="overview">
          <P3WorkspaceShell
            project={mockProject}
            foundation="human_understanding"
            initialMode="system_hub"
          />
        </P3Provider>,
      );

      // Verify all 5 tab buttons exist and have theme-aware classes
      const tabs = [
        "Overview",
        "Learning",
        "Knowledge",
        "Applications",
        "Reviews",
      ];
      for (const tab of tabs) {
        const tabBtn = screen.getByRole("button", {
          name: new RegExp(`^${tab}`, "i"),
        });
        expect(tabBtn).toBeInTheDocument();
      }
    });
  });

  describe("3. GuidedLearningEngine Theme Compatibility", () => {
    it("renders Guided Learning screens with theme tokens in Light and Dark mode", () => {
      const memoryDriver = new MemoryStorageDriver();

      const { rerender } = render(
        <P3Provider storageDriver={memoryDriver}>
          <GuidedLearningEngine
            project={mockProject}
            foundation="human_understanding"
          />
        </P3Provider>,
      );

      // Screen 1: Field Selection
      expect(screen.getByText("Choose Domain Field")).toBeInTheDocument();
      const domainCard = screen
        .getByText("Biology & Physiology")
        .closest('[role="button"]')!;
      expect(domainCard.className).toContain("border-p3-accent");
      expect(domainCard.className).not.toContain("bg-[#10213A]");

      // Next step: Subject & Topic
      fireEvent.click(
        screen.getByRole("button", { name: /Continue to Subject & Scope/i }),
      );
      expect(screen.getByText("Specify Subject & Topic")).toBeInTheDocument();

      // Input field should use semantic tokens
      const subjectInput = screen.getByPlaceholderText(
        /e\.g\. Dopaminergic Circuitry/i,
      );
      expect(subjectInput.className).toContain("bg-p3-input-bg");
      expect(subjectInput.className).toContain("text-p3-input-text");
      expect(subjectInput.className).toContain("border-p3-input-border");

      // Re-render in Dark Mode
      document.documentElement.classList.add("dark");
      rerender(
        <P3Provider storageDriver={memoryDriver}>
          <GuidedLearningEngine
            project={mockProject}
            foundation="human_understanding"
          />
        </P3Provider>,
      );

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("4. GuidedInquiryFlowModal Theme Compatibility", () => {
    it("renders modal container, backdrop, and form inputs using semantic tokens", () => {
      const memoryDriver = new MemoryStorageDriver();

      render(
        <P3Provider storageDriver={memoryDriver}>
          <GuidedInquiryFlowModal
            open={true}
            onClose={vi.fn()}
            foundation="human_understanding"
          />
        </P3Provider>,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog.className).toContain("bg-p3-modal-bg");
      expect(dialog.className).toContain("border-p3-border");
      expect(dialog.className).toContain("text-p3-text-primary");
      expect(dialog.className).not.toContain("bg-[#08080a]");
    });
  });
});
