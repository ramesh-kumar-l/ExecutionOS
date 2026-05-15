# Getting Started — LENSSTACK

A comprehensive guide for engineers setting up and exploring this codebase for the first time.

---

## What Is This?

**LENSSTACK** is a premium, offline-first, AI-assisted strategic life operating system built as a native desktop application. It is not a task manager. It is not a productivity app. It is a full-stack system for people who want to align their daily execution with their long-term life vision across 12 life domains (Health, Career, Financial, Intellectual, Emotional, Spiritual, Relationships, Family, Social, Character, Lifestyle, Legacy).

The guiding philosophy: **If it isn't on your calendar as a scheduled time block, it doesn't exist.**

The system takes you from high-level life vision → strategic goals → recurring systems → daily time-boxed execution → structured reflection → compounding growth over years.

---

## Tech Stack at a Glance

| Layer | Technology | Why |
|-------|-----------|-----|
| Desktop framework | **Tauri 2** | Lightweight, Rust-native, offline, cross-platform |
| Backend | **Rust** + sqlx | Memory safe, fast, typed SQL |
| Database | **SQLite** (embedded) | Ships with the app, zero server setup |
| Frontend | **React 18** + TypeScript 5 | Typed component model |
| Styling | **Tailwind CSS** + shadcn/ui | Fast, consistent, accessible |
| Animations | **Framer Motion** | Subtle, premium feel |
| State | **Zustand** | Lightweight, no boilerplate |
| Build | **Vite** | Fast HMR during development |
| AI (optional) | **Ollama** (local LLM) | Private, runs on your machine |

**Why not Electron?** — Tauri produces a 3–10x smaller binary, uses the OS WebView (not a bundled Chromium), and the Rust backend is more memory-efficient and safer.

**Why not Redux?** — Single-user desktop app. Zustand is 90% less boilerplate for the same result.

**Why SQLite?** — Embedded directly in the binary. Zero configuration. Scales to millions of rows for one user. Transactional. The right tool for this use case.

---

## Prerequisites

You need these installed before you can run the project.

### 1. Rust toolchain

```powershell
# Windows — download and run the rustup installer
# https://rustup.rs
winget install Rustlang.Rustup

# Verify
rustc --version   # should be 1.78+
cargo --version
```

### 2. Node.js 20 LTS

```powershell
# Using winget
winget install OpenJS.NodeJS.LTS

# Verify
node --version   # should be v20.x
```

### 3. pnpm (package manager)

```powershell
npm install -g pnpm

# Verify
pnpm --version   # should be 9.x
```

### 4. Tauri system dependencies (Windows-specific)

Tauri on Windows requires two things:

**a) Microsoft C++ Build Tools**
- Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- In the installer, select: "Desktop development with C++"
- This installs the MSVC compiler Rust needs on Windows.

**b) WebView2 Runtime**
- Usually already installed on Windows 10/11 (ships with Edge)
- Check: Open Edge → Settings → About — if Edge is installed, WebView2 is present
- If not: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 5. Tauri CLI (installed via cargo)

```powershell
cargo install tauri-cli --version "^2.0"

# Verify
cargo tauri --version
```

### 6. (Optional) Ollama — for AI features

If you want the AI mentor features (daily briefing, reflection questions, goal alignment analysis) to work, install Ollama:

```powershell
winget install Ollama.Ollama

# Then pull a model (Llama 3 recommended)
ollama pull llama3
```

Ollama runs as a local HTTP server on `http://localhost:11434`. The app connects to it automatically. All AI features degrade gracefully if Ollama is not running — the core app works fully without it.

---

## Installation

```powershell
# 1. Clone the repository
git clone https://github.com/ramesh152/lensstack.git
cd lensstack

# 2. Install frontend dependencies
pnpm install

# 3. Verify Rust dependencies compile (this takes 2–5 minutes on first run)
cargo check --manifest-path src-tauri/Cargo.toml
```

---

## Running the App

### Development mode

```powershell
pnpm tauri:dev
```

This starts:
- Vite dev server for the React frontend (with hot module replacement)
- Tauri wrapping it in a native window
- Rust backend compiled in debug mode
- SQLite database created at: `%APPDATA%\com.lensstack.app\lensstack.db`

