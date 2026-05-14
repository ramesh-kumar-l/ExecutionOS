# AI Memory — LENSSTACK + X10THINK

## Memory Architecture

### Three Memory Tiers

```
Tier 1: Working Memory (Session)
  → Current session context
  → Active goals and time blocks
  → Today's reflection entries
  → In-memory only

Tier 2: Episodic Memory (Medium-term, 90 days)
  → Recent goal changes
  → Execution patterns (last 30 days)
  → Reflection summaries (last 90 days)
  → Context snapshots (last 20)
  → Stored in SQLite, queried per request

Tier 3: Semantic Memory (Long-term)
  → Life domain visions and purposes
  → Key decisions
  → Flagged reflections and insights
  → Learning notes
  → Vector embeddings for semantic retrieval
  → Stored in SQLite (embeddings as JSON) or Qdrant
```

## Context Assembly for AI Requests

When making an AI request, the system assembles context:
```rust
struct AIContext {
    user_name: String,
    active_domains: Vec<DomainSummary>,
    active_goals: Vec<GoalSummary>,
    recent_execution: ExecutionSummary,    // last 7 days
    recent_reflections: Vec<ReflectionSummary>, // last 5
    today_plan: Vec<TimeBlockSummary>,
    energy_level: Option<i32>,
    open_threads: Vec<String>,             // from context snapshots
}
```

## Vector Embeddings

### What gets embedded
- Reflection entries (full content)
- Context snapshots
- Knowledge notes
- Goal descriptions
- Decision log entries

### Embedding Model
- Default: `nomic-embed-text` via Ollama (local)
- Fallback: None (semantic search disabled, full-text search only)
- Dimension: 768 (nomic-embed-text default)

### Storage
- SQLite JSON column (for small datasets, <10k entries)
- Qdrant (optional, for larger datasets)

### Similarity Search
```rust
async fn semantic_search(query: &str, limit: usize) -> Vec<SearchResult> {
    let query_embedding = embed(query).await?;
    // Cosine similarity against stored embeddings
    // Return top N results with scores
}
```

## AI Request Types

| Request Type | Context Used | Expected Output |
|-------------|-------------|-----------------|
| Daily briefing | Today's blocks + active goals + energy | Structured briefing |
| Reflection questions | Recent activity + domain state | 5 personalized questions |
| Goal analysis | All active goals + execution data | Alignment assessment |
| Overload check | Scheduled blocks + capacity | Warning + suggestions |
| Context restoration | Last snapshots + recent activity | Restoration briefing |
| Semantic search | User query + embeddings | Ranked results |
| Weekly summary | Full week data | Pattern insights |

## Prompt Templates

### Daily Briefing
```
System: You are a calm, strategic advisor. Be direct and concise.
User context: [assembled context JSON]
Task: Generate a brief morning briefing covering:
1. Today's strategic focus (1 sentence)
2. Key time blocks to protect (up to 3)
3. Overload alert if >8 high-priority items
4. One strategic question for today
Format: JSON with keys: focus, key_blocks, alert, question
```

### Reflection Questions
```
System: Generate thoughtful, non-judgmental reflection questions.
Context: [recent execution + mood + goal progress]
Task: Generate 5 questions. Mix: progress, learning, emotion, strategy.
Avoid: clichés, leading questions, forced positivity.
Format: JSON array of strings.
```

## Privacy Controls

- AI memory can be cleared per tier
- User can flag entries as "private" (excluded from AI context)
- Privacy mode: disables all AI logging, uses only current session context
- Data never leaves device (Ollama is local)

## Graceful Degradation
When Ollama unavailable:
- Tier 1 memory (session) still assembled
- AI features show "AI offline" state
- Core reflection, goals, execution work fully without AI
- Embeddings queue for processing when Ollama returns
