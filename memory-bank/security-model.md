# Security Model — LENSSTACK + X10THINK

## Threat Model (Single-User Local App)
Primary threats: local data access by unauthorized users, data leakage via export, insecure AI API calls.

Not in scope (single-user desktop): CSRF, XSS between users, SQL injection from network, multi-tenant isolation.

## Data Security

### Sensitive Fields (encrypted at rest)
- Reflection content (personal/private)
- Context snapshots
- Decision logs
- Health data
- Financial goal details

### Encryption
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 (100k iterations) from user passphrase
- Per-field encryption in SQLite (not full-disk — selective)
- Master key stored in system keychain (OS credential store)

### Non-Sensitive Fields (plaintext)
- Goal titles, time blocks, domain names
- UI preferences, settings
- Export metadata

## Tauri Security Configuration
```json
{
  "security": {
    "csp": "default-src 'self'; script-src 'self'",
    "dangerousUseHttpScheme": false,
    "freezePrototype": true
  }
}
```

### Tauri IPC Rules
- All commands explicitly listed in `allowlist`
- No shell access from frontend
- No filesystem access from frontend except via Rust commands
- HTTP requests to Ollama only (localhost) via Rust

## AI Privacy
- All AI inference runs locally via Ollama
- No data sent to external APIs (unless user explicitly enables)
- AI API calls go through Rust (not from browser context)
- Ollama endpoint configurable (default: `http://localhost:11434`)
- User can enable "privacy mode" to disable AI logging

## Backup Security
- Exports are plaintext by default (user owns their data)
- Encrypted backup uses user-set password
- No automatic cloud upload without explicit user action
- Backup password never stored — user must re-enter for restore

## No Telemetry
- Zero analytics, tracking, or usage metrics collected
- No crash reporting to external services
- Local error log only (user-accessible)
- Network audit available in dev mode to verify

## Authentication (Future)
- Optional local PIN for app access
- System biometrics integration (Windows Hello / macOS Touch ID)
- No account system in v1

## Dependency Security
- Rust dependencies: `cargo audit` in CI
- Frontend dependencies: `pnpm audit` in CI
- Tauri: follow official security advisories

## Secure Coding Rules
1. Never `unwrap()` in production Rust code — handle errors explicitly
2. Parameterize all SQL queries — no string concatenation in queries
3. Validate all IPC inputs at Rust boundary
4. No `eval()` or `innerHTML` in frontend
5. Content from user notes rendered as Markdown (sanitized), not raw HTML
