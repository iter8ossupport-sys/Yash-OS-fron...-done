import { describe, expect, it } from "vitest";
import {
  updateTradingOperatingProfile,
  updateFinancialTransitionPlan,
  saveTradingStrategy,
  deleteTradingStrategy,
  saveTradingSystem,
  deleteTradingSystem,
  saveTradingAccount,
  deleteTradingAccount,
  recordTradingSession,
  recordFinancialPerformance,
  recordRiskIncident,
  updateTradingStage,
} from "../lib/os/logic";
import { validateTradingOperation } from "../lib/os/validation/schemas";
import { migrateOSState } from "../lib/os/reviews/migrations";
import type {
  OSState,
  TradingStrategy,
  TradingSystem,
  TradingAccount,
  TradingExecutionRecord,
  FinancialPerformanceRecord,
  TradingRiskIncident,
} from "../lib/os/types";

describe("Phase 3: Priority 2 Workstream A — Trading Operation Domain Logic", () => {
  const getBaseState = (): OSState => migrateOSState({});

  it("1. updates Trading Operating Profile and increments version", () => {
    const s0 = getBaseState();
    expect(s0.tradingOperation).toBeDefined();

    const s1 = updateTradingOperatingProfile(s0, {
      marketFocus: ["Futures (NQ / ES)", "Crude Oil (CL)"],
      riskRules: {
        maxDailyDrawdownCurrency: 750,
        maxTrailingDrawdownPercent: 6,
        maxRiskPerTradePercent: 1.5,
        hardStopRequired: true,
        leverageOrContractLimit: "3 contracts max",
        maxConsecutiveLosses: 3,
        circuitBreakerAction: "halve_risk",
      },
    });

    expect(s1.tradingOperation?.operatingProfile.marketFocus).toContain(
      "Crude Oil (CL)",
    );
    expect(
      s1.tradingOperation?.operatingProfile.riskRules.maxDailyDrawdownCurrency,
    ).toBe(750);
    expect(
      s1.tradingOperation?.operatingProfile.riskRules.circuitBreakerAction,
    ).toBe("halve_risk");
    expect(s1.tradingOperation?.operatingProfile.version).toBe(2);
  });

  it("2. updates Financial & Transition Plan and manages milestones", () => {
    const s0 = getBaseState();
    const s1 = updateFinancialTransitionPlan(s0, {
      targetMonthlyCashflow: 8000,
      monthlyLivingExpenses: 3000,
      cashAllocationPolicy: {
        livingExpensesPercent: 35,
        startupReinvestmentPercent: 40,
        capitalBufferPercent: 15,
        taxReservePercent: 10,
      },
    });

    expect(s1.tradingOperation?.financialPlan.targetMonthlyCashflow).toBe(8000);
    expect(s1.tradingOperation?.financialPlan.monthlyLivingExpenses).toBe(3000);
    expect(
      s1.tradingOperation?.financialPlan.cashAllocationPolicy
        ?.startupReinvestmentPercent,
    ).toBe(40);
    expect(s1.tradingOperation?.financialPlan.version).toBe(2);
  });

  it("3. manages Strategy and System relational hierarchy", () => {
    const s0 = getBaseState();

    const newStrategy: TradingStrategy = {
      id: "strat-orb-1",
      name: "NY Open Range Breakout (ORB)",
      assetClass: "futures",
      timeframe: "5m",
      rulesMarkdown: "Trade 09:30 - 10:00 range breaks with 15-tick stop",
      status: "active",
      stage: "backtesting",
      expectedWinRate: 60,
      expectedRiskReward: 2.2,
    };

    const s1 = saveTradingStrategy(s0, newStrategy);
    expect(
      s1.tradingOperation?.strategies.some((x) => x.id === "strat-orb-1"),
    ).toBe(true);

    const newSystem: TradingSystem = {
      id: "sys-orb-engine",
      name: "ORB Execution Script",
      strategyId: "strat-orb-1",
      automationLevel: "semi_automated",
      platformOrTech: "Python / IBKR API",
      status: "development",
    };

    const s2 = saveTradingSystem(s1, newSystem);
    expect(
      s2.tradingOperation?.systems.some((x) => x.id === "sys-orb-engine"),
    ).toBe(true);

    // Deleting strategy dissociates linked system safely without dangling crash
    const s3 = deleteTradingStrategy(s2, "strat-orb-1");
    expect(
      s3.tradingOperation?.strategies.some((x) => x.id === "strat-orb-1"),
    ).toBe(false);
    const orphanedSys = s3.tradingOperation?.systems.find(
      (x) => x.id === "sys-orb-engine",
    );
    expect(orphanedSys?.strategyId).toBe("");
  });

  it("4. records Trading Accounts with masked credentials and compliance classification", () => {
    const s0 = getBaseState();

    const account: TradingAccount = {
      id: "acc-apex-50k",
      institutionOrFirm: "Apex Trader Funding",
      accountType: "prop_firm_evaluation",
      identifierMasked: "****-9921",
      accountSize: 50000,
      currency: "USD",
      isFunded: false,
      status: "evaluating",
      maxDrawdownLimit: 2500,
      dailyLossLimit: 1000,
    };

    const s1 = saveTradingAccount(s0, account);
    expect(
      s1.tradingOperation?.accounts.some((a) => a.id === "acc-apex-50k"),
    ).toBe(true);

    const s2 = deleteTradingAccount(s1, "acc-apex-50k");
    expect(
      s2.tradingOperation?.accounts.some((a) => a.id === "acc-apex-50k"),
    ).toBe(false);
  });

  it("5. records daily execution session and scores discipline", () => {
    const s0 = getBaseState();

    const session: TradingExecutionRecord = {
      id: "exec-2026-11-03",
      date: "2026-11-03",
      strategyId: "strat-lbes-1",
      sessionType: "London",
      tradesCount: 2,
      disciplineScore: 5,
      ruleAdherence: true,
      netPnL: 420,
      isVerified: true,
      isConfidential: true,
      notes: "Followed breakout rule to the letter. Clean 2R winner.",
    };

    const s1 = recordTradingSession(s0, session);
    expect(s1.tradingOperation?.executionRecords.length).toBe(1);
    expect(s1.tradingOperation?.executionRecords[0]?.disciplineScore).toBe(5);
    expect(s1.tradingOperation?.executionRecords[0]?.ruleAdherence).toBe(true);
  });

  it("6. records financial performance and recalculates startup runway months", () => {
    const s0 = getBaseState();

    const perfRecord: FinancialPerformanceRecord = {
      id: "perf-2026-10",
      periodRef: "2026-10",
      grossPnL: 6200,
      feesAndCommissions: 200,
      totalNetCashExtracted: 6000,
      injectedToStartupFund: 2400, // 40% of net
      livingExpensesCovered: 2400,
      taxReserveAllocated: 600,
      runwayMonthsCalculated: 9.6, // $24,000 fund / $2500 monthly burn
      isVerified: true,
      confidential: false,
      verificationEvidence: "Bank wire receipt #BW-88912",
    };

    const s1 = recordFinancialPerformance(s0, perfRecord);
    expect(s1.tradingOperation?.performanceHistory.length).toBe(1);
    expect(s1.tradingOperation?.financialPlan.currentMonthlyCashflow).toBe(
      6000,
    );
    expect(
      s1.tradingOperation?.financialPlan.estimatedCurrentRunwayMonths,
    ).toBeGreaterThanOrEqual(6);
  });

  it("7. records risk incidents and audit deviations", () => {
    const s0 = getBaseState();

    const incident: TradingRiskIncident = {
      id: "risk-inc-1",
      date: "2026-11-03",
      severity: "warning",
      ruleType: "discipline",
      description: "Delayed manual exit by 2 minutes past session close",
      immediateActionTaken: "Closed trade immediately at market",
      preventionMeasure: "Set hard alarm 5 minutes before session cut-off",
    };

    const s1 = recordRiskIncident(s0, incident);
    expect(s1.tradingOperation?.riskIncidents?.length).toBe(1);
    expect(s1.tradingOperation?.riskIncidents?.[0]?.severity).toBe("warning");
  });

  it("8. updates trading development stage across operating profile", () => {
    const s0 = getBaseState();

    const s1 = updateTradingStage(s0, "live_funded");
    expect(s1.tradingOperation?.currentStage).toBe("live_funded");
    expect(s1.tradingOperation?.operatingProfile.developmentStage).toBe(
      "live_funded",
    );

    const valid = validateTradingOperation(s1.tradingOperation);
    expect(valid.success).toBe(true);
  });
});