First boot takes 2–5 minutes (Rust compilation). Subsequent boots are ~15 seconds.

### Production build

```powershell
pnpm tauri:build
```

Produces an `.msi` installer in `src-tauri/target/release/bundle/msi/`.

### Frontend only (no Tauri)

```powershell
pnpm dev
```

Runs the React UI in a browser at `http://localhost:5173`. Tauri IPC calls will fail (no backend), but this is useful for UI-only component development.

---

## Project Structure Tour

```
lensstack/
├── memory-bank/          ← Architecture documentation (READ THIS FIRST)
│   ├── vision.md         ← Product vision and target user
│   ├── architecture.md   ← System architecture and data flow
│   ├── tech-stack.md     ← Technology choices and reasons
│   ├── feature-specs.md  ← Detailed feature specifications
│   ├── life-domains.md   ← The 12 life domains explained
│   ├── execution-model.md← Time-boxing and scheduling logic
│   ├── coding-standards.md← Mandatory code style rules
│   └── ... (25 files total)
│
├── src-tauri/            ← Rust backend
│   └── src/
│       ├── lib.rs        ← App setup, migration runner, command registry
│       ├── commands/     ← IPC command handlers (frontend calls these)
│       │   ├── domains.rs
│       │   ├── goals.rs
│       │   ├── execution.rs
│       │   ├── reflection.rs
│       │   ├── knowledge.rs
│       │   ├── context.rs
│       │   ├── ai.rs
│       │   ├── settings.rs
│       │   └── export.rs
│       └── db/
│           ├── pool.rs          ← SQLite connection pool
│           ├── migrations/      ← SQL migration files (run on every startup)
│           │   ├── 001_initial.sql   ← All tables
│           │   ├── 002_seed_domains.sql ← 12 default life domains
│           │   └── 003_fts5_triggers.sql ← FTS5 sync + indexes
│           └── models/          ← Rust structs that map to DB rows
│
└── src/                  ← React frontend
    ├── App.tsx           ← Root component, page routing
    ├── pages/            ← One file per page/route
    │   ├── TodayPage.tsx     ← Daily time blocks + focus timer
    │   ├── WeeklyPage.tsx    ← 7-column weekly planning grid
    │   ├── GoalsPage.tsx     ← Strategic goals + milestones
    │   ├── DomainsPage.tsx   ← 12 life domains + vision editing
    │   ├── ReflectionPage.tsx← Weekly/monthly review wizard
    │   ├── KnowledgePage.tsx ← Notes + FTS5 search
    │   ├── ContextPage.tsx   ← Context snapshots + decision log
    │   └── SettingsPage.tsx  ← Theme, AI config, shortcuts
    ├── components/
    │   ├── ui/           ← Primitive components (shadcn/ui wrappers)
    │   ├── layout/       ← Sidebar, command palette
    │   └── knowledge/    ← Feature-specific components
    ├── stores/           ← Zustand state stores
    │   ├── appStore.ts       ← Active route, sidebar state, command palette
    │   ├── goalsStore.ts
    │   ├── knowledgeStore.ts
    │   └── ...
    ├── lib/
    │   ├── commands/     ← Typed Tauri IPC wrappers (use these, not raw invoke)
    │   └── animations.ts ← Framer Motion variants
    └── types/
        └── index.ts      ← All shared TypeScript types
```

---

## How the Frontend Talks to the Backend

This is the most important concept to understand about Tauri apps.

**The IPC bridge** — The React frontend cannot directly touch the database or the filesystem. It communicates with the Rust backend through typed commands called via `invoke()`.

```
React component
  → calls a typed wrapper in src/lib/commands/
  → which calls Tauri's invoke("rust_command_name", args)
  → crosses the IPC bridge to Rust
  → Rust handler runs, queries SQLite
  → returns typed Result<T, String>
  → React receives the response
  → Zustand store updates
  → Component re-renders
```

**Concrete example — loading goals:**

```typescript
// src/lib/commands/goals.ts
import { invoke } from "@tauri-apps/api/core";
import type { Goal } from "@/types";

export function getGoals(domainId?: string): Promise<Goal[]> {
  return invoke<Goal[]>("get_goals", { domainId });
}
```

