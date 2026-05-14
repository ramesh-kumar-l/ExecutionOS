use tauri::State;
use crate::db::DbPool;
use crate::db::models::reflection::{ReflectionEntry, ReflectionRow};

#[tauri::command]
pub async fn get_reflections(
    limit: Option<i64>,
    db: State<'_, DbPool>,
) -> Result<Vec<ReflectionEntry>, String> {
    let limit = limit.unwrap_or(20);
    let rows = sqlx::query_as::<_, ReflectionRow>(
        "SELECT id, type AS entry_type, date, content, mood, energy, ai_summary, created_at
         FROM reflection_entries
         ORDER BY created_at DESC
         LIMIT ?"
    )
    .bind(limit)
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(ReflectionEntry::from).collect())
}

#[tauri::command]
pub async fn get_reflection(
    id: String,
    db: State<'_, DbPool>,
) -> Result<ReflectionEntry, String> {
    let row = sqlx::query_as::<_, ReflectionRow>(
        "SELECT id, type AS entry_type, date, content, mood, energy, ai_summary, created_at
         FROM reflection_entries
         WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(ReflectionEntry::from(row))
}

#[tauri::command]
pub async fn create_reflection(
    entry_type: String,
    content: serde_json::Value,
    mood: Option<i64>,
    energy: Option<i64>,
    db: State<'_, DbPool>,
) -> Result<ReflectionEntry, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let date = &now[..10];
    let content_str = serde_json::to_string(&content).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO reflection_entries (id, type, date, content, mood, energy, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&entry_type)
    .bind(date)
    .bind(&content_str)
    .bind(mood)
    .bind(energy)
    .bind(&now)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, ReflectionRow>(
        "SELECT id, type AS entry_type, date, content, mood, energy, ai_summary, created_at
         FROM reflection_entries
         WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(ReflectionEntry::from(row))
}
