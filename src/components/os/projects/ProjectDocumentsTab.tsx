import { FileText, ArrowRight, ShieldCheck, ListTree } from "lucide-react";
import { Badge, Button } from "@/components/os/ui";
import type { Project, ProjectDoc, ProjectDocument } from "@/lib/os/types";

export interface ProjectDocumentsTabProps {
  draft: Project;
  onOpenDocEditor: (doc: ProjectDoc | ProjectDocument) => void;
  onOpenStructuredPlan: () => void;
}

export function ProjectDocumentsTab({
  draft,
  onOpenDocEditor,
  onOpenStructuredPlan,
}: ProjectDocumentsTabProps) {
  const docs = (draft.docs ?? []) as (ProjectDoc | ProjectDocument)[];

  const getDocByType = (type: string) => {
    return docs.find(
      (d) => "type" in d && (d as ProjectDocument).type === type,
    ) as ProjectDocument | undefined;
  };

  const briefDoc = getDocByType("project_brief");
  const execPlanDoc = getDocByType("execution_plan");
  const evidenceDoc = getDocByType("evidence_experiments");
  const decisionsDoc = getDocByType("decisions_history");
  const methodsDoc = getDocByType("methods_knowledge");
  const complianceDoc = getDocByType("legal_compliance");

  const execPlan = draft.executionPlan;
  const monthlyCount = execPlan?.currentApproved.outcomes.monthly.length ?? 0;
  const weeklyCount = execPlan?.currentApproved.outcomes.weekly.length ?? 0;
  const dailyCount = execPlan?.currentApproved.outcomes.daily.length ?? 0;
  const planVersion = execPlan?.currentApproved.version ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-glass-border/50 pb-3">
        <div>
          <h3 className="font-semibold text-sm text-foreground">
            Five Standardized Project Documents
          </h3>
          <p className="text-xs text-muted-foreground">
            Foundational knowledge, structured execution plans, market proof and
            decisions.
          </p>
        </div>
        <Badge className="text-xs px-2.5 py-0.5">Docs 5/5 Standardized</Badge>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Doc 1: Project Brief */}
        <div className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/30 p-4 transition-all hover:border-cyan/40 hover:bg-secondary/50">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan" />
                1. Project Brief
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                v{briefDoc?.version ?? 1}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {briefDoc?.content ||
                "Thesis, target customer profile, acute problem statement, and solution hypothesis."}
            </p>
          </div>
          <div className="pt-3">
            <Button
              size="sm"
              variant="glass"
              className="w-full text-xs"
              onClick={() => briefDoc && onOpenDocEditor(briefDoc)}
            >
              Open / Edit Brief
            </Button>
          </div>
        </div>

        {/* Doc 2: Structured Execution Plan (Authoritative Single Source) */}
        <div className="flex flex-col justify-between rounded-xl border border-cyan/40 bg-cyan/10 p-4 transition-all hover:border-cyan/60 hover:bg-cyan/15">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <ListTree className="h-4 w-4 text-cyan" />
                2. Execution Plan
              </span>
              <Badge className="bg-cyan/20 text-cyan text-[10px] border-cyan/40">
                Authoritative Plan v{planVersion}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              3-tier structured outcome horizons: monthly, weekly, and daily
              targets.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="rounded bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
                {monthlyCount} monthly
              </span>
              <span className="rounded bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
                {weeklyCount} weekly
              </span>
              <span className="rounded bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
                {dailyCount} daily
              </span>
            </div>
          </div>
          <div className="pt-3">
            <Button
              size="sm"
              variant="primary"
              className="w-full text-xs"
              onClick={onOpenStructuredPlan}
            >
              Manage Execution Plan <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Doc 3: Evidence & Experiments */}
        <div className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/30 p-4 transition-all hover:border-cyan/40 hover:bg-secondary/50">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan" />
                3. Evidence & Experiments
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                v{evidenceDoc?.version ?? 1}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {evidenceDoc?.content ||
                "Customer interview notes, pilot usage data, conversion proof, and LOIs."}
            </p>
          </div>
          <div className="pt-3">
            <Button
              size="sm"
              variant="glass"
              className="w-full text-xs"
              onClick={() => evidenceDoc && onOpenDocEditor(evidenceDoc)}
            >
              Open / Edit Evidence
            </Button>
          </div>
        </div>

        {/* Doc 4: Decisions History */}
        <div className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/30 p-4 transition-all hover:border-cyan/40 hover:bg-secondary/50">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan" />
                4. Decisions History
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                v{decisionsDoc?.version ?? 1}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {decisionsDoc?.content ||
                "Architectural decision records (ADRs), pricing models, and strategic pivot rationale."}
            </p>
          </div>
          <div className="pt-3">
            <Button
              size="sm"
              variant="glass"
              className="w-full text-xs"
              onClick={() => decisionsDoc && onOpenDocEditor(decisionsDoc)}
            >
              Open / Edit Decisions
            </Button>
          </div>
        </div>

        {/* Doc 5: Methods & Knowledge */}
        <div className="flex flex-col justify-between rounded-xl border border-glass-border/70 bg-secondary/30 p-4 transition-all hover:border-cyan/40 hover:bg-secondary/50">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan" />
                5. Methods & Knowledge
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                v{methodsDoc?.version ?? 1}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {methodsDoc?.content ||
                "Repeatable execution playbooks, SOPs, and domain knowledge distilled from shipping."}
            </p>
          </div>
          <div className="pt-3">
            <Button
              size="sm"
              variant="glass"
              className="w-full text-xs"
              onClick={() => methodsDoc && onOpenDocEditor(methodsDoc)}
            >
              Open / Edit Methods
            </Button>
          </div>
        </div>

        {/* Doc 6 (Fintech Only): Legal & Compliance */}
        {complianceDoc && (
          <div className="flex flex-col justify-between rounded-xl border border-cyan/30 bg-cyan/5 p-4 transition-all hover:border-cyan/50 hover:bg-cyan/10">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-cyan flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan" />
                  6. Legal & Compliance
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  v{complianceDoc.version ?? 1}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {complianceDoc.content ||
                  "Fintech regulatory requirements, licensing rules, and terms of service."}
              </p>
            </div>
            <div className="pt-3">
              <Button
                size="sm"
                variant="glass"
                className="w-full text-xs"
                onClick={() => onOpenDocEditor(complianceDoc)}
              >
                Open Compliance Tracker
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
