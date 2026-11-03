import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Priority2CashflowSection } from "@/components/os/projects/Priority2CashflowSection";
import { TradingOperationOverviewTab } from "@/components/os/trading/TradingOperationOverviewTab";
import { TradingOperatingProfileTab } from "@/components/os/trading/TradingOperatingProfileTab";
import { FinancialTransitionPlanTab } from "@/components/os/trading/FinancialTransitionPlanTab";
import { LegalComplianceEditorModal } from "@/components/os/projects/LegalComplianceEditorModal";
import type { Project, TradingOperation } from "@/lib/os/types";

const mockOperation: TradingOperation = {
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
    transitionMilestones: [
      {
        id: "tm-1",
        phase: "Phase 1: Living Expenses",
        targetCapital: 500000,
        monthlyYieldTarget: 60000,
        achieved: true,
        achievedAt: "2026-10-01T00:00:00Z",
        achievementEvidence: "Bank account payouts verified",
      },
    ],
    flexibleContent: "Financial notes",
    version: 1,
    updatedAt: "2026-11-03T10:00:00Z",
  },
  strategies: [
    {
      id: "strat-1",
      name: "London Breakout (LBES)",
      assetClass: "futures",
      timeframe: "15m",
      rulesMarkdown: "Break of London high/low",
      status: "active",
      stage: "paper_simulation",
      expectedWinRate: 58,
      expectedRiskReward: 2.1,
    },
  ],
  systems: [
    {
      id: "sys-1",
      name: "LBES PineScript Engine",
      strategyId: "strat-1",
      automationLevel: "semi_automated",
      platformOrTech: "TradingView",
      status: "live",
    },
  ],
  accounts: [
    {
      id: "acc-1",
      institutionOrFirm: "Apex Trader Funding",
      accountType: "prop_firm_evaluation",
      identifierMasked: "****-8831",
      accountSize: 50000,
      currency: "USD",
      isFunded: false,
      status: "active",
      maxDrawdownLimit: 2500,
    },
  ],
  experiments: [],
  executionRecords: [
    {
      id: "rec-1",
      date: "2026-11-02",
      sessionType: "London",
      tradesCount: 2,
      disciplineScore: 5,
      ruleAdherence: true,
      netPnL: 650,
      isVerified: true,
      isConfidential: true,
      notes: "Clean execution",
    },
  ],
  performanceHistory: [],
  riskIncidents: [],
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-03T10:00:00Z",
};

const mockFintechProject: Project = {
  id: "proj-fintech-1",
  name: "Alpaca Trade Router",
  objective: "Non-custodial algorithmic order execution bridge",
  priorityId: 2,
  workstream: "B",
  status: "active",
  hypothesis: "API execution eliminates slippage",
  milestone: "Audit regulatory exemptions",
  metrics: "< 50ms latency",
  bottlenecks: "Rate limiting",
  evidence: "",
  decisions: "",
  learning: "",
  documents: "",
  createdAt: "2026-11-01T00:00:00Z",
  complianceContent: {
    frameworkSummary: "Non-custodial technology provider framework",
    licensing: [
      {
        id: "lic-1",
        licenseType: "Broker-Dealer Registration",
        thresholdCriteria: "Custodial control",
        status: "verified_requirement",
        actionRequired: "Maintain strictly non-custodial software boundary",
      },
      {
        id: "lic-2",
        licenseType: "State Money Transmitter",
        thresholdCriteria: "Holding fiat reserves",
        status: "unresolved_question",
        actionRequired: "Review state-by-state money transmission statutes",
      },
    ],
    unresolvedQuestions: [
      {
        id: "q-1",
        question: "Does routing user-signed orders require state licensing?",
        impactSeverity: "blocking_public_launch",
        hypothesizedAnswer: "No, user retains exclusive private key control",
        requiredExpertise: "fintech_counsel",
        status: "open",
      },
    ],
  },
};

