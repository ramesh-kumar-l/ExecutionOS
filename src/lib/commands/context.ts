import { invoke } from "@tauri-apps/api/core";
import type { ContextSnapshot, DecisionLog } from "@/types";

export interface CreateSnapshotInput {
  title: string;
  context_text: string;
  open_threads: string[];
  decisions: string[];
  next_actions: string[];
}

export interface CreateDecisionInput {
  title: string;
  context?: string;
  rationale?: string;
  options?: string[];
  domain_id?: string;
  goal_id?: string;
  decided_at: string;
  review_date?: string;
}

export async function getContextSnapshots(limit?: number): Promise<ContextSnapshot[]> {
  return invoke<ContextSnapshot[]>("get_context_snapshots", { limit: limit ?? 50 });
}

export async function createContextSnapshot(input: CreateSnapshotInput): Promise<ContextSnapshot> {
  return invoke<ContextSnapshot>("create_context_snapshot", {
    title: input.title,
    context_text: input.context_text,
    open_threads: input.open_threads,
    decisions: input.decisions,
    next_actions: input.next_actions,
  });
}

export async function deleteContextSnapshot(id: string): Promise<void> {
  return invoke<void>("delete_context_snapshot", { id });
}

export async function getDecisionLog(limit?: number): Promise<DecisionLog[]> {
  return invoke<DecisionLog[]>("get_decision_log", { limit: limit ?? 50 });
}

export async function createDecision(input: CreateDecisionInput): Promise<DecisionLog> {
  return invoke<DecisionLog>("create_decision", {
    title: input.title,
    context: input.context,
    rationale: input.rationale,
    options: input.options,
    domain_id: input.domain_id,
    goal_id: input.goal_id,
    decided_at: input.decided_at,
    review_date: input.review_date,
  });
}

export async function deleteDecision(id: string): Promise<void> {
  return invoke<void>("delete_decision", { id });
}
