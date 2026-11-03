export interface TradingRiskRules {
  maxDailyDrawdownCurrency: number;
  maxTrailingDrawdownPercent: number;
  maxRiskPerTradePercent: number;
  hardStopRequired: boolean;
  leverageOrContractLimit: string;
}

export interface TradingRoutines {
  preMarketPrepChecklist: string[];
  postMarketReviewChecklist: string[];
}

export interface TradingOperatingProfile {
  id: string;
  title: string; // "Trading Operating Profile"
  marketFocus: string[]; // e.g. ["NQ Futures", "ES", "FX Major Pairs"]
  coreEdgeDescription: string;
  riskRules: TradingRiskRules;
  routines: TradingRoutines;
  flexibleContent: string; // Markdown for playbooks and setup conditions
  version: number;
  updatedAt: string;
}

export interface TransitionMilestone {
  id: string;
  phase: string; // e.g. "Phase 1: Cover living costs", "Phase 2: Fund seed runway"
  targetCapital: number;
  monthlyYieldTarget: number;
  achieved: boolean;
}

export interface FinancialTransitionPlan {
  id: string;
  title: string; // "Financial & Transition Plan"
  targetMonthlyCashflow: number;
  currentMonthlyCashflow: number;
  startupRunwayMonthsTarget: number;
  estimatedCurrentRunwayMonths: number;
  transitionMilestones: TransitionMilestone[];
  flexibleContent: string;
  version: number;
  updatedAt: string;
}

export interface TradingStrategy {
  id: string;
  name: string; // e.g. "London Breakout Execution System (LBES)", "NY Open ORB"
  assetClass: "futures" | "equities" | "forex" | "crypto" | "options";
  timeframe: string;
  rulesMarkdown: string;
  status: "incubating" | "active" | "paused" | "retired";
  expectedWinRate?: number | undefined;
  expectedRiskReward?: number | undefined;
}

export interface TradingSystem {
  id: string;
  name: string; // e.g. "LBES Execution Engine v1"
  strategyId: string;
  automationLevel: "manual" | "semi_automated" | "fully_automated";
  platformOrTech: string; // e.g. "TradingView / PineScript", "Python / Interactive Brokers"
  status: "development" | "live" | "deprecated";
}

export interface TradingAccount {
  id: string;
  institutionOrFirm: string; // e.g. "Apex Trader Funding", "Interactive Brokers"
  accountType:
    "prop_firm_evaluation" | "prop_firm_funded" | "live_personal" | "corporate";
  identifierMasked: string; // e.g. "****-8831" (never store plaintext broker credentials)
  accountSize: number;
  currency: string;
  isFunded: boolean;
  status: "active" | "evaluating" | "suspended" | "closed";
}

export interface TradingExperiment {
  id: string;
  hypothesis: string;
  strategyId?: string | undefined;
  startDate: string;
  endDate?: string | undefined;
  tradesPlanned: number;
  tradesExecuted: number;
  findings: string;
  validated: boolean;
}

export interface TradingExecutionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  strategyId?: string | undefined;
  accountId?: string | undefined;
  sessionType: "London" | "New York" | "Asian" | "Off-Hours";
  tradesCount: number;
  disciplineScore: number; // 1 to 5
  ruleAdherence: boolean;
  netPnL?: number | undefined; // Sensitive: Redacted by default in non-financial exports
  isVerified: boolean; // Reconciled against broker statement
  isConfidential: boolean; // Enforces strict tokenized redaction
  notes: string;
}

export interface FinancialPerformanceRecord {
  id: string;
  periodRef: string; // YYYY-MM or YYYY-Www
  totalNetCashExtracted: number;
  injectedToStartupFund: number;
  runwayMonthsCalculated: number;
  isVerified: boolean;
  confidential: boolean;
}

/** Root Master Trading Operation Entity (Priority 2A) */
export interface TradingOperation {
  id: string;
  name: string; // Default: "Proprietary Trading Operation (LBES)"
  status: "active" | "paused";
  operatingProfile: TradingOperatingProfile;
  financialPlan: FinancialTransitionPlan;
  strategies: TradingStrategy[];
  systems: TradingSystem[];
  accounts: TradingAccount[];
  experiments: TradingExperiment[];
  executionRecords: TradingExecutionRecord[];
  performanceHistory: FinancialPerformanceRecord[];
  createdAt: string;
  updatedAt: string;
}
