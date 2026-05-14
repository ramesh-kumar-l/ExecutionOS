# LENSSTACK + X10THINK

A premium offline-first AI-assisted strategic life operating system for elite performers.

## Prerequisites

- [Rust](https://rustup.rs/) (1.78+)
- [Node.js](https://nodejs.org/) (20 LTS)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/) (Windows: WebView2 + build tools)
- [Ollama](https://ollama.ai/) (optional, for AI features)

## Setup

```bash
# Install frontend dependencies
pnpm install

# Start development (Tauri + React hot reload)
pnpm tauri:dev

# Build for production
pnpm tauri:build

# Run frontend tests
pnpm test

# Type check
pnpm typecheck
```

## Architecture

- **Frontend**: React + TypeScript + Tailwind + shadcn/ui + Framer Motion
- **Backend**: Rust + Tauri 2.x
- **Database**: SQLite (local, offline-first)
- **AI**: Ollama (local inference, optional)
- **State**: Zustand (UI) + SQLite (source of truth)

## Memory Bank

All architectural decisions are documented in `/memory-bank/`. Read these before making significant changes.

## Philosophy

This is not a productivity app. It is a strategic life operating system built on:
1. Reliability over features
2. Simplicity over cleverness
3. User ownership over convenience
4. Long-term thinking over short-term wins
