/**
 * Global Knowledge: Domain Validation Rules
 *
 * Strict Architectural Rule: Pure TypeScript; validates structural and URI invariants.
 */

import type { GlobalKnowledgeEdge, GlobalKnowledgeNode } from "./entities";
import {
  EDGE_PROVENANCES,
  GLOBAL_RELATIONSHIP_TYPES,
  GRAPH_CLUSTER_TYPES,
} from "./enums";

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

const NODE_URI_PATTERN = /^gkn:\/\/[a-z0-9_]+\/[a-z0-9_]+\/[a-zA-Z0-9_\-.:]+$/;
const EDGE_URI_PATTERN = /^gke:\/\/.+\/.+\/[a-z0-9_]+$/;

/**
 * Validates a projected GlobalKnowledgeNode.
 */
export function validateGlobalKnowledgeNode(
  node: Partial<GlobalKnowledgeNode>,
): ValidationResult {
  const errors: string[] = [];

  if (!node.id || !node.id.trim()) {
    errors.push("Node ID is required.");
  } else if (!NODE_URI_PATTERN.test(node.id)) {
    errors.push(
      `Node ID '${node.id}' does not match standard URI format: 'gkn://<system>/<entityType>/<id>'.`,
    );
  }

  if (!node.label || !node.label.trim()) {
    errors.push("Node label is required.");
  }

  if (!node.cluster || !GRAPH_CLUSTER_TYPES.includes(node.cluster)) {
    errors.push(`Invalid cluster: '${node.cluster}'.`);
  }

  if (!node.entityType || !node.entityType.trim()) {
    errors.push("Node entityType is required.");
  }

  if (
    node.depth === undefined ||
    typeof node.depth !== "number" ||
    node.depth < 0
  ) {
    errors.push("Node depth must be a non-negative number.");
  }

  if (!node.sourceRef || typeof node.sourceRef !== "object") {
    errors.push("Node sourceRef is required.");
  } else {
    if (!node.sourceRef.system) {
      errors.push("Node sourceRef.system is required.");
    }
    if (!node.sourceRef.entityId) {
      errors.push("Node sourceRef.entityId is required.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a projected GlobalKnowledgeEdge.
 */
export function validateGlobalKnowledgeEdge(
  edge: Partial<GlobalKnowledgeEdge>,
): ValidationResult {
  const errors: string[] = [];

  if (!edge.id || !edge.id.trim()) {
    errors.push("Edge ID is required.");
  } else if (!EDGE_URI_PATTERN.test(edge.id)) {
    errors.push(
      `Edge ID '${edge.id}' does not match standard URI format: 'gke://<source>/<target>/<relationshipType>'.`,
    );
  }

  if (!edge.source || !edge.source.trim()) {
    errors.push("Edge source URI is required.");
  }

  if (!edge.target || !edge.target.trim()) {
    errors.push("Edge target URI is required.");
  }

  if (edge.source === edge.target) {
    errors.push("Edge cannot connect a node to itself.");
  }

  if (
    !edge.relationship ||
    !GLOBAL_RELATIONSHIP_TYPES.includes(edge.relationship)
  ) {
    errors.push(`Invalid relationship: '${edge.relationship}'.`);
  }

  if (!edge.provenance || !EDGE_PROVENANCES.includes(edge.provenance)) {
    errors.push(`Invalid provenance: '${edge.provenance}'.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
