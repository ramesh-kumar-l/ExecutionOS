# Knowledge System — LENSSTACK + X10THINK

## Purpose
Capture, organize, and synthesize learning across all life domains. Connect knowledge to goals and actions. Make insights retrievable when relevant.

## Core Philosophy
Knowledge without action is just information. This system links learning to goals and execution, making it actionable.

## Knowledge Entry Types

| Type | Description |
|------|-------------|
| `note` | Free-form note, idea, or observation |
| `learning` | Key insight from reading, course, experience |
| `book` | Book summary and key takeaways |
| `decision` | Decision record (also in context engine) |
| `resource` | Reference to external resource |
| `synthesis` | Connected insight from multiple sources |

## Data Model
```typescript
interface KnowledgeNote {
  id: string;
  type: 'note' | 'learning' | 'book' | 'decision' | 'resource' | 'synthesis';
  title: string;
  content: string;         // Markdown
  tags: string[];
  domain_id: string | null;
  goal_id: string | null;
  linked_note_ids: string[];
  source: string | null;   // book title, URL, person
  created_at: string;
  updated_at: string;
}
```

## Note Editor
- Markdown editor with preview
- Inline link creation (`[[note title]]` wiki-style)
- Tag autocomplete
- Domain and goal linking
- Source attribution field

## Knowledge Graph
- Notes are nodes, links are edges
- Bidirectional links (link A → B creates B → A backlink)
- Graph visualization (optional, Phase 7+)
- Link suggestions from AI based on content similarity

## Search
- Full-text search (SQLite FTS5)
- Tag filter
- Domain filter
- Date range filter
- Semantic search (AI, optional)

## AI-Assisted Knowledge Features
- **Synthesis suggestions**: AI identifies notes with related content
- **Tag suggestions**: AI suggests tags based on content
- **Goal connection**: AI suggests which goals a note is relevant to
- **Learning patterns**: AI identifies recurring themes in recent notes

## Book Tracking
Special note type for books:
```
Title: [book title]
Author: [author]
Status: reading / completed / want-to-read
Key insights: [list]
Action items: [list]
Rating: 1-5
Completed: [date]
```

## Spaced Repetition (Future)
- Flag notes for review
- Review queue with spaced repetition schedule
- Reinforces long-term retention of key insights

## Knowledge ↔ Goals Integration
- Notes link to goals (learning supports the goal)
- Goal detail view shows linked knowledge notes
- When creating a goal, system suggests related existing notes

## Storage
```sql
CREATE TABLE knowledge_notes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'note',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',     -- JSON array
  domain_id TEXT,
  goal_id TEXT,
  linked_note_ids TEXT DEFAULT '[]',  -- JSON array
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (goal_id) REFERENCES goals(id)
);

-- Full-text search
CREATE VIRTUAL TABLE knowledge_fts USING fts5(
  title, content, tags,
  content=knowledge_notes,
  content_rowid=rowid
);
```

## UX
- Quick capture: ⌘N anywhere opens new note
- View: card grid or list
- Sort: by date, domain, type, relevance
- Filter panel: collapsible left sidebar
- Note detail: full-width editor with metadata panel
