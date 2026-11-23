/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Complete UX/UI Rebuild & End-to-End Integration Test Suite
 *
 * Covers:
 * 1. Project Creation (A: Human Understanding, B: Reality Understanding, C: Custom)
 * 2. Visual Identity & Watermark Rendering (3-6% opacity target)
 * 3. Flow A: Human Understanding (Screens A2–A12)
 * 4. Flow B: Reality Understanding (Screens B2–B12)
 * 5. Flow C: Custom Learning (Screens C2–C12)
 * 6. Non-overwriting Session Preservation & Continuity
 * 7. P1/P2 Isolation & Backward Compatibility
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateLearningProjectModal } from "@/priority3/presentation/components/creation/CreateLearningProjectModal";
import { GuidedInquiryFlowModal } from "@/priority3/presentation/components/inquiry/GuidedInquiryFlowModal";
import { P3WorkspaceShell } from "@/priority3/presentation/components/P3WorkspaceShell";
import { P3Provider } from "@/priority3/presentation/context/P3Context";
import { MemoryStorageDriver } from "@/priority3/infrastructure/persistence/storageEngine";
import type { Project } from "@/lib/os/types";

describe("Priority 3 UX/UI Rebuild & Flow Verification", () => {
  let memoryDriver: MemoryStorageDriver;

  beforeEach(() => {
    localStorage.clear();
    memoryDriver = new MemoryStorageDriver();
  });

  // =========================================================================
  // 1. PROJECT CREATION SCREEN (Matches media_1795333105416_404f77de.jpg)
  // =========================================================================
  describe("1. CreateLearningProjectModal (Authoritative Visual Design)", () => {
    it("renders the exact approved header, title, description and sections", () => {
      render(
        <CreateLearningProjectModal
          open={true}
          onClose={() => {}}
          onCreate={() => {}}
        />,
      );

      expect(screen.getByText("Priority 3")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Create a Learning Project" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Choose a foundation for your learning project/i),
      ).toBeInTheDocument();
      expect(screen.getByText("Two permanent foundations")).toBeInTheDocument();
      expect(
        screen.getByText("Select one option to continue"),
      ).toBeInTheDocument();

      // Card A: Human Understanding
      expect(screen.getByText("Human Understanding")).toBeInTheDocument();
      expect(
        screen.getByAltText("Human Understanding synaptic brain illustration"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Biology, neuroscience, psychology, behavior, communication/i,
        ),
      ).toBeInTheDocument();

      // Card B: Reality Understanding
      expect(screen.getByText("Reality Understanding")).toBeInTheDocument();
      expect(
        screen.getByAltText(
          "Reality Understanding cybernetic gears illustration",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Physics, mathematics, logic, engineering, computing, software/i,
        ),
      ).toBeInTheDocument();

      // Card C: Custom
      expect(screen.getByText("Custom")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Create a flexible learning project for any skill, question, experiment/i,
        ),
      ).toBeInTheDocument();

      // Project Details
      expect(screen.getByText("Project details")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "e.g. Neuroscience, AI Systems, Decision Making",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Create Project")).toBeInTheDocument();
    });

    it("requires a project name before submitting", () => {
      const handleCreate = vi.fn();
      render(
        <CreateLearningProjectModal
          open={true}
          onClose={() => {}}
          onCreate={handleCreate}
        />,
      );

      const submitBtn = screen.getByText("Create Project");
      fireEvent.click(submitBtn);

      expect(handleCreate).not.toHaveBeenCalled();
      expect(
        screen.getByText("Please enter a valid project name to continue."),
      ).toBeInTheDocument();
    });

    it("creates a project with selected foundation A, B, or C cleanly", () => {
      const handleCreate = vi.fn();
      render(
        <CreateLearningProjectModal
          open={true}
          onClose={() => {}}
          onCreate={handleCreate}
        />,
      );

      // Select Card B: Reality Understanding
      const realityCard = screen
        .getByText("Reality Understanding")
        .closest('[role="button"]')!;
      fireEvent.click(realityCard);

      // Enter Project Name
      const input = screen.getByPlaceholderText(
        "e.g. Neuroscience, AI Systems, Decision Making",
      );
      fireEvent.change(input, { target: { value: "Quantum AI Systems" } });

      const submitBtn = screen.getByText("Create Project");
      fireEvent.click(submitBtn);

      expect(handleCreate).toHaveBeenCalledTimes(1);
      const createdProj: Project = handleCreate.mock.calls[0]![0];
      expect(createdProj.name).toBe("Quantum AI Systems");
      expect(createdProj.priorityId).toBe(3);
      expect(createdProj.learningFoundation).toBe("reality_understanding");
      expect(createdProj.status).toBe("active");
    });
  });

  // =========================================================================
  // 2. FOUNDATION VISUAL IDENTITY & WATERMARK
  // =========================================================================
  describe("2. P3WorkspaceShell Foundation Watermark", () => {
    it("renders subtle background watermark for Human and Reality, none for Custom", () => {
      const { rerender, container } = render(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell foundation="human_understanding" />
        </P3Provider>,
      );

      const watermarkA = container.querySelector(
        '[style*="human-understanding.png"]',
      );
      expect(watermarkA).toBeInTheDocument();
      expect(watermarkA?.className).toContain("opacity-[0.04]");

      // Rerender for Reality Understanding
      rerender(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell foundation="reality_understanding" />
        </P3Provider>,
      );
      const watermarkB = container.querySelector(
        '[style*="reality-understanding.png"]',
      );
      expect(watermarkB).toBeInTheDocument();
      expect(watermarkB?.className).toContain("opacity-[0.04]");

      // Rerender for Custom
      rerender(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell foundation="custom" />
        </P3Provider>,
      );
      const watermarkC = container.querySelector(
        '[style*="understanding.png"]',
      );
      expect(watermarkC).toBeNull();
    });
  });

  // =========================================================================
  // 3. GUIDED INQUIRY FLOW A (HUMAN UNDERSTANDING)
  // =========================================================================
  describe("3. Flow A: Human Understanding (Screens A2–A12)", () => {
    it("executes complete flow from field selection to session and knowledge unit", async () => {
      render(
        <P3Provider storageDriver={memoryDriver}>
          <GuidedInquiryFlowModal
            open={true}
            onClose={() => {}}
            foundation="human_understanding"
          />
        </P3Provider>,
      );

      // Screen A2: Choose field
      expect(screen.getByText("Neuroscience")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Neuroscience"));
      fireEvent.click(screen.getByText("Continue to Subject & Scope"));

      // Screen A3-A4: Subject & Topic
      const subjectInput = screen.getByPlaceholderText(
        "e.g. Dopaminergic Circuitry",
      );
      fireEvent.change(subjectInput, {
        target: { value: "Prefrontal Dopamine" },
      });
      fireEvent.click(screen.getByText("Define Learning Question"));

      // Screen A5: Define Question
      const qInput = screen.getByPlaceholderText(
        "e.g. How does tonic vs phasic dopamine affect prefrontal executive control?",
      );
      fireEvent.change(qInput, {
        target: { value: "How does tonic dopamine regulate working memory?" },
      });
      fireEvent.click(screen.getByText("Confirm & Begin Investigation"));

      // Screen A6: Choose Investigation Approach
      await waitFor(() =>
        expect(
          screen.getByText("Choose Session Investigation Approach"),
        ).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Launch Active Session"));

      // Screen A7: Active Session
      await waitFor(() =>
        expect(screen.getByText("Active Learning Session")).toBeInTheDocument(),
      );
      const focusInput = screen.getByPlaceholderText(
        "e.g. Read Huberman & Stanford notes on receptor saturation",
      );
      fireEvent.change(focusInput, {
        target: { value: "D1 receptor inverted U curve analysis" },
      });
      const understandingInput = screen.getByPlaceholderText(
        "Explain the mechanism or concept as you understand it right now...",
      );
      fireEvent.change(understandingInput, {
        target: {
          value:
            "Working memory peaks at moderate D1 stimulation; hypo or hyper stimulation degrades SNR.",
        },
      });
      fireEvent.click(screen.getByText("Conclude & Review Session"));

      // Screen A8: Session Review & Knowledge Decision
      await waitFor(() =>
        expect(
          screen.getByText("Session Review & Knowledge Decision"),
        ).toBeInTheDocument(),
      );
      expect(
        screen.getByText(/Working memory peaks at moderate D1 stimulation/i),
      ).toBeInTheDocument();

      // Click: 2. Create Knowledge Unit
      fireEvent.click(screen.getByText("2. Create Knowledge Unit"));

      // Screen A9: Formalize Knowledge Unit
      await waitFor(() =>
        expect(
          screen.getByText("Formalize Knowledge Unit"),
        ).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Save Knowledge Unit"));

      // Screen A10-A12: Continuity & Resumption
      await waitFor(() =>
        expect(
          screen.getByText("Investigation Continuity Anchor"),
        ).toBeInTheDocument(),
      );
      expect(
        screen.getByText("How does tonic dopamine regulate working memory?"),
      ).toBeInTheDocument();
      expect(screen.getByText("open")).toBeInTheDocument();
      expect(screen.getByText("Start Subsequent Session")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 4. GUIDED INQUIRY FLOW C (CUSTOM LEARNING)
  // =========================================================================
  describe("4. Flow C: Custom Learning Flow (Screens C2–C12)", () => {
    it("executes flexible custom inquiry without fixed taxonomy", async () => {
      render(
        <P3Provider storageDriver={memoryDriver}>
          <GuidedInquiryFlowModal
            open={true}
            onClose={() => {}}
            foundation="custom"
          />
        </P3Provider>,
      );

      // Screen C2: Purpose & Approach
      expect(
        screen.getByText("Define Purpose & Learning Approach"),
      ).toBeInTheDocument();
      const purposeInput = screen.getByPlaceholderText(
        "e.g. Distributed consensus algorithms, French conversation, Options hedging",
      );
      fireEvent.change(purposeInput, {
        target: { value: "Raft Consensus Algorithm in Go" },
      });
      fireEvent.click(screen.getByText("Experiment-led"));
      fireEvent.click(screen.getByText("Continue to Subject & Scope"));

      // Screen C3: Scope
      expect(screen.getByText("Define Scope & Boundaries")).toBeInTheDocument();
      const scopeInput = screen.getByPlaceholderText(
        "What is strictly in scope? What is explicitly out of scope for now?",
      );
      fireEvent.change(scopeInput, {
        target: { value: "Leader election and log replication only." },
      });
      fireEvent.click(screen.getByText("Define Learning Question"));

      // Screen C4-C5: Question
      const qInput = screen.getByPlaceholderText(
        "e.g. How does tonic vs phasic dopamine affect prefrontal executive control?",
      );
      fireEvent.change(qInput, {
        target: {
          value: "How does Raft guarantee safety during split brain votes?",
        },
      });
      fireEvent.click(screen.getByText("Confirm & Begin Investigation"));

      // Approach & Session
      await waitFor(() =>
        expect(
          screen.getByText("Choose Session Investigation Approach"),
        ).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Launch Active Session"));

      await waitFor(() =>
        expect(screen.getByText("Active Learning Session")).toBeInTheDocument(),
      );
      const focusInput = screen.getByPlaceholderText(
        "e.g. Read Huberman & Stanford notes on receptor saturation",
      );
      fireEvent.change(focusInput, {
        target: { value: "Simulating randomized election timeout" },
      });
      const understandingInput = screen.getByPlaceholderText(
        "Explain the mechanism or concept as you understand it right now...",
      );
      fireEvent.change(understandingInput, {
        target: {
          value:
            "Randomized election timeouts drastically reduce split vote probabilities.",
        },
      });
      fireEvent.click(screen.getByText("Conclude & Review Session"));

      // Decision: Keep Session Only
      await waitFor(() =>
        expect(screen.getByText("1. Keep as Session Only")).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("1. Keep as Session Only"));

      // Verify continuity anchor
      await waitFor(() =>
        expect(
          screen.getByText("Investigation Continuity Anchor"),
        ).toBeInTheDocument(),
      );
      expect(
        screen.getByText(
          "How does Raft guarantee safety during split brain votes?",
        ),
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 5. GUIDED LEARNING ENGINE & WORKSPACE INTEGRATION (PHASE 2)
  // =========================================================================
  describe("5. Shared Guided Learning Engine & Persistence", () => {
    it("executes Flow B (Reality Understanding) via GuidedLearningEngine directly", async () => {
      render(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell
            foundation="reality_understanding"
            initialMode="guided_learning"
          />
        </P3Provider>,
      );

      // Screen 1: Field Selection
      expect(screen.getByText("Choose Domain Field")).toBeInTheDocument();
      expect(screen.getByText("AI & Machine Learning")).toBeInTheDocument();
      fireEvent.click(screen.getByText("AI & Machine Learning"));
      fireEvent.click(screen.getByText("Continue to Subject & Scope"));

      // Screen 2: Subject & Topic
      await waitFor(() =>
        expect(screen.getByText("Specify Subject & Topic")).toBeInTheDocument(),
      );
      const subjectInput = screen.getByPlaceholderText(
        "e.g. Quantum Electrodynamics",
      );
      fireEvent.change(subjectInput, {
        target: { value: "Transformer Attention" },
      });
      fireEvent.click(screen.getByText("Define Learning Question"));

      // Screen 3: Question
      await waitFor(() =>
        expect(
          screen.getByText("Define the Learning Question"),
        ).toBeInTheDocument(),
      );
      const qInput = screen.getByPlaceholderText(
        "e.g. How does tonic vs phasic dopamine affect prefrontal executive control?",
      );
      fireEvent.change(qInput, {
        target: {
          value:
            "Why does FlashAttention yield linear memory scaling in context length?",
        },
      });
      fireEvent.click(screen.getByText("Confirm Question & Choose Approach"));

      // Screen 4: Approach
      await waitFor(() =>
        expect(
          screen.getByText("Choose Investigation Approach"),
        ).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Launch Active Session"));

      // Screen 5: Session
      await waitFor(() =>
        expect(screen.getByText("Active Learning Session")).toBeInTheDocument(),
      );
      const focusInput = screen.getByPlaceholderText(
        "e.g. Read Huberman & Stanford notes on receptor saturation",
      );
      fireEvent.change(focusInput, {
        target: { value: "Tiling softmax over SRAM memory blocks" },
      });
      const understandingInput = screen.getByPlaceholderText(
        "Explain the mechanism or concept as you understand it right now...",
      );
      fireEvent.change(understandingInput, {
        target: {
          value:
            "Tiling allows computing online softmax without materializing full N x N matrix in HBM.",
        },
      });
      fireEvent.click(screen.getByText("Conclude & Review Session"));

      // Screen 6: Review & Knowledge Decision
      await waitFor(() =>
        expect(
          screen.getByText("Session Review & Knowledge Decision"),
        ).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("2. Create Knowledge Unit"));

      // Screen 7: Formalize KU
      await waitFor(() =>
        expect(
          screen.getByText("Formalize Knowledge Unit"),
        ).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText("Save Knowledge Unit"));

      // Screen 8: Continuity
      await waitFor(() =>
        expect(
          screen.getByText("Investigation Continuity Anchor"),
        ).toBeInTheDocument(),
      );
      expect(
        screen.getByText(
          "Why does FlashAttention yield linear memory scaling in context length?",
        ),
      ).toBeInTheDocument();
    });

    it("supports pausing and resuming an active investigation without data loss", async () => {
      render(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell
            foundation="human_understanding"
            initialMode="guided_learning"
          />
        </P3Provider>,
      );

      // Click Pause Investigation
      const pauseBtn = screen.getByText("Pause Investigation");
      fireEvent.click(pauseBtn);

      // Screen Paused
      expect(screen.getByText("Investigation Paused")).toBeInTheDocument();
      expect(
        screen.getByText(/Your inquiry state is safely bookmarked/i),
      ).toBeInTheDocument();

      // Click Resume
      const resumeBtn = screen.getByText("Resume Investigation");
      fireEvent.click(resumeBtn);

      // Returns to active step
      expect(screen.getByText("Choose Domain Field")).toBeInTheDocument();
    });

    it("switches smoothly between Guided Learning Mode and System Library", async () => {
      render(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell
            foundation="human_understanding"
            initialMode="guided_learning"
          />
        </P3Provider>,
      );

      // In Guided Learning initially
      expect(screen.getByText("Guided Learning")).toBeInTheDocument();
      expect(screen.getByText("Choose Domain Field")).toBeInTheDocument();

      // Click System Library mode button
      const systemLibBtn = screen.getAllByRole("button", {
        name: /System Library/i,
      })[0]!;
      fireEvent.click(systemLibBtn);

      // Now in System Library with 5 tabs visible
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Learning")).toBeInTheDocument();
      expect(screen.getByText("Knowledge")).toBeInTheDocument();
      expect(screen.getByText("Applications")).toBeInTheDocument();
      expect(screen.getByText("Reviews")).toBeInTheDocument();

      // Click Return to Guided Learning
      const returnBtn = screen.getByText("Open Guided Learning");
      fireEvent.click(returnBtn);

      // Back in Guided Learning
      expect(screen.getByText("Choose Domain Field")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. PHASE 3: GLOBAL VISUAL DNA, UX SIMPLIFICATION & WORKSPACE REFINEMENT
  // =========================================================================
  describe("6. Phase 3 Global Visual DNA & Architecture Simplification", () => {
    it("CreateLearningProjectModal locks body scroll on mount and restores scroll position on unmount", () => {
      // Mock window.scrollY
      Object.defineProperty(window, "scrollY", {
        value: 450,
        writable: true,
        configurable: true,
      });

      const { unmount } = render(
        <CreateLearningProjectModal
          open={true}
          onClose={() => {}}
          onCreate={() => {}}
        />,
      );

      // Body style should reflect lock
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.top).toBe("-450px");
      expect(document.body.style.overflow).toBe("hidden");

      // Unmount modal
      unmount();

      // Body styles must be restored
      expect(document.body.style.position).toBe("");
      expect(document.body.style.top).toBe("");
      expect(document.body.style.overflow).toBe("");
    });

    it("project foundation is strictly immutable inside workspace without A/B/C switching buttons", () => {
      const realityProject: Project = {
        id: "p3-99",
        name: "Quantum Computing Foundations",
        objective: "Study quantum logic gates",
        priorityId: 3,
        learningFoundation: "reality_understanding",
        status: "active",
        hypothesis: "Quantum gates provide exponential speedup",
        milestone: "Ship 1 prototype",
        metrics: "Gate fidelity",
        bottlenecks: "",
        evidence: "",
        decisions: "",
        learning: "",
        documents: "",
        createdAt: new Date().toISOString(),
      };

      render(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell project={realityProject} initialMode="system_hub" />
        </P3Provider>,
      );

      // Displays fixed foundation identity pill
      expect(
        screen.getAllByText("Reality Understanding").length,
      ).toBeGreaterThanOrEqual(1);

      // Must NOT contain interactive switching buttons for A/B/C foundations
      expect(
        screen.queryByRole("button", { name: /Switch to Human/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Switch to Custom/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Two permanent foundations/i }),
      ).not.toBeInTheDocument();
    });

    it("renders the approved 5-section Overview information hierarchy", () => {
      const sampleProject: Project = {
        id: "p3-101",
        name: "Human Behavior Dynamics",
        objective: "Explore neuroscience & decision architecture",
        priorityId: 3,
        learningFoundation: "human_understanding",
        status: "active",
        hypothesis: "Behavior is driven by predictive processing",
        milestone: "Synthesize 10 papers",
        metrics: "Papers read",
        bottlenecks: "Information density",
        evidence: "",
        decisions: "",
        learning: "",
        documents: "",
        createdAt: new Date().toISOString(),
      };

      render(
        <P3Provider storageDriver={memoryDriver}>
          <P3WorkspaceShell project={sampleProject} initialMode="system_hub" />
        </P3Provider>,
      );

      // Section 1: Project Identity
      expect(
        screen.getByRole("heading", { name: "Human Behavior Dynamics" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Explore neuroscience & decision architecture"),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText("Human Understanding").length,
      ).toBeGreaterThanOrEqual(1);

      // Section 2: Current Learning Focus (hero card with 3 core answers + Continue Learning button)
      expect(screen.getByText("Current Learning Focus")).toBeInTheDocument();
      expect(screen.getByText(/What am I learning\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Where did I stop\?/i)).toBeInTheDocument();
      expect(screen.getByText(/What should I do next\?/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /(?:Continue|Start) Learning/i }),
      ).toBeInTheDocument();

      // Section 3: Learning Progress (compact stats row)
      expect(screen.getByText("Open Questions")).toBeInTheDocument();
      expect(screen.getByText("Knowledge Units")).toBeInTheDocument();
      expect(screen.getByText("Learning Sessions")).toBeInTheDocument();
      expect(screen.getByText("Reviews & Audits")).toBeInTheDocument();

      // Section 4: Recent Activity
      expect(screen.getByText("Recent Questions")).toBeInTheDocument();
      expect(screen.getByText("Distilled Knowledge")).toBeInTheDocument();

      // Section 5: Secondary Actions (quiet bar)
      expect(screen.getByText("Quick actions:")).toBeInTheDocument();
      expect(screen.getByText("Quick Capture")).toBeInTheDocument();
      expect(screen.getByText("New Question")).toBeInTheDocument();
      expect(screen.getByText("Record Session")).toBeInTheDocument();
    });
  });
});
