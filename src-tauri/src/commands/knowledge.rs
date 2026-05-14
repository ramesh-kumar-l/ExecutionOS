use tauri::State;
use crate::db::DbPool;
use crate::db::models::knowledge::{KnowledgeNote, KnowledgeRow};

#[tauri::command]
pub async fn get_knowledge_notes(
    search: Option<String>,
    note_type: Option<String>,
    domain_id: Option<String>,
    limit: Option<i64>,
    db: State<'_, DbPool>,
) -> Result<Vec<KnowledgeNote>, String> {
    let limit = limit.unwrap_or(50);

    let rows = if let Some(q) = search.as_deref().filter(|s| !s.is_empty()) {
        let pattern = format!("%{}%", q);
        if let Some(nt) = &note_type {
            sqlx::query_as::<_, KnowledgeRow>(
                "SELECT id, type AS note_type, title, content, tags, domain_id, goal_id,
                        linked_note_ids, source, created_at, updated_at
                 FROM knowledge_notes
                 WHERE (title LIKE ? OR content LIKE ? OR tags LIKE ?)
                   AND type = ?
                 ORDER BY updated_at DESC LIMIT ?",
            )
            .bind(&pattern)
            .bind(&pattern)
            .bind(&pattern)
            .bind(nt)
            .bind(limit)
            .fetch_all(db.inner())
            .await
        } else {
            sqlx::query_as::<_, KnowledgeRow>(
                "SELECT id, type AS note_type, title, content, tags, domain_id, goal_id,
                        linked_note_ids, source, created_at, updated_at
                 FROM knowledge_notes
                 WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
                 ORDER BY updated_at DESC LIMIT ?",
            )
            .bind(&pattern)
            .bind(&pattern)
            .bind(&pattern)
            .bind(limit)
            .fetch_all(db.inner())
            .await
        }
    } else if let Some(nt) = &note_type {
        sqlx::query_as::<_, KnowledgeRow>(
            "SELECT id, type AS note_type, title, content, tags, domain_id, goal_id,
                    linked_note_ids, source, created_at, updated_at
             FROM knowledge_notes
             WHERE type = ?
             ORDER BY updated_at DESC LIMIT ?",
        )
        .bind(nt)
        .bind(limit)
        .fetch_all(db.inner())
        .await
    } else if let Some(did) = &domain_id {
        sqlx::query_as::<_, KnowledgeRow>(
            "SELECT id, type AS note_type, title, content, tags, domain_id, goal_id,
                    linked_note_ids, source, created_at, updated_at
             FROM knowledge_notes
             WHERE domain_id = ?
             ORDER BY updated_at DESC LIMIT ?",
        )
        .bind(did)
        .bind(limit)
        .fetch_all(db.inner())
        .await
    } else {
        sqlx::query_as::<_, KnowledgeRow>(
            "SELECT id, type AS note_type, title, content, tags, domain_id, goal_id,
                    linked_note_ids, source, created_at, updated_at
             FROM knowledge_notes
             ORDER BY updated_at DESC LIMIT ?",
        )
        .bind(limit)
        .fetch_all(db.inner())
        .await
    }
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(KnowledgeNote::from).collect())
}

#[tauri::command]
pub async fn create_knowledge_note(
    note_type: String,
    title: String,
    content: String,
    tags: Vec<String>,
    domain_id: Option<String>,
    goal_id: Option<String>,
    source: Option<String>,
    db: State<'_, DbPool>,
) -> Result<KnowledgeNote, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO knowledge_notes
         (id, type, title, content, tags, domain_id, goal_id, linked_note_ids, source, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?)",
    )
    .bind(&id)
    .bind(&note_type)
    .bind(&title)
    .bind(&content)
    .bind(&tags_json)
    .bind(&domain_id)
    .bind(&goal_id)
    .bind(&source)
    .bind(&now)
    .bind(&now)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, KnowledgeRow>(
        "SELECT id, type AS note_type, title, content, tags, domain_id, goal_id,
                linked_note_ids, source, created_at, updated_at
         FROM knowledge_notes WHERE id = ?",
    )
    .bind(&id)
    .fetch_one(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(KnowledgeNote::from(row))
}

#[tauri::command]
pub async fn update_knowledge_note(
    id: String,
    title: Option<String>,
    content: Option<String>,
    tags: Option<Vec<String>>,
    source: Option<String>,
    db: State<'_, DbPool>,
) -> Result<KnowledgeNote, String> {
    let now = chrono::Utc::now().to_rfc3339();

    if let Some(t) = &title {
        sqlx::query("UPDATE knowledge_notes SET title = ?, updated_at = ? WHERE id = ?")
            .bind(t)
            .bind(&now)
            .bind(&id)
            .execute(db.inner())
            .await
            .map_err(|e| e.to_string())?;
    }
    if let Some(c) = &content {
        sqlx::query("UPDATE knowledge_notes SET content = ?, updated_at = ? WHERE id = ?")
            .bind(c)
            .bind(&now)
            .bind(&id)
            .execute(db.inner())
            .await
            .map_err(|e| e.to_string())?;
    }
    if let Some(ts) = &tags {
        let tags_json = serde_json::to_string(ts).map_err(|e| e.to_string())?;
        sqlx::query("UPDATE knowledge_notes SET tags = ?, updated_at = ? WHERE id = ?")
            .bind(&tags_json)
            .bind(&now)
            .bind(&id)
            .execute(db.inner())
            .await
            .map_err(|e| e.to_string())?;
    }
    if let Some(s) = &source {
        sqlx::query("UPDATE knowledge_notes SET source = ?, updated_at = ? WHERE id = ?")
            .bind(s)
            .bind(&now)
            .bind(&id)
            .execute(db.inner())
            .await
            .map_err(|e| e.to_string())?;
    }

    let row = sqlx::query_as::<_, KnowledgeRow>(
        "SELECT id, type AS note_type, title, content, tags, domain_id, goal_id,
                linked_note_ids, source, created_at, updated_at
         FROM knowledge_notes WHERE id = ?",
    )
    .bind(&id)
    .fetch_one(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(KnowledgeNote::from(row))
}

#[tauri::command]
pub async fn delete_knowledge_note(
    id: String,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    sqlx::query("DELETE FROM knowledge_notes WHERE id = ?")
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
