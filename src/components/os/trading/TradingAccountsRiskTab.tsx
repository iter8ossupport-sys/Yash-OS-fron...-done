import { useState } from "react";
import {
  Wallet,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Lock,
} from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/os/ui";
import type { TradingAccount, TradingRiskIncident } from "@/lib/os/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface TradingAccountsRiskTabProps {
  accounts: TradingAccount[];
  riskIncidents: TradingRiskIncident[];
  isConfidential: boolean;
  onSaveAccount: (account: TradingAccount) => void;
  onDeleteAccount: (id: string) => void;
  onRecordIncident: (incident: TradingRiskIncident) => void;
}

export function TradingAccountsRiskTab({
  accounts,
  riskIncidents,
  isConfidential,
  onSaveAccount,
  onDeleteAccount,
  onRecordIncident,
}: TradingAccountsRiskTabProps) {
  const [editingAccount, setEditingAccount] =
    useState<Partial<TradingAccount> | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    date: new Date().toISOString().slice(0, 10),
    severity: "warning" as TradingRiskIncident["severity"],
    ruleType: "discipline" as TradingRiskIncident["ruleType"],
    description: "",
    immediateActionTaken: "",
    preventionMeasure: "",
  });

  const handleSaveAccount = () => {
    if (!editingAccount?.institutionOrFirm?.trim()) {
      toast.error("Institution/Firm name is required");
      return;
    }

    // Enforce masking on identifier
    let maskedId = editingAccount.identifierMasked?.trim() || "";
    if (maskedId && !maskedId.startsWith("****")) {
      maskedId = `****-${maskedId.slice(-4)}`;
    }
    if (!maskedId) {
      maskedId = `****-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const acc: TradingAccount = {
      id: editingAccount.id || `acc-${Date.now()}`,
      institutionOrFirm: editingAccount.institutionOrFirm.trim(),
      accountType: editingAccount.accountType || "simulation",
      identifierMasked: maskedId,
      accountSize: Number(editingAccount.accountSize) || 50000,
      currency: editingAccount.currency || "USD",
      isFunded: editingAccount.isFunded ?? false,
      status: editingAccount.status || "active",
      maxDrawdownLimit: Number(editingAccount.maxDrawdownLimit) || undefined,
      dailyLossLimit: Number(editingAccount.dailyLossLimit) || undefined,
      profitTarget: Number(editingAccount.profitTarget) || undefined,
      currentBalance: Number(editingAccount.currentBalance) || undefined,
      payoutEligibilityNotes:
        editingAccount.payoutEligibilityNotes?.trim() || undefined,
    };

    onSaveAccount(acc);
    setEditingAccount(null);
    toast.success("Trading account saved");
  };

  const handleSaveIncident = () => {
    if (!newIncident.description.trim()) {
      toast.error("Description is required");
      return;
    }
    onRecordIncident({
      id: `inc-${Date.now()}`,
      date: newIncident.date,
      severity: newIncident.severity,
      ruleType: newIncident.ruleType,
      description: newIncident.description.trim(),
      immediateActionTaken: newIncident.immediateActionTaken.trim(),
      preventionMeasure: newIncident.preventionMeasure.trim(),
    });
    setShowIncidentModal(false);
    setNewIncident({
      date: new Date().toISOString().slice(0, 10),
      severity: "warning",
      ruleType: "discipline",
      description: "",
      immediateActionTaken: "",
      preventionMeasure: "",
    });
    toast.success("Risk incident recorded");
  };

  const formatMoney = (val?: number, currency: string = "USD") => {
    if (val === undefined) return "—";
    if (isConfidential) return `${currency === "INR" ? "₹" : "$"}***,***`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: TRADING ACCOUNTS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/60 pb-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-cyan" />
              Trading Accounts & Portfolios ({accounts.length})
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-cyan" />
              Masked identifiers enforced. Never store plaintext credentials.
            </p>
          </div>
          <Button
            size="sm"
            variant="glass"
            onClick={() =>
              setEditingAccount({
                institutionOrFirm: "",
                accountType: "simulation",
                identifierMasked: "",
                accountSize: 50000,
                currency: "USD",
                isFunded: false,
                status: "active",
                maxDrawdownLimit: 2500,
                dailyLossLimit: 1000,
              })
            }
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Account
          </Button>
        </div>

        {/* Account Editor Form */}
        {editingAccount && (
          <div className="rounded-2xl border border-cyan/40 bg-secondary/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
              <span className="font-semibold text-xs text-cyan">
                {editingAccount.id ? "Edit Account" : "Add New Account"}
              </span>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Institution / Broker / Firm</Label>
                <Input
                  value={editingAccount.institutionOrFirm ?? ""}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      institutionOrFirm: e.target.value,
                    })
                  }
                  placeholder="e.g. Apex Trader Funding, IBKR"
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Account Type</Label>
                <Select
                  value={editingAccount.accountType ?? "simulation"}
                  onChange={(val) =>
                    setEditingAccount({
                      ...editingAccount,
                      accountType: val as TradingAccount["accountType"],
                    })
                  }
                  options={[
                    { value: "simulation", label: "Paper Simulation" },
                    { value: "prop_firm_evaluation", label: "Prop Evaluation" },
                    { value: "prop_firm_funded", label: "Prop Funded" },
                    { value: "live_personal", label: "Live Personal" },
                    { value: "corporate", label: "Corporate Account" },
                  ]}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Identifier (Masked / Last 4)</Label>
                <Input
                  value={editingAccount.identifierMasked ?? ""}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      identifierMasked: e.target.value,
                    })
                  }
                  placeholder="e.g. ****-8831"
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={editingAccount.status ?? "active"}
                  onChange={(val) =>
                    setEditingAccount({
                      ...editingAccount,
                      status: val as TradingAccount["status"],
                    })
                  }
                  options={[
                    { value: "active", label: "Active" },
                    { value: "evaluating", label: "Evaluating" },
                    { value: "passed", label: "Passed" },
                    { value: "suspended", label: "Suspended" },
                    { value: "closed", label: "Closed" },
                  ]}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Account Size</Label>
                <Input
                  type="number"
                  value={editingAccount.accountSize ?? 50000}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      accountSize: Number(e.target.value),
                    })
                  }
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Max Drawdown Limit</Label>
                <Input
                  type="number"
                  value={editingAccount.maxDrawdownLimit ?? ""}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      maxDrawdownLimit: Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 2500"
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Daily Loss Limit</Label>
                <Input
                  type="number"
                  value={editingAccount.dailyLossLimit ?? ""}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      dailyLossLimit: Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 1000"
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div>
                <Label>Current Balance</Label>
                <Input
                  type="number"
                  value={editingAccount.currentBalance ?? ""}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      currentBalance: Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 52400"
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isFundedCheck"
                checked={editingAccount.isFunded ?? false}
                onChange={(e) =>
                  setEditingAccount({
                    ...editingAccount,
                    isFunded: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-glass-border text-cyan focus:ring-cyan"
              />
              <label
                htmlFor="isFundedCheck"
                className="text-xs text-foreground cursor-pointer"
              >
                Funded Capital Account (Eligible for Profit Withdrawals)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingAccount(null)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveAccount}>
                <Check className="h-3.5 w-3.5 mr-1" /> Save Account
              </Button>
            </div>
          </div>
        )}

        {/* Accounts Table */}
        <div className="overflow-x-auto rounded-xl border border-glass-border/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-[11px] font-semibold text-muted-foreground border-b border-glass-border/60">
              <tr>
                <th className="p-3">Institution & ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Size / Balance</th>
                <th className="p-3">Drawdown Limit</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/40">
              {accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <td className="p-3">
                    <span className="font-semibold text-foreground block">
                      {acc.institutionOrFirm}
                    </span>
                    <span className="font-mono text-[10px] text-cyan">
                      {acc.identifierMasked}
                    </span>
                  </td>
                  <td className="p-3 capitalize text-muted-foreground">
                    {acc.accountType.replace(/_/g, " ")}
                  </td>
                  <td className="p-3 font-mono">
                    <span className="text-foreground block">
                      {formatMoney(acc.accountSize, acc.currency)}
                    </span>
                    {acc.currentBalance !== undefined && (
                      <span className="text-[10px] text-muted-foreground">
                        Bal: {formatMoney(acc.currentBalance, acc.currency)}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">
                    {acc.maxDrawdownLimit
                      ? formatMoney(acc.maxDrawdownLimit, acc.currency)
                      : "—"}
                  </td>
                  <td className="p-3">
                    <Badge
                      className={cn(
                        "text-[10px] capitalize",
                        acc.status === "active" || acc.status === "passed"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {acc.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingAccount(acc)}
                        className="text-muted-foreground hover:text-cyan p-1"
                        title="Edit account"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Delete account "${acc.institutionOrFirm}"?`,
                            )
                          ) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        className="text-muted-foreground hover:text-destructive p-1"
                        title="Delete account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: RISK INCIDENTS AUDIT TRAIL */}
      <div className="space-y-4 pt-4 border-t border-glass-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan" />
              Risk Incidents & Circuit Breaker Log ({riskIncidents.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Formal audit trail of drawdown violations, missed hard stops, and
              corrective actions.
            </p>
          </div>
          <Button
            size="sm"
            variant="glass"
            onClick={() => setShowIncidentModal(true)}
            className="text-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-400" /> Log
            Risk Incident
          </Button>
        </div>

        {/* Risk Incident Dialog Form */}
        {showIncidentModal && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
              <span className="font-semibold text-xs text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Log Risk Rule Incident
              </span>
              <button
                type="button"
                onClick={() => setShowIncidentModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newIncident.date}
                  onChange={(e) =>
                    setNewIncident({ ...newIncident, date: e.target.value })
                  }
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Severity</Label>
                <Select
                  value={newIncident.severity}
                  onChange={(val) =>
                    setNewIncident({
                      ...newIncident,
                      severity: val as TradingRiskIncident["severity"],
                    })
                  }
                  options={[
                    { value: "warning", label: "Warning (Near Breach)" },
                    { value: "breach", label: "Rule Breach" },
                    { value: "critical", label: "Critical Account Threat" },
                  ]}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Rule Violated</Label>
                <Select
                  value={newIncident.ruleType}
                  onChange={(val) =>
                    setNewIncident({
                      ...newIncident,
                      ruleType: val as TradingRiskIncident["ruleType"],
                    })
                  }
                  options={[
                    {
                      value: "daily_drawdown",
                      label: "Daily Drawdown Exceeded",
                    },
                    { value: "max_risk", label: "Max Risk Per Trade Exceeded" },
                    {
                      value: "missing_stop",
                      label: "Missing Physical Hard Stop",
                    },
                    {
                      value: "overleverage",
                      label: "Overleverage / Contract Limit",
                    },
                    {
                      value: "discipline",
                      label: "Emotional / Discipline Violation",
                    },
                  ]}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div>
              <Label>Description of Incident</Label>
              <Textarea
                value={newIncident.description}
                onChange={(e) =>
                  setNewIncident({
                    ...newIncident,
                    description: e.target.value,
                  })
                }
                placeholder="What happened? State setup context, execution mistake, or deviation from rules..."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Immediate Action Taken</Label>
                <Input
                  value={newIncident.immediateActionTaken}
                  onChange={(e) =>
                    setNewIncident({
                      ...newIncident,
                      immediateActionTaken: e.target.value,
                    })
                  }
                  placeholder="e.g. Liquidated position, halted trading for 24h"
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label>Prevention Measure (Systemic Fix)</Label>
                <Input
                  value={newIncident.preventionMeasure}
                  onChange={(e) =>
                    setNewIncident({
                      ...newIncident,
                      preventionMeasure: e.target.value,
                    })
                  }
                  placeholder="e.g. Set hard stop bracket order on NinjaTrader"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowIncidentModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleSaveIncident}>
                Record Incident
              </Button>
            </div>
          </div>
        )}

        {/* Risk Incidents List */}
        <div className="space-y-2">
          {riskIncidents.length === 0 ? (
            <div className="rounded-xl border border-glass-border/50 bg-secondary/10 p-4 text-center text-xs text-muted-foreground">
              No risk incidents recorded. Discipline safeguards strictly
              maintained.
            </div>
          ) : (
            riskIncidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-xl border border-destructive/20 bg-secondary/30 p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {inc.date}
                    </span>
                    <Badge
                      className={cn(
                        "text-[10px] uppercase font-bold",
                        inc.severity === "critical"
                          ? "bg-destructive/20 text-destructive border-destructive/30"
                          : inc.severity === "breach"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {inc.severity}
                    </Badge>
                    <span className="font-medium text-foreground capitalize">
                      {inc.ruleType.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-snug">
                  {inc.description}
                </p>

                <div className="grid gap-2 sm:grid-cols-2 pt-1 text-[11px]">
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Action:{" "}
                    </span>
                    {inc.immediateActionTaken}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Prevention:{" "}
                    </span>
                    {inc.preventionMeasure}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
