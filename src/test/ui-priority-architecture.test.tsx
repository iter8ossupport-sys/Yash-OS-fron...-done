import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import * as fs from "node:fs";
import * as path from "node:path";
import { initialState, today } from "@/lib/os/seed";
import {
  ensureCanonicalProjectDocuments,
  ensureWorkstreamBDocuments,
  saveProject,
} from "@/lib/os/logic";
import type {
  Project,
  ProjectDocument,
  TradingOperation,
  OSState,
} from "@/lib/os/types";
import { ProjectDocumentsTab } from "@/components/os/projects/ProjectDocumentsTab";
import { ProjectDetailsModal } from "@/components/os/projects/ProjectDetailsModal";
import { PortfolioHierarchyTree } from "@/components/os/projects/PortfolioHierarchyTree";
import { LearningWorkspaceModal } from "@/components/os/projects/LearningWorkspaceModal";
import { Priority3LearningWorkspaceModal } from "@/components/os/learning/Priority3LearningWorkspaceModal";
import { createDefaultLearningSystem } from "@/lib/os/learning/state";
import { AppShell } from "@/components/os/AppShell";

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

vi.mock("@/lib/os/store", () => ({
  useOS: vi.fn(() => ({
    state: initialState,
    update: vi.fn(),
    setGoalsOpen: vi.fn(),
  })),
}));

const mockTradingOp: TradingOperation = {
  id: "op-test-1",
  name: "Proprietary Trading Operation (LBES)",
  status: "active",
  currentStage: "paper_simulation",
  operatingProfile: {
    id: "profile-1",
    title: "Trading Operating Profile",
    marketFocus: ["NQ Futures", "ES"],
    coreEdgeDescription:
      "Opening range breakout with volatility expansion confirmation",
    riskRules: {
      maxDailyDrawdownCurrency: 500,
      maxTrailingDrawdownPercent: 3,
      maxRiskPerTradePercent: 1,
      hardStopRequired: true,
      leverageOrContractLimit: "2 Mini / 10 Micro",
      maxConsecutiveLosses: 3,
      circuitBreakerAction: "stop_for_day",
    },
    routines: {
      preMarketPrepChecklist: ["Economic calendar review", "Key S/R marking"],
      postMarketReviewChecklist: ["Log trades", "Review discipline"],
      inTradeExecutionChecklist: ["Bracket stop check"],
    },
    flexibleContent: "LBES Strategy Rules",
    version: 1,
    updatedAt: "2026-11-03T10:00:00Z",
  },
  financialPlan: {
    id: "plan-1",
    title: "Financial & Transition Plan",
    targetMonthlyCashflow: 200000,
    currentMonthlyCashflow: 75000,
    monthlyLivingExpenses: 60000,
    startupRunwayMonthsTarget: 12,
    estimatedCurrentRunwayMonths: 8,
    cashAllocationPolicy: {
      livingExpensesPercent: 40,
      startupReinvestmentPercent: 30,
      capitalBufferPercent: 20,
      taxReservePercent: 10,
    },
    transitionMilestones: [],
    flexibleContent: "Target Monthly Cashflow: $200k",
    version: 1,
    updatedAt: "2026-11-03T10:00:00Z",
  },
  strategies: [],
  systems: [],
  accounts: [],
  experiments: [],
  executionRecords: [],
  performanceHistory: [],
  riskIncidents: [],
  createdAt: "2026-11-03T10:00:00Z",
  updatedAt: "2026-11-03T10:00:00Z",
};

