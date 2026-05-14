# Coding Standards — LENSSTACK + X10THINK

## General Rules
1. Correctness over cleverness
2. Explicit over implicit
3. Typed over untyped — always
4. No premature abstraction
5. Every function does one thing
6. Functions under 50 lines preferred; over 100 requires justification
7. No commented-out code committed
8. No `TODO` without an issue reference in committed code

## TypeScript Standards

### Strict Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Rules
- No `any` — use `unknown` + type guards or proper types
- No type assertions (`as T`) unless unavoidable with comment explaining why
- Prefer `interface` for object shapes, `type` for unions/intersections
- Named exports only (no default exports, except pages)
- Import order: React → third-party → internal (absolute) → relative

### Naming
```typescript
// Types/interfaces: PascalCase
interface GoalSummary { ... }
type BlockStatus = 'planned' | 'completed' | 'skipped';

// Functions/variables: camelCase
const createGoal = async (input: CreateGoalInput): Promise<Goal> => { ... }

// Constants: UPPER_SNAKE_CASE
const MAX_GOALS_PER_DOMAIN = 20;

// React components: PascalCase
const GoalCard: React.FC<GoalCardProps> = ({ goal }) => { ... }

// Tauri command names: snake_case (matches Rust)
await invoke('create_goal', { title: 'Test' });

// File names: kebab-case
// goal-card.tsx, use-goals.ts, goal-types.ts
```

### Tauri IPC Pattern
```typescript
// Always use typed wrappers, never raw invoke in components
// src/lib/commands/goals.ts
export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  return invoke<Goal>('create_goal', input);
}
```

## Rust Standards

### Cargo.toml Conventions
- Pin major versions: `sqlx = "0.7"`
- Group dependencies: [dependencies], [dev-dependencies], [build-dependencies]

### Code Rules
- No `unwrap()` in production code — use `?` with proper error types
- No `panic!()` except in truly unrecoverable invariant violations
- All public functions documented with `///`
- Use `thiserror` for custom error types
- All SQL queries in separate `.sql` files or typed with `sqlx::query!` macro

### Error Handling
```rust
// Define module-specific errors
#[derive(Debug, thiserror::Error)]
pub enum GoalError {
    #[error("Goal not found: {0}")]
    NotFound(String),
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
}

// Tauri commands return Result<T, String>
#[tauri::command]
async fn create_goal(input: CreateGoalInput, db: State<DbPool>) -> Result<Goal, String> {
    goals::create(&db, input).await.map_err(|e| e.to_string())
}
```

### Tauri Command Naming
```rust
// Pattern: verb_noun or verb_noun_modifier
create_goal
get_goals
get_goal_by_id
update_goal
delete_goal
list_time_blocks_for_date
start_focus_session
```

## React Standards

### Component Structure
```typescript
// 1. Imports
// 2. Types
// 3. Component function
// 4. Sub-components (if private to this file)
// No class components

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
  // 1. Hooks (no conditionals around hooks)
  // 2. Derived state
  // 3. Event handlers
  // 4. Return JSX
};
```

### Hooks Rules
- Custom hooks prefix: `use`
- No logic in components beyond event handlers and conditional renders
- Business logic lives in custom hooks, not components

### State Rules
- Zustand stores for cross-component state
- `useState` for purely local UI state (open/close, hover, etc.)
- No prop drilling beyond 2 levels — use Zustand

## File Organization
```
src/
  components/
    ui/           ← shadcn/ui primitive wrappers only
    layout/       ← layout components
    modules/      ← domain-specific composed components
  pages/          ← one file per route/page
  hooks/          ← custom hooks
  stores/         ← Zustand stores
  lib/
    commands/     ← Tauri IPC wrappers (one file per module)
    utils/        ← pure utility functions
    constants.ts  ← app-wide constants
  types/          ← shared TypeScript types
  styles/         ← global CSS
  assets/         ← static assets
```

## SQL Standards
- All tables use TEXT primary keys (UUID, never integer autoincrement)
- All timestamps stored as ISO 8601 TEXT (SQLite has no date type)
- All boolean stored as INTEGER (0/1)
- JSON arrays stored as TEXT (validated in Rust before insert)
- Migrations: numbered sequential files `001_initial.sql`, `002_add_x.sql`

## Git Commit Standards
```
type(scope): subject

Types: feat, fix, refactor, test, docs, style, chore
Scope: goals, execution, reflection, ai, context, ui, db, config

Examples:
feat(goals): add milestone tracking to goal detail view
fix(execution): correct time block overlap detection
refactor(db): extract goal queries to dedicated module
```
