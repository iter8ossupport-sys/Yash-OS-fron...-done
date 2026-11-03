import type {
  ApplicationRecord,
  CapabilityArea,
  KnowledgeArtifact,
  LearningJourney,
  LearningKnowledgeSystem,
  LearningObjective,
  LearningResource,
  LearningReview,
  LearningSession,
  OSState,
} from "../types";

/**
 * Returns a rich, realistic baseline Learning Knowledge System with both
 * Skill Development and Subject Exploration journeys.
 */
export function createDefaultLearningSystem(): LearningKnowledgeSystem {
  const now = new Date().toISOString();

  // 1. Initial Canonical Resources (reusable across journeys)
  const resources: LearningResource[] = [
    {
      id: "res-refactoring-ui",
      title: "Refactoring UI",
      type: "book",
      authorOrSource: "Adam Wathan & Steve Schoger",
      description:
        "Tactical UI design rules for developers thinking in components.",
      whyStudying:
        "Eliminate visual ambiguity and achieve high-craft dark glass UI aesthetics.",
      status: "in_progress",
      journeyIds: ["journey-ui-ux"],
      notes:
        "Establish visual hierarchy with spacing and contrast before adding color borders.",
      distilledTakeaways: [
        "Avoid using gray borders on dark surfaces; use white with 5-10% opacity.",
        "Spacing scale must follow strict geometric multiples (4px, 8px, 12px, 16px).",
        "Visual hierarchy is established by font-weight and opacity, not just font size.",
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "res-thinking-fast-slow",
      title: "Thinking, Fast and Slow",
      type: "book",
      authorOrSource: "Daniel Kahneman",
      description:
        "System 1 vs System 2 cognitive processing, heuristics, and biases.",
      whyStudying:
        "Deconstruct founder cognitive bias during trading drawdown and architectural trade-offs.",
      status: "in_progress",
      journeyIds: ["journey-psychology"],
      notes:
        "Loss aversion creates asymmetric psychological pain (2.5x) leading to revenge trading.",
      distilledTakeaways: [
        "What you see is all there is (WYSIATI) induces premature conclusions.",
        "Loss aversion must be countered by hard automated circuit breakers, not willpower.",
        "System 2 is cognitively lazy; architecture checklists force deliberative evaluation.",
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "res-tanstack-docs",
      title: "TanStack Start & Router Architecture Guides",
      type: "documentation",
      authorOrSource: "Tanner Linsley",
      description:
        "Full-stack server runtime, SSR streaming, and route tree optimization.",
      whyStudying:
        "Master modern full-stack hydration boundaries and zero-latency routing.",
      status: "completed",
      journeyIds: ["journey-ui-ux"],
      notes:
        "Route loaders execute before component hydration, preventing layout shift.",
      distilledTakeaways: [
        "Never block route loader on unindexed database queries.",
        "Keep client state local unless global subscription is mandatory.",
      ],
      createdAt: now,
      updatedAt: now,
      completedAt: now,
    },
  ];

  // 2. Initial Capability Areas
  const capabilities: CapabilityArea[] = [
    {
      id: "cap-ui-design",
      name: "Responsive Dark Glass UI Systems",
      description:
        "Building production UI with strict dark mode contrast, zero overflow, and fluid responsiveness.",
      journeyIds: ["journey-ui-ux"],
      currentState: "demonstrated_independently",
      evidence:
        "Engineered PortfolioHierarchyTree, dark glass theme, and verified on 21 test suites.",
      reviewDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cap-decision-under-risk",
      name: "Probabilistic Decision Architecture",
      description:
        "Making disciplined choices under uncertainty without emotional tilt.",
      journeyIds: ["journey-psychology"],
      currentState: "developing",
      evidence:
        "Rule adherence checklist logged across daily trading execution records.",
      reviewDate: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 3. Journey A: Skill Development (Requires understanding + practical application)
  const journeySkill: LearningJourney = {
    id: "journey-ui-ux",
    title: "UI/UX & Design Systems Engineering",
    description:
      "Master modern design systems, glassmorphism, responsive hierarchies, and component state architectures.",
    type: "skill_development",
    status: "active",
    purposeAndOutcome:
      "Design and implement world-class software interfaces that feel instantaneous and visually coherent.",
    capabilityAreaIds: ["cap-ui-design"],
    createdAt: now,
    updatedAt: now,
    objectives: [
      {
        id: "obj-ui-1",
        journeyId: "journey-ui-ux",
        title:
          "Master dark glass token palettes and sub-pixel border rendering",
        status: "achieved",
        targetCapabilityId: "cap-ui-design",
        evidenceSummary:
          "Implemented in src/styles.css with 100% test coverage.",
        createdAt: now,
        achievedAt: now,
      },
      {
        id: "obj-ui-2",
        journeyId: "journey-ui-ux",
        title:
          "Build compact tree hierarchy visualization with zero horizontal overflow",
        status: "achieved",
        targetCapabilityId: "cap-ui-design",
        evidenceSummary:
          "PortfolioHierarchyTree verified across desktop and mobile viewports.",
        createdAt: now,
        achievedAt: now,
      },
    ],
  };

  // 4. Journey B: Subject Exploration (Understanding, retention, synthesis; application optional)
  const journeyExploration: LearningJourney = {
    id: "journey-psychology",
    title: "Cognitive Psychology & Behavioral Decision Theory",
    description:
      "Explore human decision-making under uncertainty, cognitive biases, mental models, and emotional discipline.",
    type: "subject_exploration",
    status: "active",
    purposeAndOutcome:
      "Synthesize cognitive models to make better strategic trade-offs and understand user behavior deeply.",
    capabilityAreaIds: ["cap-decision-under-risk"],
    createdAt: now,
    updatedAt: now,
    objectives: [
      {
        id: "obj-psy-1",
        journeyId: "journey-psychology",
        title: "Understand heuristics, cognitive biases, and System 1 thinking",
        status: "active",
        targetCapabilityId: "cap-decision-under-risk",
        evidenceSummary: "Studied Kahneman mental model framework.",
        createdAt: now,
      },
    ],
  };

  // 5. Initial Sessions
  const sessions: LearningSession[] = [
    {
      id: "sess-ui-tokens",
      journeyId: "journey-ui-ux",
      title: "Sub-pixel Opacity & Glass Contrast in OKLCH",
      date: now.split("T")[0]!,
      conceptStudied:
        "OKLCH lightness and chroma separation for dark-theme surfaces",
      questionsAndUncertainties:
        "Why do low-alpha hex borders render inconsistent gray lines across LCD panels?",
      explanationInOwnWords:
        "OKLCH allows adjusting perceptual lightness without mutating hue or saturation. White with 0.08 alpha on OKLCH background guarantees consistent edge illumination without muddy grays.",
      newInsights:
        "Glass containers need subtle inset highlights (1px 0.06 alpha) rather than solid outlines to create authentic glass depth.",
      referencedResourceIds: ["res-refactoring-ui"],
      referencedObjectiveIds: ["obj-ui-1"],
      optionalNextAction:
        "Apply inset highlight to glass utility in styles.css",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sess-loss-aversion",
      journeyId: "journey-psychology",
      title: "Asymmetric Utility & Sunk Cost Fallacies",
      date: now.split("T")[0]!,
      conceptStudied:
        "Prospect Theory: Value function is steeper for losses than for gains",
      questionsAndUncertainties:
        "How does loss aversion interact with software refactoring decisions?",
      explanationInOwnWords:
        "Engineers cling to buggy or obsolete implementations because discarding them feels like an acute loss, whereas rewriting with clean architecture represents an uncertain future gain.",
      newInsights:
        "Code sunk cost can be mitigated by committing working trees early into isolated branches.",
      referencedResourceIds: ["res-thinking-fast-slow"],
      referencedObjectiveIds: ["obj-psy-1"],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 6. Initial Application Record (linked to Project & Task)
  const applications: ApplicationRecord[] = [
    {
      id: "app-portfolio-tree",
      journeyId: "journey-ui-ux",
      title: "Portfolio Hierarchy Tree Visualizer Implementation",
      type: "product_implementation",
      description:
        "Replaced 3 disconnected priority columns with a unified parent-child tree layout.",
      linkedObjectiveIds: ["obj-ui-2"],
      linkedPriorityId: 1,
      linkedProjectId: "p1-core",
      evidenceOutput:
        "PortfolioHierarchyTree.tsx merged with 10 unit tests passing.",
      outcomeAchieved: true,
      appliedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 7. Initial Knowledge Artifacts (Preserving source provenance)
  const knowledgeArtifacts: KnowledgeArtifact[] = [
    {
      id: "art-glass-design",
      title: "The Glass Highlight Rule",
      category: "principle",
      content:
        "Never stroke a dark glass container with an opaque gray border. Use white at 6-12% opacity with an inset 1px box shadow to simulate genuine light refraction.",
      sourceProvenance: {
        journeyId: "journey-ui-ux",
        journeyTitle: "UI/UX & Design Systems Engineering",
        resourceId: "res-refactoring-ui",
        resourceTitle: "Refactoring UI",
        sessionId: "sess-ui-tokens",
      },
      tags: ["design", "css", "glassmorphism", "ui"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "art-system-1-tilt",
      title: "System 1 Circuit Breaker Protocol",
      category: "framework",
      content:
        "Under severe stress, System 1 overtakes conscious deliberation. Real-time decision makers must bind themselves to hard, external automated circuit breakers rather than relying on willpower.",
      sourceProvenance: {
        journeyId: "journey-psychology",
        journeyTitle: "Cognitive Psychology & Behavioral Decision Theory",
        resourceId: "res-thinking-fast-slow",
        resourceTitle: "Thinking, Fast and Slow",
        sessionId: "sess-loss-aversion",
      },
      tags: ["psychology", "risk", "trading", "decisions"],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 8. Initial Learning Reviews
  const reviews: LearningReview[] = [
    {
      id: "rev-ui-1",
      journeyId: "journey-ui-ux",
      date: now.split("T")[0]!,
      intendedLearning:
        "Master dark glass UI architecture and responsive container sizing.",
      actualUnderstanding:
        "Achieved deep understanding of OKLCH lightness scales and sub-pixel border rendering.",
      practicalApplication:
        "Built PortfolioHierarchyTree component and eliminated viewport whitespace drift.",
      evidence:
        "Verified clean visual output and 100% test pass rate across 21 test files.",
      remainingGaps:
        "Keyboard navigation across deep interactive trees could be further streamlined.",
      nextImprovement: "Implement arrow-key roving focus in next iteration.",
      createdAt: now,
    },
  ];

  return {
    id: "learning-system-core",
    version: 1,
    coreDocument: {
      title: "Learning & Knowledge Operating System",
      markdownContent:
        "# Founder Capability Operating System\n\nLearning for execution.",
      lastUpdated: now,
    },
    activeWorkflow: "capability_acquisition",
    journeys: [journeySkill, journeyExploration],
    resources,
    sessions,
    applications,
    capabilities,
    knowledgeArtifacts,
    reviews,
    acquisitions: [],
    discoveries: [],
  };
}

/**
 * Guarantees that state.learningSystem exists and possesses all first-class collections.
 */
export function ensureLearningSystem(state: OSState): LearningKnowledgeSystem {
  if (!state.learningSystem) {
    return createDefaultLearningSystem();
  }

  const existing = state.learningSystem;
  return {
    ...existing,
    journeys:
      existing.journeys && existing.journeys.length > 0
        ? existing.journeys
        : createDefaultLearningSystem().journeys,
    resources:
      existing.resources && existing.resources.length > 0
        ? existing.resources
        : createDefaultLearningSystem().resources,
    sessions: existing.sessions ?? [],
    applications: existing.applications ?? [],
    capabilities: existing.capabilities ?? [],
    knowledgeArtifacts: existing.knowledgeArtifacts ?? [],
    reviews: existing.reviews ?? [],
    acquisitions: existing.acquisitions ?? [],
    discoveries: existing.discoveries ?? [],
  };
}

/**
 * Saves or updates a LearningJourney in state.
 */
export function saveLearningJourney(
  state: OSState,
  journey: LearningJourney,
): OSState {
  const current = ensureLearningSystem(state);
  const now = new Date().toISOString();
  const journeyWithTimestamp: LearningJourney = {
    ...journey,
    updatedAt: now,
    createdAt: journey.createdAt || now,
  };

  const exists = current.journeys.some((j) => j.id === journey.id);
  const updatedJourneys = exists
    ? current.journeys.map((j) =>
        j.id === journey.id ? journeyWithTimestamp : j,
      )
    : [journeyWithTimestamp, ...current.journeys];

  return {
    ...state,
    learningSystem: {
      ...current,
      journeys: updatedJourneys,
    },
  };
}

/**
 * Saves or updates a LearningObjective on a specific Journey in state.
 */
export function saveLearningObjective(
  state: OSState,
  objective: LearningObjective,
): OSState {
  const current = ensureLearningSystem(state);
  const targetJourney = current.journeys.find(
    (j) => j.id === objective.journeyId,
  );
  if (!targetJourney) return state;

  const currentObjectives = targetJourney.objectives ?? [];
  const exists = currentObjectives.some((o) => o.id === objective.id);
  const updatedObjectives = exists
    ? currentObjectives.map((o) => (o.id === objective.id ? objective : o))
    : [...currentObjectives, objective];

  return saveLearningJourney(state, {
    ...targetJourney,
    objectives: updatedObjectives,
  });
}

/**
 * Deletes a LearningObjective from a Journey in state.
 */
export function deleteLearningObjective(
  state: OSState,
  journeyId: string,
  objectiveId: string,
): OSState {
  const current = ensureLearningSystem(state);
  const targetJourney = current.journeys.find((j) => j.id === journeyId);
  if (!targetJourney) return state;

  const updatedObjectives = (targetJourney.objectives ?? []).filter(
    (o) => o.id !== objectiveId,
  );

  return saveLearningJourney(state, {
    ...targetJourney,
    objectives: updatedObjectives,
  });
}

/**
 * Saves or updates a canonical LearningResource in state.
 */
export function saveLearningResource(
  state: OSState,
  resource: LearningResource,
): OSState {
  const current = ensureLearningSystem(state);
  const now = new Date().toISOString();
  const resourceWithTimestamp: LearningResource = {
    ...resource,
    updatedAt: now,
    createdAt: resource.createdAt || now,
  };

  const exists = current.resources.some((r) => r.id === resource.id);
  const updatedResources = exists
    ? current.resources.map((r) =>
        r.id === resource.id ? resourceWithTimestamp : r,
      )
    : [resourceWithTimestamp, ...current.resources];

  return {
    ...state,
    learningSystem: {
      ...current,
      resources: updatedResources,
    },
  };
}

/**
 * Deletes a canonical LearningResource in state.
 */
export function deleteLearningResource(
  state: OSState,
  resourceId: string,
): OSState {
  const current = ensureLearningSystem(state);
  const updatedResources = current.resources.filter((r) => r.id !== resourceId);

  return {
    ...state,
    learningSystem: {
      ...current,
      resources: updatedResources,
    },
  };
}

/**
 * Saves or updates a LearningSession in state.
 */
export function saveLearningSession(
  state: OSState,
  session: LearningSession,
): OSState {
  const current = ensureLearningSystem(state);
  const now = new Date().toISOString();
  const sessionWithTimestamp: LearningSession = {
    ...session,
    updatedAt: now,
    createdAt: session.createdAt || now,
  };

  const exists = current.sessions.some((s) => s.id === session.id);
  const updatedSessions = exists
    ? current.sessions.map((s) =>
        s.id === session.id ? sessionWithTimestamp : s,
      )
    : [sessionWithTimestamp, ...current.sessions];

  return {
    ...state,
    learningSystem: {
      ...current,
      sessions: updatedSessions,
    },
  };
}

/**
 * Deletes a LearningSession in state.
 */
export function deleteLearningSession(
  state: OSState,
  sessionId: string,
): OSState {
  const current = ensureLearningSystem(state);
  const updatedSessions = current.sessions.filter((s) => s.id !== sessionId);

  return {
    ...state,
    learningSystem: {
      ...current,
      sessions: updatedSessions,
    },
  };
}

/**
 * Saves or updates an ApplicationRecord in state.
 */
export function saveApplicationRecord(
  state: OSState,
  application: ApplicationRecord,
): OSState {
  const current = ensureLearningSystem(state);
  const now = new Date().toISOString();
  const appWithTimestamp: ApplicationRecord = {
    ...application,
    updatedAt: now,
    createdAt: application.createdAt || now,
  };

  const exists = current.applications.some((a) => a.id === application.id);
  const updatedApplications = exists
    ? current.applications.map((a) =>
        a.id === application.id ? appWithTimestamp : a,
      )
    : [appWithTimestamp, ...current.applications];

  return {
    ...state,
    learningSystem: {
      ...current,
      applications: updatedApplications,
    },
  };
}

/**
 * Deletes an ApplicationRecord in state.
 */
export function deleteApplicationRecord(
  state: OSState,
  applicationId: string,
): OSState {
  const current = ensureLearningSystem(state);
  const updatedApplications = current.applications.filter(
    (a) => a.id !== applicationId,
  );

  return {
    ...state,
    learningSystem: {
      ...current,
      applications: updatedApplications,
    },
  };
}

/**
 * Saves or updates a CapabilityArea in state.
 */
export function saveCapabilityArea(
  state: OSState,
  capability: CapabilityArea,
): OSState {
  const current = ensureLearningSystem(state);
  const now = new Date().toISOString();
  const capWithTimestamp: CapabilityArea = {
    ...capability,
    updatedAt: now,
    createdAt: capability.createdAt || now,
  };

  const exists = current.capabilities.some((c) => c.id === capability.id);
  const updatedCapabilities = exists
    ? current.capabilities.map((c) =>
        c.id === capability.id ? capWithTimestamp : c,
      )
    : [capWithTimestamp, ...current.capabilities];

  return {
    ...state,
    learningSystem: {
      ...current,
      capabilities: updatedCapabilities,
    },
  };
}

/**
 * Saves or updates a KnowledgeArtifact in state.
 */
export function saveKnowledgeArtifact(
  state: OSState,
  artifact: KnowledgeArtifact,
): OSState {
  const current = ensureLearningSystem(state);
  const now = new Date().toISOString();
  const artifactWithTimestamp: KnowledgeArtifact = {
    ...artifact,
    updatedAt: now,
    createdAt: artifact.createdAt || now,
  };

  const exists = current.knowledgeArtifacts.some((a) => a.id === artifact.id);
  const updatedArtifacts = exists
    ? current.knowledgeArtifacts.map((a) =>
        a.id === artifact.id ? artifactWithTimestamp : a,
      )
    : [artifactWithTimestamp, ...current.knowledgeArtifacts];

  return {
    ...state,
    learningSystem: {
      ...current,
      knowledgeArtifacts: updatedArtifacts,
    },
  };
}

/**
 * Saves or updates a LearningReview in state.
 */
export function saveLearningReview(
  state: OSState,
  review: LearningReview,
): OSState {
  const current = ensureLearningSystem(state);
  const now = new Date().toISOString();
  const reviewWithTimestamp: LearningReview = {
    ...review,
    createdAt: review.createdAt || now,
  };

  const exists = current.reviews.some((r) => r.id === review.id);
  const updatedReviews = exists
    ? current.reviews.map((r) => (r.id === review.id ? reviewWithTimestamp : r))
    : [reviewWithTimestamp, ...current.reviews];

  return {
    ...state,
    learningSystem: {
      ...current,
      reviews: updatedReviews,
    },
  };
}
