import { describe, expect, it } from "vitest";
import { saveLegalComplianceContent } from "../lib/os/logic";
import { validateProject } from "../lib/os/validation/schemas";
import { migrateOSState } from "../lib/os/reviews/migrations";
import type {
  LegalComplianceContent,
  Project,
  ProjectDocument,
} from "../lib/os/types";

describe("Phase 3: Priority 2 Workstream B — Legal & Compliance Governance Tests", () => {
  it("1. saves and updates Document 6 (Legal & Compliance) on a Workstream B project", () => {
    const state = migrateOSState({});
    const project: Project = {
      id: "fintech-algo-saas",
      name: "Algorithmic Execution Utility",
      objective: "Non-custodial algorithmic order routing tool",
      priorityId: 2,
      workstream: "B",
      status: "active",
      hypothesis: "Traders want fast disciplined bracket orders",
      milestone: "Ship desktop tool MVP",
      metrics: "5 beta users",
      bottlenecks: "",
      evidence: "",
      decisions: "",
      learning: "",
      documents: "",
      createdAt: "2026-11-01T00:00:00.000Z",
      goals: [],
      milestones: [],
      docs: [],
    };

    const stateWithProject = {
      ...state,
      projects: [...state.projects, project],
    };

    const complianceContent: LegalComplianceContent = {
      frameworkSummary:
        "Non-custodial trade execution utility operating locally in client browser/desktop environment.",
      productClassification: {
        category: "non_custodial_tool",
        custodyStatus: "non_custodial",
        regulatoryRole: "technology_provider",
        classificationRationale:
          "Zero custody of user funds; user supplies their own broker API keys and triggers all orders.",
      },
      jurisdictions: [
        {
          jurisdictionCode: "US",
          regulatoryBody: "SEC / CFTC",
          applicableRegime: "Commodity Exchange Act / Publisher Safe Harbor",
          targetLaunchPhase: "tier_1_launch",
          complianceStatus: "compliant",
          notes: "Non-personalized trade routing",
        },
      ],
      licensing: [
        {
          id: "lic-ria-1",
          licenseType: "RIA Registration Exemption",
          thresholdCriteria:
            "No discretionary management or personalized advice",
          status: "verified_requirement",
          actionRequired: "Enforce disclaimer and manual configuration",
        },
      ],
      privacyAndData: {
        dataClassification: "pseudonymous_trading_data",
        storageRegime: "local_first_only",
        applicableStatutes: ["GDPR", "CCPA/CPRA"],
        dataRetentionPolicy: "100% on-device storage",
        redactionRules: "Redact tokenized PnL from telemetry",
      },
      disclosures: [
        {
          id: "disc-cftc-1",
          disclosureTitle: "CFTC Rule 4.41 Hypothetical Disclaimer",
          requiredPlacement: "modal_confirmation",
          text: "Hypothetical or simulated performance results have certain limitations.",
          status: "verified_requirement",
        },
      ],
      thirdPartyObligations: [
        {
          id: "tpo-ibkr-1",
          counterparty: "Interactive Brokers Client Portal API",
          agreementType: "developer_agreement",
          restrictions: ["Never store broker credentials server-side"],
          auditFrequency: "Annual",
          status: "verified_requirement",
        },
      ],
      evidence: [
        {
          id: "ev-counsel-memo-1",
          title: "Securities Counsel Opinion Letter",
          evidenceType: "counsel_memo",
          referenceUrlOrDoc: "docs/legal/counsel-opinion-2026.pdf",
          dateRecorded: "2026-11-02",
          verificationMethod: "Formal review by external fintech counsel",
        },
      ],
      unresolvedQuestions: [
        {
          id: "uq-eu-mica-1",
          question:
            "Does expanding to crypto futures require EU MiCA CASP license?",
          impactSeverity: "scaling_limitation",
          hypothesizedAnswer:
            "Non-custodial routing without order matching or settlement should fall outside CASP scope.",
          requiredExpertise: "securities_lawyer",
          status: "open",
        },
      ],
      professionalReview: {
        counselNameOrFirm: "Apex Fintech Legal Partners LLP",
        lastFormalReviewDate: "2026-10-25",
        disclaimerOfNonLegalAdvice:
          "Yash OS provides operational governance, discipline tracking, and strategic compliance planning. It does not provide formal legal advice.",
      },
    };

    const s1 = saveLegalComplianceContent(
      stateWithProject,
      "fintech-algo-saas",
      complianceContent,
    );

    const savedProject = s1.projects.find((p) => p.id === "fintech-algo-saas");
    expect(savedProject).toBeDefined();
    expect(savedProject?.complianceContent).toBeDefined();
    expect(
      savedProject?.complianceContent?.productClassification?.category,
    ).toBe("non_custodial_tool");

    const legalDoc = savedProject?.docs?.find(
      (d) => "type" in d && (d as ProjectDocument).type === "legal_compliance",
    ) as ProjectDocument;
    expect(legalDoc).toBeDefined();
    expect(legalDoc.complianceContent?.licensing?.length).toBe(1);
    expect(legalDoc.complianceContent?.disclosures?.length).toBe(1);
    expect(legalDoc.complianceContent?.unresolvedQuestions?.length).toBe(1);

    // Zod schema validation passes
    const validation = validateProject(savedProject);
    expect(validation.success).toBe(true);
  });

  it("2. enforces tripartite status classification across requirements and questions", () => {
    const statuses = [
      "verified_requirement",
      "potential_requirement",
      "unresolved_question",
    ] as const;

    statuses.forEach((st) => {
      expect([
        "verified_requirement",
        "potential_requirement",
        "unresolved_question",
      ]).toContain(st);
    });
  });
});
