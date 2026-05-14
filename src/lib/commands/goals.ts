import { invoke } from "@tauri-apps/api/core";
import type { Goal, Milestone, CreateGoalInput, UpdateGoalInput } from "@/types";

export async function getGoals(filters?: { domain_id?: string; status?: string }): Promise<Goal[]> {
  return invoke<Goal[]>("get_goals", filters ?? {});
}

export async function getGoal(id: string): Promise<Goal> {
  return invoke<Goal>("get_goal", { id });
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  return invoke<Goal>("create_goal", input);
}

export async function updateGoal(input: UpdateGoalInput): Promise<Goal> {
  return invoke<Goal>("update_goal", input);
}

export async function deleteGoal(id: string): Promise<void> {
  return invoke<void>("delete_goal", { id });
}

export async function getMilestones(goal_id: string): Promise<Milestone[]> {
  return invoke<Milestone[]>("get_milestones", { goal_id });
}

export async function createMilestone(
  goal_id: string,
  title: string,
  target_date?: string
): Promise<Milestone> {
  return invoke<Milestone>("create_milestone", { goal_id, title, target_date });
}

export async function completeMilestone(id: string): Promise<void> {
  return invoke<void>("complete_milestone", { id });
}

export async function deleteMilestone(id: string): Promise<void> {
  return invoke<void>("delete_milestone", { id });
}