```rust
// src-tauri/src/commands/goals.rs
#[tauri::command]
pub async fn get_goals(
    domain_id: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Vec<Goal>, String> {
    // query SQLite, return typed data
}
```

```typescript
// src/stores/goalsStore.ts
const loadGoals = async (domainId?: string) => {
  const goals = await getGoals(domainId);  // calls the typed wrapper
  set({ goals });
};
```

**Rule:** Never call `invoke()` directly from a component. Always go through `src/lib/commands/`.

---

## Database — How Migrations Work

The app uses a custom migration runner (not sqlx-migrate). Every time the app boots, all three SQL migration files are executed via `sqlx::query().execute()`:

```rust
// src-tauri/src/lib.rs
async fn run_migrations(pool: &sqlx::SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(include_str!("db/migrations/001_initial.sql")).execute(pool).await?;
    sqlx::query(include_str!("db/migrations/002_seed_domains.sql")).execute(pool).await?;
    sqlx::query(include_str!("db/migrations/003_fts5_triggers.sql")).execute(pool).await?;
    Ok(())
}
```

All SQL statements use `IF NOT EXISTS` or `INSERT OR IGNORE` so re-running them is safe. **To add a migration**, create `004_your_change.sql` and add it to this function.

The SQLite database file lives at:
- **Windows**: `%APPDATA%\com.lensstack.app\lensstack.db`
- **macOS**: `~/Library/Application Support/com.lensstack.app/lensstack.db`

