# Roadmap — LENSSTACK + X10THINK

## Development Phases

### Phase 0 — Foundation (Weeks 1–2)
**Goal**: Runnable Tauri app with core infrastructure
- [ ] Tauri + React + TypeScript project initialized
- [ ] SQLite database connected (sqlx + migrations)
- [ ] Design system implemented (Tailwind + shadcn/ui)
- [ ] Command palette implemented (⌘K)
- [ ] Navigation/sidebar layout implemented
- [ ] Routing structure implemented
- [ ] Theme system (dark/light)
- [ ] Basic settings page

### Phase 1 — Life Architecture (Weeks 3–4)
**Goal**: User can define their life structure
- [ ] Life Domains setup (12 domains)
- [ ] Domain vision/purpose editor
- [ ] Life Map visualization
- [ ] Domain health scores
- [ ] Domain balance wheel view

### Phase 2 — Goals System (Weeks 5–6)
**Goal**: Strategic goal management
- [ ] Goal creation with domain linking
- [ ] Goal decomposition (milestones, sub-goals)
- [ ] Goal timeline visualization
- [ ] Goal progress tracking
- [ ] Goal review workflow

### Phase 3 — Execution Engine (Weeks 7–9)
**Goal**: Time-boxed daily execution
- [ ] Daily view with time blocks
- [ ] Time block creation/editing
- [ ] Recurring systems (habits/rituals)
- [ ] Focus session timer
- [ ] Execution debt tracking
- [ ] Weekly planning view

### Phase 4 — Reflection System (Weeks 10–11)
**Goal**: Review and learning loops
- [ ] Daily reflection template
- [ ] Weekly review workflow
- [ ] Monthly strategic review
- [ ] Quarterly/annual review
- [ ] Reflection journal with search

### Phase 5 — AI Mentor (Weeks 12–14)
**Goal**: AI integration via Ollama
- [ ] Ollama connection + model selection
- [ ] AI reflection questions
- [ ] Goal alignment analysis
- [ ] Overload detection
- [ ] Daily AI briefing

### Phase 6 — Cognitive Continuity (Weeks 15–16)
**Goal**: Context preservation
- [ ] Context snapshots
- [ ] Decision log
- [ ] Interrupted work capture
- [ ] AI-powered context restoration

### Phase 7 — Knowledge System (Weeks 17–18)
**Goal**: Integrated knowledge/learning graph
- [ ] Note creation with linking
- [ ] Knowledge tagging
- [ ] Learning log
- [ ] Semantic search

### Phase 8 — Export & Polish (Weeks 19–20)
**Goal**: Data ownership + production quality
- [ ] Export: Markdown, JSON, CSV, PDF
- [ ] Encrypted backup
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Final design polish

## MVP Definition (Phase 0–3)
A user can:
1. Define their life domains and vision
2. Create strategic goals linked to domains
3. Schedule time blocks for those goals
4. Track daily execution
5. Run a basic weekly review

## Success Metrics (Phase 1 MVP)
- App boots in <1s
- All core actions complete in <100ms
- Zero data loss scenarios
- All flows accessible via keyboard
- Offline-first verified (no network required)
