/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Evidence-Based Capability & Progress Matrix
 *
 * Tracks the 4 qualitative dimensions of founder capability:
 * 1. Understanding: First-principles comprehension of system mechanics & invariant rules.
 * 2. Reasoning: Deductive inference, root-cause debugging, trade-off evaluation.
 * 3. Transfer: Cross-domain application (Venture execution P1 & Trading P2).
 * 4. Reality Accuracy: Empirical predictive calibration against ground-truth feedback.
 *
 * Grounded in actual evidence, Knowledge Units, and Execution Trials.
 */

import React from "react";
import {
  ShieldCheck,
  Brain,
  Zap,
  Repeat,
  Target,
  CheckCircle2,
  HelpCircle,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useP3 } from "../../context/P3Context";
import type { CapabilityDimension } from "../../../domain/enums";

export function CapabilityProgressMatrix() {
  const {
    knowledgeUnits,
    applications,
    questions,
    subjects,
    domains,
    evidence,
  } = useP3();

  // Metrics calculation
  const validatedKUs = knowledgeUnits.filter((k) => k.status === "validated");
  const positiveTrials = applications.filter((a) => a.outcomeMatched);
  const challengingTrials = applications.filter((a) => !a.outcomeMatched);

  const supportingEvidenceCount = evidence.filter(
    (e) => e.polarity === "supports",
  ).length;

  const dimensions: {
    key: CapabilityDimension;
    title: string;
    description: string;
    icon: React.ElementType;
    metricsSummary: string;
    evidenceStatement: string;
  }[] = [
    {
      key: "understanding",
      title: "1. Mechanical Understanding",
      description:
        "First-principles comprehension of system invariants, rules, and failure modes.",
      icon: Brain,
      metricsSummary: `${validatedKUs.length} validated KUs (${knowledgeUnits.length} total)`,
      evidenceStatement:
        validatedKUs.length > 0
          ? `Grounded in ${validatedKUs.length} rigorously validated mental models with verified invariant rules.`
          : "Initial mental models formulated. Require experimental verification to claim mastery.",
    },
    {
      key: "reasoning",
      title: "2. Deductive Reasoning & Debugging",
      description:
        "Ability to deduce root causes, isolate bottleneck variables, and evaluate architectural trade-offs.",
      icon: Zap,
      metricsSummary: `${questions.filter((q) => q.status === "resolved_for_now").length} inquiries resolved (${questions.length} total)`,
      evidenceStatement:
        questions.length > 0
          ? `${questions.filter((q) => q.status === "resolved_for_now").length} questions resolved through structured investigation.`
          : "Formulate learning inquiries to test deductive reasoning against execution bottlenecks.",
    },
    {
      key: "transfer",
      title: "3. Cross-Domain Transfer",
      description:
        "Ability to apply conceptual knowledge into operational execution (P1 Ventures & P2 Trading).",
      icon: Repeat,
      metricsSummary: `${applications.length} Execution Trials logged`,
      evidenceStatement:
        applications.length > 0
          ? `${positiveTrials.length} validated trials and ${challengingTrials.length} discrepancy trials logged across P1/P2.`
          : "Zero execution trials logged yet. Apply knowledge units directly in P1 venture projects or P2 trading sessions.",
    },
    {
      key: "reality_accuracy",
      title: "4. Reality Accuracy & Calibration",
      description:
        "Empirical calibration between hypotheses and operational reality without wishful thinking.",
      icon: Target,
      metricsSummary: `${supportingEvidenceCount} empirical citations (${evidence.length} total)`,
      evidenceStatement:
        evidence.length > 0
          ? `${supportingEvidenceCount} supporting data points and ${evidence.length - supportingEvidenceCount} challenging counter-examples logged.`
          : "Attach empirical evidence or benchmark datasets to knowledge units to calibrate predictive accuracy.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-p3-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Evidence-Based Capability & Progress Matrix
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Founder capability is evaluated through empirical proof, validated
          mechanisms, and cross-domain execution trials—never arbitrary points
          or vanity scores.
        </p>
      </div>

      {/* 4 Qualitative Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div
              key={dim.key}
              className="p-4 rounded-xl border border-p3-border bg-card/60 backdrop-blur-sm flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {dim.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/50 text-muted-foreground border border-glass-border">
                    {dim.metricsSummary}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {dim.description}
                </p>
              </div>

              <div className="border-l-2 border-[#38BDF8]/40 pl-2.5 py-0.5 text-xs">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-0.5">
                  Evidence Calibration
                </span>
                <p className="text-xs text-foreground/90 font-medium">
                  {dim.evidenceStatement}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subject & Knowledge Progress Breakdown */}
      <div className="rounded-xl border border-glass-border bg-secondary/10 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-glass-border pb-2">
          <span className="text-xs font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Subject-Level Capability Breakdown ({subjects.length} Subjects)
          </span>
          <span className="text-[11px] text-muted-foreground">
            Progress derived from validated KUs and logged trials
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No subjects registered in taxonomy. Create domains and subjects in
            Taxonomy Explorer.
          </div>
        ) : (
          <div className="divide-y divide-glass-border">
            {subjects.map((sub) => {
              const subKUs = knowledgeUnits.filter(
                (k) => k.identity.subjectId === sub.id,
              );
              const subValidated = subKUs.filter(
                (k) => k.status === "validated",
              ).length;
              const parentDomain = domains.find((d) => d.id === sub.domainId);

              return (
                <div
                  key={sub.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-4">
                    <span className="font-medium text-foreground">
                      {sub.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-2">
                      ({parentDomain?.name || "Independent Domain"})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                    <span className="text-muted-foreground">
                      {subKUs.length} KUs
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {subValidated} Validated
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
