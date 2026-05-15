# I Built a Desktop App with Tauri 2, Rust, and React — Here's Every Architecture Decision I Made

*A no-fluff technical deep dive into building a production-quality offline-first desktop application in 2026.*

---

Six months ago I started building LENSSTACK — a strategic life operating system I use daily. Not a web app. Not an Electron app. A real native desktop application with a Rust backend, SQLite database, and React frontend, packaged with Tauri 2.

This post is the article I wish existed when I started: the honest architecture decisions, the tradeoffs I weighed, the things I'd do differently, and the patterns that held up under real use.

---

## Why Tauri Over Electron

This is always the first question. The answer comes down to three things.

**Binary size.** An Electron app ships its own Chromium. My Tauri build is under 5MB. An equivalent Electron app would be 80–150MB. For a personal desktop tool, that matters.

**Memory.** Electron runs a full Chromium process. Tauri uses the operating system's native WebView — Edge/WebView2 on Windows, WKWebView on macOS, WebKitGTK on Linux. The memory footprint difference is significant enough that you notice it immediately.

**The backend.** With Electron, your backend is Node.js. With Tauri, it's Rust. For a personal system that needs to be reliable for years, the memory safety guarantees and performance of Rust were worth the learning investment.

The tradeoff: Tauri has a steeper initial setup (MSVC build tools, WebView2 runtime, Rust toolchain), and the Tauri community is smaller than Electron's. If you need cross-browser consistency or a massive plugin ecosystem, Electron is still the right call.

---

## The Layer Architecture

I settled on four clear layers with hard boundaries between them:

```
┌─────────────────────────────────────┐
│           React UI Layer            │
│   (Components, Pages, Zustand)      │
├─────────────────────────────────────┤
│         Tauri IPC Bridge            │
│   (invoke() → typed commands)       │
├─────────────────────────────────────┤
│         Rust Command Layer          │
│   (Business logic, validation)      │
├─────────────────────────────────────┤
│         SQLite Storage Layer        │
│   (sqlx, async queries, migrations) │
└─────────────────────────────────────┘
```

The IPC bridge is the most important concept. The React frontend cannot access the filesystem or the database directly. Everything goes through typed commands:

```typescript
// Frontend never calls invoke() directly
// It uses typed wrappers in src/lib/commands/

export function getGoals(domainId?: string): Promise<Goal[]> {
  return invoke<Goal[]>("get_goals", { domainId });
}
```

```rust
// Backend: the actual command
#[tauri::command]
pub async fn get_goals(
    domain_id: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Vec<Goal>, String> {
    sqlx::query_as::<_, GoalRow>(
        "SELECT * FROM goals WHERE domain_id = ? ORDER BY created_at DESC"
    )
    .bind(domain_id)
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())
    .map(|rows| rows.into_iter().map(Goal::from).collect())
}
```

This boundary is strict and intentional. It means the frontend is a pure view layer with no business logic. The Rust backend owns all validation, all database access, and all invariants.

---

## SQLite as the Source of Truth

I chose SQLite over a remote database for a deliberate reason: this is an offline-first application. The data needs to exist locally, durably, and without a network connection.

