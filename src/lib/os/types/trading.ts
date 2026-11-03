export type TradingDevelopmentStage =
  | "research" // Market research, theoretical edge discovery
  | "backtesting" // Quantitative validation against historical data
  | "paper_simulation" // Real-time market execution without financial risk
  | "evaluation" // Prop firm evaluation or personal proof-of-concept
  | "live_funded" // Live capital deployment or funded prop account
  | "scaling"; // Multi-contract / multi-account capital scaling

export interface TradingRiskRules {
  maxDailyDrawdownCurrency: number;
  maxTrailingDrawdownPercent: number;
  maxRiskPerTradePercent: number;
  hardStopRequired: boolean;
  leverageOrContractLimit: string;
  maxConsecutiveLosses?: number | undefined;
  circuitBreakerAction?:
    "stop_for_day" | "halve_risk" | "review_required" | undefined;
}

export interface TradingRoutines {
  preMarketPrepChecklist: string[];
  postMarketReviewChecklist: string[];
  inTradeExecutionChecklist?: string[] | undefined;
}

export interface TradingOperatingProfile {
  id: string;
  title: string; // "Trading Operating Profile"
  marketFocus: string[]; // e.g. ["NQ Futures", "ES", "FX Major Pairs"]
  coreEdgeDescription: string;
  developmentStage?: TradingDevelopmentStage | undefined;
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
  prerequisitesSummary?: string | undefined;
  transitionTriggerConditions?: string[] | undefined;
  achieved: boolean;
  achievedAt?: string | undefined;
  achievementEvidence?: string | undefined;
}

export interface CashAllocationPolicy {
  livingExpensesPercent: number; // e.g. 40%
  startupReinvestmentPercent: number; // e.g. 30% -> Priority 1 fund
  capitalBufferPercent: number; // e.g. 20% -> Account drawdown buffer
  taxReservePercent: number; // e.g. 10%
}

export interface FinancialTransitionPlan {
  id: string;
  title: string; // "Financial & Transition Plan"
  targetMonthlyCashflow: number;
  currentMonthlyCashflow: number;
  monthlyLivingExpenses?: number | undefined;
  startupRunwayMonthsTarget: number;
  estimatedCurrentRunwayMonths: number;
  cashAllocationPolicy?: CashAllocationPolicy | undefined;
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
  stage?: TradingDevelopmentStage | undefined;
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
  documentationUrl?: string | undefined;
}

export interface TradingAccount {
  id: string;
  institutionOrFirm: string; // e.g. "Apex Trader Funding", "Interactive Brokers", "Paper Simulation"
  accountType:
    | "simulation"
    | "research"
    | "prop_firm_evaluation"
    | "prop_firm_funded"
    | "live_personal"
    | "corporate";
  identifierMasked: string; // e.g. "****-8831" (never store plaintext broker credentials)
  accountSize: number;
  currency: string;
  isFunded: boolean;
  status: "active" | "evaluating" | "suspended" | "closed" | "passed";
  maxDrawdownLimit?: number | undefined;
  dailyLossLimit?: number | undefined;
  profitTarget?: number | undefined;
  currentBalance?: number | undefined;
  payoutEligibilityNotes?: string | undefined;
}

export interface TradingExperiment {
  id: string;
  hypothesis: string;
  strategyId?: string | undefined;
  systemId?: string | undefined;
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
  systemId?: string | undefined;
  accountId?: string | undefined;
  sessionType: "London" | "New York" | "Asian" | "Off-Hours";
  tradesCount: number;
  disciplineScore: number; // 1 to 5
  ruleAdherence: boolean;
  ruleBreachReason?: string | undefined;
  netPnL?: number | undefined; // Sensitive: Redacted by default in non-financial exports
  isVerified: boolean; // Reconciled against broker statement
  isConfidential: boolean; // Enforces strict tokenized redaction
  screenshotUrl?: string | undefined;
  notes: string;
}

export interface FinancialPerformanceRecord {
  id: string;
  periodRef: string; // YYYY-MM or YYYY-Www
  grossPnL?: number | undefined;
  feesAndCommissions?: number | undefined;
  totalNetCashExtracted: number;
  injectedToStartupFund: number;
  livingExpensesCovered?: number | undefined;
  taxReserveAllocated?: number | undefined;
  runwayMonthsCalculated: number;
  isVerified: boolean;
  confidential: boolean;
  verificationEvidence?: string | undefined;
}

export interface TradingRiskIncident {
  id: string;
  date: string;
  severity: "warning" | "breach" | "critical";
  ruleType:
    | "daily_drawdown"
    | "max_risk"
    | "missing_stop"
    | "overleverage"
    | "discipline";
  description: string;
  immediateActionTaken: string;
  preventionMeasure: string;
  accountId?: string | undefined;
}

/** Root Master Trading Operation Entity (Priority 2A) */
export interface TradingOperation {
  id: string;
  name: string; // Default: "Proprietary Trading Operation (LBES)"
  status: "active" | "paused";
  currentStage?: TradingDevelopmentStage | undefined;
  operatingProfile: TradingOperatingProfile;
  financialPlan: FinancialTransitionPlan;
  strategies: TradingStrategy[];
  systems: TradingSystem[];
  accounts: TradingAccount[];
  experiments: TradingExperiment[];
  executionRecords: TradingExecutionRecord[];
  performanceHistory: FinancialPerformanceRecord[];
  riskIncidents?: TradingRiskIncident[] | undefined;
  createdAt: string;
  updatedAt: string;
}
