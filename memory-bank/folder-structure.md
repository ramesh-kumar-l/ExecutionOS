# Folder Structure — LENSSTACK + X10THINK

## Top-Level Structure
```
ExecutionOS/
├── memory-bank/              ← Architecture brain (25 files)
├── src-tauri/                ← Rust/Tauri backend
│   ├── src/
│   │   ├── main.rs           ← Tauri app entry point
│   │   ├── lib.rs            ← Library root
│   │   ├── commands/         ← Tauri IPC command handlers
│   │   │   ├── mod.rs
│   │   │   ├── goals.rs
│   │   │   ├── domains.rs
│   │   │   ├── execution.rs
│   │   │   ├── reflection.rs
│   │   │   ├── context.rs
│   │   │   ├── knowledge.rs
│   │   │   ├── ai.rs
│   │   │   ├── settings.rs
│   │   │   └── export.rs
│   │   ├── db/               ← Database layer
│   │   │   ├── mod.rs
│   │   │   ├── pool.rs       ← Connection pool setup
│   │   │   ├── migrations/   ← SQL migration files
│   │   │   │   ├── 001_initial.sql
│   │   │   │   ├── 002_goals.sql
│   │   │   │   └── ...
│   │   │   └── models/       ← Rust DB model structs
│   │   │       ├── domain.rs
│   │   │       ├── goal.rs
│   │   │       ├── time_block.rs
│   │   │       └── ...
│   │   ├── services/         ← Business logic (no DB concerns)
│   │   │   ├── mod.rs
│   │   │   ├── goals.rs
│   │   │   ├── execution.rs
│   │   │   ├── health_score.rs
│   │   │   └── ...
│   │   ├── ai/               ← AI integration
│   │   │   ├── mod.rs
│   │   │   ├── ollama.rs     ← Ollama HTTP client
│   │   │   ├── context.rs    ← Context assembly
│   │   │   ├── prompts.rs    ← Prompt templates
│   │   │   └── embeddings.rs ← Vector embedding
│   │   └── error.rs          ← App-wide error types
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
│
├── src/                      ← React frontend
│   ├── main.tsx              ← React entry point
│   ├── App.tsx               ← Root component + routing
│   │
│   ├── components/
│   │   ├── ui/               ← Primitive UI components (shadcn wrappers)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   └── ...
│   │   ├── layout/           ← Layout components
│   │   │   ├── PageLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FocusLayout.tsx
│   │   │   └── CommandPalette.tsx
│   │   └── modules/          ← Feature-specific components
│   │       ├── domains/
│   │       │   ├── DomainCard.tsx
│   │       │   ├── DomainEditor.tsx
│   │       │   └── BalanceWheel.tsx
│   │       ├── goals/
│   │       │   ├── GoalCard.tsx
│   │       │   ├── GoalEditor.tsx
│   │       │   ├── GoalTimeline.tsx
│   │       │   └── MilestoneList.tsx
│   │       ├── execution/
│   │       │   ├── DayView.tsx
│   │       │   ├── TimeBlockCard.tsx
│   │       │   ├── TimeBlockEditor.tsx
│   │       │   └── FocusTimer.tsx
│   │       ├── reflection/
│   │       │   ├── ReflectionEditor.tsx
│   │       │   └── ReflectionHistory.tsx
│   │       ├── context/
│   │       │   ├── ContextSnapshot.tsx
│   │       │   └── DecisionLog.tsx
│   │       └── ai/
│   │           ├── AIPanel.tsx
│   │           └── AIBriefing.tsx
│   │
│   ├── pages/                ← Route-level page components
│   │   ├── TodayPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── DomainsPage.tsx
│   │   ├── ExecutionPage.tsx
│   │   ├── ReflectionPage.tsx
│   │   ├── KnowledgePage.tsx
│   │   ├── ContextPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── hooks/                ← Custom React hooks
│   │   ├── useGoals.ts
│   │   ├── useDomains.ts
│   │   ├── useExecution.ts
│   │   ├── useReflection.ts
│   │   ├── useAI.ts
│   │   └── useKeyboard.ts
│   │
│   ├── stores/               ← Zustand stores
│   │   ├── appStore.ts
│   │   ├── domainsStore.ts
│   │   ├── goalsStore.ts
│   │   ├── executionStore.ts
│   │   ├── reflectionStore.ts
│   │   └── aiStore.ts
│   │
│   ├── lib/
│   │   ├── commands/         ← Tauri IPC typed wrappers
│   │   │   ├── goals.ts
│   │   │   ├── domains.ts
│   │   │   ├── execution.ts
│   │   │   ├── reflection.ts
│   │   │   └── ai.ts
│   │   ├── utils/
│   │   │   ├── dates.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── animations.ts     ← Framer Motion variants
│   │   └── constants.ts
│   │
│   ├── types/
│   │   ├── domain.types.ts
│   │   ├── goal.types.ts
│   │   ├── execution.types.ts
│   │   ├── reflection.types.ts
│   │   ├── ai.types.ts
│   │   └── index.ts          ← Re-exports
│   │
│   ├── styles/
│   │   ├── globals.css       ← CSS variables + resets
│   │   └── fonts.css
│   │
│   └── assets/
│       └── fonts/
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.json
├── .prettierrc
├── CLAUDE.md
└── README.md
```

## Module Boundary Rules
- `commands/` files import from `db/` and `services/` only
- `services/` files have zero Tauri dependencies — pure Rust business logic
- `db/` files are the only layer touching SQLite directly
- Frontend `pages/` import from `components/modules/` and `hooks/` only
- Frontend `hooks/` import from `stores/` and `lib/commands/` only
- No cross-module imports at the component level
