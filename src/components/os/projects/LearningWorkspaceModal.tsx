import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  Cpu,
  Layers,
  Lightbulb,
  Scale,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge, Button, Modal } from "@/components/os/ui";
import { cn } from "@/lib/utils";

export interface LearningWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
}

export type LearningTabId = "loop" | "domains" | "principles";

export function LearningWorkspaceModal({
  open,
  onClose,
}: LearningWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<LearningTabId>("loop");

  const loopStages = [
    {
      num: 1,
      title: "PRE-THINK",
      subtitle: "Hypothesis & Bottleneck Scoping",
      content:
        "Before consuming any material, identify the exact bottleneck blocking execution today. Formulate a crisp hypothesis: 'If I learn X, I can unblock bottleneck Y inside Project Z.'",
    },
    {
      num: 2,
      title: "LEARN",
      subtitle: "Targeted High-Leverage Input",
      content:
        "Study the minimal fundamental required to test the hypothesis. Sources: RFC specifications, documentation, academic papers, books, or direct expert guidance. Strictly avoid passive tutorial bingeing.",
    },
    {
      num: 3,
      title: "UNDERSTAND",
      subtitle: "Mental Model Synthesis",
      content:
        "Articulate the concept in plain English without consulting the source. If you cannot explain the mechanism simply, your understanding is incomplete.",
    },
    {
      num: 4,
      title: "APPLY",
      subtitle: "Real Task Trial",
      content:
        "Immediately deploy the understanding inside an active task or experiment in Priority 1 (Venture) or Priority 2 (Cashflow). Knowledge untested by execution evaporates.",
    },
    {
      num: 5,
      title: "REALITY",
      subtitle: "System & Market Feedback",
      content:
        "Observe what actually happened: Did the build succeed? Did the server hydrate cleanly? Did the order fill as modeled? Did the user convert?",
    },
    {
      num: 6,
      title: "ANALYZE",
      subtitle: "Evidence vs. Hypothesis",
      content:
        "Compare reality against your pre-think expectations. Isolate surprises, failure points, and edge cases.",
    },
    {
      num: 7,
      title: "IMPROVE",
      subtitle: "Distill & Standardize",
      content:
        "Extract the invariant truth. Save it to Yash OS Knowledge as a Principle, Method, or Framework so future execution cycles are permanently faster.",
    },
    {
      num: 8,
      title: "REPEAT",
      subtitle: "Compound & Reinvest",
      content:
        "Re-enter the loop at a higher baseline. Compound capability gains across Priority 1 (Venture) and Priority 2 (Cashflow) iteratively.",
    },
  ];

  const domains = [
    {
      title: "Systems Engineering & AI Architecture",
      icon: Cpu,
      priority: "Accelerates Priority 1",
      accent: "text-p1 border-p1/30 bg-p1/10",
      description:
        "Distributed systems, reactive state machines, SSR hydration boundaries, Nitro server runtimes, and multi-agent orchestration.",
    },
    {
      title: "Financial Market Microstructure & Execution",
      icon: TrendingUp,
      priority: "Accelerates Priority 2",
      accent: "text-cyan border-cyan/30 bg-cyan/10",
      description:
        "Auction market dynamics, orderflow absorption, liquidity imbalances, risk math, and disciplined trade execution playbooks.",
    },
    {
      title: "Product Discovery & Human Friction",
      icon: Zap,
      priority: "Accelerates Priority 1",
      accent: "text-violet border-violet/30 bg-violet/10",
      description:
        "Acute pain discovery, user interview synthesis, offer validation, and feedback loop closure.",
    },
    {
      title: "Regulatory FinTech & Boundary Governance",
      icon: Scale,
      priority: "Accelerates Priority 2",
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      description:
        "Non-custodial technology positioning, statutory publisher exemptions, data governance, and commercial legal architecture.",
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Priority 3: Learning for Execution Workspace"
      wide
      className="max-w-5xl"
    >
      <div className="space-y-4">
        {/* Core Philosophy Banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-violet/40 bg-violet/10 p-4 text-xs text-violet-foreground">
          <Brain className="h-5 w-5 shrink-0 text-violet mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-violet block text-sm">
              FOUNDER CAPABILITY OPERATING SYSTEM
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Learning in Yash OS exists for one singular purpose: to
              continuously increase founder capability. It is not about
              collecting courses, tracking passive study hours, or accumulating
              certificates. It is about becoming more capable of understanding
              problems, making high-stakes decisions, executing with precision,
              and producing verified real-world results.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-glass-border/70 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("loop")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "loop"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" /> 1. The 8-Stage Execution Loop
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("domains")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "domains"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Layers className="h-3.5 w-3.5" /> 2. Foundational Domains
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("principles")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "principles"
                ? "bg-violet/15 text-violet border border-violet/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Lightbulb className="h-3.5 w-3.5" /> 3. Operating Principles
          </button>
        </div>

        {/* TAB 1: THE 8-STAGE EXECUTION LOOP */}
        {activeTab === "loop" && (
          <div className="space-y-3">
            <div className="grid gap-2.5">
              {loopStages.map((st) => (
                <div
                  key={st.num}
                  className="flex items-start gap-3 rounded-xl border border-glass-border/70 bg-secondary/25 p-3.5 transition-colors hover:border-violet/30"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-violet/40 bg-violet/15 font-mono text-xs font-bold text-violet">
                    {st.num}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tracking-tight text-foreground">
                        {st.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        — {st.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {st.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FOUNDATIONAL CAPABILITY DOMAINS */}
        {activeTab === "domains" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {domains.map((dom) => {
              const Icon = dom.icon;
              return (
                <div
                  key={dom.title}
                  className="rounded-2xl border border-glass-border/80 bg-secondary/25 p-4 transition-all hover:border-violet/40 hover:bg-secondary/35"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-glass-border bg-secondary/60">
                        <Icon className="h-4 w-4 text-violet" />
                      </div>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                          dom.accent,
                        )}
                      >
                        {dom.priority}
                      </span>
                    </div>
                  </div>
                  <h4 className="mt-3 font-display text-sm font-semibold text-foreground">
                    {dom.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {dom.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: OPERATING PRINCIPLES */}
        {activeTab === "principles" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-glass-border/70 bg-secondary/25 p-4 space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                The Iron Law of Learning for Execution
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If a concept has not been applied to code, a trading session, a
                user interview, or an architectural decision within 48 hours of
                study, it is treated as forgotten noise. Always pull learning
                forward through the active task engine.
              </p>
            </div>

            <div className="rounded-xl border border-glass-border/70 bg-secondary/25 p-4 space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                Rejection of Vanity Metrics
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Yash OS deliberately excludes clock timers for reading, page
                counters, and gamified study points. The only valid metric is
                demonstrable improvement in execution speed, decision accuracy,
                and output quality.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-glass-border/60 pt-3">
          <Button variant="glass" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