describe("1. Portfolio Hierarchy Redesign", () => {
  const p1Project: Project = {
    id: "p1-core",
    name: "Autonomous Agent Core",
    objective: "Ship production multi-agent system",
    status: "active",
    priorityId: 1,
    hypothesis: "Local execution eliminates API latency",
    milestone: "Complete memory hydration",
    metrics: "Sub-10ms response",
    bottlenecks: "Token context overhead",
    evidence: "",
    decisions: "",
    learning: "",
    documents: "",
    docs: [],
    createdAt: today(),
    deadline: "2026-12-01",
  };

  const p2FintechProject: Project = {
    id: "p2-fintech-gateway",
    name: "Non-Custodial Settlement Gateway",
    objective: "Zero-custody automated escrow routing",
    status: "active",
    priorityId: 2,
    workstream: "B",
    hypothesis: "Direct smart contracts bypass regulatory pooling",
    milestone: "Testnet audit deployment",
    metrics: "Volume routed",
    bottlenecks: "RPC node rate limits",
    evidence: "",
    decisions: "",
    learning: "",
    documents: "",
    docs: [],
    createdAt: today(),
    deadline: "2026-11-30",
  };

  const p3LearningProject: Project = {
    id: "p3-systems-lab",
    name: "Distributed Systems Lab",
    objective: "Master Paxos and Raft consensus implementations",
    status: "active",
    priorityId: 3,
    hypothesis: "Building Raft in Go crystallizes leader election edge cases",
    milestone: "Pass network partition tests",
    metrics: "Test suites passed",
    bottlenecks: "",
    evidence: "",
    decisions: "",
    learning: "",
    documents: "",
    docs: [],
    createdAt: today(),
  };

  const allProjects = [p1Project, p2FintechProject, p3LearningProject];

  it("renders Portfolio Root with metrics and New Project button", () => {
    const onOpenCreateProject = vi.fn();
    render(
      <PortfolioHierarchyTree
        projects={allProjects}
        tradingOperation={mockTradingOp}
        onOpenProjectDetails={vi.fn()}
        onOpenCreateProject={onOpenCreateProject}
        onOpenTradingWorkspace={vi.fn()}
        onOpenRecordSession={vi.fn()}
        onOpenLearningWorkspace={vi.fn()}
      />,
    );

    expect(screen.getByText("Yash OS Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Root")).toBeInTheDocument();
    expect(screen.getByText("3 Permanent")).toBeInTheDocument();
    expect(screen.getByText("2 Branches (A & B)")).toBeInTheDocument();

    const newProjBtn = screen.getByRole("button", { name: /New Project/i });
    fireEvent.click(newProjBtn);
    expect(onOpenCreateProject).toHaveBeenCalledTimes(1);
  });

  it("renders 3 distinct strategic branches with parent-child directional cues", () => {
    render(
      <PortfolioHierarchyTree
        projects={allProjects}
        tradingOperation={mockTradingOp}
        onOpenProjectDetails={vi.fn()}
        onOpenCreateProject={vi.fn()}
        onOpenTradingWorkspace={vi.fn()}
        onOpenRecordSession={vi.fn()}
        onOpenLearningWorkspace={vi.fn()}
      />,
    );

    expect(screen.getByText("Founder Capability")).toBeInTheDocument();
    expect(screen.getByText("Cashflow Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("Learning for Execution")).toBeInTheDocument();
  });

  it("renders Priority 2 with two distinct child branches: Workstream A and Workstream B", () => {
    const onOpenTradingWorkspace = vi.fn();
    const onOpenRecordSession = vi.fn();
    const onOpenCreateProject = vi.fn();

    render(
      <PortfolioHierarchyTree
        projects={allProjects}
        tradingOperation={mockTradingOp}
        onOpenProjectDetails={vi.fn()}
        onOpenCreateProject={onOpenCreateProject}
        onOpenTradingWorkspace={onOpenTradingWorkspace}
        onOpenRecordSession={onOpenRecordSession}
        onOpenLearningWorkspace={vi.fn()}
      />,
    );

    // Child Branch 2A: Workstream A
    expect(screen.getByText("Workstream A")).toBeInTheDocument();
    expect(screen.getByText("Trading Operation")).toBeInTheDocument();
    expect(
      screen.getByText("Proprietary Trading Operation (LBES)"),
    ).toBeInTheDocument();
    expect(screen.getByText("paper simulation")).toBeInTheDocument();
    expect(screen.getByText(/\$2[0,]+000\/mo/)).toBeInTheDocument();

    const tradingWorkspaceBtn = screen.getByTitle("Open Trading Workspace");
    fireEvent.click(tradingWorkspaceBtn);
    expect(onOpenTradingWorkspace).toHaveBeenCalledTimes(1);

    const recordSessionBtn = screen.getByRole("button", {
      name: /Quick Record Session/i,
    });
    fireEvent.click(recordSessionBtn);
    expect(onOpenRecordSession).toHaveBeenCalledTimes(1);

    // Child Branch 2B: Workstream B
    expect(screen.getByText("Workstream B")).toBeInTheDocument();
    expect(screen.getByText("Fintech Product Development")).toBeInTheDocument();
    expect(
      screen.getByText("Non-Custodial Settlement Gateway"),
    ).toBeInTheDocument();
    expect(screen.getByText("Docs 6/6 Standardized")).toBeInTheDocument();

    const addFintechBtn = screen.getByRole("button", {
      name: /Add Fintech Project/i,
    });
    fireEvent.click(addFintechBtn);
    expect(onOpenCreateProject).toHaveBeenCalledWith(2, "B");
  });

  it("clicking a project card or directional arrow triggers onOpenProjectDetails", () => {
    const onOpenProjectDetails = vi.fn();

    render(
      <PortfolioHierarchyTree
        projects={allProjects}
        tradingOperation={mockTradingOp}
        onOpenProjectDetails={onOpenProjectDetails}
        onOpenCreateProject={vi.fn()}
        onOpenTradingWorkspace={vi.fn()}
        onOpenRecordSession={vi.fn()}
        onOpenLearningWorkspace={vi.fn()}
      />,
    );

    // Click Priority 1 project
    const p1Card = screen
      .getByText("Autonomous Agent Core")
      .closest("div[role='button']");
    expect(p1Card).toBeInTheDocument();
    fireEvent.click(p1Card!);
    expect(onOpenProjectDetails).toHaveBeenCalledWith("p1-core");

    // Click Priority 2 Fintech project
    const p2Card = screen
      .getByText("Non-Custodial Settlement Gateway")
      .closest("div[role='button']");
    expect(p2Card).toBeInTheDocument();
    fireEvent.click(p2Card!);
    expect(onOpenProjectDetails).toHaveBeenCalledWith("p2-fintech-gateway");
  });
});

describe("2. Priority 2 — Restore All Six Workstream B Documents", () => {
  const baseFintechProject: Project = {
    id: "fintech-doc-test",
    name: "Fintech Settlement Router",
    objective: "Non-custodial routing pipeline",
    status: "active",
    priorityId: 2,
    workstream: "B",
    hypothesis: "Client-side execution eliminates custodian liabilities",
    milestone: "Complete architecture brief & compliance mapping",
    metrics: "$100k daily volume",
    bottlenecks: "WebSocket throughput",
    evidence: "Pilot interview with 3 proprietary trading firms",
    decisions: "ADR-001: Select WebSockets over long polling",
    learning: "Nitro server engine minimizes SSR hydration overhead",
    documents: "",
    docs: [],
    createdAt: today(),
  };

  it("ensureCanonicalProjectDocuments initializes all 6 documents and Structured Execution Plan", () => {
    const normalized = ensureCanonicalProjectDocuments(baseFintechProject);

    expect(normalized.docs).toBeDefined();
    expect(normalized.docs?.length).toBe(6);

    const docTypes = normalized.docs?.map((d) => ("type" in d ? d.type : null));
    expect(docTypes).toContain("project_brief");
    expect(docTypes).toContain("execution_plan");
    expect(docTypes).toContain("evidence_experiments");
    expect(docTypes).toContain("decisions_history");
    expect(docTypes).toContain("methods_knowledge");
    expect(docTypes).toContain("legal_compliance");

    // Authoritative executionPlan structured state exists
    expect(normalized.executionPlan).toBeDefined();
    expect(normalized.executionPlan?.currentApproved.version).toBe(1);
    expect(normalized.complianceContent).toBeDefined();
  });

  it("strictly enforces Document 6 removal on Priority 1 and Workstream A projects", () => {
    const p1Project: Project = {
      ...baseFintechProject,
      priorityId: 1,
      workstream: undefined,
    };
    const normalizedP1 = ensureCanonicalProjectDocuments(p1Project);
    expect(normalizedP1.docs?.length).toBe(5);
    expect(
      normalizedP1.docs?.some(
        (d) => "type" in d && d.type === "legal_compliance",
      ),
    ).toBe(false);

    const p2AProject: Project = {
      ...baseFintechProject,
      priorityId: 2,
      workstream: "A",
    };
    const normalizedP2A = ensureCanonicalProjectDocuments(p2AProject);
    expect(normalizedP2A.docs?.length).toBe(5);
    expect(
      normalizedP2A.docs?.some(
        (d) => "type" in d && d.type === "legal_compliance",
      ),
    ).toBe(false);
  });

  it("ProjectDocumentsTab renders all 6 documents with functional buttons", () => {
    const normalized = ensureCanonicalProjectDocuments(baseFintechProject);
    const onOpenDocEditor = vi.fn();
    const onOpenStructuredPlan = vi.fn();
    const onOpenComplianceEditor = vi.fn();

    render(
      <ProjectDocumentsTab
        draft={normalized}
        onOpenDocEditor={onOpenDocEditor}
        onOpenStructuredPlan={onOpenStructuredPlan}
        onOpenComplianceEditor={onOpenComplianceEditor}
      />,
    );

    expect(
      screen.getByText(
        "Six Standardized Project Documents (Fintech Operations)",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Docs 6/6 Standardized")).toBeInTheDocument();

    // Verify Doc 1
    const briefBtn = screen.getByRole("button", {
      name: /Open \/ Edit Brief/i,
    });
    fireEvent.click(briefBtn);
    expect(onOpenDocEditor).toHaveBeenCalledTimes(1);

    // Verify Doc 2
    const planBtn = screen.getByRole("button", {
      name: /Manage Execution Plan/i,
    });
    fireEvent.click(planBtn);
    expect(onOpenStructuredPlan).toHaveBeenCalledTimes(1);

    // Verify Doc 3
    const evidenceBtn = screen.getByRole("button", {
      name: /Open \/ Edit Evidence/i,
    });
    fireEvent.click(evidenceBtn);
    expect(onOpenDocEditor).toHaveBeenCalledTimes(2);

    // Verify Doc 4
    const decisionsBtn = screen.getByRole("button", {
      name: /Open \/ Edit Decisions/i,
    });
    fireEvent.click(decisionsBtn);
    expect(onOpenDocEditor).toHaveBeenCalledTimes(3);

    // Verify Doc 5
    const methodsBtn = screen.getByRole("button", {
      name: /Open \/ Edit Methods/i,
    });
    fireEvent.click(methodsBtn);
    expect(onOpenDocEditor).toHaveBeenCalledTimes(4);

    // Verify Doc 6
    const complianceBtn = screen.getByRole("button", {
      name: /Open Legal & Compliance Tracker/i,
    });
    fireEvent.click(complianceBtn);
    expect(onOpenComplianceEditor).toHaveBeenCalledTimes(1);
  });

  it("ProjectDetailsModal opens Document 1, edits content, saves, and reopens with persistent content", () => {
    const onSave = vi.fn();
    const normalized = ensureCanonicalProjectDocuments(baseFintechProject);

    render(
      <ProjectDetailsModal
        project={normalized}
        isActive={false}
        onClose={vi.fn()}
        onSave={onSave}
        onDelete={vi.fn()}
        onSetActive={vi.fn()}
        onOpenDocEditor={vi.fn()}
      />,
    );

    // Switch to documents tab
    const docsTabBtn = screen.getByRole("button", { name: /6 Documents/i });
    fireEvent.click(docsTabBtn);

    // Open Doc 1: Brief
    const briefBtn = screen.getByRole("button", {
      name: /Open \/ Edit Brief/i,
    });
    fireEvent.click(briefBtn);

    // Document editor modal is open
    expect(
      screen.getByText(/Edit Document: Project Brief/i),
    ).toBeInTheDocument();

    // Edit content
    const textarea = screen.getByPlaceholderText(/Write markdown, notes/i);
    fireEvent.change(textarea, {
      target: { value: "Updated architecture thesis for European deployment." },
    });

    // Save document
    const saveDocBtn = screen.getByRole("button", { name: /Save Document/i });
    fireEvent.click(saveDocBtn);

    // onSave was called with updated project
    expect(onSave).toHaveBeenCalled();
    const savedProject = onSave.mock.calls.at(-1)?.[0] as Project;
    const updatedBrief = savedProject.docs?.find(
      (d) => "type" in d && (d as ProjectDocument).type === "project_brief",
    ) as ProjectDocument;
    expect(updatedBrief.content).toBe(
      "Updated architecture thesis for European deployment.",
    );

    // Reopen brief and verify content persisted
    fireEvent.click(briefBtn);
    expect(
      screen.getByDisplayValue(
        "Updated architecture thesis for European deployment.",
      ),
    ).toBeInTheDocument();
  });
});

describe("3. UI Polish & Viewport Integrity", () => {
  it("enforces root background dark color, scrollbar rules, and atmosphere offset to prevent white edges", () => {
    const cssPath = path.resolve(process.cwd(), "src/styles.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // .dark has color-scheme dark and dark background, :root has light theme background
    expect(cssContent).toMatch(/\.dark\s*\{[^}]*color-scheme:\s*dark;/);
    expect(cssContent).toMatch(
      /\.dark\s*\{[^}]*--background:\s*oklch\(0\.13\s*0\.04\s*265\);/,
    );
    expect(cssContent).toMatch(
      /:root\s*\{[^}]*--background:\s*oklch\(0\.97\s*0\.008\s*250\);/,
    );

    // html and body dark background and sizing
    expect(cssContent).toMatch(
      /html\s*\{[^}]*background-color:\s*var\(--color-background\);/,
    );
    expect(cssContent).toMatch(
      /body\s*\{[^}]*background-color:\s*var\(--color-background\);/,
    );
    expect(cssContent).toMatch(/overflow-x:\s*hidden;/);

    // atmosphere inset: -5% prevents background drift from showing white canvas edge
    expect(cssContent).toMatch(/@utility atmosphere\s*\{[^}]*inset:\s*-5%;/);
    expect(cssContent).toMatch(/@utility atmosphere\s*\{[^}]*width:\s*110%;/);
    expect(cssContent).toMatch(/@utility atmosphere\s*\{[^}]*height:\s*110%;/);

    // Dark scrollbars across the application
    expect(cssContent).toContain("*::-webkit-scrollbar");
    expect(cssContent).toContain("*::-webkit-scrollbar-track");
    expect(cssContent).toContain("*::-webkit-scrollbar-thumb");
  });

  it("renders AppShell root container with full-width, background, and overflow protection", () => {
    const { container } = render(
      <AppShell>
        <div data-testid="child-content">App Shell Content</div>
      </AppShell>,
    );

    const rootWrapper = container.firstChild as HTMLElement;
    expect(rootWrapper.className).toContain("w-full");
    expect(rootWrapper.className).toContain("bg-background");
    expect(rootWrapper.className).toContain("overflow-x-hidden");
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("toggles theme between dark and light when clicking top-right theme toggle button", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    const themeToggleBtn = screen.getByLabelText("Toggle theme");
    expect(themeToggleBtn).toBeInTheDocument();
    fireEvent.click(themeToggleBtn);
  });
});

describe("4. Priority 3 Learning & Capability Architectural Integration & Regression Safeguards", () => {
  it("Priority 3 entry point in PortfolioHierarchyTree triggers onOpenLearningWorkspace callback", () => {
    const handleOpenLearning = vi.fn();
    render(
      <PortfolioHierarchyTree
        projects={initialState.projects}
        tradingOperation={mockTradingOp}
        onOpenProjectDetails={vi.fn()}
        onOpenCreateProject={vi.fn()}
        onOpenTradingWorkspace={vi.fn()}
        onOpenRecordSession={vi.fn()}
        onOpenLearningWorkspace={handleOpenLearning}
      />,
    );

    const workspaceBtn = screen.getByTitle("Open Learning Workspace");
    expect(workspaceBtn).toBeInTheDocument();
    fireEvent.click(workspaceBtn);
    expect(handleOpenLearning).toHaveBeenCalledTimes(1);
  });

  it("Priority 3 project card in PortfolioHierarchyTree triggers onOpenLearningWorkspace with project ID", () => {
    const handleOpenLearning = vi.fn();
    const handleOpenDetails = vi.fn();
    render(
      <PortfolioHierarchyTree
        projects={initialState.projects}
        tradingOperation={mockTradingOp}
        onOpenProjectDetails={handleOpenDetails}
        onOpenCreateProject={vi.fn()}
        onOpenTradingWorkspace={vi.fn()}
        onOpenRecordSession={vi.fn()}
        onOpenLearningWorkspace={handleOpenLearning}
      />,
    );

    const p3ProjectTitle = screen.getByText("Product + Trading Skills");
    expect(p3ProjectTitle).toBeInTheDocument();
    fireEvent.click(p3ProjectTitle);
    expect(handleOpenLearning).toHaveBeenCalledWith("demo-skills");
  });

  it("Priority3LearningWorkspaceModal renders all 6 main views (Overview, Journeys, Resources, Knowledge, Capabilities, Reviews)", () => {
    const testState: OSState = {
      ...initialState,
      learningSystem: createDefaultLearningSystem(),
    };
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <Priority3LearningWorkspaceModal
        open={true}
        onClose={handleClose}
        state={testState}
        onUpdateState={handleUpdate}
      />,
    );

    // Verify modal title
    expect(
      screen.getByText("Priority 3: Learning & Capability Development System"),
    ).toBeInTheDocument();

    // Verify 6 main views navigation tabs exist
    expect(
      screen.getByRole("button", { name: /1\.\s*Overview/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /2\.\s*Learning Journeys/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /3\.\s*Canonical Resources/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /4\.\s*Knowledge/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /5\.\s*Capability Matrix/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /6\.\s*Reviews/i }),
    ).toBeInTheDocument();

    // Verify tab switching to all views
    fireEvent.click(
      screen.getByRole("button", { name: /2\.\s*Learning Journeys/i }),
    );
    expect(
      screen.getByText(/Active and archived capability acquisition/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /3\.\s*Canonical Resources/i }),
    );
    expect(screen.getByText(/Canonical Resource Library/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /4\.\s*Knowledge/i }));
    expect(
      screen.getByText(/Distilled Knowledge Artifacts/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /5\.\s*Capability Matrix/i }),
    );
    expect(screen.getByText(/Founder Capability Matrix/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /6\.\s*Reviews/i }));
    expect(
      screen.getByRole("button", { name: /Conduct Review/i }),
    ).toBeInTheDocument();
  });

  it("legacy generic 8-stage text is not present, and LearningWorkspaceModal adapter safely forwards to Priority3LearningWorkspaceModal", () => {
    render(<LearningWorkspaceModal open={true} onClose={vi.fn()} />);

    // Should NOT have the legacy static text
    expect(
      screen.queryByText(/2\.\s*Foundational Domains/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Hypothesis & Bottleneck Scoping"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("The Iron Law of Learning for Execution"),
    ).not.toBeInTheDocument();

    // MUST render the authoritative Priority 3 header
    expect(
      screen.getByText("Priority 3: Learning & Capability Development System"),
    ).toBeInTheDocument();
  });

  it("persists journey mutations cleanly through onUpdateState", () => {
    let currentState: OSState = {
      ...initialState,
      learningSystem: createDefaultLearningSystem(),
    };
    const handleUpdate = vi.fn((updater: (s: OSState) => OSState) => {
      currentState = updater(currentState);
    });

    render(
      <Priority3LearningWorkspaceModal
        open={true}
        onClose={vi.fn()}
        state={currentState}
        onUpdateState={handleUpdate}
      />,
    );

    // Click New Journey
    const newJourneyBtn = screen.getByRole("button", { name: /New Journey/i });
    fireEvent.click(newJourneyBtn);

    // Enter journey title and submit
    const titleInput = screen.getByPlaceholderText(
      /Design Systems Engineering/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "Regression Shielded Journey" },
    });

    const createBtn = screen.getByRole("button", { name: /Create Journey/i });
    fireEvent.click(createBtn);

    expect(handleUpdate).toHaveBeenCalled();
    expect(
      currentState.learningSystem?.journeys.some(
        (j) => j.title === "Regression Shielded Journey",
      ),
    ).toBe(true);
  });
});
