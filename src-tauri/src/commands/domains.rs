use tauri::State;
use crate::db::{DbPool, models::Domain};
use crate::db::models::domain::UpdateDomainInput;
use crate::error::AppResult;
use chrono::Utc;

#[tauri::command]
pub async fn get_domains(db: State<'_, DbPool>) -> Result<Vec<Domain>, String> {
    let domains = sqlx::query_as::<_, Domain>(
        "SELECT * FROM domains WHERE is_active = 1 ORDER BY sort_order ASC"
    )
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(domains)
}

#[tauri::command]
pub async fn get_domain(id: String, db: State<'_, DbPool>) -> Result<Domain, String> {
    let domain = sqlx::query_as::<_, Domain>(
        "SELECT * FROM domains WHERE id = ?"
    )
    .bind(&id)
    .fetch_optional(db.inner())
    .await
    .map_err(|e| e.to_string())?
    .ok_or_else(|| format!("Domain not found: {id}"))?;

    Ok(domain)
}

#[tauri::command]
pub async fn update_domain(input: UpdateDomainInput, db: State<'_, DbPool>) -> Result<Domain, String> {
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE domains SET
            vision = COALESCE(?, vision),
            purpose = COALESCE(?, purpose),
            current_status = COALESCE(?, current_status),
            sort_order = COALESCE(?, sort_order),
            updated_at = ?
        WHERE id = ?"
    )
    .bind(&input.vision)
    .bind(&input.purpose)
    .bind(&input.current_status)
    .bind(input.sort_order)
    .bind(&now)
    .bind(&input.id)
    .execute(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    get_domain(input.id, db).await
}

#[tauri::command]
pub async fn get_domain_health(id: String, db: State<'_, DbPool>) -> Result<f64, String> {
    let score = sqlx::query_scalar::<_, f64>(
        "SELECT health_score FROM domains WHERE id = ?"
    )
    .bind(&id)
    .fetch_optional(db.inner())
    .await
    .map_err(|e| e.to_string())?
    .unwrap_or(0.0);

    Ok(score)
}
