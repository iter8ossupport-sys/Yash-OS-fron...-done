import { useState } from "react";
import { Award, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { today, uid } from "@/lib/os/seed";
import { Button, Input, Label, Modal, Textarea } from "@/components/os/ui";
import { cn } from "@/lib/utils";
import type { TradingExecutionRecord, TradingOperation } from "@/lib/os/types";

export interface RecordTradingSessionModalProps {
  tradingOperation: TradingOperation;
  onClose: () => void;
  onSave: (record: TradingExecutionRecord) => void;
}

export function RecordTradingSessionModal({
  tradingOperation,
  onClose,
  onSave,
}: RecordTradingSessionModalProps) {
  const [date, setDate] = useState(today());
  const [strategyId, setStrategyId] = useState(
    tradingOperation.strategies[0]?.id ?? "",
  );
  const [accountId, setAccountId] = useState(
    tradingOperation.accounts[0]?.id ?? "",
  );
  const [sessionType, setSessionType] = useState<
    "London" | "New York" | "Asian" | "Off-Hours"
  >("London");
  const [tradesCount, setTradesCount] = useState<number>(1);
  const [disciplineScore, setDisciplineScore] = useState<number>(5);
  const [ruleAdherence, setRuleAdherence] = useState<boolean>(true);
  const [ruleBreachReason, setRuleBreachReason] = useState("");
  const [netPnL, setNetPnL] = useState<string>("");
  const [isConfidential, setIsConfidential] = useState<boolean>(true);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (tradesCount < 0) {
      toast.error("Trades count cannot be negative");
      return;
    }

    const pnlNum = netPnL.trim() === "" ? undefined : Number(netPnL);
    if (pnlNum != null && isNaN(pnlNum)) {
      toast.error("Net PnL must be a valid number");
      return;
    }

    const record: TradingExecutionRecord = {
      id: `exec-${uid()}`,
      date,
      strategyId: strategyId || undefined,
      accountId: accountId || undefined,
      sessionType,
      tradesCount,
      disciplineScore,
      ruleAdherence,
      ruleBreachReason: !ruleAdherence ? ruleBreachReason.trim() : undefined,
      netPnL: pnlNum,
      isVerified: true,
      isConfidential,
      notes: notes.trim(),
    };

    onSave(record);
    toast.success("Trading session recorded");
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Log Trading Session">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Session Type</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={sessionType}
              onChange={(e) =>
                setSessionType(
                  e.target.value as TradingExecutionRecord["sessionType"],
                )
              }
            >
              <option
                value="London"
                className="bg-popover text-popover-foreground"
              >
                London Open
              </option>
              <option
                value="New York"
                className="bg-popover text-popover-foreground"
              >
                New York Open
              </option>
              <option
                value="Asian"
                className="bg-popover text-popover-foreground"
              >
                Asian Session
              </option>
              <option
                value="Off-Hours"
                className="bg-popover text-popover-foreground"
              >
                Off-Hours
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Strategy Executed</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
            >
              <option value="" className="bg-popover text-popover-foreground">
                General / Unspecified
              </option>
              {tradingOperation.strategies.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  className="bg-popover text-popover-foreground"
                >
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Execution Account</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="" className="bg-popover text-popover-foreground">
                Simulation / Default
              </option>
              {tradingOperation.accounts.map((a) => (
                <option
                  key={a.id}
                  value={a.id}
                  className="bg-popover text-popover-foreground"
                >
                  {a.institutionOrFirm} ({a.identifierMasked})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Total Trades Executed</Label>
            <Input
              type="number"
              min={0}
              value={tradesCount}
              onChange={(e) =>
                setTradesCount(parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
          <div>
            <Label>Net Session PnL ($ Optional)</Label>
            <Input
              type="number"
              placeholder="e.g. +420 or -150"
              value={netPnL}
              onChange={(e) => setNetPnL(e.target.value)}
            />
          </div>
        </div>

        {/* Discipline Scoring (1 to 5) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="mb-0 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-cyan" />
              Discipline Score: {disciplineScore} / 5
            </Label>
            <span className="text-[11px] text-muted-foreground">
              {disciplineScore === 5
                ? "Perfect Rule Execution"
                : disciplineScore >= 4
                  ? "Disciplined with Minor Hesitation"
                  : disciplineScore >= 3
                    ? "Deviated Slightly from Plan"
                    : "Plan Breach / Emotional Execution"}
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setDisciplineScore(score)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                  disciplineScore === score
                    ? "bg-cyan/20 border-cyan text-cyan ring-1 ring-cyan"
                    : "border-glass-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50",
                )}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Rule Adherence Toggle */}
        <div className="rounded-xl border border-glass-border/70 bg-secondary/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ruleAdherence ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              )}
              <span className="text-xs font-medium text-foreground">
                Strict Rule Adherence
              </span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setRuleAdherence(true)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  ruleAdherence
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-muted-foreground hover:bg-secondary/50",
                )}
              >
                Yes (100% Rules)
              </button>
              <button
                type="button"
                onClick={() => setRuleAdherence(false)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  !ruleAdherence
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : "text-muted-foreground hover:bg-secondary/50",
                )}
              >
                Rule Breach
              </button>
            </div>
          </div>

          {!ruleAdherence && (
            <div className="mt-3">
              <Label className="text-destructive">
                Breach Reason / Deviation Note
              </Label>
              <Input
                placeholder="e.g. Moved stop loss, took trade outside timeblock"
                value={ruleBreachReason}
                onChange={(e) => setRuleBreachReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <Label>Session Notes & Learnings</Label>
          <Textarea
            rows={3}
            placeholder="Market behavior, entry quality, psychological state, edge takeaways..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-glass-border/60 pt-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isConfidential}
            onChange={(e) => setIsConfidential(e.target.checked)}
            className="rounded border-input text-cyan"
          />
          Mask PnL in non-financial views
        </label>

        <div className="flex gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Session
          </Button>
        </div>
      </div>
    </Modal>
  );
}
