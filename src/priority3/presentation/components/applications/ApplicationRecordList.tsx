/**
 * Priority 3: Learning & Knowledge Intelligence System
 * Component: Application Records List & Real-World Trials
 */

import React, { useState } from "react";
import { Button } from "@/components/os/ui";
import {
  PlayCircle,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import type { ApplicationRecordEntity } from "../../../domain/entities";
import { useP3 } from "../../context/P3Context";
import { RecordApplicationModal } from "./RecordApplicationModal";

export function ApplicationRecordList() {
  const { applications, knowledgeUnits } = useP3();

  const [matchFilter, setMatchFilter] = useState<
    "all" | "matched" | "discrepancy"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const filteredApplications = applications.filter((app) => {
    if (matchFilter === "matched" && !app.outcomeMatched) return false;
    if (matchFilter === "discrepancy" && app.outcomeMatched) return false;
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      const match =
        app.title.toLowerCase().includes(lower) ||
        app.contextAndProblem.toLowerCase().includes(lower) ||
        app.intendedAction.toLowerCase().includes(lower) ||
        app.actualOutcome.toLowerCase().includes(lower) ||
        app.reflectionAndLessons.toLowerCase().includes(lower);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Trigger */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-p3-text-primary flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-p3-accent" />
            Execution Application Records ({filteredApplications.length})
          </h3>
          <p className="text-xs text-p3-text-secondary">
            Empirical trials testing knowledge models in real tasks across
            Priority 1 (Venture) and Priority 2 (Cashflow).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsRecordOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-p3-accent px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#071426] hover:opacity-90 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record Execution Trial</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-p3-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-p3-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications, problem context, lessons..."
            className="w-full rounded-lg border border-p3-input-border bg-p3-input-bg pl-8 pr-3 py-1 text-xs text-p3-input-text placeholder:text-p3-placeholder focus:outline-none focus:border-p3-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-p3-text-secondary">Outcome:</span>
          <select
            value={matchFilter}
            onChange={(e) =>
              setMatchFilter(
                e.target.value as "all" | "matched" | "discrepancy",
              )
            }
            className="h-7 rounded-lg border border-p3-input-border bg-p3-input-bg px-2 text-xs text-p3-input-text focus:outline-none focus:border-p3-accent"
          >
            <option value="all">All Outcomes</option>
            <option value="matched">Validated (Matched Hypothesis)</option>
            <option value="discrepancy">Surprise / Discrepancy Found</option>
          </select>
        </div>
      </div>

      {/* Applications Cards Grid */}
      {filteredApplications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-p3-border p-8 text-center text-xs text-p3-text-secondary space-y-2">
          <PlayCircle className="mx-auto h-8 w-8 text-p3-text-secondary/30" />
          <p>No execution application records match criteria.</p>
          <button
            type="button"
            onClick={() => setIsRecordOpen(true)}
            className="rounded-lg border border-p3-border bg-p3-surface px-4 py-1.5 text-xs text-p3-text-primary hover:bg-p3-surface-elevated transition-colors"
          >
            Record your first practical trial
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredApplications.map((app) => {
            const connectedKUs = knowledgeUnits.filter((ku) =>
              app.connectedKnowledgeUnitIds.includes(ku.id),
            );

            return (
              <div
                key={app.id}
                className="flex flex-col justify-between rounded-xl border border-p3-border bg-p3-surface p-4 transition-all hover:border-p3-accent-border"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-p3-text-secondary">
                      {app.outcomeMatched ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-p3-accent" />{" "}
                          Matched Hypothesis
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-p3-text-secondary" />{" "}
                          Discrepancy Found
                        </>
                      )}
                    </span>

                    {app.relatedP1Reference?.label && (
                      <span className="text-[10px] font-mono text-p3-text-secondary">
                        {app.relatedP1Reference.label}
                      </span>
                    )}

                    {app.relatedP2Reference?.label && (
                      <span className="text-[10px] font-mono text-p3-text-secondary">
                        {app.relatedP2Reference.label}
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-sm font-semibold text-p3-text-primary leading-snug">
                    {app.title}
                  </h4>

                  {app.contextAndProblem && (
                    <p className="text-xs text-p3-text-secondary line-clamp-2 leading-relaxed">
                      {app.contextAndProblem}
                    </p>
                  )}

                  {/* Clean 2-column comparison without nested boxes */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] pt-1">
                    <div>
                      <span className="font-semibold text-p3-text-primary block text-[10px] uppercase tracking-wider">
                        Expected
                      </span>
                      <p className="line-clamp-2 mt-0.5 text-p3-text-secondary">
                        {app.expectedOutcome}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-p3-text-primary block text-[10px] uppercase tracking-wider">
                        Actual Reality
                      </span>
                      <p className="line-clamp-2 mt-0.5 text-p3-text-secondary">
                        {app.actualOutcome}
                      </p>
                    </div>
                  </div>

                  {/* Key lesson: accent left border instead of nested box */}
                  {app.reflectionAndLessons && (
                    <div className="border-l-2 border-p3-accent-border pl-2.5 py-0.5 text-[11px] text-p3-text-secondary">
                      <span className="font-semibold text-[10px] uppercase tracking-wider block text-p3-accent">
                        Key Lesson
                      </span>
                      <p className="line-clamp-2 mt-0.5 text-p3-text-primary/90">
                        {app.reflectionAndLessons}
                      </p>
                    </div>
                  )}

                  {connectedKUs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-p3-text-secondary">
                      <span>Knowledge:</span>
                      {connectedKUs.map((ku) => (
                        <span
                          key={ku.id}
                          className="flex items-center gap-1 text-p3-text-primary hover:text-p3-accent transition-colors"
                        >
                          <Lightbulb className="h-2.5 w-2.5 text-p3-accent" />
                          {ku.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-p3-border pt-2.5 text-[11px] text-p3-text-secondary">
                  <span className="font-mono text-[10px]">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                  <span>{app.evidence ? "Proof attached" : "Unverified"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Application Modal */}
      <RecordApplicationModal
        open={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
      />
    </div>
  );
}
