# Context Engine — LENSSTACK + X10THINK

## Purpose
Preserve cognitive continuity across time. Eliminate the "lost context" problem when returning to work after days, weeks, or months.

## Problem Being Solved
Elite performers constantly switch contexts: projects, goals, life domains. Each switch costs re-orientation time. This engine eliminates that cost.

## Core Capabilities

### 1. Context Snapshots
Capture current mental state before stopping work:
```
Snapshot {
  title: "Q2 product strategy session"
  what_I_was_doing: "Analyzing competitor positioning for X10 launch"
  open_threads: ["Pricing model unresolved", "Need input from design"]
  key_decisions_made: ["Going with freemium", "Delayed feature Y to Q3"]
  next_actions: ["Draft pricing page copy", "Schedule design sync"]
  mental_state: "energized but incomplete"
  ai_summary: null  // generated on request
}
```

### 2. Decision Log
Record key decisions with context:
```
Decision {
  title: "Chose SQLite over PostgreSQL"
  context: "Single-user app, offline-first requirement"
  options_considered: ["SQLite", "PostgreSQL", "DuckDB"]
  rationale: "SQLite ships with the app, zero server overhead"
  decided_at: "2026-05-14"
  decided_by: "self"
  review_date: null
}
```

### 3. Context Restoration
When returning to work:
- AI reads recent context snapshots + decision log
- Generates a natural language restoration briefing
- Shows: "Last time you were working on X, you had Y open threads. Key decisions: Z. Recommended next action: ..."

### 4. Interruption Capture
Quick capture of mid-task state:
- Keyboard shortcut (⌘⇧I) to open capture panel
- 30-second capture: title + what was in progress + immediate next step
- Syncs to context timeline

### 5. Context Timeline
Chronological view of all context events:
- Snapshots
- Decisions
- Interruptions
- Reflections (linked)
- Goal status changes

## AI Integration

### Context Briefing Generation
```
Input: last N snapshots + recent goal activity + pending time blocks
Output: {
  "summary": "Brief paragraph of where you left off",
  "open_threads": ["list of unresolved items"],
  "recommended_start": "Specific suggested first action",
  "time_since_last": "4 days"
}
```

### Semantic Search
- All context entries embedded (vector)
- Semantic search: "find when I last thought about pricing strategy"
- Returns ranked results with snippets

## Storage Model
```sql
CREATE TABLE context_snapshots (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  context_text TEXT NOT NULL,
  open_threads TEXT NOT NULL DEFAULT '[]',  -- JSON array
  decisions TEXT NOT NULL DEFAULT '[]',      -- JSON array
  next_actions TEXT NOT NULL DEFAULT '[]',   -- JSON array
  ai_summary TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE decision_log (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  context TEXT,
  rationale TEXT,
  options_json TEXT DEFAULT '[]',
  domain_id TEXT,
  goal_id TEXT,
  decided_at TEXT NOT NULL,
  review_date TEXT,
  created_at TEXT NOT NULL
);
```

## UX Design
- **Quick capture**: always accessible via ⌘⇧I (global shortcut)
- **Context panel**: right sidebar, shows current context at a glance
- **Restoration flow**: shown when opening app after >24h absence
- **Timeline view**: scrollable history of all context events
- **Search**: semantic + full-text across all entries

## Continuity Principle
The system should feel like it "remembers" what the user was doing, even after long gaps. The goal is zero re-orientation time.
