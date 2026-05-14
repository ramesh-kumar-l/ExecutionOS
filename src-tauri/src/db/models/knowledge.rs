use serde::{Deserialize, Serialize};

#[derive(Debug, sqlx::FromRow)]
pub struct KnowledgeRow {
    pub id: String,
    pub note_type: String,
    pub title: String,
    pub content: String,
    pub tags: String,
    pub domain_id: Option<String>,
    pub goal_id: Option<String>,
    pub linked_note_ids: String,
    pub source: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KnowledgeNote {
    pub id: String,
    #[serde(rename = "type")]
    pub note_type: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub domain_id: Option<String>,
    pub goal_id: Option<String>,
    pub linked_note_ids: Vec<String>,
    pub source: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<KnowledgeRow> for KnowledgeNote {
    fn from(row: KnowledgeRow) -> Self {
        let tags = serde_json::from_str::<Vec<String>>(&row.tags).unwrap_or_default();
        let linked_note_ids =
            serde_json::from_str::<Vec<String>>(&row.linked_note_ids).unwrap_or_default();
        Self {
            id: row.id,
            note_type: row.note_type,
            title: row.title,
            content: row.content,
            tags,
            domain_id: row.domain_id,
            goal_id: row.goal_id,
            linked_note_ids,
            source: row.source,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}
