-- Migration 001: Initial schema

-- Life Domains
CREATE TABLE IF NOT EXISTS domains (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Circle',
    color TEXT NOT NULL DEFAULT 'hsl(0 0% 50%)',
    vision TEXT NOT NULL DEFAULT '',
    purpose TEXT NOT NULL DEFAULT '',
    current_status TEXT NOT NULL DEFAULT '',
    health_score REAL NOT NULL DEFAULT 0.0,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    domain_id TEXT NOT NULL,
    target_date TEXT,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    success_criteria TEXT NOT NULL DEFAULT '',
    progress REAL NOT NULL DEFAULT 0.0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

CREATE INDEX IF NOT EXISTS idx_goals_domain_id ON goals(domain_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_date TEXT,
    completed_at TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id);

-- Time Blocks
CREATE TABLE IF NOT EXISTS time_blocks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    goal_id TEXT,
    domain_id TEXT,
    block_type TEXT NOT NULL DEFAULT 'deep_work'
        CHECK (block_type IN ('deep_work', 'shallow', 'meeting', 'ritual', 'rest', 'buffer')),
    energy_type TEXT NOT NULL DEFAULT 'medium'
        CHECK (energy_type IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
    recurring_rule_id TEXT,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES goals(id),
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON time_blocks(date);
CREATE INDEX IF NOT EXISTS idx_time_blocks_date_status ON time_blocks(date, status);
CREATE INDEX IF NOT EXISTS idx_time_blocks_goal_id ON time_blocks(goal_id);

-- Recurring Rules
CREATE TABLE IF NOT EXISTS recurring_rules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    pattern TEXT NOT NULL CHECK (pattern IN ('daily', 'weekly', 'monthly')),
    days_of_week TEXT NOT NULL DEFAULT '[]',
    start_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    block_type TEXT NOT NULL,
    goal_id TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES goals(id)
);

-- Focus Sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    time_block_id TEXT,
    goal_id TEXT,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    planned_duration_minutes INTEGER NOT NULL,
    actual_duration_minutes INTEGER,
    interruptions INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (time_block_id) REFERENCES time_blocks(id),
    FOREIGN KEY (goal_id) REFERENCES goals(id)
);

-- Reflection Entries
CREATE TABLE IF NOT EXISTS reflection_entries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'free')),
    date TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '{}',
    mood INTEGER,
    energy INTEGER,
    ai_summary TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reflections_date ON reflection_entries(date);
CREATE INDEX IF NOT EXISTS idx_reflections_type ON reflection_entries(type);

-- Context Snapshots
CREATE TABLE IF NOT EXISTS context_snapshots (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    context_text TEXT NOT NULL DEFAULT '',
    open_threads TEXT NOT NULL DEFAULT '[]',
    decisions TEXT NOT NULL DEFAULT '[]',
    next_actions TEXT NOT NULL DEFAULT '[]',
    ai_summary TEXT,
    created_at TEXT NOT NULL
);

-- Decision Log
CREATE TABLE IF NOT EXISTS decision_log (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    context TEXT NOT NULL DEFAULT '',
    rationale TEXT NOT NULL DEFAULT '',
    options TEXT NOT NULL DEFAULT '[]',
    domain_id TEXT,
    goal_id TEXT,
    decided_at TEXT NOT NULL,
    review_date TEXT,
    created_at TEXT NOT NULL
);

-- Knowledge Notes
CREATE TABLE IF NOT EXISTS knowledge_notes (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'note'
        CHECK (type IN ('note', 'learning', 'book', 'decision', 'resource', 'synthesis')),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    domain_id TEXT,
    goal_id TEXT,
    linked_note_ids TEXT NOT NULL DEFAULT '[]',
    source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (domain_id) REFERENCES domains(id),
    FOREIGN KEY (goal_id) REFERENCES goals(id)
);

-- Full-text search for knowledge notes
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_notes_fts
USING fts5(title, content, tags, content=knowledge_notes, content_rowid=rowid);

-- User Settings (single row)
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    theme TEXT NOT NULL DEFAULT 'dark',
    ollama_url TEXT NOT NULL DEFAULT 'http://localhost:11434',
    ollama_model TEXT NOT NULL DEFAULT 'llama3',
    ai_enabled INTEGER NOT NULL DEFAULT 1,
    ai_verbosity TEXT NOT NULL DEFAULT 'standard',
    first_day_of_week INTEGER NOT NULL DEFAULT 1,
    daily_planning_time TEXT NOT NULL DEFAULT '08:00',
    daily_review_time TEXT NOT NULL DEFAULT '20:00'
);

-- Seed default settings row
INSERT OR IGNORE INTO user_settings (id) VALUES (1);
