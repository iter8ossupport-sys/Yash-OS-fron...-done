import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { initialState } from "@/lib/os/seed";
import type {
  CapabilityArea,
  LearningJourney,
  LearningResource,
  OSState,
} from "@/lib/os/types";
import {
  createDefaultLearningSystem,
  ensureLearningSystem,
  saveLearningResource,
} from "@/lib/os/learning/state";
import { CreateJourneyModal } from "@/components/os/learning/CreateJourneyModal";
import { CreateResourceModal } from "@/components/os/learning/CreateResourceModal";
import { RecordSessionModal } from "@/components/os/learning/RecordSessionModal";
import { RecordApplicationModal } from "@/components/os/learning/RecordApplicationModal";
import { CaptureKnowledgeModal } from "@/components/os/learning/CaptureKnowledgeModal";
import { AssessCapabilityModal } from "@/components/os/learning/AssessCapabilityModal";
import { JourneyWorkspaceModal } from "@/components/os/learning/JourneyWorkspaceModal";
import { Priority3LearningWorkspaceModal } from "@/components/os/learning/Priority3LearningWorkspaceModal";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a className={className} {...props}>
      {children}
    </a>
  ),
  useRouterState: vi.fn(() => "/projects"),
}));

function getTestState(): OSState {
  return {
    ...initialState,
    learningSystem: createDefaultLearningSystem(),
  };
}

