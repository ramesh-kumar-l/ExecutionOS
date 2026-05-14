use serde::{Deserialize, Serialize};

/// Raw DB row — content stored as JSON text
#[derive(Debug, sqlx::FromRow)]
pub struct ReflectionRow {
    pub id: String,
    pub entry_type: String,
    pub date: String,
    pub content: String,
    pub mood: Option<i64>,
    pub energy: Option<i64>,
    pub ai_summary: Option<String>,
    pub created_at: String,
}

/// Serialized response — content expanded to JSON value
#[derive(Debug, Serialize, Deserialize)]
pub struct ReflectionEntry {
    pub id: String,
    #[serde(rename = "type")]
    pub entry_type: String,
    pub date: String,
    pub content: serde_json::Value,
    pub mood: Option<i64>,
    pub energy: Option<i64>,
    pub ai_summary: Option<String>,
    pub created_at: String,
}

impl From<ReflectionRow> for ReflectionEntry {
    fn from(row: ReflectionRow) -> Self {
        let content = serde_json::from_str(&row.content)
            .unwrap_or(serde_json::Value::Object(Default::default()));
        Self {
            id: row.id,
            entry_type: row.entry_type,
            date: row.date,
            content,
            mood: row.mood,
            energy: row.energy,
            ai_summary: row.ai_summary,
            created_at: row.created_at,
        }
    }
}