You can open it with [DB Browser for SQLite](https://sqlitebrowser.org/) to inspect data during development.

---

## State Management — The Rules

| State type | Where it lives | When to use |
|-----------|---------------|-------------|
| Persistent data | SQLite (source of truth) | Goals, notes, time blocks, etc. |
| App-wide UI state | Zustand store | Active page, sidebar open, modals |
| Local component state | `useState` | Hover, focus, input drafts |

**Never** store persistent domain data only in Zustand — it vanishes on restart. Always write to SQLite through a Rust command, then update the Zustand store from the response.

---

## Adding a New Feature — Step by Step

Example: adding a "habit tracker" feature.

**1. Define the SQL schema** in a new migration file:
```sql
-- src-tauri/src/db/migrations/004_habits.sql
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  domain_id TEXT,
  created_at TEXT NOT NULL
);
```

**2. Create the Rust model** in `src-tauri/src/db/models/habit.rs`:
```rust
#[derive(sqlx::FromRow)]
pub struct HabitRow { pub id: String, pub title: String, ... }

pub struct Habit { pub id: String, pub title: String, ... }

impl From<HabitRow> for Habit { ... }
```

**3. Write the Rust command handler** in `src-tauri/src/commands/habits.rs`:
```rust
#[tauri::command]
pub async fn get_habits(db: State<'_, DbPool>) -> Result<Vec<Habit>, String> { ... }
```

**4. Register the command** in `src-tauri/src/lib.rs`:
```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::habits::get_habits,
])
```

**5. Add the TypeScript type** in `src/types/index.ts`:
```typescript
export interface Habit { id: string; title: string; ... }
```

**6. Write the typed IPC wrapper** in `src/lib/commands/habits.ts`:
```typescript
export function getHabits(): Promise<Habit[]> {
  return invoke<Habit[]>("get_habits");
}
```

**7. Create the Zustand store** in `src/stores/habitsStore.ts`.

**8. Build the page component** in `src/pages/HabitsPage.tsx`.

**9. Add the nav item** in `src/components/layout/Sidebar.tsx`.

---

## The 12 Life Domains

When you first launch the app, 12 life domains are pre-seeded by `002_seed_domains.sql`. These are:

| # | Domain | Scope |
|---|--------|-------|
| 1 | Health | Fitness, sleep, nutrition, energy |
| 2 | Career | Role, skills, impact, income |
| 3 | Financial | Savings, investments, net worth |
| 4 | Intellectual | Learning, reading, mastery |
| 5 | Emotional | Self-awareness, resilience, mental health |
| 6 | Spiritual | Values, meaning, purpose |
| 7 | Relationships | Partner, deep friendships |
| 8 | Family | Parents, siblings, children |
| 9 | Social | Community, network, giving back |
| 10 | Character | Integrity, virtues, identity |
| 11 | Lifestyle | Home, hobbies, travel |
| 12 | Legacy | Long-term contribution, impact |

Users can rename, recolor, reorder, and add custom domains (up to 16 total).

---

## Key Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘1` – `⌘8` | Navigate to page 1–8 |
| `⌘⇧I` | Capture context interruption |

---

## Troubleshooting

**"error: linker `link.exe` not found"**
You need MSVC Build Tools. See Prerequisites step 4a.

**"Failed to find the system WebView2 installation"**
Install the WebView2 runtime. See Prerequisites step 4b.

**"`cargo tauri` not found"**
Run `cargo install tauri-cli --version "^2.0"`.

**"thread 'main' panicked at 'Failed to run migrations'"**
The SQL migration has a syntax error. Open the `.sql` file in `src-tauri/src/db/migrations/` and look for unclosed statements.

**The app opens but shows a blank white screen**
The Vite dev server may not have started yet. Wait 5 seconds and reload (`Ctrl+R`).

**AI features show "AI offline"**
Ollama is not running. Start it with `ollama serve` in a terminal. AI features are fully optional — the app works without them.

**SQLite database corruption**
Delete the database file (see path above) and restart the app. Migrations will recreate all tables. Note: this deletes all your data.

---

## Running Tests

```powershell
# Frontend unit tests
pnpm test

# TypeScript type checking
pnpm typecheck

# Lint
pnpm lint

# Rust tests
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## Code Style Rules (enforced)

- **TypeScript**: strict mode, no `any`, no default exports (except pages)
- **Rust**: no `unwrap()` in production paths, use `?` operator
- **SQL**: UUID text primary keys, ISO 8601 timestamps as TEXT
- **Naming**: TypeScript PascalCase for types, camelCase for functions; Rust snake_case
- **No** comments explaining what — only comments explaining why (non-obvious constraints, workarounds)

See `memory-bank/coding-standards.md` for the full rules.

---

## Architecture Decision Records

All architecture decisions live in `memory-bank/`. Before adding a feature or changing a pattern, read the relevant file. Key files:

| Question | File |
|----------|------|
| Why this tech stack? | `tech-stack.md` |
| How is the DB structured? | `domain-models.md` |
| How does state management work? | `state-management.md` |
| What are the product principles? | `principles.md` |
| What is the execution model? | `execution-model.md` |
| How does the AI work? | `ai-behavior.md` |
| How does the knowledge system work? | `knowledge-system.md` |

---

## What's Working Right Now (v0.1)

All 8 development phases are complete and the scaffold is ready:

- **Today page**: Daily time blocks, focus timer (Pomodoro), block creation
- **Weekly page**: 7-column week grid, drag-to-create blocks, week navigation
- **Goals page**: Goals with milestones, domain linking, progress tracking
- **Domains page**: 12 life domains, inline vision/purpose editing
- **Reflection page**: Weekly and monthly review wizard with structured prompts
- **Knowledge page**: Notes CRUD with FTS5 full-text search, tags, type filters
- **Context page**: Context snapshots + decision log (cognitive continuity)
- **Schedule page**: Recurring time block rules (create/toggle/delete)
- **Settings**: Theme, AI model configuration, Ollama URL
- **AI integration**: Ollama connection, daily briefing, reflection questions, goal alignment
- **Export system**: JSON, Markdown, CSV export per module

**Not yet done** (future phases):
- Balance wheel radar chart visualization
- Calendar import/export (ICS)
- Vector semantic search
- Encrypted backup
- E2E tests (Playwright)
- Mobile / cloud sync (deliberately deferred)

---

## Contributing

1. Read `memory-bank/coding-standards.md` before writing any code
2. Read the relevant `memory-bank/*.md` file for the module you're touching
3. Follow the feature addition steps above
4. Commit format: `type(scope): subject` (e.g., `feat(goals): add milestone dates`)
5. Open a PR with a description of what and why

---

## Contact

Built by [Ramesh Kumar](https://github.com/ramesh152). Questions, issues, and contributions welcome via GitHub Issues.