SQLite scales to millions of rows for a single-user application. It is transactional. It is battle-tested at scale (it's literally embedded in billions of devices). And it ships with the application — no configuration, no server process.

The schema uses a pattern I'd recommend for any SQLite project:

- **UUID text primary keys** — never integer autoincrement. Easier to reason about, no collision risk when merging data sources.
- **ISO 8601 text timestamps** — SQLite has no native date type. Text comparisons on ISO 8601 strings work correctly with `<` and `>` operators.
- **JSON stored as text** — tags, arrays, and optional structured data live as JSON strings. Validated in Rust before insert, parsed after read.

```sql
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,                   -- UUID
  title TEXT NOT NULL,
  domain_id TEXT NOT NULL REFERENCES domains(id),
  target_date TEXT,                      -- ISO 8601
  status TEXT NOT NULL DEFAULT 'active', -- enum enforced in Rust
  tags TEXT NOT NULL DEFAULT '[]',       -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### The Migration Pattern

I wrote a custom migration runner rather than using sqlx-migrate. The reason: I wanted full control over idempotency. Every migration file uses `IF NOT EXISTS`, `CREATE OR REPLACE`, or `INSERT OR IGNORE` so that re-running all migrations on every boot is safe.

```rust
async fn run_migrations(pool: &sqlx::SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(include_str!("db/migrations/001_initial.sql")).execute(pool).await?;
    sqlx::query(include_str!("db/migrations/002_seed_domains.sql")).execute(pool).await?;
    sqlx::query(include_str!("db/migrations/003_fts5_triggers.sql")).execute(pool).await?;
    Ok(())
}
```

`include_str!` embeds the SQL at compile time. No file I/O at runtime. If a migration file doesn't exist, the Rust compiler fails — which is exactly the behavior I want.

---

## FTS5 Full-Text Search — The Right Way

The knowledge module has full-text search across notes. My first implementation used `LIKE '%query%'` — an O(n) table scan. That's fine for 10 notes. It becomes noticeable at 10,000.

The correct implementation uses SQLite's built-in FTS5 extension:

```sql
-- The FTS virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_notes_fts
USING fts5(title, content, tags, content=knowledge_notes, content_rowid=rowid);

-- Sync triggers (keep the index consistent)
CREATE TRIGGER IF NOT EXISTS knowledge_notes_ai
AFTER INSERT ON knowledge_notes BEGIN
  INSERT INTO knowledge_notes_fts(rowid, title, content, tags)
  VALUES (new.rowid, new.title, new.content, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS knowledge_notes_au
AFTER UPDATE ON knowledge_notes BEGIN
  INSERT INTO knowledge_notes_fts(knowledge_notes_fts, rowid, title, content, tags)
  VALUES ('delete', old.rowid, old.title, old.content, old.tags);
  INSERT INTO knowledge_notes_fts(rowid, title, content, tags)
  VALUES (new.rowid, new.title, new.content, new.tags);
END;
```

The query sanitizer converts user input into safe FTS5 MATCH expressions:

```rust
fn fts_query(q: &str) -> String {
    q.split_whitespace()
        .filter(|w| !w.is_empty())
        .map(|w| format!("\"{}\"*", w.replace('"', "\"\"")))
        .collect::<Vec<_>>()
        .join(" ")
}
// "hello world" → `"hello"* "world"*`
// Prefix match on each token, results ordered by rank (relevance)
```

---

## State Management: Zustand + SQLite

The pattern I use throughout:

1. **SQLite is the source of truth.** Never trust Zustand state as the canonical record.
2. **Zustand is a read cache.** It holds what the UI currently shows.
3. **Write → SQLite first, then update Zustand from the response.**

```typescript
// goalsStore.ts — the pattern
const createGoal = async (input: CreateGoalInput) => {
  const goal = await createGoalCommand(input); // writes to SQLite via Rust
  set((state) => ({ goals: [goal, ...state.goals] })); // update from response
};
```

This means the store always reflects what actually got written. If the Rust command fails (e.g., DB error), the store isn't updated, and the UI stays consistent with the database.

I deliberately rejected React Query here. React Query is excellent for remote APIs — it handles stale-while-revalidate, refetch intervals, and network state. But for local Tauri IPC calls, that machinery is unnecessary overhead. The IPC is effectively an in-process call — no network, no retry semantics needed.

---

## The React Side: Patterns That Worked

**Typed IPC wrappers** — every module gets its own file in `src/lib/commands/`. Components never call `invoke()` directly. This creates a single place to update if a command signature changes on the Rust side.

**Page-level data loading** — pages own their data loading logic via the Zustand store. Components receive typed props and render. No data fetching inside deeply nested components.

**Animation budget** — Framer Motion variants are defined once in `src/lib/animations.ts` and reused everywhere. I set a firm rule early: no animation over 200ms. This keeps the UI feeling fast, not slow-and-showy.

```typescript
// animations.ts — defined once
export const slideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
};
```

---

## Local AI With Ollama

The AI features connect to Ollama — a local LLM inference server that runs on your machine. No data leaves the device. The model runs on your GPU/CPU.

The design principle: **AI suggests, never decides.**

```rust
// ai.rs — the Ollama client
pub async fn get_daily_briefing(context: AiContext) -> Result<String, String> {
    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:11434/api/generate")
        .json(&OllamaRequest {
            model: &context.model,
            prompt: build_briefing_prompt(&context),
            stream: false,
        })
        .send()
        .await
        .map_err(|_| "AI offline".to_string())?;
    // parse response...
}
```

The graceful degradation is explicit: if the HTTP call fails (Ollama not running), the error string is "AI offline" and the UI shows a clean offline state rather than a broken error panel.

---

## What I'd Do Differently

**Use a migration framework.** My custom `run_migrations()` works, but tracking which migrations have already run requires careful `IF NOT EXISTS` discipline. sqlx-migrate handles this cleanly with a migrations table.

**Typed errors instead of `String` in commands.** Every Tauri command returns `Result<T, String>`. This means the frontend can't distinguish a "not found" error from a "permission denied" error. I'd define an error enum serialized to JSON next time.

**Testing from day one.** The IPC boundary makes integration tests straightforward to write. I didn't write them early enough.

---

## The Numbers

- **Lines of Rust**: ~2,400 (commands + db models + migrations)
- **Lines of TypeScript/TSX**: ~4,800 (pages + components + stores)
- **SQL migrations**: 3 files, ~180 lines
- **Dev build time (cold)**: ~3 minutes
- **Dev build time (hot)**: ~15 seconds (Tauri recompiles only changed Rust)
- **Production binary size**: ~4.8MB
- **App startup time**: <800ms

---

## Final Thought

The Rust + Tauri + React combination is genuinely excellent for personal desktop tools. The development experience is rougher than Electron at first, but the resulting application is faster, smaller, and more reliable. The IPC bridge enforces good architecture by construction — your frontend has to be a pure view layer because there's no other option.

If you want to see the full source, the project is open at: **github.com/ramesh152/lensstack**

I've documented every architecture decision in a `memory-bank/` folder at the root of the repo — 25 markdown files covering everything from vision and principles to the SQL schema and AI behavior.

---

*Built with Tauri 2, Rust 1.78, React 18, TypeScript 5, SQLite, and Ollama.*
*Questions or feedback? Find me on LinkedIn or open a GitHub issue.*
