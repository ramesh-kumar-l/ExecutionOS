# Testing Strategy — LENSSTACK + X10THINK

## Testing Philosophy
Test behavior, not implementation. Test what matters to users, not internal details.

## Test Pyramid

```
         ┌───────────────┐
         │  E2E (Playwright)   │  ← Critical user flows only
         ├───────────────┤
         │  Integration         │  ← Rust DB + IPC contracts
         ├───────────────┤
         │  Unit                │  ← Business logic + utilities
         └───────────────┘
```

## Frontend Testing (Vitest + RTL)

### What to test
- Business logic in custom hooks
- Store actions and state transitions
- Utility functions (date helpers, formatters, validators)
- Component behavior (not styling)

### What NOT to test
- Shadcn/ui internals
- CSS/styling
- Framer Motion animations
- Implementation details

### Test file convention
```
src/
  hooks/
    useGoals.ts
    useGoals.test.ts    ← colocated
  lib/
    dates.ts
    dates.test.ts
```

### Example pattern
```typescript
describe('useGoals', () => {
  it('creates a goal and adds it to the store', async () => {
    const { result } = renderHook(() => useGoalsStore());
    await act(() => result.current.createGoal({ title: 'Test Goal', ... }));
    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].title).toBe('Test Goal');
  });
});
```

## Rust Testing

### Unit tests (inline)
```rust
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_health_score_calculation() {
    let score = calculate_domain_health(0.8, 0.7, 0.5, 8.0);
    assert!((score - 74.5).abs() < 0.1);
  }
}
```

### Integration tests (Rust)
- Use `sqlx::test` attribute with in-memory SQLite
- Test full CRUD for each domain model
- Test migration correctness

```rust
#[sqlx::test]
async fn test_create_goal(pool: SqlitePool) {
  let goal = create_goal(&pool, CreateGoalInput { title: "Test".into(), ... }).await;
  assert!(goal.is_ok());
}
```

## E2E Testing (Playwright — Phase 8+)
Critical paths only:
1. First launch + domain setup
2. Create goal → schedule time block → complete block
3. Run weekly review
4. Export all data
5. AI mentor flow (mocked Ollama)

## Coverage Targets
| Layer | Target |
|-------|--------|
| Rust business logic | 85% |
| Frontend hooks/utils | 80% |
| Component behavior | 60% |
| E2E critical paths | 100% of defined paths |

## CI Strategy
- Run Rust tests on every commit
- Run Vitest on every commit
- E2E tests on PR to main
- Build Tauri app in CI to catch compilation errors

## Test Data Strategy
- Rust: in-memory SQLite per test
- Frontend: mock `invoke` via `vi.mock('@tauri-apps/api/core')`
- Fixtures: typed test factory functions, not raw objects

## Mocking Tauri IPC in Tests
```typescript
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((cmd, args) => {
    if (cmd === 'get_goals') return Promise.resolve([mockGoal]);
    throw new Error(`Unmocked command: ${cmd}`);
  })
}));
```
