use tauri::State;
use uuid::Uuid;
use chrono::Utc;
use crate::db::{DbPool, models::goal::{Goal, Milestone, CreateGoalInput, UpdateGoalInput, GoalFilter}};

#[tauri::command]
pub async fn get_goals(filter: GoalFilter, db: State<'_, DbPool>) -> Result<Vec<Goal>, String> {
    let goals = match (&filter.domain_id, &filter.status) {
        (Some(domain_id), Some(status)) => {
            sqlx::query_as::<_, Goal>(
                "SELECT * FROM goals WHERE domain_id = ? AND status = ? ORDER BY created_at DESC"
            )
            .bind(domain_id)
            .bind(status)
            .fetch_all(db.inner())
            .await
        }
        (Some(domain_id), None) => {
            sqlx::query_as::<_, Goal>(
                "SELECT * FROM goals WHERE domain_id = ? ORDER BY created_at DESC"
            )
            .bind(domain_id)
            .fetch_all(db.inner())
            .await
        }
        (None, Some(status)) => {
            sqlx::query_as::<_, Goal>(
                "SELECT * FROM goals WHERE status = ? ORDER BY created_at DESC"
            )
            .bind(status)
            .fetch_all(db.inner())
            .await
        }
        (None, None) => {
            sqlx::query_as::<_, Goal>(
                "SELECT * FROM goals ORDER BY created_at DESC"
            )
            .fetch_all(db.inner())
            .await
        }
    };

    goals.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_goal(id: String, db: State<'_, DbPool>) -> Result<Goal, String> {
    sqlx::query_as::<_, Goal>("SELECT * FROM goals WHERE id = ?")
        .bind(&id)
        .fetch_optional(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Goal not found: {id}"))
}

#[tauri::command]
pub async fn create_goal(input: CreateGoalInput, db: State<'_, DbPool>) -> Result<Goal, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO goals (id, title, description, domain_id, target_date, status, priority, success_criteria, progress, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?, 0.0, ?, ?)"
    )
    .bind(&id)
    .bind(&input.title)
    .bind(input.description.as_deref().unwrap_or(""))
    .bind(&input.domain_id)
    .bind(&input.target_date)
    .bind(&input.priority)
    .bind(input.success_criteria.as_deref().unwrap_or(""))
    .bind(&now)
    .bind(&now)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    get_goal(id, db).await
}

#[tauri::command]
pub async fn update_goal(input: UpdateGoalInput, db: State<'_, DbPool>) -> Result<Goal, String> {
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE goals SET
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            target_date = COALESCE(?, target_date),
            status = COALESCE(?, status),
            priority = COALESCE(?, priority),
            progress = COALESCE(?, progress),
            success_criteria = COALESCE(?, success_criteria),
            updated_at = ?
        WHERE id = ?"
    )
    .bind(&input.title)
    .bind(&input.description)
    .bind(&input.target_date)
    .bind(&input.status)
    .bind(&input.priority)
    .bind(input.progress)
    .bind(&input.success_criteria)
    .bind(&now)
    .bind(&input.id)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    get_goal(input.id, db).await
}

#[tauri::command]
pub async fn delete_goal(id: String, db: State<'_, DbPool>) -> Result<(), String> {
    sqlx::query("DELETE FROM goals WHERE id = ?")
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// ─── Milestones ───────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_milestones(goal_id: String, db: State<'_, DbPool>) -> Result<Vec<Milestone>, String> {
    sqlx::query_as::<_, Milestone>(
        "SELECT * FROM milestones WHERE goal_id = ? ORDER BY sort_order ASC"
    )
    .bind(&goal_id)
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_milestone(
    goal_id: String,
    title: String,
    target_date: Option<String>,
    db: State<'_, DbPool>,
) -> Result<Milestone, String> {
    let id = Uuid::new_v4().to_string();

    let sort_order: i64 = sqlx::query_scalar(
        "SELECT COALESCE(MAX(sort_order), -1) + 1 FROM milestones WHERE goal_id = ?"
    )
    .bind(&goal_id)
    .fetch_one(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO milestones (id, goal_id, title, target_date, sort_order) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&goal_id)
    .bind(&title)
    .bind(&target_date)
    .bind(sort_order)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Milestone>("SELECT * FROM milestones WHERE id = ?")
        .bind(&id)
        .fetch_one(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn complete_milestone(id: String, db: State<'_, DbPool>) -> Result<(), String> {
    let now = Utc::now().to_rfc3339();
    sqlx::query("UPDATE milestones SET completed_at = ? WHERE id = ?")
        .bind(&now)
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_milestone(id: String, db: State<'_, DbPool>) -> Result<(), String> {
    sqlx::query("DELETE FROM milestones WHERE id = ?")
        .bind(&id)
        .execute(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
