import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Globe,
  Scale,
  Lock,
  AlertTriangle,
  FileText,
  HelpCircle,
  Award,
  Plus,
  Trash2,
  Check,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Input,
  Label,
  Modal,
  Select,
  Textarea,
} from "@/components/os/ui";
import type {
  ComplianceRequirementStatus,
  JurisdictionTrackingRecord,
  LegalComplianceContent,
  LicensingRequirementItem,
  MandatoryDisclosureItem,
  PrivacyAndDataGovernance,
  ProductClassificationDetails,
  ProfessionalLegalReviewDetails,
  Project,
  ProjectDocument,
  ThirdPartyObligationItem,
  UnresolvedComplianceQuestion,
} from "@/lib/os/types";
import { cn } from "@/lib/utils";

export interface LegalComplianceEditorModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

export type ComplianceSectionId =
  | "classification"
  | "jurisdictions"
  | "licensing"
  | "privacy"
  | "disclosures"
  | "third_party"
  | "evidence"
  | "questions"
  | "counsel";

export function LegalComplianceEditorModal({
  project,
  open,
  onClose,
  onSave,
}: LegalComplianceEditorModalProps) {
  const [activeSection, setActiveSection] =
    useState<ComplianceSectionId>("classification");

  // Initial compliance content
  const initialContent: LegalComplianceContent = project.complianceContent ?? {
    frameworkSummary: "Fintech regulatory boundary and risk management regime.",
    productClassification: {
      category: "non_custodial_tool",
      custodyStatus: "non_custodial",
      regulatoryRole: "technology_provider",
      classificationRationale:
        "Software-only non-custodial execution analytics. Never holds, controls, or transmits user funds.",
    },
    jurisdictions: [
      {
        jurisdictionCode: "US - Federal",
        regulatoryBody: "CFTC / NFA",
        applicableRegime: "CEA / Rule 4.41",
        targetLaunchPhase: "tier_1_launch",
        complianceStatus: "in_review",
        notes: "Strict hypothetical performance disclaimer required.",
      },
    ],
    licensing: [
      {
        id: "lic-cta-publisher",
        licenseType: "Commodity Trading Advisor (CTA)",
        thresholdCriteria: "Impersonal publisher exemption",
        status: "verified_requirement",
        actionRequired:
          "Publish impersonal analysis only; do not provide bespoke client execution advice.",
        statutoryReference: "CFTC Rule 4.14(a)(9)",
      },
    ],
    privacyAndData: {
      dataClassification: "pseudonymous_trading_data",
      storageRegime: "local_first_only",
      applicableStatutes: ["GDPR", "CCPA", "India DPDP"],
      dataRetentionPolicy: "Local storage only. Zero centralized telemetry.",
      redactionRules: "Tokenize account IDs and mask financial PnL by default.",
    },
    disclosures: [
      {
        id: "disc-cftc-441",
        disclosureTitle: "CFTC Rule 4.41 Hypothetical Performance Disclaimer",
        requiredPlacement: "footer_all_pages",
        text: "HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE CERTAIN LIMITATIONS. UNLIKE AN ACTUAL PERFORMANCE RECORD, SIMULATED RESULTS DO NOT REPRESENT ACTUAL TRADING.",
        status: "verified_requirement",
      },
    ],
    thirdPartyObligations: [
      {
        id: "tpo-broker-api",
        counterparty: "Broker Execution API",
        agreementType: "api_terms_of_service",
        restrictions: [
          "No automated high-frequency order flooding",
          "Rate limited to 10 req/sec",
        ],
        auditFrequency: "Quarterly review",
        status: "verified_requirement",
      },
    ],
    evidence: [
      {
        id: "ev-statute-414",
        title:
          "CFTC Rule 4.14(a)(9) Impersonal Advisory Exemption Statutory Text",
        evidenceType: "statute_text",
        referenceUrlOrDoc:
          "https://www.cftc.gov/LawRegulation/CommodityExchangeAct/index.htm",
        dateRecorded: new Date().toISOString().slice(0, 10),
        verificationMethod: "Statute review",
      },
    ],
    unresolvedQuestions: [
      {
        id: "q-signal-classification",
        question:
          "Does automated alert webhook broadcasting trigger CTA registration in any state?",
        impactSeverity: "blocking_public_launch",
        hypothesizedAnswer:
          "Exempt if broadcast identically to all subscribers without personal discretion.",
        requiredExpertise: "securities_lawyer",
        status: "open",
      },
    ],
    professionalReview: {
      disclaimerOfNonLegalAdvice:
        "INFORMATIONAL GOVERNANCE SPECIFICATION ONLY — NOT FORMAL LEGAL ADVICE. This register tracks statutory risks and regulatory requirements for architectural integrity. Formal legal counsel review must be executed before commercial launch.",
    },
  };

  const [draftContent, setDraftContent] =
    useState<LegalComplianceContent>(initialContent);

  // Helper to render tripartite badges
  const renderStatusBadge = (status: ComplianceRequirementStatus) => {
    switch (status) {
      case "verified_requirement":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
            Verified Requirement
          </Badge>
        );
      case "potential_requirement":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
            Potential Requirement
          </Badge>
        );
      case "unresolved_question":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px]">
            Unresolved Question
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleSave = () => {
    // Sync into project.docs for doc type legal_compliance
    const existingDocs = (project.docs ?? []) as ProjectDocument[];
    const compDoc = existingDocs.find((d) => d.type === "legal_compliance");
    const updatedDoc: ProjectDocument = compDoc
      ? {
          ...compDoc,
          complianceContent: draftContent,
          updatedAt: new Date().toISOString(),
          version: (compDoc.version ?? 1) + 1,
        }
      : {
          id: `doc-${Date.now()}`,
          projectId: project.id,
          type: "legal_compliance",
          title: "Document 6: Legal & Compliance",
          content: draftContent.frameworkSummary,
          complianceContent: draftContent,
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const nextDocs = compDoc
      ? existingDocs.map((d) =>
          d.type === "legal_compliance" ? updatedDoc : d,
        )
      : [...existingDocs, updatedDoc];

    const updatedProj: Project = {
      ...project,
      complianceContent: draftContent,
      docs: nextDocs,
    };

    onSave(updatedProj);
    toast.success("Document 6: Legal & Compliance updated");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Document 6: Legal & Compliance Tracker (Fintech Workstream B)"
      wide
      className="max-w-5xl"
    >
      <div className="space-y-4">
        {/* MANDATORY LEGAL COUNSEL DISCLAIMER BANNER */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-400 block">
              NON-LEGAL ADVICE NOTICE & REGULATORY ARCHITECTURE REGISTER
            </span>
            <p className="text-[11px] leading-relaxed text-amber-300/90">
              {draftContent.professionalReview?.disclaimerOfNonLegalAdvice}
            </p>
          </div>
        </div>

        {/* 9 Dimensions Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-glass-border/70 pb-2">
          <button
            type="button"
            onClick={() => setActiveSection("classification")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "classification"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Scale className="h-3.5 w-3.5" /> 1. Classification
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("jurisdictions")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "jurisdictions"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Globe className="h-3.5 w-3.5" /> 2. Jurisdictions (
            {draftContent.jurisdictions?.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("licensing")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "licensing"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> 3. Licensing (
            {draftContent.licensing?.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("privacy")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "privacy"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Lock className="h-3.5 w-3.5" /> 4. Data & Privacy
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("disclosures")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "disclosures"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> 5. Disclosures (
            {draftContent.disclosures?.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("third_party")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "third_party"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <FileText className="h-3.5 w-3.5" /> 6. Counterparties (
            {draftContent.thirdPartyObligations?.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("evidence")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "evidence"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Award className="h-3.5 w-3.5" /> 7. Evidence (
            {draftContent.evidence?.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("questions")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "questions"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <HelpCircle className="h-3.5 w-3.5" /> 8. Questions (
            {draftContent.unresolvedQuestions?.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("counsel")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
              activeSection === "counsel"
                ? "bg-cyan/15 text-cyan border border-cyan/40"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <ShieldAlert className="h-3.5 w-3.5" /> 9. Formal Counsel
          </button>
        </div>

        {/* SECTION 1: PRODUCT CLASSIFICATION */}
        {activeSection === "classification" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
              <Scale className="h-4 w-4" /> 1. Product Classification &
              Regulatory Boundary
            </h4>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Product Regulatory Category</Label>
                <Select
                  value={
                    draftContent.productClassification?.category ??
                    "non_custodial_tool"
                  }
                  onChange={(val) =>
                    setDraftContent({
                      ...draftContent,
                      productClassification: {
                        ...(draftContent.productClassification as ProductClassificationDetails),
                        category:
                          val as ProductClassificationDetails["category"],
                      },
                    })
                  }
                  options={[
                    {
                      value: "non_custodial_tool",
                      label: "Non-Custodial Tool",
                    },
                    {
                      value: "analytics_dashboard",
                      label: "Analytics Dashboard",
                    },
                    { value: "trade_journal", label: "Trading Journal" },
                    { value: "signal_service", label: "Signal Service" },
                    { value: "algo_execution", label: "Automated Execution" },
                    { value: "ria_advisory", label: "RIA Advisory Service" },
                  ]}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <Label>Custody Status</Label>
                <Select
                  value={
                    draftContent.productClassification?.custodyStatus ??
                    "non_custodial"
                  }
                  onChange={(val) =>
                    setDraftContent({
                      ...draftContent,
                      productClassification: {
                        ...(draftContent.productClassification as ProductClassificationDetails),
                        custodyStatus:
                          val as ProductClassificationDetails["custodyStatus"],
                      },
                    })
                  }
                  options={[
                    {
                      value: "non_custodial",
                      label: "Non-Custodial (Never Holds Funds)",
                    },
                    {
                      value: "third_party_custody",
                      label: "Third-Party Broker Custody",
                    },
                    {
                      value: "custodial",
                      label: "Direct Custodial (High Risk)",
                    },
                  ]}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <Label>Regulatory Entity Role</Label>
                <Select
                  value={
                    draftContent.productClassification?.regulatoryRole ??
                    "technology_provider"
                  }
                  onChange={(val) =>
                    setDraftContent({
                      ...draftContent,
                      productClassification: {
                        ...(draftContent.productClassification as ProductClassificationDetails),
                        regulatoryRole:
                          val as ProductClassificationDetails["regulatoryRole"],
                      },
                    })
                  }
                  options={[
                    {
                      value: "technology_provider",
                      label: "Technology / Software Provider",
                    },
                    {
                      value: "educational_publisher",
                      label: "Educational Publisher",
                    },
                    {
                      value: "registered_entity",
                      label: "Registered Financial Entity",
                    },
                  ]}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div>
              <Label>Classification Rationale & Boundary Defense</Label>
              <Textarea
                value={
                  draftContent.productClassification?.classificationRationale ??
                  ""
                }
                onChange={(e) =>
                  setDraftContent({
                    ...draftContent,
                    productClassification: {
                      ...(draftContent.productClassification as ProductClassificationDetails),
                      classificationRationale: e.target.value,
                    },
                  })
                }
                placeholder="Explain why this tool remains outside the definition of a money transmitter, custodian, or bespoke investment advisor..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
        )}

        {/* SECTION 2: JURISDICTION TRACKING */}
        {activeSection === "jurisdictions" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> 2. Tracked Regulatory
                Jurisdictions
              </h4>
              <Button
                size="sm"
                variant="glass"
                onClick={() => {
                  const newJur: JurisdictionTrackingRecord = {
                    jurisdictionCode: "New Jurisdiction",
                    regulatoryBody: "Regulatory Agency",
                    applicableRegime: "Statutory Act",
                    targetLaunchPhase: "tier_1_launch",
                    complianceStatus: "in_review",
                  };
                  setDraftContent({
                    ...draftContent,
                    jurisdictions: [
                      ...(draftContent.jurisdictions ?? []),
                      newJur,
                    ],
                  });
                }}
                className="text-xs h-7"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Jurisdiction
              </Button>
            </div>

            <div className="space-y-2">
              {(draftContent.jurisdictions ?? []).map((jur, idx) => (
                <div
                  key={`${jur.jurisdictionCode}-${idx}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-glass-border/60 bg-secondary/20 p-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {jur.jurisdictionCode}
                      </span>
                      <span className="text-cyan font-mono text-[11px]">
                        • {jur.regulatoryBody}
                      </span>
                      <Badge className="text-[10px] bg-secondary text-muted-foreground capitalize">
                        {jur.complianceStatus}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Regime: {jur.applicableRegime} | Phase:{" "}
                      {jur.targetLaunchPhase}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftContent({
                        ...draftContent,
                        jurisdictions: (
                          draftContent.jurisdictions ?? []
                        ).filter((_, i) => i !== idx),
                      });
                    }}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: LICENSING REQUIREMENTS */}
        {activeSection === "licensing" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> 3. Licensing & Registration
                Requirements
              </h4>
              <Button
                size="sm"
                variant="glass"
                onClick={() => {
                  const newLic: LicensingRequirementItem = {
                    id: `lic-${Date.now()}`,
                    licenseType: "New License Analysis",
                    thresholdCriteria: "Commercial user threshold",
                    status: "potential_requirement",
                    actionRequired:
                      "Confirm exemption applicability with legal counsel.",
                  };
                  setDraftContent({
                    ...draftContent,
                    licensing: [...(draftContent.licensing ?? []), newLic],
                  });
                }}
                className="text-xs h-7"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Licensing Item
              </Button>
            </div>

            <div className="space-y-2">
              {(draftContent.licensing ?? []).map((lic, idx) => (
                <div
                  key={lic.id}
                  className="rounded-xl border border-glass-border/60 bg-secondary/20 p-3 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {lic.licenseType}
                    </span>
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(lic.status)}
                      <button
                        type="button"
                        onClick={() => {
                          setDraftContent({
                            ...draftContent,
                            licensing: (draftContent.licensing ?? []).filter(
                              (_, i) => i !== idx,
                            ),
                          });
                        }}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Threshold:{" "}
                    </span>
                    {lic.thresholdCriteria}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Action:{" "}
                    </span>
                    {lic.actionRequired}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: DATA & PRIVACY GOVERNANCE */}
        {activeSection === "privacy" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
              <Lock className="h-4 w-4" /> 4. Privacy, KYC & Financial Data
              Governance
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Data Classification</Label>
                <Select
                  value={
                    draftContent.privacyAndData?.dataClassification ??
                    "pseudonymous_trading_data"
                  }
                  onChange={(val) =>
                    setDraftContent({
                      ...draftContent,
                      privacyAndData: {
                        ...(draftContent.privacyAndData as PrivacyAndDataGovernance),
                        dataClassification:
                          val as PrivacyAndDataGovernance["dataClassification"],
                      },
                    })
                  }
                  options={[
                    { value: "public", label: "Public Market Data" },
                    {
                      value: "pseudonymous_trading_data",
                      label: "Pseudonymous Execution Data",
                    },
                    {
                      value: "financial_records",
                      label: "Financial Records & PnL",
                    },
                    {
                      value: "pii_sensitive",
                      label: "Personally Identifiable Information (PII)",
                    },
                  ]}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <Label>Storage Architecture Regime</Label>
                <Select
                  value={
                    draftContent.privacyAndData?.storageRegime ??
                    "local_first_only"
                  }
                  onChange={(val) =>
                    setDraftContent({
                      ...draftContent,
                      privacyAndData: {
                        ...(draftContent.privacyAndData as PrivacyAndDataGovernance),
                        storageRegime:
                          val as PrivacyAndDataGovernance["storageRegime"],
                      },
                    })
                  }
                  options={[
                    {
                      value: "local_first_only",
                      label: "Local-First Only (Strictly Private)",
                    },
                    {
                      value: "client_encrypted",
                      label: "Client Encrypted Sync",
                    },
                    {
                      value: "cloud_synced",
                      label: "Cloud Synced (Requires SOC2/GDPR DPA)",
                    },
                  ]}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div>
              <Label>Data Retention & Deletion Policy</Label>
              <Textarea
                value={draftContent.privacyAndData?.dataRetentionPolicy ?? ""}
                onChange={(e) =>
                  setDraftContent({
                    ...draftContent,
                    privacyAndData: {
                      ...(draftContent.privacyAndData as PrivacyAndDataGovernance),
                      dataRetentionPolicy: e.target.value,
                    },
                  })
                }
                rows={2}
                className="text-xs"
              />
            </div>

            <div>
              <Label>Redaction & Confidentiality Rules</Label>
              <Textarea
                value={draftContent.privacyAndData?.redactionRules ?? ""}
                onChange={(e) =>
                  setDraftContent({
                    ...draftContent,
                    privacyAndData: {
                      ...(draftContent.privacyAndData as PrivacyAndDataGovernance),
                      redactionRules: e.target.value,
                    },
                  })
                }
                rows={2}
                className="text-xs"
              />
            </div>
          </div>
        )}

        {/* SECTION 5: MANDATORY DISCLOSURES */}
        {activeSection === "disclosures" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> 5. Mandatory Disclosures &
                Risk Warnings
              </h4>
              <Button
                size="sm"
                variant="glass"
                onClick={() => {
                  const newDisc: MandatoryDisclosureItem = {
                    id: `disc-${Date.now()}`,
                    disclosureTitle: "Risk Warning",
                    requiredPlacement: "footer_all_pages",
                    text: "Trading financial instruments involves significant risk of loss.",
                    status: "verified_requirement",
                  };
                  setDraftContent({
                    ...draftContent,
                    disclosures: [...(draftContent.disclosures ?? []), newDisc],
                  });
                }}
                className="text-xs h-7"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Disclosure
              </Button>
            </div>

            <div className="space-y-2">
              {(draftContent.disclosures ?? []).map((disc, idx) => (
                <div
                  key={disc.id}
                  className="rounded-xl border border-glass-border/60 bg-secondary/20 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {disc.disclosureTitle}
                    </span>
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(disc.status)}
                      <button
                        type="button"
                        onClick={() => {
                          setDraftContent({
                            ...draftContent,
                            disclosures: (
                              draftContent.disclosures ?? []
                            ).filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono bg-secondary/40 p-2 rounded">
                    &quot;{disc.text}&quot;
                  </p>
                  <span className="text-[10px] text-cyan capitalize block">
                    Placement: {disc.requiredPlacement.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: COUNTERPARTY OBLIGATIONS */}
        {activeSection === "third_party" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> 6. Third-Party & Counterparty
                Obligations
              </h4>
              <Button
                size="sm"
                variant="glass"
                onClick={() => {
                  const newTpo: ThirdPartyObligationItem = {
                    id: `tpo-${Date.now()}`,
                    counterparty: "Vendor / Exchange API",
                    agreementType: "api_terms_of_service",
                    restrictions: ["No redistributing raw L2 orderbook feeds"],
                    auditFrequency: "Annual",
                    status: "verified_requirement",
                  };
                  setDraftContent({
                    ...draftContent,
                    thirdPartyObligations: [
                      ...(draftContent.thirdPartyObligations ?? []),
                      newTpo,
                    ],
                  });
                }}
                className="text-xs h-7"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Obligation
              </Button>
            </div>

            <div className="space-y-2">
              {(draftContent.thirdPartyObligations ?? []).map((tpo, idx) => (
                <div
                  key={tpo.id}
                  className="rounded-xl border border-glass-border/60 bg-secondary/20 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {tpo.counterparty} ({tpo.agreementType.replace(/_/g, " ")}
                      )
                    </span>
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(tpo.status)}
                      <button
                        type="button"
                        onClick={() => {
                          setDraftContent({
                            ...draftContent,
                            thirdPartyObligations: (
                              draftContent.thirdPartyObligations ?? []
                            ).filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Restrictions: {tpo.restrictions.join(", ")}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Audit Frequency: {tpo.auditFrequency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: COMPLIANCE EVIDENCE REPOSITORY */}
        {activeSection === "evidence" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
              <Award className="h-4 w-4" /> 7. Compliance Evidence &
              Verification Audit Trail
            </h4>

            <div className="space-y-2">
              {(draftContent.evidence ?? []).map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-glass-border/60 bg-secondary/20 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {ev.title}
                    </span>
                    <Badge className="text-[10px] bg-cyan/15 text-cyan border-cyan/30 capitalize">
                      {ev.evidenceType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Recorded: {ev.dateRecorded} | Method:{" "}
                    {ev.verificationMethod}
                  </div>
                  {ev.referenceUrlOrDoc && (
                    <div className="text-[10px] text-cyan font-mono truncate">
                      Ref: {ev.referenceUrlOrDoc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: OPEN QUESTIONS & UNCERTAINTY REGISTER */}
        {activeSection === "questions" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" /> 8. Open Questions &
                Regulatory Uncertainty
              </h4>
              <Button
                size="sm"
                variant="glass"
                onClick={() => {
                  const newQ: UnresolvedComplianceQuestion = {
                    id: `q-${Date.now()}`,
                    question: "New compliance inquiry...",
                    impactSeverity: "blocking_public_launch",
                    hypothesizedAnswer: "Pending counsel confirmation.",
                    requiredExpertise: "fintech_counsel",
                    status: "open",
                  };
                  setDraftContent({
                    ...draftContent,
                    unresolvedQuestions: [
                      ...(draftContent.unresolvedQuestions ?? []),
                      newQ,
                    ],
                  });
                }}
                className="text-xs h-7"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Inquiry
              </Button>
            </div>

            <div className="space-y-2">
              {(draftContent.unresolvedQuestions ?? []).map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-glass-border/60 bg-secondary/20 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {q.question}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px] bg-destructive/20 text-destructive border-destructive/30 uppercase">
                        {q.impactSeverity.replace(/_/g, " ")}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => {
                          setDraftContent({
                            ...draftContent,
                            unresolvedQuestions: (
                              draftContent.unresolvedQuestions ?? []
                            ).filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Hypothesis:{" "}
                    </span>
                    {q.hypothesizedAnswer}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Required Counsel:{" "}
                    <span className="text-cyan font-mono">
                      {q.requiredExpertise.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 9: PROFESSIONAL LEGAL REVIEW */}
        {activeSection === "counsel" && (
          <div className="space-y-4 rounded-2xl border border-glass-border/70 bg-secondary/30 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> 9. Formal Legal Counsel Review
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Retained Counsel / Law Firm</Label>
                <Input
                  value={
                    draftContent.professionalReview?.counselNameOrFirm ?? ""
                  }
                  onChange={(e) =>
                    setDraftContent({
                      ...draftContent,
                      professionalReview: {
                        ...(draftContent.professionalReview as ProfessionalLegalReviewDetails),
                        counselNameOrFirm: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Wilson Sonsini / Fintech Practice Group"
                  className="text-xs h-9"
                />
              </div>

              <div>
                <Label>Last Formal Review Date</Label>
                <Input
                  type="date"
                  value={
                    draftContent.professionalReview?.lastFormalReviewDate ?? ""
                  }
                  onChange={(e) =>
                    setDraftContent({
                      ...draftContent,
                      professionalReview: {
                        ...(draftContent.professionalReview as ProfessionalLegalReviewDetails),
                        lastFormalReviewDate: e.target.value,
                      },
                    })
                  }
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div>
              <Label>Counsel Opinion Summary / Scope of Advice</Label>
              <Textarea
                value={
                  draftContent.professionalReview?.counselOpinionSummary ?? ""
                }
                onChange={(e) =>
                  setDraftContent({
                    ...draftContent,
                    professionalReview: {
                      ...(draftContent.professionalReview as ProfessionalLegalReviewDetails),
                      counselOpinionSummary: e.target.value,
                    },
                  })
                }
                placeholder="Summary of legal opinion letters, memo references, and statutory boundary approvals..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-glass-border/60 pt-4">
          <span className="text-[11px] text-muted-foreground font-mono">
            Document 6: Legal & Compliance • 9 Dimensions Governed
          </span>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 mr-1" /> Save Legal & Compliance
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
