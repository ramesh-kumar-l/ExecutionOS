use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::FromRow)]
pub struct ContextSnapshotRow {
    pub id: String,
    pub title: String,
    pub context_text: String,
    pub open_threads: String,
    pub decisions: String,
    pub next_actions: String,
    pub ai_summary: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContextSnapshot {
    pub id: String,
    pub title: String,
    pub context_text: String,
    pub open_threads: Vec<String>,
    pub decisions: Vec<String>,
    pub next_actions: Vec<String>,
    pub ai_summary: Option<String>,
    pub created_at: String,
}

impl From<ContextSnapshotRow> for ContextSnapshot {
    fn from(row: ContextSnapshotRow) -> Self {
        let open_threads =
            serde_json::from_str::<Vec<String>>(&row.open_threads).unwrap_or_default();
        let decisions =
            serde_json::from_str::<Vec<String>>(&row.decisions).unwrap_or_default();
        let next_actions =
            serde_json::from_str::<Vec<String>>(&row.next_actions).unwrap_or_default();
        Self {
            id: row.id,
            title: row.title,
            context_text: row.context_text,
            open_threads,
            decisions,
            next_actions,
            ai_summary: row.ai_summary,
            created_at: row.created_at,
        }
    }
}

#[derive(Debug, sqlx::FromRow)]
pub struct DecisionLogRow {
    pub id: String,
    pub title: String,
    pub context: String,
    pub rationale: String,
    pub options: String,
    pub domain_id: Option<String>,
    pub goal_id: Option<String>,
    pub decided_at: String,
    pub review_date: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DecisionLog {
    pub id: String,
    pub title: String,
    pub context: String,
    pub rationale: String,
    pub options: Vec<String>,
    pub domain_id: Option<String>,
    pub goal_id: Option<String>,
    pub decided_at: String,
    pub review_date: Option<String>,
    pub created_at: String,
}

impl From<DecisionLogRow> for DecisionLog {
    fn from(row: DecisionLogRow) -> Self {
        let options = serde_json::from_str::<Vec<String>>(&row.options).unwrap_or_default();
        Self {
            id: row.id,
            title: row.title,
            context: row.context,
            rationale: row.rationale,
            options,
            domain_id: row.domain_id,
            goal_id: row.goal_id,
            decided_at: row.decided_at,
            review_date: row.review_date,
            created_at: row.created_at,
        }
    }
}