describe("Phase 3 Priority 2 Cashflow UI Components", () => {
  it("1. Priority2CashflowSection renders Workstream A card and Workstream B fintech project", () => {
    const handleWorkspace = vi.fn();
    const handleLog = vi.fn();
    const handleDetails = vi.fn();
    const handleCreate = vi.fn();
    const handleCompliance = vi.fn();

    render(
      <Priority2CashflowSection
        projects={[mockFintechProject]}
        tradingOperation={mockOperation}
        onOpenTradingWorkspace={handleWorkspace}
        onOpenRecordSession={handleLog}
        onOpenProjectDetails={handleDetails}
        onOpenCreateFintechProject={handleCreate}
        onOpenComplianceTracker={handleCompliance}
      />,
    );

    // Verify Workstream A elements
    expect(screen.getByText("Workstream A")).toBeDefined();
    expect(
      screen.getByText("Proprietary Trading Operation (LBES)"),
    ).toBeDefined();
    expect(screen.getByText(/paper simulation/i)).toBeDefined();

    // Verify Workstream B elements
    expect(screen.getByText("Workstream B")).toBeDefined();
    expect(screen.getByText("Fintech Product Development")).toBeDefined();
    expect(screen.getByText("Alpaca Trade Router")).toBeDefined();

    // Verify Document 6 compliance pill on fintech card
    const compliancePill = screen.getByText(/1 Verified • 1 Open Qs/i);
    expect(compliancePill).toBeDefined();

    // Test clicking compliance pill
    fireEvent.click(compliancePill);
    expect(handleCompliance).toHaveBeenCalledWith(mockFintechProject);
  });

  it("2. TradingOperationOverviewTab renders stage progression and supports confidential masking", () => {
    const handleUpdateStage = vi.fn();
    const handleToggleStatus = vi.fn();
    const handleOpenRecord = vi.fn();
    const handleNavigate = vi.fn();

    // Render with confidential mode FALSE
    const { rerender } = render(
      <TradingOperationOverviewTab
        operation={mockOperation}
        isConfidential={false}
        onUpdateStage={handleUpdateStage}
        onToggleStatus={handleToggleStatus}
        onOpenRecordSession={handleOpenRecord}
        onNavigateTab={handleNavigate}
      />,
    );

    // Should render unmasked currency
    expect(screen.getByText(/75,000/)).toBeDefined();
    expect(screen.getByText(/8 Months/)).toBeDefined();
    expect(screen.getByText(/100% Rule Adherence/)).toBeDefined();

    // Click stage 4 (Evaluation)
    const evalButton = screen.getByText("4. Evaluation");
    fireEvent.click(evalButton);
    expect(handleUpdateStage).toHaveBeenCalledWith("evaluation");

    // Rerender with confidential mode TRUE
    rerender(
      <TradingOperationOverviewTab
        operation={mockOperation}
        isConfidential={true}
        onUpdateStage={handleUpdateStage}
        onToggleStatus={handleToggleStatus}
        onOpenRecordSession={handleOpenRecord}
        onNavigateTab={handleNavigate}
      />,
    );

    // Should mask monetary values with asterisks
    expect(screen.getAllByText("₹***,***").length).toBeGreaterThan(0);
  });

  it("3. TradingOperatingProfileTab renders non-negotiable risk rules matrix and routines", () => {
    const handleSave = vi.fn();

    render(
      <TradingOperatingProfileTab
        profile={mockOperation.operatingProfile}
        onSave={handleSave}
      />,
    );

    expect(screen.getByText(/Non-Negotiable Risk Rules Matrix/i)).toBeDefined();
    expect(
      screen.getByText(/Mandatory Hard Stop Required on Order Entry/i),
    ).toBeDefined();
    expect(screen.getByText(/Economic calendar review/)).toBeDefined();
    expect(screen.getByText(/Key S\/R marking/)).toBeDefined();

    // Save profile
    const saveBtn = screen.getByText("Save Profile");
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalled();
  });

  it("4. FinancialTransitionPlanTab calculates cash allocation policy total and displays milestones", () => {
    const handleSave = vi.fn();

    render(
      <FinancialTransitionPlanTab
        plan={mockOperation.financialPlan}
        isConfidential={false}
        onSave={handleSave}
      />,
    );

    // Check policy 100% target badge
    expect(screen.getByText("Total: 100%")).toBeDefined();
    expect(screen.getByText("Phase 1: Living Expenses")).toBeDefined();
    expect(
      screen.getByText("Evidence: Bank account payouts verified"),
    ).toBeDefined();
  });

  it("5. LegalComplianceEditorModal displays prominent non-legal advice notice and governs 9 dimensions", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <LegalComplianceEditorModal
        project={mockFintechProject}
        open={true}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    // Prominent disclaimer banner
    expect(
      screen.getByText(
        /NON-LEGAL ADVICE NOTICE & REGULATORY ARCHITECTURE REGISTER/i,
      ),
    ).toBeDefined();

    // Dimension tabs
    expect(screen.getByText(/1. Classification/i)).toBeDefined();
    expect(screen.getByText(/2. Jurisdictions/i)).toBeDefined();
    expect(screen.getByText(/3. Licensing/i)).toBeDefined();
    expect(screen.getByText(/4. Data & Privacy/i)).toBeDefined();
    expect(screen.getByText(/5. Disclosures/i)).toBeDefined();
    expect(screen.getByText(/6. Counterparties/i)).toBeDefined();
    expect(screen.getByText(/7. Evidence/i)).toBeDefined();
    expect(screen.getByText(/8. Questions/i)).toBeDefined();
    expect(screen.getByText(/9. Formal Counsel/i)).toBeDefined();
  });
});
