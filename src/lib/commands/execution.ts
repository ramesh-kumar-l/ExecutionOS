import { invoke } from "@tauri-apps/api/core";
import type {
  TimeBlock,
  FocusSession,
  RecurringRule,
  CreateTimeBlockInput,
  BlockType,
} from "@/types";

export async function getTimeBlocks(date: string): Promise<TimeBlock[]> {
  return invoke<TimeBlock[]>("get_time_blocks", { date });
}

export async function createTimeBlock(input: CreateTimeBlockInput): Promise<TimeBlock> {
  return invoke<TimeBlock>("create_time_block", input);
}

export async function updateTimeBlock(
  id: string,
  patch: Partial<Omit<TimeBlock, "id" | "created_at">>
): Promise<TimeBlock> {
  return invoke<TimeBlock>("update_time_block", { id, ...patch });
}

export async function completeTimeBlock(id: string): Promise<void> {
  return invoke<void>("complete_time_block", { id });
}

export async function skipTimeBlock(id: string, reason?: string): Promise<void> {
  return invoke<void>("skip_time_block", { id, reason });
}

export async function getActiveFocusSession(): Promise<FocusSession | null> {
  return invoke<FocusSession | null>("get_active_focus_session");
}

export async function startFocusSession(
  planned_duration_minutes: number,
  time_block_id?: string,
  goal_id?: string
): Promise<FocusSession> {
  return invoke<FocusSession>("start_focus_session", {
    planned_duration_minutes,
    time_block_id,
    goal_id,
  });
}

export async function endFocusSession(id: string, notes?: string): Promise<FocusSession> {
  return invoke<FocusSession>("end_focus_session", { id, notes });
}

export async function getRecurringRules(): Promise<RecurringRule[]> {
  return invoke<RecurringRule[]>("get_recurring_rules");
}

export interface CreateRecurringRuleInput {
  title: string;
  pattern: "daily" | "weekly" | "monthly";
  days_of_week: number[];
  start_time: string;
  duration_minutes: number;
  block_type: BlockType;
  goal_id?: string;
}

export async function createRecurringRule(input: CreateRecurringRuleInput): Promise<RecurringRule> {
  return invoke<RecurringRule>("create_recurring_rule", input);
}

export async function toggleRecurringRule(id: string, is_active: boolean): Promise<void> {
  return invoke<void>("toggle_recurring_rule", { id, is_active });
}

export async function deleteRecurringRule(id: string): Promise<void> {
  return invoke<void>("delete_recurring_rule", { id });
}
