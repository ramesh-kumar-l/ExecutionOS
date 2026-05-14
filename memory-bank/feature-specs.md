# Feature Specs — LENSSTACK + X10THINK

## F01 — Life Architecture System

### Purpose
Allow users to map their entire life across domains with vision, purpose, and context.

### Core Features
- 12 predefined life domains (customizable)
- Per-domain: vision statement, purpose statement, current status
- Life balance wheel visualization
- Domain health score (derived from goals + execution + reflection)
- Life map: visual representation of all domains + their state

### Data Model
```
Domain { id, name, icon, color, vision, purpose, status, health_score, created_at }
```

### UX
- Setup wizard for first-time domain configuration
- Domain cards on dashboard
- Full-screen domain detail view
- Inline editing for vision/purpose

---

## F02 — Strategic Goal System

### Purpose
Translate vision into measurable strategic goals with clear timelines.

### Core Features
- Goal creation with: title, description, domain_link, target_date, success_criteria
- Goal decomposition: milestones, sub-goals, key results
- Goal status: active / paused / completed / archived
- Goal timeline (Gantt-style)
- Goal progress tracking (manual + automatic from execution)
- Goal linking: goals can depend on other goals
- Strategic prioritization view (importance × urgency matrix)

### Data Model
```
Goal { id, title, description, domain_id, target_date, status, priority, success_criteria, created_at }
Milestone { id, goal_id, title, target_date, completed_at }
```

---

## F03 — Time-Boxed Execution Engine

### Core Features
- Daily view: 24-hour timeline with time blocks
- Time block creation: title, duration, goal_link, energy_type, block_type
- Block types: deep work / shallow work / meeting / ritual / rest
- Recurring time blocks (daily/weekly/monthly patterns)
- Focus session: Pomodoro-style timer with distraction guard
- Execution debt: tracks scheduled vs actual time
- Weekly view with multi-day planning

### Data Model
```
TimeBlock { id, title, start_time, end_time, date, goal_id, block_type, energy_type, status, recurring_id }
RecurringRule { id, pattern, days_of_week, time_of_day, duration, template }
FocusSession { id, time_block_id, started_at, ended_at, interruptions, notes }
```

---

## F04 — Reflection System

### Core Features
- Daily reflection (prompted journal with AI-generated questions)
- Weekly review workflow (structured template)
- Monthly strategic review
- Quarterly and annual life review
- Reflection entry search
- Pattern recognition across reflections (AI)

### Template Structure (Weekly Review)
1. What went well?
2. What was challenging?
3. What did I learn?
4. What will I do differently?
5. Goal progress check
6. Energy/health check
7. Next week intentions

---

## F05 — AI Mentor & Reflection

### Core Features
- Daily AI briefing (goals, schedule, energy)
- AI-generated reflection questions (personalized)
- Goal alignment analysis
- Overload detection + suggestions
- Strategic advice on request
- AI summary of recent activity

---

## F06 — Context Engine (Cognitive Continuity)

### Core Features
- Context snapshots: capture current mental state + open threads
- Decision log: record key decisions with rationale
- Interrupted work log: capture mid-task mental context
- AI context restoration: summarize what was happening before a break
- Timeline: chronological view of all context events

---

## F07 — Command Palette

### Core Features
- ⌘K / Ctrl+K universal access
- Search: goals, domains, notes, time blocks
- Quick actions: new goal, new time block, start focus, open reflection
- Navigation shortcuts
- Recent items

---

## F08 — Export System

### Core Features
- Export per-module or full export
- Formats: Markdown, JSON, CSV, PDF
- Encrypted backup (AES-256)
- Import from backup
- Data migration guide

---

## F09 — Settings

### Core Features
- Theme (dark/light/system)
- AI model selection + Ollama URL
- Notification preferences
- Keyboard shortcuts viewer/customizer
- Domain customization
- Export/import
- Privacy settings
