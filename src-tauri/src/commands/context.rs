use tauri::State;
use crate::db::DbPool;
use crate::db::models::context::{ContextSnapshot, ContextSnapshotRow, DecisionLog, DecisionLogRow};

#[tauri::command]
pub async fn get_context_snapshots(
    limit: Option<i64>,
    db: State<'_, DbPool>,
) -> Result<Vec<ContextSnapshot>, String> {
    let limit = limit.unwrap_or(50);
    let rows = sqlx::query_as::<_, ContextSnapshotRow>(
        "SELECT id, title, context_text, open_threads, decisions, next_actions, ai_summary, created_at
         FROM context_snapshots
         ORDER BY created_at DESC LIMIT ?",
    )
    .bind(limit)
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(ContextSnapshot::from).collect())
}

#[tauri::command]
pub async fn create_context_snapshot(
    title: String,
    context_text: String,
    open_threads: Vec<String>,
    decisions: Vec<String>,
    next_actions: Vec<String>,
    db: State<'_, DbPool>,
) -> Result<ContextSnapshot, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let open_threads_json = serde_json::to_string(&open_threads).map_err(|e| e.to_string())?;
    let decisions_json = serde_json::to_string(&decisions).map_err(|e| e.to_string())?;
    let next_actions_json = serde_json::to_string(&next_actions).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO context_snapshots
         (id, title, context_text, open_threads, decisions, next_actions, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&title)
    .bind(&context_text)
    .bind(&open_threads_json)
    .bind(&decisions_json)
    .bind(&next_actions_json)
    .bind(&now)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, ContextSnapshotRow>(
        "SELECT id, title, context_text, open_threads, decisions, next_actions, ai_summary, created_at
         FROM context_snapshots WHERE id = ?",
    )
    .bind(&id)
    .fetch_one(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(ContextSnapshot::from(row))
}

#[tauri::command]
pub async fn delete_context_snapshot(
    id: String,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    sqlx::query("DELETE FROM context_snapshots WHERE id = ?")
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_decision_log(
    limit: Option<i64>,
    db: State<'_, DbPool>,
) -> Result<Vec<DecisionLog>, String> {
    let limit = limit.unwrap_or(50);
    let rows = sqlx::query_as::<_, DecisionLogRow>(
        "SELECT id, title, context, rationale, options, domain_id, goal_id, decided_at, review_date, created_at
         FROM decision_log
         ORDER BY decided_at DESC LIMIT ?",
    )
    .bind(limit)
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(DecisionLog::from).collect())
}

#[tauri::command]
pub async fn create_decision(
    title: String,
    context: Option<String>,
    rationale: Option<String>,
    options: Option<Vec<String>>,
    domain_id: Option<String>,
    goal_id: Option<String>,
    decided_at: String,
    review_date: Option<String>,
    db: State<'_, DbPool>,
) -> Result<DecisionLog, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let context_str = context.unwrap_or_default();
    let rationale_str = rationale.unwrap_or_default();
    let options_vec = options.unwrap_or_default();
    let options_json = serde_json::to_string(&options_vec).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO decision_log
         (id, title, context, rationale, options, domain_id, goal_id, decided_at, review_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&title)
    .bind(&context_str)
    .bind(&rationale_str)
    .bind(&options_json)
    .bind(&domain_id)
    .bind(&goal_id)
    .bind(&decided_at)
    .bind(&review_date)
    .bind(&now)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, DecisionLogRow>(
        "SELECT id, title, context, rationale, options, domain_id, goal_id, decided_at, review_date, created_at
         FROM decision_log WHERE id = ?",
    )
    .bind(&id)
    .fetch_one(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(DecisionLog::from(row))
}

#[tauri::command]
pub async fn delete_decision(
    id: String,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    sqlx::query("DELETE FROM decision_log WHERE id = ?")
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
