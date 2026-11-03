import { useState } from "react";
import {
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Layers,
  Wallet,
  Calendar,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/os/ui";
import { useOS } from "@/lib/os/store";
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
} from "@/lib/os/logic";
import type {
  TradingDevelopmentStage,
  TradingOperatingProfile,
  FinancialTransitionPlan,
  TradingStrategy,
  TradingSystem,
  TradingAccount,
  TradingExecutionRecord,
  FinancialPerformanceRecord,
  TradingRiskIncident,
} from "@/lib/os/types";
import { cn } from "@/lib/utils";
import {
  TradingOperationOverviewTab,
  type TradingTabId,
} from "./TradingOperationOverviewTab";
import { TradingOperatingProfileTab } from "./TradingOperatingProfileTab";
import { FinancialTransitionPlanTab } from "./FinancialTransitionPlanTab";
import { TradingStrategiesSystemsTab } from "./TradingStrategiesSystemsTab";
import { TradingAccountsRiskTab } from "./TradingAccountsRiskTab";
import { TradingPerformanceTab } from "./TradingPerformanceTab";
import { RecordTradingSessionModal } from "./RecordTradingSessionModal";

export interface TradingOperationModalProps {
  open: boolean;
  onClose: () => void;
}

export function TradingOperationModal({
  open,
  onClose,
}: TradingOperationModalProps) {
  const { state, update } = useOS();
  const operation = state.tradingOperation;

  const [activeTab, setActiveTab] = useState<TradingTabId>("overview");
  const [isConfidential, setIsConfidential] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  if (!operation) return null;

  const handleUpdateStage = (stage: TradingDevelopmentStage) => {
    update((s) => updateTradingStage(s, stage));
    toast.success(`Trading stage updated to ${stage.replace(/_/g, " ")}`);
  };

  const handleToggleStatus = (status: "active" | "paused") => {
    update((s) => {
      if (!s.tradingOperation) return s;
      return {
        ...s,
        tradingOperation: {
          ...s.tradingOperation,
          status,
          updatedAt: new Date().toISOString(),
        },
      };
    });
    toast.success(`Trading operation is now ${status}`);
  };

  const handleSaveProfile = (profile: Partial<TradingOperatingProfile>) => {
    update((s) => updateTradingOperatingProfile(s, profile));
  };

  const handleSaveFinancialPlan = (plan: Partial<FinancialTransitionPlan>) => {
    update((s) => updateFinancialTransitionPlan(s, plan));
  };

  const handleSaveStrategy = (strategy: TradingStrategy) => {
    update((s) => saveTradingStrategy(s, strategy));
  };

  const handleDeleteStrategy = (id: string) => {
    update((s) => deleteTradingStrategy(s, id));
    toast.success("Strategy removed");
  };

  const handleSaveSystem = (system: TradingSystem) => {
    update((s) => saveTradingSystem(s, system));
  };

  const handleDeleteSystem = (id: string) => {
    update((s) => deleteTradingSystem(s, id));
    toast.success("Execution system removed");
  };

  const handleSaveAccount = (account: TradingAccount) => {
    update((s) => saveTradingAccount(s, account));
  };

  const handleDeleteAccount = (id: string) => {
    update((s) => deleteTradingAccount(s, id));
    toast.success("Trading account removed");
  };

  const handleRecordSession = (session: TradingExecutionRecord) => {
    update((s) => recordTradingSession(s, session));
  };

  const handleRecordFinancial = (fin: FinancialPerformanceRecord) => {
    update((s) => recordFinancialPerformance(s, fin));
  };

  const handleRecordIncident = (inc: TradingRiskIncident) => {
    update((s) => recordRiskIncident(s, inc));
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={operation.name || "Trading Operation (Priority 2A)"}
        wide
        className="max-w-5xl"
      >
        <div className="space-y-4">
          {/* Header Controls: Confidential Toggle & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-glass-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-cyan/40 bg-cyan/15 px-2.5 py-1 text-xs font-semibold text-cyan">
                Priority 2A Cashflow Engine
              </span>
              <span className="text-xs text-muted-foreground">
                Stage:{" "}
                <span className="font-semibold text-foreground capitalize">
                  {operation.currentStage?.replace(/_/g, " ") ??
                    "paper simulation"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConfidential(!isConfidential)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                  isConfidential
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                    : "border-glass-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                )}
                title="Toggle confidential mode (masks absolute monetary amounts)"
              >
                {isConfidential ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> Confidential Active
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Mask Amounts
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowRecordModal(true)}
                className="flex items-center gap-1 rounded-lg bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-110"
              >
                <Zap className="h-3.5 w-3.5" /> Log Session
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-glass-border/70 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                activeTab === "overview"
                  ? "bg-cyan/15 text-cyan border border-cyan/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" /> Overview & KPIs
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                activeTab === "profile"
                  ? "bg-cyan/15 text-cyan border border-cyan/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Operating Profile (Doc 1)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("financial_plan")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                activeTab === "financial_plan"
                  ? "bg-cyan/15 text-cyan border border-cyan/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <DollarSign className="h-3.5 w-3.5" /> Financial Plan (Doc 2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("strategies_systems")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                activeTab === "strategies_systems"
                  ? "bg-cyan/15 text-cyan border border-cyan/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <Layers className="h-3.5 w-3.5" /> Strategies & Systems
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("accounts_risk")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                activeTab === "accounts_risk"
                  ? "bg-cyan/15 text-cyan border border-cyan/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <Wallet className="h-3.5 w-3.5" /> Accounts & Risk Logs
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("performance")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                activeTab === "performance"
                  ? "bg-cyan/15 text-cyan border border-cyan/40"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <Calendar className="h-3.5 w-3.5" /> Journal & Performance
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === "overview" && (
            <TradingOperationOverviewTab
              operation={operation}
              isConfidential={isConfidential}
              onUpdateStage={handleUpdateStage}
              onToggleStatus={handleToggleStatus}
              onOpenRecordSession={() => setShowRecordModal(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "profile" && (
            <TradingOperatingProfileTab
              profile={operation.operatingProfile}
              onSave={handleSaveProfile}
            />
          )}

          {activeTab === "financial_plan" && (
            <FinancialTransitionPlanTab
              plan={operation.financialPlan}
              isConfidential={isConfidential}
              onSave={handleSaveFinancialPlan}
            />
          )}

          {activeTab === "strategies_systems" && (
            <TradingStrategiesSystemsTab
              strategies={operation.strategies ?? []}
              systems={operation.systems ?? []}
              experiments={operation.experiments ?? []}
              onSaveStrategy={handleSaveStrategy}
              onDeleteStrategy={handleDeleteStrategy}
              onSaveSystem={handleSaveSystem}
              onDeleteSystem={handleDeleteSystem}
            />
          )}

          {activeTab === "accounts_risk" && (
            <TradingAccountsRiskTab
              accounts={operation.accounts ?? []}
              riskIncidents={operation.riskIncidents ?? []}
              isConfidential={isConfidential}
              onSaveAccount={handleSaveAccount}
              onDeleteAccount={handleDeleteAccount}
              onRecordIncident={handleRecordIncident}
            />
          )}

          {activeTab === "performance" && (
            <TradingPerformanceTab
              executionRecords={operation.executionRecords ?? []}
              performanceHistory={operation.performanceHistory ?? []}
              strategies={operation.strategies ?? []}
              isConfidential={isConfidential}
              onOpenRecordSession={() => setShowRecordModal(true)}
              onRecordFinancialPerformance={handleRecordFinancial}
            />
          )}
        </div>
      </Modal>

      {/* Fast Record Daily Session Modal */}
      {showRecordModal && (
        <RecordTradingSessionModal
          tradingOperation={operation}
          onClose={() => setShowRecordModal(false)}
          onSave={(record) => {
            handleRecordSession(record);
            setShowRecordModal(false);
          }}
        />
      )}
    </>
  );
}
