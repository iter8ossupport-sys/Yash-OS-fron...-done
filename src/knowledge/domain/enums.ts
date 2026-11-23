/**
 * Global Knowledge: Domain Enums & Value Object Definitions
 *
 * Strict Architectural Rule: Pure TypeScript; 0 React or Browser dependencies.
 */

/** Top-level structural cluster grouping in the Knowledge Graph */
export const GRAPH_CLUSTER_TYPES = [
  "foundation_human",
  "foundation_reality",
  "foundation_custom",
  "p1_founder",
  "p2_cashflow",
  "reviews_intelligence",
  "core_os",
  "curated_memory",
] as const;
export type GraphClusterType = (typeof GRAPH_CLUSTER_TYPES)[number];

/** Explicit semantic relationships between Global Knowledge nodes */
export const GLOBAL_RELATIONSHIP_TYPES = [
  // 1. Structural / Taxonomy
  "contains", // Hierarchical taxonomy parent-child (directed)

  // 2. Cross-Priority Semantic Connections
  "informs", // Knowledge Unit or Principle guides a strategic project, decision, or system
  "applies_to", // Method or framework applied to an execution context / milestone
  "mitigates", // Principle or Improvement mitigates a recurring bottleneck
  "derived_from", // Curated memory forged from empirical review or evidence
  "cross_discipline", // Analogous pattern identified across separate domains (bidirectional)

  // 3. Priority 3 Native Semantic Relationships (Preserved 100%)
  "related_to", // Associative relationship
  "depends_on", // Prerequisite dependency
  "part_of", // Component of a larger system or framework
  "explains", // Conceptual model explaining an observed phenomenon
  "contrasts_with", // Competing paradigms, opposing frameworks, or alternative models (bidirectional)
  "applied_in", // Concrete application of knowledge
  "supported_by", // Corroborating evidence or supporting knowledge unit
  "challenges", // Opposing or conflicting evidence
] as const;
export type GlobalRelationshipType = (typeof GLOBAL_RELATIONSHIP_TYPES)[number];

/** Directionality of a relationship edge */
export type EdgeDirection = "directed" | "bidirectional";

/** Origin and provenance of an edge */
export const EDGE_PROVENANCES = [
  "projected_hierarchy", // Derived from taxonomic parent-child containment
  "native_p3", // Derived directly from P3 KnowledgeRelationshipEntity
  "native_review", // Derived from ReviewImprovement.promotedToKnowledgeId or evidence
  "curated_reference", // Derived from KnowledgeItem.sourceReferences
] as const;
export type EdgeProvenance = (typeof EDGE_PROVENANCES)[number];
