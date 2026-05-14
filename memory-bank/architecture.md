# Architecture — LENSSTACK + X10THINK

## Architecture Pattern
**Offline-first modular event-capable desktop application**

## Layer Diagram
```
┌─────────────────────────────────────────────┐
│              React UI Layer                  │
│  (Components · Pages · Hooks · Stores)       │
├─────────────────────────────────────────────┤
│           Tauri IPC Bridge                   │
│  (Commands · Events · State sync)            │
├─────────────────────────────────────────────┤
│           Rust Core Layer                    │
│  (Business Logic · DB · AI · Sync)           │
├─────────────────────────────────────────────┤
│           Storage Layer                      │
│  SQLite (primary) · File system              │
├─────────────────────────────────────────────┤
│           AI Layer (optional)                │
│  Ollama local inference · Vector search      │
└─────────────────────────────────────────────┘
```

## Core Modules

| Module | Responsibility |
|--------|---------------|
| `life-architecture` | Domains, vision, purpose, life map |
| `goals` | Strategic goals, OKRs, milestones |
| `execution` | Time-boxing, scheduling, focus sessions |
| `ai-mentor` | AI reflection, recommendations, summaries |
| `context-engine` | Cognitive continuity, snapshots, memory |
| `knowledge` | Notes, learning, knowledge graph |
| `deep-work` | Focus protection, session management |
| `health-energy` | Tracking physical/mental state |
| `recurring-systems` | Habits, rituals, recurring tasks |
| `reflection` | Review workflows, journaling |
| `export` | Data export, backup, migration |

## Data Flow
```
User Action → React Store → Tauri IPC Command
→ Rust Handler → SQLite → Event emitted
→ React Store updated → UI re-renders
```

## AI Integration Flow
```
User Context → Rust AI Module → Ollama HTTP API
→ Response parsed → Explanation attached
→ Suggestion returned (never auto-applied)
```

## State Management Strategy
- **Zustand** for UI state (client-only)
- **SQLite** for persistent domain state (source of truth)
- **Tauri events** for cross-window sync
- No Redux — overkill for this use case

## Offline-First Strategy
- All reads/writes go to local SQLite
- AI features gracefully disabled when Ollama unavailable
- Optional cloud sync never blocks core functionality
- Local-first, sync-later pattern

## Module Boundaries
- Each module owns its SQLite tables
- Cross-module queries go through typed Rust service layer
- No direct table-to-table joins across module boundaries at UI level
- IPC commands are the API contract between frontend and backend

## Scalability Constraints
- Single user, single device (no concurrent write conflicts)
- SQLite scales to millions of rows for single-user use case
- Vector search via embedded Qdrant or in-memory for small datasets
- No premature distributed architecture
