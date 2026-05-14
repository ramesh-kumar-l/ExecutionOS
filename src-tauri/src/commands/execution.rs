use tauri::State;
use uuid::Uuid;
use chrono::Utc;
use crate::db::{DbPool, models::time_block::{TimeBlock, FocusSession, CreateTimeBlockInput, RecurringRule, RecurringRuleRow, CreateRecurringRuleInput}};

#[tauri::command]
pub async fn get_time_blocks(date: String, db: State<'_, DbPool>) -> Result<Vec<TimeBlock>, String> {
    sqlx::query_as::<_, TimeBlock>(
        "SELECT * FROM time_blocks WHERE date = ? ORDER BY start_time ASC"
    )
    .bind(&date)
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_time_block(
    input: CreateTimeBlockInput,
    db: State<'_, DbPool>,
) -> Result<TimeBlock, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO time_blocks
         (id, title, date, start_time, end_time, goal_id, domain_id, block_type, energy_type, status, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?)"
    )
    .bind(&id)
    .bind(&input.title)
    .bind(&input.date)
    .bind(&input.start_time)
    .bind(&input.end_time)
    .bind(&input.goal_id)
    .bind(&input.domain_id)
    .bind(&input.block_type)
    .bind(&input.energy_type)
    .bind(input.notes.as_deref().unwrap_or(""))
    .bind(&now)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, TimeBlock>("SELECT * FROM time_blocks WHERE id = ?")
        .bind(&id)
        .fetch_one(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn complete_time_block(id: String, db: State<'_, DbPool>) -> Result<(), String> {
    sqlx::query("UPDATE time_blocks SET status = 'completed' WHERE id = ?")
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_time_blocks_range(
    start_date: String,
    end_date: String,
    db: State<'_, DbPool>,
) -> Result<Vec<TimeBlock>, String> {
    sqlx::query_as::<_, TimeBlock>(
        "SELECT * FROM time_blocks WHERE date >= ? AND date <= ? ORDER BY date ASC, start_time ASC",
    )
    .bind(&start_date)
    .bind(&end_date)
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn skip_time_block(id: String, _reason: Option<String>, db: State<'_, DbPool>) -> Result<(), String> {
    sqlx::query("UPDATE time_blocks SET status = 'skipped' WHERE id = ?")
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_recurring_rules(db: State<'_, DbPool>) -> Result<Vec<RecurringRule>, String> {
    let rows = sqlx::query_as::<_, RecurringRuleRow>(
        "SELECT * FROM recurring_rules ORDER BY created_at ASC"
    )
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())?;
    Ok(rows.into_iter().map(RecurringRule::from).collect())
}

#[tauri::command]
pub async fn create_recurring_rule(
    input: CreateRecurringRuleInput,
    db: State<'_, DbPool>,
) -> Result<RecurringRule, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let days_json = serde_json::to_string(&input.days_of_week).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO recurring_rules
         (id, title, pattern, days_of_week, start_time, duration_minutes, block_type, goal_id, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)"
    )
    .bind(&id)
    .bind(&input.title)
    .bind(&input.pattern)
    .bind(&days_json)
    .bind(&input.start_time)
    .bind(input.duration_minutes)
    .bind(&input.block_type)
    .bind(&input.goal_id)
    .bind(&now)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, RecurringRuleRow>("SELECT * FROM recurring_rules WHERE id = ?")
        .bind(&id)
        .fetch_one(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(RecurringRule::from(row))
}

#[tauri::command]
pub async fn toggle_recurring_rule(
    id: String,
    is_active: bool,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    sqlx::query("UPDATE recurring_rules SET is_active = ? WHERE id = ?")
        .bind(is_active as i64)
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_recurring_rule(id: String, db: State<'_, DbPool>) -> Result<(), String> {
    sqlx::query("DELETE FROM recurring_rules WHERE id = ?")
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_active_focus_session(db: State<'_, DbPool>) -> Result<Option<FocusSession>, String> {
    sqlx::query_as::<_, FocusSession>(
        "SELECT * FROM focus_sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1"
    )
    .fetch_optional(db.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_focus_session(
    planned_duration_minutes: i64,
    time_block_id: Option<String>,
    goal_id: Option<String>,
    db: State<'_, DbPool>,
) -> Result<FocusSession, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO focus_sessions (id, time_block_id, goal_id, started_at, planned_duration_minutes, interruptions, notes)
         VALUES (?, ?, ?, ?, ?, 0, '')"
    )
    .bind(&id)
    .bind(&time_block_id)
    .bind(&goal_id)
    .bind(&now)
    .bind(planned_duration_minutes)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, FocusSession>("SELECT * FROM focus_sessions WHERE id = ?")
        .bind(&id)
        .fetch_one(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn end_focus_session(
    id: String,
    notes: Option<String>,
    db: State<'_, DbPool>,
) -> Result<FocusSession, String> {
    let now = Utc::now().to_rfc3339();

    let session = sqlx::query_as::<_, FocusSession>("SELECT * FROM focus_sessions WHERE id = ?")
        .bind(&id)
        .fetch_optional(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Session not found: {id}"))?;

    let started = chrono::DateTime::parse_from_rfc3339(&session.started_at)
        .map_err(|e| e.to_string())?;
    let ended = chrono::DateTime::parse_from_rfc3339(&now)
        .map_err(|e| e.to_string())?;
    let actual_minutes = (ended - started).num_minutes();

    sqlx::query(
        "UPDATE focus_sessions SET ended_at = ?, actual_duration_minutes = ?, notes = COALESCE(?, notes) WHERE id = ?"
    )
    .bind(&now)
    .bind(actual_minutes)
    .bind(&notes)
    .bind(&id)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, FocusSession>("SELECT * FROM focus_sessions WHERE id = ?")
        .bind(&id)
        .fetch_one(db.inner())
        .await
        .map_err(|e| e.to_string())
}
