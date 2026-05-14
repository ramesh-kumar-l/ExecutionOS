# Non-Functional Requirements — LENSSTACK + X10THINK

## Performance

| Metric | Target |
|--------|--------|
| App startup time | < 1 second cold start |
| Navigation transition | < 50ms |
| Local data read | < 10ms |
| Local data write | < 20ms |
| AI response (local) | < 3s for standard queries |
| Search results | < 100ms |
| Export generation | < 5s for full export |

## Reliability

| Metric | Target |
|--------|--------|
| Data loss tolerance | Zero — all mutations atomic |
| Crash recovery | Auto-restore last state on relaunch |
| SQLite integrity | WAL mode + regular PRAGMA integrity_check |
| UI error boundary | Every module isolated — one crash doesn't break app |
| Failed AI calls | Graceful fallback, never blocks core flow |

## Offline Capability
- 100% core functionality offline
- AI features degraded gracefully when Ollama unavailable
- No network requests required for any core flow
- Sync (when built) is additive — never required

## Security

| Requirement | Implementation |
|-------------|---------------|
| Sensitive field encryption | AES-256-GCM via Rust |
| No remote telemetry | Verified via network audit |
| Local-only storage default | SQLite in app data directory |
| Backup encryption | User-set password + PBKDF2 key derivation |
| Auth (future) | Local PIN or system keychain |

## Accessibility
- WCAG 2.1 AA compliance
- Full keyboard navigation
- Screen reader support (ARIA)
- Focus management in modals and panels
- `prefers-reduced-motion` respected
- Color contrast: 4.5:1 minimum for text

## Maintainability
- TypeScript strict mode — no `any`
- Rust clippy warnings treated as errors in CI
- All Tauri commands have typed input/output
- SQLite migrations versioned and forward-only
- Module isolation: no cross-module direct imports
- Test coverage target: 80% for business logic

## Scalability (Single User)
- SQLite handles millions of rows comfortably
- No performance degradation up to 10 years of daily data
- Vector search scales to 100k+ embeddings locally

## Observability
- Rust tracing crate for backend logging
- Error boundaries in React with error reporting to local log
- SQLite query timing in development mode
- AI call latency tracked locally

## Compatibility
- Windows 10/11 (primary)
- macOS 12+ (secondary)
- Linux (tertiary — best effort)
- Minimum RAM: 4GB
- Recommended: 8GB+ (for local LLM)
