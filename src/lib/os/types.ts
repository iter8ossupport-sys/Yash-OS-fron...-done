/**
 * Central Backward-Compatible Type Exports for Yash OS
 *
 * Domain types are organized under `src/lib/os/types/`:
 * - core.ts: Foundational OS entities (PriorityId, Task, Plan, Goals, OSState)
 * - projects.ts: Projects, milestones, documents, and performance summaries
 * - trading.ts: Priority 2A Trading Operation, strategies, systems, accounts
 * - learning.ts: Priority 3 Learning & Knowledge OS, dual workflows
 * - knowledge.ts: Knowledge items, formats (Principle, Method, Framework, Custom)
 * - reviews.ts: Periodic reviews, bottlenecks, improvements, analytics & forecasts
 */

export * from "./types/core";
export * from "./types/projects";
export * from "./types/trading";
export * from "./types/learning";
export * from "./types/knowledge";
export * from "./types/reviews";
