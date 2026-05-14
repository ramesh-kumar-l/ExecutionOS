# Domain Models — LENSSTACK + X10THINK

## Life Domains (12)

| # | Domain | Description |
|---|--------|-------------|
| 1 | Health | Physical wellbeing, fitness, sleep, nutrition |
| 2 | Career | Professional growth, skills, impact, income |
| 3 | Financial | Wealth building, savings, investments, security |
| 4 | Intellectual | Learning, curiosity, mental growth, mastery |
| 5 | Emotional | Emotional intelligence, self-awareness, resilience |
| 6 | Spiritual | Values, meaning, purpose, inner life |
| 7 | Relationships | Romantic partner, deep friendships |
| 8 | Family | Parents, siblings, children, extended family |
| 9 | Social | Community, network, broader social life |
| 10 | Character | Integrity, virtues, identity, principles |
| 11 | Lifestyle | Home, environment, hobbies, aesthetics |
| 12 | Legacy | Long-term contribution, impact, what you leave behind |

## Core Data Models (TypeScript)

```typescript
// Life Domain
interface Domain {
  id: string;
  name: string;
  icon: string;
  color: string;
  vision: string;
  purpose: string;
  current_status: string;
  health_score: number; // 0–100, derived
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Strategic Goal
interface Goal {
  id: string;
  title: string;
  description: string;
  domain_id: string;
  target_date: string | null;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: 'critical' | 'high' | 'medium' | 'low';
  success_criteria: string;
  progress: number; // 0–100
  created_at: string;
  updated_at: string;
}

// Milestone
interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  target_date: string | null;
  completed_at: string | null;
  sort_order: number;
}

// Time Block
interface TimeBlock {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  goal_id: string | null;
  domain_id: string | null;
  block_type: 'deep_work' | 'shallow' | 'meeting' | 'ritual' | 'rest' | 'buffer';
  energy_type: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  recurring_rule_id: string | null;
  notes: string;
  created_at: string;
}

// Recurring Rule
interface RecurringRule {
  id: string;
  title: string;
  pattern: 'daily' | 'weekly' | 'monthly';
  days_of_week: number[]; // 0=Sun, 1=Mon...
  start_time: string;
  duration_minutes: number;
  block_type: TimeBlock['block_type'];
  goal_id: string | null;
  is_active: boolean;
  created_at: string;
}

// Focus Session
interface FocusSession {
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

// Reflection Entry
interface ReflectionEntry {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'free';
  date: string;
  content: Record<string, string>; // template field -> answer
  mood: number | null; // 1–10
  energy: number | null; // 1–10
  ai_summary: string | null;
  created_at: string;
}

// Context Snapshot
interface ContextSnapshot {
  id: string;
  title: string;
  context: string; // free-form mental state capture
  open_threads: string[];
  decisions: string[];
  next_actions: string[];
  ai_summary: string | null;
  created_at: string;
}

// Knowledge Note
interface KnowledgeNote {
  id: string;
  title: string;
  content: string; // Markdown
  tags: string[];
  domain_id: string | null;
  goal_id: string | null;
  linked_note_ids: string[];
  created_at: string;
  updated_at: string;
}

// User Settings
interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  ollama_url: string;
  ollama_model: string;
  ai_enabled: boolean;
  ai_verbosity: 'minimal' | 'standard' | 'detailed';
  first_day_of_week: 0 | 1; // 0=Sunday, 1=Monday
  daily_planning_time: string; // HH:MM
  daily_review_time: string; // HH:MM
}
```

## Domain Health Score Formula
```
health_score = (
  goal_completion_rate * 0.35 +
  execution_rate * 0.35 +
  reflection_frequency * 0.20 +
  user_manual_rating * 0.10
) * 100
```

## Entity Relationships
```
Domain (1) → (many) Goals
Goal (1) → (many) Milestones
Goal (1) → (many) TimeBlocks [optional link]
TimeBlock (many) → (1) RecurringRule [optional]
TimeBlock (1) → (many) FocusSessions
Domain (1) → (many) ReflectionEntries [optional]
KnowledgeNote (many) → (many) KnowledgeNote [self-referential links]
```
