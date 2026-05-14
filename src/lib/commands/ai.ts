import { invoke } from "@tauri-apps/api/core";
import type { AIBriefing, AIInsight } from "@/types";

export interface AiConnectionStatus {
  connected: boolean;
  model: string;
}

export async function checkAiConnection(): Promise<AiConnectionStatus> {
  return invoke<AiConnectionStatus>("check_ai_connection");
}

export async function getDailyBriefing(): Promise<AIBriefing> {
  return invoke<AIBriefing>("get_daily_briefing");
}

export async function generateReflectionQuestions(
  reflection_type: string
): Promise<string[]> {
  return invoke<string[]>("generate_reflection_questions", { reflection_type });
}

export async function analyzeGoalAlignment(): Promise<AIInsight[]> {
  return invoke<AIInsight[]>("analyze_goal_alignment");
}
