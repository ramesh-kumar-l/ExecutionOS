# Execution Model — LENSSTACK + X10THINK

## Core Philosophy
Every meaningful goal must become scheduled time, or it doesn't exist.

**Vision → Goal → Time Block → Execution → Reflection → Compound**

## Time Block Architecture

### Block Types
| Type | Description | Scheduling Rule |
|------|-------------|-----------------|
| `deep_work` | Focused, cognitively demanding | Min 90 min, no interruptions |
| `shallow` | Email, admin, low-cognition tasks | Batch into designated periods |
| `meeting` | Collaborative, external commitments | Calendar-sourced |
| `ritual` | Daily/weekly recurring practices | Fixed time, recurring rule |
| `rest` | Recovery, breaks, renewal | Protected, non-negotiable |
| `buffer` | Unplanned, overflow, transitions | 20% of day recommended |

### Energy Mapping
- **High energy blocks**: deep work, creative, strategic tasks
- **Medium energy blocks**: meetings, planning, communication
- **Low energy blocks**: admin, routine, maintenance

Match high-energy time slots to high-cognition work types.

## Daily Execution Flow
```
Morning Planning (15 min)
  → Review today's time blocks
  → AI briefing (goals + energy)
  → Confirm/adjust schedule

Execution Phase
  → Time block activation
  → Focus session (optional Pomodoro)
  → Completion logging
  → Quick notes / interruptions captured

Evening Review (10 min)
  → Mark blocks complete/skipped
  → Capture what actually happened
  → Tomorrow preview
```

## Weekly Execution Model
```
Sunday (or Monday): Weekly Planning Session
  → Review previous week (execution rate, goal progress)
  → Set weekly intentions (3 key outcomes)
  → Schedule time blocks for the week
  → Protect deep work slots

Friday: Weekly Review
  → Reflection prompts
  → Goal progress update
  → Lessons captured
  → Next week preview
```

## Recurring Systems Engine

### Ritual Types
- **Daily rituals**: morning routine, evening review, exercise
- **Weekly rituals**: weekly planning, deep work sessions
- **Monthly rituals**: financial review, goal check-in
- **Quarterly rituals**: strategic life review, goal reset

### Recurrence Rules
```
RecurringRule {
  pattern: 'daily' | 'weekly' | 'monthly'
  days_of_week: [1,2,3,4,5]  // Mon-Fri
  start_time: '07:00'
  duration_minutes: 30
  block_type: 'ritual'
}
```

### Auto-generation
- Recurring rules generate TimeBlock instances for the next 90 days
- Regenerated on demand (never stale)
- User can override individual instances without breaking the rule

## Execution Debt Tracking
- **Execution rate**: `completed_blocks / total_blocks` per period
- **Debt accumulation**: each skipped deep work block = debt
- **Debt display**: weekly trend, not daily shame
- **Debt resolution**: AI suggests recovery strategies (not guilt)

## Focus Session (Pomodoro-style)
```
Session = {
  planned_duration: 25 | 45 | 90 min
  break_duration: 5 | 10 | 20 min
  interruption_log: string[]
  distraction_guard: boolean  // hide other app content
}
```

## Strategic Prioritization
Eisenhower matrix view:
- Important + Urgent → Do first
- Important + Not Urgent → Schedule (most critical for long-term goals)
- Not Important + Urgent → Delegate or minimize
- Not Important + Not Urgent → Eliminate

AI scans scheduled blocks and alerts if Important+Not Urgent items are consistently absent.

## Execution Analytics
- Daily completion rate
- Weekly execution rate by domain
- Focus session duration trends
- Planned vs actual time comparison
- Energy level correlation with output

## Calendar Integration (Future)
- Export time blocks to ICS format
- Import from Google Calendar / Outlook
- Two-way sync (Phase 7+, optional)
