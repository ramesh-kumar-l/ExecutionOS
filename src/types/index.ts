// Core domain types for LENSSTACK

// ─── Life Domains ────────────────────────────────────────────────────────────

export type DomainId =
  | "health"
  | "career"
  | "financial"
  | "intellectual"
  | "emotional"
  | "spiritual"
  | "relationships"
  | "family"
  | "social"
  | "character"
  | "lifestyle"
  | "legacy";

export interface Domain {
  id: string;
  slug: DomainId | string;
  name: string;
  icon: string;
  color: string;
  vision: string;
  purpose: string;
  current_status: string;
  health_score: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export type GoalStatus = "active" | "paused" | "completed" | "archived";
export type GoalPriority = "critical" | "high" | "medium" | "low";

export interface Goal {
  id: string;
  title: string;
  description: string;
  domain_id: string;
  target_date: string | null;
  status: GoalStatus;
  priority: GoalPriority;
  success_criteria: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  target_date: string | null;
  completed_at: string | null;
  sort_order: number;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  domain_id: string;
  target_date?: string;
  priority: GoalPriority;
  success_criteria?: string;
}

export interface UpdateGoalInput {
  id: string;
  title?: string;
  description?: string;
  target_date?: string;
  status?: GoalStatus;
  priority?: GoalPriority;
  progress?: number;
  success_criteria?: string;
}

// ─── Execution ───────────────────────────────────────────────────────────────

export type BlockType = "deep_work" | "shallow" | "meeting" | "ritual" | "rest" | "buffer";
export type EnergyType = "high" | "medium" | "low";
export type BlockStatus = "planned" | "in_progress" | "completed" | "skipped";

export interface TimeBlock {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  goal_id: string | null;
  domain_id: string | null;
  block_type: BlockType;
  energy_type: EnergyType;
  status: BlockStatus;
  recurring_rule_id: string | null;
  notes: string;
  created_at: string;
}

export interface CreateTimeBlockInput {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  goal_id?: string;
  domain_id?: string;
  block_type: BlockType;
  energy_type: EnergyType;
  notes?: string;
}

export interface FocusSession {
  id: string;
  time_block_id: string | null;
  goal_id: string | null;
  started_at: string;
  ended_at: string | null;
  planned_duration_minutes: number;
  actual_duration_minutes: number | null;
  interruptions: number;
  notes: string;
}

export interface RecurringRule {
  id: string;
  title: string;
  pattern: "daily" | "weekly" | "monthly";
  days_of_week: number[];
  start_time: string;
  duration_minutes: number;
  block_type: BlockType;
  goal_id: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Reflection ──────────────────────────────────────────────────────────────

export type ReflectionType = "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "free";

export interface ReflectionEntry {
  id: string;
  type: ReflectionType;
  date: string;
  content: Record<string, string>;
  mood: number | null;
  energy: number | null;
  ai_summary: string | null;
  created_at: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export interface ContextSnapshot {
  id: string;
  title: string;
  context_text: string;
  open_threads: string[];
  decisions: string[];
  next_actions: string[];
  ai_summary: string | null;
  created_at: string;
}

export interface DecisionLog {
  id: string;
  title: string;
  context: string;
  rationale: string;
  options: string[];
  domain_id: string | null;
  goal_id: string | null;
  decided_at: string;
  review_date: string | null;
  created_at: string;
}

// ─── Knowledge ───────────────────────────────────────────────────────────────

export type NoteType = "note" | "learning" | "book" | "decision" | "resource" | "synthesis";

export interface KnowledgeNote {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  tags: string[];
  domain_id: string | null;
  goal_id: string | null;
  linked_note_ids: string[];
  source: string | null;
  created_at: string;
  updated_at: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export interface AIBriefing {
  focus: string;
  key_blocks: string[];
  alert: string | null;
  question: string;
}

export interface AIInsight {
  insight: string;
  reasoning: string;
  suggestion: string;
  confidence: "high" | "medium" | "low";
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface UserSettings {
  theme: "dark" | "light" | "system";
  ollama_url: string;
  ollama_model: string;
  ai_enabled: boolean;
  ai_verbosity: "minimal" | "standard" | "detailed";
  first_day_of_week: 0 | 1;
  daily_planning_time: string;
  daily_review_time: string;
}

// ─── App State ───────────────────────────────────────────────────────────────

export type AppRoute =
  | "today"
  | "weekly"
  | "goals"
  | "domains"
  | "execution"
  | "reflection"
  | "knowledge"
  | "context"
  | "settings";

export interface AppNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: string;
}