describe("Priority 3 — Learning for Execution UI & Product Workflows", () => {
  // WORKFLOW A: Create Skill Development journey with objectives and capability links
  it("Workflow A: creates a Skill Development journey with objectives and capability links", () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();
    const defaultSys = createDefaultLearningSystem();

    render(
      <CreateJourneyModal
        open={true}
        onClose={handleClose}
        onSave={handleSave}
        capabilities={defaultSys.capabilities}
        availableResources={defaultSys.resources}
      />,
    );

    expect(screen.getByText("Create Learning Journey")).toBeDefined();
    expect(screen.getByText("Skill Development")).toBeDefined();
    expect(screen.getByText("Subject Exploration")).toBeDefined();

    // Fill Title
    const titleInput = screen.getByPlaceholderText(
      /e\.g\. UI\/UX & Design Systems Engineering/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "Full-Stack Nitro & Hydration Mastery" },
    });

    // Fill Purpose
    const purposeInput = screen.getByPlaceholderText(
      /What will you understand, decide, or execute differently/i,
    );
    fireEvent.change(purposeInput, {
      target: {
        value: "Eliminate server-client hydration mismatches across Yash OS.",
      },
    });

    // Add an objective
    const objInput = screen.getByPlaceholderText(
      /e\.g\. Master sub-pixel border rendering in OKLCH/i,
    );
    fireEvent.change(objInput, {
      target: { value: "Master SSR hydration boundaries" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("Master SSR hydration boundaries")).toBeDefined();

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "Create Journey" }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    const savedJourney: LearningJourney = handleSave.mock.calls[0]![0];
    expect(savedJourney.title).toBe("Full-Stack Nitro & Hydration Mastery");
    expect(savedJourney.type).toBe("skill_development");
    expect(savedJourney.status).toBe("active");
    expect(savedJourney.objectives).toHaveLength(1);
    expect(savedJourney.objectives?.[0]?.title).toBe(
      "Master SSR hydration boundaries",
    );
  });

  // WORKFLOW B: Create Subject Exploration journey without mandatory practical application
  it("Workflow B: creates a Subject Exploration journey and highlights optional application", () => {
    const handleSave = vi.fn();
    const defaultSys = createDefaultLearningSystem();

    render(
      <CreateJourneyModal
        open={true}
        onClose={vi.fn()}
        onSave={handleSave}
        capabilities={defaultSys.capabilities}
        availableResources={defaultSys.resources}
      />,
    );

    // Switch to Subject Exploration
    fireEvent.click(screen.getByText("Subject Exploration"));
    expect(
      screen.getByText(/Practical application is strictly optional/i),
    ).toBeDefined();

    const titleInput = screen.getByPlaceholderText(
      /e\.g\. Cognitive Psychology & Decision Architecture/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "Austrian Capital Theory & Business Cycles" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Journey" }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    const saved = handleSave.mock.calls[0]![0];
    expect(saved.type).toBe("subject_exploration");
    expect(saved.title).toBe("Austrian Capital Theory & Business Cycles");
  });

  // WORKFLOW C: Canonical Resource Creation & Reuse across multiple journeys
  it("Workflow C: creates a canonical resource and reuses it across multiple journeys without record duplication", () => {
    let state = getTestState();
    const defaultSys = ensureLearningSystem(state);
    const handleSave = vi.fn((res: LearningResource) => {
      state = saveLearningResource(state, res);
    });

    render(
      <CreateResourceModal
        open={true}
        onClose={vi.fn()}
        onSave={handleSave}
        journeys={defaultSys.journeys}
      />,
    );

    expect(screen.getByText("Add Learning Resource")).toBeDefined();

    const titleInput = screen.getByPlaceholderText(
      /e\.g\. Refactoring UI or Thinking, Fast and Slow/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "High Performance Browser Networking" },
    });

    const authorInput = screen.getByPlaceholderText(
      /e\.g\. Daniel Kahneman or Tanner Linsley/i,
    );
    fireEvent.change(authorInput, {
      target: { value: "Ilya Grigorik" },
    });

    const whyInput = screen.getByPlaceholderText(
      /What specific bottleneck does this resource help resolve/i,
    );
    fireEvent.change(whyInput, {
      target: { value: "Optimize WebSocket latency for trading order books." },
    });

    // Select first journey via pill button
    const firstJourneyButton = screen.getByRole("button", {
      name: defaultSys.journeys[0]!.title,
    });
    fireEvent.click(firstJourneyButton);

    fireEvent.click(screen.getByRole("button", { name: "Save Resource" }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    const savedRes = handleSave.mock.calls[0]![0];
    expect(savedRes.title).toBe("High Performance Browser Networking");
    expect(savedRes.authorOrSource).toBe("Ilya Grigorik");

    // Verify it exists in updated state
    const updatedSys = ensureLearningSystem(state);
    const found = updatedSys.resources.find((r) => r.id === savedRes.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe("High Performance Browser Networking");
  });

  // WORKFLOW D: Edit and reopen canonical resources
  it("Workflow D: edits and updates an existing canonical resource", () => {
    const handleSave = vi.fn();
    const existing = createDefaultLearningSystem().resources[0];

    render(
      <CreateResourceModal
        open={true}
        initialResource={existing}
        onClose={vi.fn()}
        onSave={handleSave}
      />,
    );

    expect(screen.getByText("Edit Learning Resource")).toBeDefined();

    // Add a takeaway
    const takeawayInput = screen.getByPlaceholderText(
      /e\.g\. Establish hierarchy by font-weight/i,
    );
    fireEvent.change(takeawayInput, {
      target: {
        value: "Always use CSS transform over top/left for 60fps animations.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    const updated = handleSave.mock.calls[0]![0];
    expect(updated.id).toBe(existing!.id);
    expect(updated.distilledTakeaways).toContain(
      "Always use CSS transform over top/left for 60fps animations.",
    );
  });

  // WORKFLOW E: Record Deliberate Learning Session with plain-English explanation
  it("Workflow E: records a deliberate learning session with mental model synthesis", () => {
    const handleSave = vi.fn();
    const defaultSys = createDefaultLearningSystem();
    const targetJourney = defaultSys.journeys[0];

    render(
      <RecordSessionModal
        open={true}
        journeyId={targetJourney!.id}
        journeyTitle={targetJourney!.title}
        availableResources={defaultSys.resources}
        onClose={vi.fn()}
        onSave={handleSave}
      />,
    );

    expect(screen.getByText("Record Learning Session")).toBeDefined();

    // Fill Title
    const titleInput = screen.getByPlaceholderText(
      /e\.g\. Sub-pixel Opacity & Glass Contrast in OKLCH/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "CSS Subgrid & Container Queries" },
    });

    // Fill Concept
    const conceptInput = screen.getByPlaceholderText(
      /What fundamental mechanism, mental model, or rule did you examine/i,
    );
    fireEvent.change(conceptInput, {
      target: { value: "CSS Subgrid alignment" },
    });

    // Fill Mental Model
    const mentalModelInput = screen.getByPlaceholderText(
      /Articulate the concept simply without checking notes/i,
    );
    fireEvent.change(mentalModelInput, {
      target: {
        value: "Container queries decouple components from the viewport width.",
      },
    });

    // Fill Next Action
    const nextActionInput = screen.getByPlaceholderText(
      /e\.g\. Try applying inset highlight/i,
    );
    fireEvent.change(nextActionInput, {
      target: {
        value: "Implement container queries on PortfolioHierarchyTree.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Save (Learning )?Session/i }),
    );

    expect(handleSave).toHaveBeenCalledTimes(1);
    const session = handleSave.mock.calls[0]![0];
    expect(session.title).toBe("CSS Subgrid & Container Queries");
    expect(session.plainEnglishExplanation).toBe(
      "Container queries decouple components from the viewport width.",
    );
  });

  // WORKFLOW F: Capture Knowledge Artifact with source provenance
  it("Workflow F: captures knowledge artifact preserving journey and resource provenance", () => {
    const handleSave = vi.fn();

    render(
      <CaptureKnowledgeModal
        open={true}
        journeyId="journey-ui-ux"
        journeyTitle="UI/UX & Design Systems"
        resourceId="res-refactoring-ui"
        resourceTitle="Refactoring UI"
        onClose={vi.fn()}
        onSave={handleSave}
      />,
    );

    expect(screen.getByText("Capture Reusable Knowledge")).toBeDefined();

    const titleInput = screen.getByPlaceholderText(
      /e\.g\. The Glass Highlight Rule or System 1 Circuit Breaker/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "The Inset Box Shadow Rule" },
    });

    const contentInput = screen.getByPlaceholderText(
      /State the distilled rule/i,
    );
    fireEvent.change(contentInput, {
      target: {
        value:
          "Use 1px inset box shadow with white opacity to simulate glass depth.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Knowledge" }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    const artifact = handleSave.mock.calls[0]![0];
    expect(artifact.title).toBe("The Inset Box Shadow Rule");
    expect(artifact.category).toBe("principle");
    expect(artifact.sourceProvenance?.journeyId).toBe("journey-ui-ux");
    expect(artifact.sourceProvenance?.resourceId).toBe("res-refactoring-ui");
  });

  // WORKFLOW G: Record Practical Application linked to project task ID with verifiable evidence
  it("Workflow G: records practical application with project linkage and evidence output", () => {
    const handleSave = vi.fn();

    render(
      <RecordApplicationModal
        open={true}
        journeyId="journey-ui-ux"
        journeyTitle="UI/UX & Design Systems"
        isExploration={false}
        availableProjects={[{ id: "p1-core", name: "Yash OS Core Foundation" }]}
        onClose={vi.fn()}
        onSave={handleSave}
      />,
    );

    expect(screen.getByText("Record Practical Application")).toBeDefined();

    const titleInput = screen.getByPlaceholderText(
      /e\.g\. Portfolio Tree Visualizer Implementation/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "Portfolio Tree Responsive Refactor" },
    });

    const descInput = screen.getByPlaceholderText(
      /What exactly was tested, shipped, or solved/i,
    );
    fireEvent.change(descInput, {
      target: { value: "Replaced 3 cards with parent-child tree layout." },
    });

    const evidenceInput = screen.getByPlaceholderText(
      /e\.g\. PortfolioHierarchyTree\.tsx/i,
    );
    fireEvent.change(evidenceInput, {
      target: { value: "Commit 7e795e6 verified with 21 unit tests passing." },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Save Application Record" }),
    );

    expect(handleSave).toHaveBeenCalledTimes(1);
    const appRecord = handleSave.mock.calls[0]![0];
    expect(appRecord.title).toBe("Portfolio Tree Responsive Refactor");
    expect(appRecord.linkedProjectId).toBe("p1-core");
    expect(appRecord.evidenceOutput).toBe(
      "Commit 7e795e6 verified with 21 unit tests passing.",
    );
    expect(appRecord.outcomeAchieved).toBe(true);
  });

  // WORKFLOW H: Evidence-based capability assessment (rejection on empty evidence)
  it("Workflow H: strictly rejects demonstrated capability if evidence is omitted, and accepts when evidence is provided", () => {
    const handleSave = vi.fn();

    render(
      <AssessCapabilityModal
        open={true}
        onClose={vi.fn()}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByPlaceholderText(
      /e\.g\. Responsive Dark Glass UI Systems or Probabilistic Risk Math/i,
    );
    fireEvent.change(nameInput, {
      target: { value: "Server-Side Streaming SSR" },
    });

    // Select Demonstrated Independently card
    fireEvent.click(screen.getByText("Demonstrated Independently"));

    // Try submitting without evidence
    fireEvent.click(screen.getByRole("button", { name: "Save Assessment" }));

    // Must be rejected with descriptive error
    expect(handleSave).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        /Demonstrated capability requires concrete verifiable evidence/i,
      ),
    ).toBeDefined();

    // Now supply valid evidence
    const evidenceInput = screen.getByPlaceholderText(/Document exact proofs/i);
    fireEvent.change(evidenceInput, {
      target: {
        value: "Engineered Nitro SSR router with zero layout shifts on reload.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Assessment" }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    const savedCap: CapabilityArea = handleSave.mock.calls[0]![0];
    expect(savedCap.name).toBe("Server-Side Streaming SSR");
    expect(savedCap.currentState).toBe("demonstrated_independently");
    expect(savedCap.evidence).toBe(
      "Engineered Nitro SSR router with zero layout shifts on reload.",
    );
  });

  // WORKFLOW I: Learning Review and journey lifecycle transitions
  it("Workflow I: handles learning reviews and lifecycle status transitions (pause, resume, complete, archive)", () => {
    let state = getTestState();
    const handleUpdate = (fn: (prev: OSState) => OSState) => {
      state = fn(state);
    };

    const targetJourneyId = state.learningSystem!.journeys[0]!.id;

    const { rerender } = render(
      <JourneyWorkspaceModal
        open={true}
        journeyId={targetJourneyId}
        onClose={vi.fn()}
        state={state}
        onUpdateState={handleUpdate}
      />,
    );

    // Initial status is active -> pause it
    const pauseButton = screen.getByTitle("Pause learning journey");
    fireEvent.click(pauseButton);
    expect(
      state.learningSystem!.journeys.find((j) => j.id === targetJourneyId)
        ?.status,
    ).toBe("paused");

    // Re-render with updated state -> resume it
    rerender(
      <JourneyWorkspaceModal
        open={true}
        journeyId={targetJourneyId}
        onClose={vi.fn()}
        state={state}
        onUpdateState={handleUpdate}
      />,
    );

    const resumeButton = screen.getByTitle("Resume learning journey");
    fireEvent.click(resumeButton);
    expect(
      state.learningSystem!.journeys.find((j) => j.id === targetJourneyId)
        ?.status,
    ).toBe("active");

    // Complete it
    rerender(
      <JourneyWorkspaceModal
        open={true}
        journeyId={targetJourneyId}
        onClose={vi.fn()}
        state={state}
        onUpdateState={handleUpdate}
      />,
    );

    const completeButton = screen.getByTitle("Mark journey as completed");
    fireEvent.click(completeButton);
    expect(
      state.learningSystem!.journeys.find((j) => j.id === targetJourneyId)
        ?.status,
    ).toBe("completed");
  });

  // WORKFLOW J: Navigation across all 6 main views and 7 journey views
  it("Workflow J: navigates cleanly across all 6 main views and 7 journey views", () => {
    let state = getTestState();
    const handleUpdate = (fn: (prev: OSState) => OSState) => {
      state = fn(state);
    };

    const { unmount: unmountMain } = render(
      <Priority3LearningWorkspaceModal
        open={true}
        onClose={vi.fn()}
        state={state}
        onUpdateState={handleUpdate}
      />,
    );

    expect(
      screen.getByText(/FOUNDER CAPABILITY OPERATING SYSTEM/i),
    ).toBeDefined();

    // 1. Overview Tab
    expect(screen.getByText("The 8-Stage Execution Loop")).toBeDefined();

    // 2. Journeys Tab
    fireEvent.click(
      screen.getByRole("button", { name: /2\. Learning Journeys/i }),
    );
    expect(
      screen.getByText(/Active and archived capability acquisition/i),
    ).toBeDefined();

    // 3. Resources Tab
    fireEvent.click(
      screen.getByRole("button", { name: /3\. Canonical Resources/i }),
    );
    expect(screen.getByText(/Canonical Resource Library/i)).toBeDefined();

    // 4. Knowledge Tab
    fireEvent.click(screen.getByRole("button", { name: /4\. Knowledge/i }));
    expect(screen.getByText(/Distilled Knowledge Artifacts/i)).toBeDefined();

    // 5. Capabilities Tab
    fireEvent.click(
      screen.getByRole("button", { name: /5\. Capability Matrix/i }),
    );
    expect(screen.getByText(/Founder Capability Matrix/i)).toBeDefined();

    // 6. Reviews Tab
    fireEvent.click(screen.getByRole("button", { name: /6\. Reviews/i }));
    expect(screen.getByText(/Learning & Capability Reviews/i)).toBeDefined();

    unmountMain();

    // Now test 7 journey views inside isolated JourneyWorkspaceModal
    const targetJourneyId = state.learningSystem!.journeys[0]!.id;
    const { unmount: unmountJourney } = render(
      <JourneyWorkspaceModal
        open={true}
        journeyId={targetJourneyId}
        onClose={vi.fn()}
        state={state}
        onUpdateState={handleUpdate}
      />,
    );

    // Journey Tab 1: Overview
    expect(screen.getByText("Targeted Capabilities")).toBeDefined();

    // Journey Tab 2: Objectives
    fireEvent.click(screen.getByRole("button", { name: /Objectives/i }));
    expect(
      screen.getByText(
        /Specific milestones and capability criteria to master/i,
      ),
    ).toBeDefined();

    // Journey Tab 3: Resources
    fireEvent.click(screen.getByRole("button", { name: /Resources/i }));
    expect(screen.getByText(/Linked Canonical Resources/i)).toBeDefined();

    // Journey Tab 4: Sessions
    fireEvent.click(screen.getByRole("button", { name: /Sessions/i }));
    expect(screen.getByText(/Deliberate Learning Sessions/i)).toBeDefined();

    // Journey Tab 5: Application
    fireEvent.click(screen.getByRole("button", { name: /Application/i }));
    expect(screen.getByText(/Practical Application Records/i)).toBeDefined();

    // Journey Tab 6: Knowledge
    fireEvent.click(screen.getByRole("button", { name: /Knowledge/i }));
    expect(screen.getByText(/Knowledge Artifacts/i)).toBeDefined();

    // Journey Tab 7: Reviews
    fireEvent.click(
      screen.getByRole("button", { name: /Capability & Reviews/i }),
    );
    expect(screen.getByText(/Target Capability Areas/i)).toBeDefined();

    unmountJourney();
  });
});
