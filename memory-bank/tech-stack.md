# Tech Stack — LENSSTACK + X10THINK

## Mandatory Stack

### Desktop Framework
- **Tauri 2.x** — Rust-based desktop app framework
  - Reason: lightweight, secure, offline-capable, cross-platform
  - Alternative rejected: Electron (too heavy, no local-first advantage)

### Backend (Rust)
- **Rust** — core business logic, DB access, AI orchestration
- **SQLite via sqlx** — async, typed SQL queries, migrations
- **serde / serde_json** — serialization
- **tokio** — async runtime
- **reqwest** — HTTP client for Ollama API calls
- **tauri-plugin-sql** — SQLite integration

### Frontend
- **React 18+** — component model
- **TypeScript 5+** — strict mode, no `any`
- **Vite** — build tool (fast HMR)
- **Tailwind CSS 3+** — utility-first styling
- **shadcn/ui** — accessible, unstyled-then-styled components
- **Framer Motion** — subtle premium animations
- **Zustand** — lightweight state management (no Redux)
- **React Query (TanStack Query)** — async state / data fetching from Tauri commands

### AI
- **Ollama** — local LLM inference server
  - Models: Llama 3, Mistral, Phi-3 (user configurable)
- **Local vector search** — embedded for semantic retrieval
- Optional: **Qdrant** for larger vector datasets

### Storage
- **SQLite** — primary persistent store (via sqlx in Rust)
- **File system** — exports, backups, attachments

### Testing
- **Vitest** — frontend unit tests
- **React Testing Library** — component tests
- **Rust built-in tests** — unit tests for Rust modules
- **Playwright** — E2E for critical flows (optional, later phase)

## Version Targets (as of project start: 2026-05)
```
tauri: 2.x
rust: 1.78+
node: 20 LTS
react: 18.x
typescript: 5.x
tailwind: 3.x
vite: 5.x
zustand: 4.x
framer-motion: 11.x
sqlx: 0.7+
```

## Rejected Technologies
| Technology | Reason |
|------------|--------|
| Electron | Too heavy, bad offline story |
| Redux | Overkill for single-user app |
| Firebase/Supabase | Cloud dependency, privacy concern |
| MongoDB | Wrong fit for structured life data |
| GraphQL | Overhead not justified |
| Next.js | Not applicable for desktop app |

## Development Tools
- `cargo` — Rust package manager
- `pnpm` — frontend package manager (prefer over npm/yarn)
- `prettier` — code formatting
- `eslint` — TypeScript linting
- `rustfmt` — Rust formatting
- `clippy` — Rust linting
