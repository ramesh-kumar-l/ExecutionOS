use tauri::State;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use crate::db::DbPool;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserSettings {
    pub theme: String,
    pub ollama_url: String,
    pub ollama_model: String,
    pub ai_enabled: bool,
    pub ai_verbosity: String,
    pub first_day_of_week: i64,
    pub daily_planning_time: String,
    pub daily_review_time: String,
}

#[tauri::command]
pub async fn get_settings(db: State<'_, DbPool>) -> Result<UserSettings, String> {
    sqlx::query_as::<_, UserSettings>(
        "SELECT theme, ollama_url, ollama_model, ai_enabled, ai_verbosity,
                first_day_of_week, daily_planning_time, daily_review_time
         FROM user_settings WHERE id = 1"
    )
    .fetch_one(db.inner())
    .await
    .map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct UpdateSettingsInput {
    pub theme: Option<String>,
    pub ollama_url: Option<String>,
    pub ollama_model: Option<String>,
    pub ai_enabled: Option<bool>,
    pub ai_verbosity: Option<String>,
    pub first_day_of_week: Option<i64>,
    pub daily_planning_time: Option<String>,
    pub daily_review_time: Option<String>,
}

#[tauri::command]
pub async fn update_settings(
    input: UpdateSettingsInput,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE user_settings SET
            theme = COALESCE(?, theme),
            ollama_url = COALESCE(?, ollama_url),
            ollama_model = COALESCE(?, ollama_model),
            ai_enabled = COALESCE(?, ai_enabled),
            ai_verbosity = COALESCE(?, ai_verbosity),
            first_day_of_week = COALESCE(?, first_day_of_week),
            daily_planning_time = COALESCE(?, daily_planning_time),
            daily_review_time = COALESCE(?, daily_review_time)
        WHERE id = 1"
    )
    .bind(&input.theme)
    .bind(&input.ollama_url)
    .bind(&input.ollama_model)
    .bind(input.ai_enabled.map(|b| if b { 1i64 } else { 0i64 }))
    .bind(&input.ai_verbosity)
    .bind(input.first_day_of_week)
    .bind(&input.daily_planning_time)
    .bind(&input.daily_review_time)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
