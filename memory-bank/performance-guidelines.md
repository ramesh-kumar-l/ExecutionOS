# Performance Guidelines — LENSSTACK + X10THINK

## Performance Budget

| Operation | Budget |
|-----------|--------|
| App cold start | < 1000ms |
| Navigation transition | < 50ms |
| SQLite read (single record) | < 5ms |
| SQLite read (list, <100 items) | < 10ms |
| SQLite write | < 20ms |
| React re-render (component) | < 16ms (60fps) |
| Command palette search | < 50ms |
| AI response (local Ollama) | < 3000ms |
| Export (full JSON) | < 2000ms |
| Export (PDF) | < 5000ms |

## SQLite Performance

### Configuration
```sql
PRAGMA journal_mode = WAL;      -- Write-Ahead Log for concurrent reads
PRAGMA synchronous = NORMAL;    -- Balance safety/speed
PRAGMA cache_size = -8000;      -- 8MB page cache
PRAGMA foreign_keys = ON;       -- Enforce referential integrity
PRAGMA temp_store = MEMORY;     -- Temp tables in memory
```

### Index Strategy
```sql
-- Index foreign keys always
CREATE INDEX idx_goals_domain_id ON goals(domain_id);
CREATE INDEX idx_time_blocks_date ON time_blocks(date);
CREATE INDEX idx_time_blocks_goal_id ON time_blocks(goal_id);
CREATE INDEX idx_reflections_date ON reflection_entries(date);
CREATE INDEX idx_reflections_type ON reflection_entries(type);

-- Composite indexes for common queries
CREATE INDEX idx_time_blocks_date_status ON time_blocks(date, status);
```

### Query Rules
- Never `SELECT *` — list explicit columns
- Always limit list queries: `LIMIT 100` unless explicitly paginated
- Use prepared statements (sqlx macro handles this)
- Batch inserts when creating multiple records

## React Performance

### Rendering Rules
- `React.memo()` on list item components (GoalCard, TimeBlockCard)
- `useMemo()` for expensive derived data (domain health calculations)
- `useCallback()` for event handlers passed to memoized children
- Virtual scrolling for lists > 50 items (use `@tanstack/virtual`)
- No anonymous arrow functions in JSX (they break memo)

### Bundle Size
- Tree-shake Lucide icons (import individually, not `import * from 'lucide-react'`)
- Lazy-load heavy pages (`React.lazy()`)
- Analyze bundle with `vite-bundle-visualizer` before release

### State Update Rules
- Batch Zustand updates: use `set` with updater function, not multiple `set` calls
- Optimistic UI for all mutations (instant feedback, reconcile async)
- Debounce text input saves (500ms)
- Throttle drag/resize events (16ms = 60fps)

## Tauri IPC Performance
- IPC calls are async — never block UI thread
- Batch related IPC calls when possible
- Cache IPC results in Zustand — don't re-fetch if data is fresh
- Use Tauri events for push (subscription pattern) rather than polling

## Memory Management
- No memory leaks: clean up event listeners, subscriptions, intervals in `useEffect` cleanup
- Large data (export, report generation) processed in Rust (not JS)
- Vector embeddings loaded lazily — don't preload all at startup
- AI responses cached for current session only (not persisted unless useful)

## Startup Performance
- Critical path: database connection → load settings → render shell → load first page
- Defer: AI connection check, vector index load, background tasks
- No blocking operations on main thread at startup
- Preload: today's time blocks + active goals (most common first view)

## Measurement
- Use Tauri's built-in performance events in development
- React DevTools Profiler for component render analysis
- SQLite EXPLAIN QUERY PLAN for slow queries
- Target: no visible jank at 60fps on mid-range hardware
