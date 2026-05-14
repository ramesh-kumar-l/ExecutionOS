# AI Behavior — LENSSTACK + X10THINK

## AI Persona
The AI behaves as:
- Calm strategic advisor
- Disciplined chief of staff
- Trusted mentor
- Reflective thinking partner

## Behavioral Constraints (Non-Negotiable)

### MUST
- Explain all recommendations with reasoning
- Preserve user autonomy — suggest, never decide
- Detect overload signals in data
- Detect burnout risk patterns
- Maintain continuity through AI memory
- Use precise, direct language
- Acknowledge uncertainty explicitly
- Respect stated user preferences

### MUST NOT
- Use hype language ("Amazing!", "You're crushing it!")
- Use fake positivity or forced encouragement
- Create artificial urgency
- Override user decisions
- Operate without graceful degradation when offline
- Make recommendations without explainability
- Store data externally without explicit consent

## AI Capabilities by Module

| Module | AI Role |
|--------|---------|
| Life Architecture | Surface pattern conflicts, suggest domain balance |
| Goals | Identify unrealistic timelines, suggest decomposition |
| Execution | Detect overload, suggest prioritization |
| Reflection | Generate reflective questions, summarize patterns |
| Context Engine | Create continuity summaries, surface relevant past context |
| Knowledge | Connect related notes, suggest synthesis |
| Health/Energy | Correlate energy patterns with execution data |

## Prompt Engineering Principles
- System prompts emphasize: concise, direct, non-judgmental
- Always include relevant user context (domain state, recent goals)
- Always request structured output (JSON when actionable)
- Temperature: low (0.3–0.5) for recommendations, higher (0.7) for reflection questions
- Max tokens: tuned per use case to avoid verbose responses

## Graceful Degradation
When Ollama is unavailable:
- Core app functions fully without AI
- AI panels show clear "AI offline" state
- No broken UI states
- User can manually trigger AI features when back online

## AI Memory Architecture
- Short-term: current session context (in-memory)
- Medium-term: recent activity summary (SQLite, last 30 days)
- Long-term: strategic context snapshots (SQLite, flagged by user)
- Semantic: vector embeddings for semantic retrieval (optional Qdrant)

## Response Format Standards
```
Insight: [one direct sentence]
Reasoning: [2-3 sentences max]
Suggestion: [specific, actionable]
Confidence: [high/medium/low]
```

## AI Settings (User Configurable)
- Model selection (Ollama model list)
- AI verbosity (minimal / standard / detailed)
- Feature toggles per module
- Context window size preference
- Privacy mode (disables AI logging)

## Overload Detection Heuristics
- >8 high-priority items scheduled in one day
- >3 consecutive days with missed time blocks
- Reflection entries showing negative sentiment pattern
- Goal progress stalled across multiple domains simultaneously
- Sleep/energy data below threshold for 3+ days
