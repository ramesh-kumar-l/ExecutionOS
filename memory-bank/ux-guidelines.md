# UX Guidelines — LENSSTACK + X10THINK

## Design Inspiration
Linear · Obsidian · Raycast · Apple Human Interface Guidelines · Things 3 · VS Code

## Core UX Values
1. **Calm** — never anxious, never urgent-feeling
2. **Premium** — every detail signals care
3. **Minimal** — less is more, relentlessly
4. **Intelligent** — surfaces what matters when it matters
5. **Focused** — one task, one context at a time
6. **Timeless** — no trends, no novelty patterns

## Layout Principles
- Three-column max: navigation · content · context panel
- Left sidebar: navigation, always visible or hideable
- Center: primary content, max readable width
- Right panel: contextual AI, related info (optional/collapsible)
- No floating widgets. No modals stacked on modals.
- Full-screen deep work mode available for all content views

## Typography
- **Primary font**: Inter or Geist (system-like, readable)
- **Mono font**: JetBrains Mono or Geist Mono (for code, dates, numbers)
- **Scale**: 12 · 13 · 14 · 16 · 18 · 24 · 32 · 48px
- Line height: 1.5 for body, 1.2 for headings
- Max line width: 72ch for reading content

## Color System
- **Base**: near-black background (#0a0a0a), near-white text (#f5f5f5)
- **Surface levels**: 4 levels of elevation using subtle lightness steps
- **Accent**: single strategic color (muted blue or neutral gold — final TBD)
- **Semantic**: success (green), warning (amber), error (red) — muted variants
- Support both dark (default) and light themes
- No gradients in UI chrome. Gradients only in hero/onboarding.

## Spacing
- 4px base unit
- Scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96px
- Generous whitespace in content areas
- Tight spacing in navigation/toolbars

## Interaction Patterns
- **Keyboard-first**: every action has a keyboard shortcut
- **Command palette** (⌘K / Ctrl+K): universal fast navigation
- **Hover reveals**: contextual actions appear on hover, not cluttering default state
- **Optimistic UI**: actions appear instant, sync in background
- **Undo everywhere**: Ctrl+Z available for all mutations

## Animation Guidelines
- Duration: 100–200ms for micro-interactions, 200–350ms for panel transitions
- Easing: ease-out for entrances, ease-in for exits, ease-in-out for transitions
- No bouncing, no spring physics on serious productivity UI
- Framer Motion variants: `fade`, `slideUp`, `slideIn` — subtle only
- Disable animations if `prefers-reduced-motion`

## Navigation Model
- **Sidebar sections**: Today · Goals · Domains · Focus · Review · Knowledge · Settings
- **Breadcrumbs** in content area for deep hierarchies
- **Recent items** in command palette
- **Contextual back** — always visible path back

## Avoid
- Dashboard overload (no widget farms)
- Noisy notifications (critical only)
- Gamification (no streaks pressure, badges, XP)
- Social media patterns (no likes, shares, feeds)
- Feature clutter (hide advanced options by default)
- Loading spinners on fast local operations (use optimistic UI)
- Confirmations for reversible actions (just do + undo)

## Accessibility
- WCAG AA minimum
- Full keyboard navigation
- ARIA labels on all interactive elements
- Focus indicators always visible
- Screen reader support for core flows

## Component Naming Conventions
- Primitives: `Button`, `Input`, `Select`, `Badge`
- Compositions: `GoalCard`, `DomainPanel`, `TimeBlock`
- Layouts: `PageLayout`, `SidebarLayout`, `FocusLayout`
- Modules: `GoalModule`, `ReflectionModule`, `DomainModule`
