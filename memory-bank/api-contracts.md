# API Contracts — LENSSTACK + X10THINK

## Tauri IPC Commands (Frontend → Rust)

All commands follow the pattern:
```typescript
invoke<ReturnType>('command_name', { ...args })
```

---

## Domains

```typescript
// List all domains
invoke<Domain[]>('get_domains')

// Get single domain
invoke<Domain>('get_domain', { id: string })

// Update domain
invoke<Domain>('update_domain', {
  id: string,
  vision?: string,
  purpose?: string,
  current_status?: string,
  sort_order?: number,
})

// Get domain health score
invoke<number>('get_domain_health', { id: string })
```

---

## Goals

```typescript
// List goals (with filters)
invoke<Goal[]>('get_goals', {
  domain_id?: string,
  status?: 'active' | 'paused' | 'completed' | 'archived',
})

// Get single goal
invoke<Goal>('get_goal', { id: string })

// Create goal
invoke<Goal>('create_goal', {
  title: string,
  description?: string,
  domain_id: string,
  target_date?: string,
  priority: 'critical' | 'high' | 'medium' | 'low',
  success_criteria?: string,
})

// Update goal
invoke<Goal>('update_goal', {
  id: string,
  title?: string,
  description?: string,
  target_date?: string,
  status?: string,
  priority?: string,
  progress?: number,
  success_criteria?: string,
})

// Delete goal
invoke<void>('delete_goal', { id: string })

// Milestones
invoke<Milestone[]>('get_milestones', { goal_id: string })
invoke<Milestone>('create_milestone', { goal_id: string, title: string, target_date?: string })
invoke<void>('complete_milestone', { id: string })
invoke<void>('delete_milestone', { id: string })
```

---

## Execution (Time Blocks)

```typescript
// Get time blocks for a date
invoke<TimeBlock[]>('get_time_blocks', { date: string }) // YYYY-MM-DD

// Create time block
invoke<TimeBlock>('create_time_block', {
  title: string,
  date: string,
  start_time: string, // HH:MM
  end_time: string,
  goal_id?: string,
  domain_id?: string,
  block_type: 'deep_work' | 'shallow' | 'meeting' | 'ritual' | 'rest' | 'buffer',
  energy_type: 'high' | 'medium' | 'low',
  notes?: string,
})

// Update time block
invoke<TimeBlock>('update_time_block', { id: string, ...patch })

// Complete time block
invoke<void>('complete_time_block', { id: string })

// Skip time block
invoke<void>('skip_time_block', { id: string, reason?: string })

// Focus sessions
invoke<FocusSession>('start_focus_session', {
  time_block_id?: string,
  goal_id?: string,
  planned_duration_minutes: number,
})
invoke<FocusSession>('end_focus_session', { id: string, notes?: string })
invoke<FocusSession | null>('get_active_focus_session')

// Recurring rules
invoke<RecurringRule[]>('get_recurring_rules')
invoke<RecurringRule>('create_recurring_rule', { ...RecurringRuleInput })
invoke<void>('toggle_recurring_rule', { id: string, is_active: boolean })
invoke<void>('delete_recurring_rule', { id: string })
```

---

## Reflection

```typescript
// Get entries
invoke<ReflectionEntry[]>('get_reflection_entries', { type?: string, limit?: number })

// Get today's entry
invoke<ReflectionEntry | null>('get_today_reflection')

// Create entry
invoke<ReflectionEntry>('create_reflection_entry', {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'free',
  date: string,
  content: Record<string, string>,
  mood?: number,
  energy?: number,
})

// Update entry
invoke<ReflectionEntry>('update_reflection_entry', { id: string, content?: Record<string, string>, mood?: number, energy?: number })
```

---

## AI

```typescript
// Check Ollama connection
invoke<{ connected: boolean, model: string }>('check_ai_connection')

// Get daily briefing
invoke<AIBriefing>('get_daily_briefing')

// Generate reflection questions
invoke<string[]>('generate_reflection_questions', { context: ReflectionContext })

// Analyze goal alignment
invoke<AIInsight[]>('analyze_goal_alignment')

// Semantic search
invoke<SearchResult[]>('semantic_search', { query: string, limit?: number })
```

---

## Settings

```typescript
invoke<UserSettings>('get_settings')
invoke<void>('update_settings', { ...Partial<UserSettings> })
```

---

## Export

```typescript
invoke<void>('export_data', {
  format: 'markdown' | 'json' | 'csv' | 'pdf' | 'encrypted',
  scope: 'full' | 'goals' | 'reflections' | 'execution' | 'knowledge',
  output_path: string,
  password?: string,
})
```

---

## Error Contract
All commands return `Result<T, String>` in Rust.
Frontend receives either the value or throws an error with the string message.
```typescript
try {
  const result = await invoke<Goal>('create_goal', input);
} catch (errorMessage: unknown) {
  // errorMessage is a string from Rust
  console.error(errorMessage);
}
```
