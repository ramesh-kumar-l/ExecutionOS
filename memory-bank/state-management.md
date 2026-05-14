# State Management — LENSSTACK + X10THINK

## Architecture Decision
**Zustand** for UI state + **SQLite** as source of truth + **Tauri IPC** as the bridge.

No Redux. No Context hell. Zustand is simpler, faster, and sufficient.

## Store Hierarchy

### 1. `useAppStore` — Global App State
```typescript
{
  theme: 'dark' | 'light' | 'system';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  activeModule: string;
  isLoading: boolean;
  notifications: Notification[];
}
```

### 2. `useDomainsStore` — Life Domains
```typescript
{
  domains: Domain[];
  activeDomainId: string | null;
  isLoading: boolean;
  // actions
  loadDomains: () => Promise<void>;
  updateDomain: (id: string, patch: Partial<Domain>) => Promise<void>;
  setActiveDomain: (id: string) => void;
}
```

### 3. `useGoalsStore` — Goals
```typescript
{
  goals: Goal[];
  activeGoalId: string | null;
  filter: GoalFilter;
  isLoading: boolean;
  // actions
  loadGoals: () => Promise<void>;
  createGoal: (data: CreateGoalInput) => Promise<Goal>;
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}
```

### 4. `useExecutionStore` — Daily Execution
```typescript
{
  selectedDate: string; // YYYY-MM-DD
  timeBlocks: TimeBlock[];
  activeFocusSession: FocusSession | null;
  // actions
  loadTimeBlocks: (date: string) => Promise<void>;
  createTimeBlock: (data: CreateTimeBlockInput) => Promise<TimeBlock>;
  startFocusSession: (blockId: string) => Promise<void>;
  endFocusSession: () => Promise<void>;
}
```

### 5. `useReflectionStore` — Reflection
```typescript
{
  entries: ReflectionEntry[];
  activeEntry: ReflectionEntry | null;
  // actions
  loadEntries: () => Promise<void>;
  createEntry: (type: ReflectionType, content: Record<string, string>) => Promise<void>;
  loadTodayEntry: () => Promise<void>;
}
```

### 6. `useAIStore` — AI State
```typescript
{
  isConnected: boolean;
  isThinking: boolean;
  currentModel: string;
  lastResponse: AIResponse | null;
  // actions
  checkConnection: () => Promise<void>;
  generateReflectionQuestions: (context: ReflectionContext) => Promise<string[]>;
  analyzGoalAlignment: (goals: Goal[]) => Promise<AIInsight[]>;
}
```

## Data Flow Pattern
```
User action
→ Zustand action called
→ Optimistic UI update (immediate)
→ Tauri `invoke()` command
→ Rust handler → SQLite mutation
→ Return result
→ Zustand store confirmed/reconciled
→ UI consistent
```

## Error Handling Pattern
```typescript
try {
  set({ isLoading: true });
  const result = await invoke<T>('command_name', args);
  set({ data: result, isLoading: false });
} catch (err) {
  set({ isLoading: false });
  useAppStore.getState().addNotification({ type: 'error', message: parseError(err) });
}
```

## Tauri IPC Pattern
```typescript
// Frontend call
const result = await invoke<Goal[]>('get_goals', { domainId: 'abc' });

// Rust handler
#[tauri::command]
async fn get_goals(domain_id: Option<String>, db: State<DbPool>) -> Result<Vec<Goal>, String> {
  // ...
}
```

## Rules
1. SQLite is always source of truth — Zustand is a cache
2. All mutations go through Rust — no direct SQLite from frontend
3. Optimistic updates must be reversible on error
4. Store slices are isolated — no store imports another store
5. TanStack Query may be used for read-heavy derived data (charts, stats)
